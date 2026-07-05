import puppeteer from "puppeteer";
import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = "https://tyezxomrupepysxjurfj.supabase.co";
const SUPABASE_KEY = "sb_publishable_NCdzO3zzGgwKfvykdTtigA_HZjKeMiv";
const PC_BASE = "https://neuquenpatagoniacell.com.ar";

const CATEGORIAS = [
  { url: `${PC_BASE}/pantallas-modulos/samsung/`, marca: "Samsung", tipo: "Módulo" },
  { url: `${PC_BASE}/pantallas-modulos/motorola/`, marca: "Motorola", tipo: "Módulo" },
  { url: `${PC_BASE}/pantallas-modulos/iphone/`, marca: "iPhone", tipo: "Módulo" },
  { url: `${PC_BASE}/pantallas-modulos/xiaomi/`, marca: "Xiaomi", tipo: "Módulo" },
  { url: `${PC_BASE}/baterias/samsung/`, marca: "Samsung", tipo: "Batería" },
  { url: `${PC_BASE}/baterias/motorola/`, marca: "Motorola", tipo: "Batería" },
];

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

function parsearProductos(html, marca, tipo) {
  const productos = [];
  const vistos = new Set();
  const bloqueRe = /data-variants="([^"]+)"[\s\S]{0,3000}?href="(https?:\/\/[^"]+\/productos\/[^"]+)"[^>]*title="([^"]+)"/g;
  let m;
  while ((m = bloqueRe.exec(html)) !== null) {
    const url = m[2];
    if (vistos.has(url)) continue;
    vistos.add(url);
    const nombre = m[3].replace(/&amp;/g, "&").replace(/&quot;/g, '"').trim();
    let variants = [];
    try {
      const decoded = m[1].replace(/&quot;/g, '"').replace(/&amp;/g, "&").replace(/&#39;/g, "'");
      variants = JSON.parse(decoded);
    } catch { continue; }
    if (!variants.length) continue;
    const v = variants[0];
    const precio = Number(v.price_number) || 0;
    if (precio <= 0) continue;
    const stock = v.available === true && (v.stock === null || Number(v.stock) > 0);
    const calidad = /oled/i.test(nombre) ? "OLED" : /incell/i.test(nombre) ? "Incell" : "Original";
    productos.push({ nombre, precio, url, stock, calidad });
  }
  return productos;
}

async function sincronizar() {
  console.log("Iniciando sincronización Patagonia Cell...");
  const browser = await puppeteer.launch({ headless: true, args: ["--no-sandbox"] });
  const page = await browser.newPage();
  await page.setUserAgent("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120.0.0.0 Safari/537.36");

  let totalImported = 0, totalUpdated = 0, totalErrors = 0;
  const ahora = new Date().toISOString();

  for (const cat of CATEGORIAS) {
    console.log(`Procesando ${cat.marca} ${cat.tipo}...`);
    try {
      await page.goto(cat.url, { waitUntil: "networkidle2", timeout: 30000 });
      const html = await page.content();
      const productos = parsearProductos(html, cat.marca, cat.tipo);
      console.log(`  → ${productos.length} productos encontrados`);

      for (const p of productos) {
        const modelo = p.nombre
          .replace(/^(Módulo|Modulo|Batería|Bateria)\s+/i, "")
          .replace(new RegExp(`^${cat.marca}\\s+`, "i"), "")
          .trim() || p.nombre;

        const { data: existing } = await supabase
          .from("catalogo_repuestos")
          .select("id")
          .eq("proveedor", "Patagonia Cell")
          .eq("url_producto", p.url)
          .maybeSingle();

        const row = {
          proveedor: "Patagonia Cell",
          marca: cat.marca,
          modelo,
          tipo_repuesto: cat.tipo,
          calidad: p.calidad,
          precio: p.precio,
          precio_proveedor: p.precio,
          precio_calculado: p.precio,
          stock: p.stock,
          url_producto: p.url,
          fecha_actualizacion: ahora,
          ultima_sincronizacion: ahora,
        };

        if (existing?.id) {
          const { error } = await supabase.from("catalogo_repuestos").update(row).eq("id", existing.id);
          if (error) { console.error("Error update:", error.message); totalErrors++; } else totalUpdated++;
        } else {
          const { error } = await supabase.from("catalogo_repuestos").insert(row);
          if (error) { console.error("Error insert:", error.message); totalErrors++; } else totalImported++;
        }
      }
    } catch (e) {
      console.error(`Error en ${cat.marca} ${cat.tipo}:`, e.message);
      totalErrors++;
    }
  }

  await browser.close();
  console.log(`\nFinalizado: +${totalImported} nuevos, ~${totalUpdated} actualizados, ${totalErrors} errores`);
}

sincronizar().catch(console.error);
