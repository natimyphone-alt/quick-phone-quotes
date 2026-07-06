import puppeteer from "puppeteer";
import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = "https://tyezxomrupepysxjurfj.supabase.co";
const SUPABASE_KEY = "sb_publishable_NCdzO3zzGgwKfvykdTtigA_HZjKeMiv";
const PC_BASE = "https://neuquenpatagoniacell.com.ar";

const CATEGORIAS = [
  { url: `${PC_BASE}/pantallas-modulos/samsung/galaxy-a/`, marca: "Samsung", tipo: "Módulo" },
  { url: `${PC_BASE}/pantallas-modulos/samsung/galaxy-j/`, marca: "Samsung", tipo: "Módulo" },
  { url: `${PC_BASE}/pantallas-modulos/samsung/galaxy-s/`, marca: "Samsung", tipo: "Módulo" },
  { url: `${PC_BASE}/pantallas-modulos/motorola/moto-e/`, marca: "Motorola", tipo: "Módulo" },
  { url: `${PC_BASE}/pantallas-modulos/motorola/moto-g/`, marca: "Motorola", tipo: "Módulo" },
  { url: `${PC_BASE}/pantallas-modulos/motorola/moto-one/`, marca: "Motorola", tipo: "Módulo" },
  { url: `${PC_BASE}/pantallas-modulos/motorola/moto-edge/`, marca: "Motorola", tipo: "Módulo" },
  { url: `${PC_BASE}/pantallas-modulos/iphone/11-11-pro-11-pro-max/`, marca: "iPhone", tipo: "Módulo" },
  { url: `${PC_BASE}/pantallas-modulos/iphone/12-12-pro-12-pro-max/`, marca: "iPhone", tipo: "Módulo" },
  { url: `${PC_BASE}/pantallas-modulos/iphone/13-13-pro-13-pro-max/`, marca: "iPhone", tipo: "Módulo" },
  { url: `${PC_BASE}/pantallas-modulos/iphone/14-14-pro-14-pro-max/`, marca: "iPhone", tipo: "Módulo" },
  { url: `${PC_BASE}/pantallas-modulos/iphone/15-15-pro-15-pro-max/`, marca: "iPhone", tipo: "Módulo" },
  { url: `${PC_BASE}/pantallas-modulos/xiaomi/`, marca: "Xiaomi", tipo: "Módulo" },
  { url: `${PC_BASE}/pantallas-modulos/lg/`, marca: "LG", tipo: "Módulo" },
  { url: `${PC_BASE}/pantallas-modulos/huawei/`, marca: "Huawei", tipo: "Módulo" },
  { url: `${PC_BASE}/pantallas-modulos/alcatel/`, marca: "Alcatel", tipo: "Módulo" },
  { url: `${PC_BASE}/pantallas-modulos/service-pack-100-original/`, marca: "Samsung", tipo: "Módulo" },
  { url: `${PC_BASE}/baterias3/baterias-iphone1/`, marca: "iPhone", tipo: "Batería" },
  { url: `${PC_BASE}/baterias3/baterias-samsung/`, marca: "Samsung", tipo: "Batería" },
  { url: `${PC_BASE}/baterias3/baterias-motorola/`, marca: "Motorola", tipo: "Batería" },
  { url: `${PC_BASE}/baterias3/baterias-xiaomi1/`, marca: "Xiaomi", tipo: "Batería" },
  { url: `${PC_BASE}/baterias3/baterias-lg1/`, marca: "LG", tipo: "Batería" },
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
    const calidad = /oled/i.test(nombre) ? "OLED" : /incell/i.test(nombre) ? "Incell" : /service.?pack/i.test(nombre) ? "Service Pack" : "Original";
    productos.push({ nombre, precio, url, stock, calidad });
  }
  return productos;
}

async function obtenerTodasLasPaginas(page, urlBase, marca, tipo) {
  const todos = [];
  const vistos = new Set();
  let paginaActual = 1;

  while (paginaActual <= 15) {
    const url = paginaActual === 1 ? urlBase : `${urlBase}?page=${paginaActual}`;
    console.log(`    Página ${paginaActual}: ${url}`);
    try {
      await page.goto(url, { waitUntil: "networkidle2", timeout: 30000 });
      const html = await page.content();
      const productos = parsearProductos(html, marca, tipo);
      
      // Filtrar duplicados
      const nuevos = productos.filter(p => !vistos.has(p.url));
      nuevos.forEach(p => vistos.add(p.url));
      
      if (nuevos.length === 0) break;
      todos.push(...nuevos);
      paginaActual++;
      await new Promise(r => setTimeout(r, 800));
    } catch (e) {
      console.error(`    Error en página ${paginaActual}:`, e.message);
      break;
    }
  }
  return todos;
}

async function sincronizar() {
  console.log("Iniciando sincronización Patagonia Cell...\n");
  const browser = await puppeteer.launch({
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });
  const page = await browser.newPage();
  await page.setUserAgent("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120.0.0.0 Safari/537.36");

  let totalImported = 0, totalUpdated = 0, totalErrors = 0;
  const ahora = new Date().toISOString();

  for (const cat of CATEGORIAS) {
    console.log(`Procesando ${cat.marca} ${cat.tipo} - ${cat.url}`);
    try {
      const productos = await obtenerTodasLasPaginas(page, cat.url, cat.marca, cat.tipo);
      console.log(`  → ${productos.length} productos encontrados\n`);

      for (const p of productos) {
        const modelo = p.nombre
          .replace(/^(Módulo|Modulo|Batería|Bateria|Pantalla)\s+/i, "")
          .replace(new RegExp(`^${cat.marca}\\s+`, "i"), "")
          .replace(/\s*[-–]\s*(OLED|INCELL|Original|SERVICE PACK|Calidad).*$/i, "")
          .trim() || p.nombre;

        const { data: existing } = await supabase
          .from("catalogo_repuestos")
          .select("id")
          .eq("proveedor", "Patagonia Cell")
          .eq("url_producto", p.url)
          .maybeSingle();

        const row = {
          proveedor: "Patagonia Cell",
          marca: cat.marca, modelo,
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