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
  { url: `${PC_BASE}/pantallas-modulos/modulos-infinix/`, marca: "Infinix", tipo: "Módulo" },
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

function inferirCalidad(nombre, cat) {
  if (/oled/i.test(nombre)) return "OLED";
  if (/incell/i.test(nombre)) return "Incell";
  if (/service.?pack/i.test(nombre)) return "Service Pack";

  // Lógica especial para baterías iPhone
  if (cat && cat.tipo === "Batería" && cat.marca === "iPhone") {
    if (/sin.?flex/i.test(nombre)) return "Con condición";
    if (/con.?flex/i.test(nombre)) return "Sin condición";
    return "Con condición"; // autoprogramable y resto por defecto
  }

  return "Calidad Original";
}

function parsearProductos(html, cat) {
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
    const calidad = inferirCalidad(nombre, cat);
    productos.push({ nombre, precio, url, stock, calidad });
  }
  return productos;
}

function parsearProductoIndividual(html, url) {
  const variantsMatch = html.match(/data-variants="([^"]+)"/);
  if (!variantsMatch) return null;

  let variants = [];
  try {
    const decoded = variantsMatch[1].replace(/&quot;/g, '"').replace(/&amp;/g, "&").replace(/&#39;/g, "'");
    variants = JSON.parse(decoded);
  } catch { return null; }
  if (!variants.length) return null;

  const v = variants[0];
  const precio = Number(v.price_number) || 0;
  if (precio <= 0) return null;
  const stock = v.available === true && (v.stock === null || Number(v.stock) > 0);

  const tituloMatch = html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i);
  const nombre = tituloMatch
    ? tituloMatch[1].replace(/<[^>]+>/g, "").replace(/&amp;/g, "&").trim()
    : url.split("/").filter(Boolean).pop()?.replace(/-/g, " ") || "Producto";

  // Determinar si es batería iPhone para calidad
  const esIphoneBateria = url.includes("iphone") && url.includes("bateria");
  const cat = esIphoneBateria ? { tipo: "Batería", marca: "iPhone" } : null;
  const calidad = inferirCalidad(nombre, cat);

  return { nombre, precio, url, stock, calidad };
}

async function obtenerTodasLasPaginas(page, urlBase, cat) {
  const todos = [];
  const vistos = new Set();
  let paginaActual = 1;

  while (paginaActual <= 15) {
    const url = paginaActual === 1 ? urlBase : `${urlBase}?page=${paginaActual}`;
    console.log(`    Página ${paginaActual}`);
    try {
      const response = await page.goto(url, { waitUntil: "networkidle2", timeout: 30000 });
      if (response && response.status() === 404) {
        console.log(`    404 real, terminando.`);
        break;
      }
      const html = await page.content();
      const productos = parsearProductos(html, cat);
      const nuevos = productos.filter(p => !vistos.has(p.url));
      nuevos.forEach(p => vistos.add(p.url));
      if (nuevos.length === 0) break;
      todos.push(...nuevos);
      console.log(`    → ${nuevos.length} productos (total: ${todos.length})`);
      paginaActual++;
      await new Promise(r => setTimeout(r, 800));
    } catch (e) {
      console.error(`    Error:`, e.message);
      break;
    }
  }
  return todos;
}

async function sincronizarProductosManuales(page) {
  console.log("\nSincronizando productos manuales...");
  const { data: manuales } = await supabase
    .from("productos_manuales")
    .select("url")
    .eq("activo", true)
    .eq("proveedor", "Patagonia Cell");

  if (!manuales || manuales.length === 0) {
    console.log("  No hay productos manuales.");
    return;
  }

  const ahora = new Date().toISOString();
  let importados = 0, actualizados = 0, errores = 0;

  for (const { url } of manuales) {
    console.log(`  Visitando: ${url}`);
    try {
      await page.goto(url, { waitUntil: "networkidle2", timeout: 30000 });
      const html = await page.content();
      const producto = parsearProductoIndividual(html, url);

      if (!producto) {
        console.log(`    No se pudo parsear.`);
        errores++;
        continue;
      }

      console.log(`    → ${producto.nombre} $${producto.precio} stock:${producto.stock}`);

      let marca = "Desconocida";
      if (url.includes("xiaomi") || url.includes("redmi") || url.includes("poco")) marca = "Xiaomi";
      else if (url.includes("samsung")) marca = "Samsung";
      else if (url.includes("motorola") || url.includes("moto")) marca = "Motorola";
      else if (url.includes("iphone")) marca = "iPhone";
      else if (url.includes("infinix")) marca = "Infinix";
      else if (url.includes("huawei")) marca = "Huawei";
      else if (url.includes("lg")) marca = "LG";

      const tipo = url.includes("bateria") ? "Batería" : "Módulo";

      const modelo = producto.nombre
        .replace(/^(Módulo|Modulo|Batería|Bateria|Pantalla)\s+/i, "")
        .replace(new RegExp(`^${marca}\\s+`, "i"), "")
        .replace(/\s*[-–]\s*(OLED|INCELL|Original|SERVICE PACK|Calidad).*$/i, "")
        .trim() || producto.nombre;

      const { data: existing } = await supabase
        .from("catalogo_repuestos")
        .select("id")
        .eq("proveedor", "Patagonia Cell")
        .eq("url_producto", url)
        .maybeSingle();

      const row = {
        proveedor: "Patagonia Cell",
        marca,
        modelo,
        nombre_completo: producto.nombre,
        tipo_repuesto: tipo,
        calidad: producto.calidad,
        precio: producto.precio,
        precio_proveedor: producto.precio,
        precio_calculado: producto.precio,
        stock: producto.stock,
        url_producto: url,
        fecha_actualizacion: ahora,
        ultima_sincronizacion: ahora,
      };

      if (existing?.id) {
        const { error } = await supabase.from("catalogo_repuestos").update(row).eq("id", existing.id);
        if (error) { console.error("Error update:", error.message); errores++; } else actualizados++;
      } else {
        const { error } = await supabase.from("catalogo_repuestos").insert(row);
        if (error) { console.error("Error insert:", error.message); errores++; } else importados++;
      }
    } catch (e) {
      console.error(`    Error:`, e.message);
      errores++;
    }
    await new Promise(r => setTimeout(r, 800));
  }

  console.log(`  Manuales: +${importados} nuevos, ~${actualizados} actualizados, ${errores} errores`);
}

async function sincronizar() {
  console.log("Iniciando sincronización Patagonia Cell...\n");
  const browser = await puppeteer.launch({
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });
  const page = await browser.newPage();
  await page.setUserAgent("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120.0.0.0 Safari/537.36");

  let totalImported = 0, totalUpdated = 0, totalErrors = 0, totalSinStock = 0;
  const ahora = new Date().toISOString();

  await supabase.from("catalogo_repuestos")
    .update({ stock: false })
    .eq("proveedor", "Patagonia Cell");
  console.log("Productos anteriores marcados como sin stock.\n");

  for (const cat of CATEGORIAS) {
    console.log(`Procesando ${cat.marca} ${cat.tipo}...`);
    try {
      const productos = await obtenerTodasLasPaginas(page, cat.url, cat);
      const conStock = productos.filter(p => p.stock).length;
      const sinStock = productos.filter(p => !p.stock).length;
      console.log(`  → Total: ${productos.length} (${conStock} con stock, ${sinStock} sin stock)\n`);
      totalSinStock += sinStock;

      for (const p of productos) {
        if (!p.stock) continue;

        const modelo = p.nombre
          .replace(/^(Módulo|Modulo|Batería|Bateria|Pantalla)\s+/i, "")
          .replace(/^(Samsung|Motorola|iPhone|Xiaomi|LG|Huawei|Alcatel|Infinix)\s+/i, "")
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
          marca: cat.marca,
          modelo,
          nombre_completo: p.nombre,
          tipo_repuesto: cat.tipo,
          calidad: p.calidad,
          precio: p.precio,
          precio_proveedor: p.precio,
          precio_calculado: p.precio,
          stock: true,
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

  await sincronizarProductosManuales(page);

  await browser.close();
  console.log(`\nFinalizado:`);
  console.log(`  +${totalImported} nuevos importados`);
  console.log(`  ~${totalUpdated} actualizados`);
  console.log(`  ${totalSinStock} sin stock omitidos`);
  console.log(`  ${totalErrors} errores`);
}

sincronizar().catch(console.error);