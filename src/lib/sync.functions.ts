import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { z } from "zod";

async function ensureAdmin(supabase: any, userId: string) {
  const { data: authUser } = await supabase.auth.getUser();
  const email = authUser?.user?.email;
  if (!email) throw new Response("No autenticado", { status: 401 });
  const { data } = await supabase.from("usuarios").select("rol").eq("email", email).maybeSingle();
  if (data?.rol !== "administrador") throw new Response("Solo administradores", { status: 403 });
}

interface SyncResult {
  proveedor: string; ok: boolean; imported: number; updated: number; errors: number;
  message: string; needs_setup?: boolean; totalDiscovered?: number; processed?: number;
  nextOffset?: number | null; done?: boolean; errorSamples?: string[];
}

const FV_BASE = "https://www.fvmayorista.com";
const UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120.0.0.0 Safari/537.36";
const PC_BASE = "https://neuquenpatagoniacell.com.ar";

const CATEGORIAS_FV: { marca: string; tipo: "Módulo" | "Batería"; categoriaId: number }[] = [
  { marca: "Motorola", tipo: "Módulo", categoriaId: 1631246 },
  { marca: "Samsung", tipo: "Módulo", categoriaId: 1631245 },
  { marca: "iPhone", tipo: "Módulo", categoriaId: 1645686 },
  { marca: "TCL", tipo: "Módulo", categoriaId: 1664994 },
  { marca: "Alcatel", tipo: "Módulo", categoriaId: 1664999 },
  { marca: "ZTE", tipo: "Módulo", categoriaId: 2223371 },
  { marca: "Xiaomi", tipo: "Módulo", categoriaId: 3230741 },
  { marca: "Huawei", tipo: "Módulo", categoriaId: 3234355 },
  { marca: "Tecno", tipo: "Módulo", categoriaId: 3313430 },
  { marca: "Oppo", tipo: "Módulo", categoriaId: 3313509 },
  { marca: "Itel", tipo: "Módulo", categoriaId: 3313746 },
  { marca: "Infinix", tipo: "Módulo", categoriaId: 3313757 },
  { marca: "LG", tipo: "Módulo", categoriaId: 3319264 },
  { marca: "Nokia", tipo: "Módulo", categoriaId: 3383455 },
  { marca: "Honor", tipo: "Módulo", categoriaId: 3457887 },
  { marca: "Nubia", tipo: "Módulo", categoriaId: 3457898 },
  { marca: "Vivo", tipo: "Módulo", categoriaId: 3562066 },
  { marca: "Blackview", tipo: "Módulo", categoriaId: 3640482 },
  { marca: "Samsung", tipo: "Batería", categoriaId: 3698440 },
  { marca: "Motorola", tipo: "Batería", categoriaId: 3698441 },
  { marca: "LG", tipo: "Batería", categoriaId: 3698442 },
];

async function obtenerSesion(): Promise<{ csrfToken: string; cookie: string }> {
  const res = await fetch(`${FV_BASE}/`, {
    headers: { "User-Agent": UA, Accept: "text/html,application/xhtml+xml" },
    signal: AbortSignal.timeout(15000),
  });
  if (!res.ok) throw new Error(`No se pudo obtener sesión: HTTP ${res.status}`);
  const html = await res.text();
  const tokenMatch = html.match(/<meta\s+name=["']csrf-token["']\s+content=["']([^"']+)["']/i);
  if (!tokenMatch) throw new Error("No se encontró csrf-token");
  const setCookie = res.headers.get("set-cookie") || "";
  return { csrfToken: tokenMatch[1], cookie: setCookie };
}

async function fetchJsonFV(url: string, csrfToken: string, cookie: string): Promise<any> {
  const res = await fetch(url, {
    headers: {
      "User-Agent": UA, Accept: "application/json, text/plain, */*",
      Referer: `${FV_BASE}/`, Origin: FV_BASE, "X-Requested-With": "XMLHttpRequest",
      "X-Csrf-Token": csrfToken, ...(cookie ? { Cookie: cookie } : {}),
    },
    signal: AbortSignal.timeout(15000),
  });
  if (!res.ok) throw new Error(`HTTP ${res.status} en ${url}`);
  return res.json();
}

interface FVApiProducto {
  idProductos: number; p_nombre: string; p_precio: number; p_link: string;
  p_oferta: number; p_precio_oferta: number;
  stock: { s_cantidad: number; s_ilimitado: number; s_precio: number; s_oferta: number; s_precio_oferta: number }[];
}

function tieneStockFV(p: FVApiProducto): boolean {
  if (!p.stock || p.stock.length === 0) return true;
  return p.stock.some((s) => s.s_ilimitado === 1 || Number(s.s_cantidad) > 0);
}

function precioRealFV(p: FVApiProducto): number {
  if (p.stock && p.stock.length > 0) {
    const s = p.stock[0];
    if (s.s_oferta && s.s_precio_oferta) return Number(s.s_precio_oferta);
    if (s.s_precio) return Number(s.s_precio);
  }
  if (p.p_oferta && p.p_precio_oferta) return Number(p.p_precio_oferta);
  return Number(p.p_precio) || 0;
}

function modeloDesdeNombreFV(nombre: string, marca: string): string {
  let m = nombre.replace(/^(MODULO|M[OÓ]DULO|BATERIA|BATER[IÍ]A)\s+/i, "").replace(new RegExp(`^${marca}\\s+`, "i"), "").trim();
  return m || nombre;
}

function inferirCalidadFV(nombre: string): string {
  const n = nombre.toLowerCase();
  if (/oled/.test(n)) return "OLED";
  if (/incell|in-cell/.test(n)) return "Incell";
  return "Original";
}

interface PCProducto {
  nombre: string; precio: number; url: string; stock: boolean; imagen: string | null;
}

function parsearResultadosPC(html: string): PCProducto[] {
  const productos: PCProducto[] = [];
  const vistos = new Set<string>();

  const bloqueRe = /data-variants="([^"]+)"[\s\S]{0,3000}?href="(https?:\/\/[^"]+\/productos\/[^"]+)"[^>]*title="([^"]+)"/g;
  let m: RegExpExecArray | null;
  while ((m = bloqueRe.exec(html)) !== null) {
    const url = m[2];
    if (vistos.has(url)) continue;
    vistos.add(url);
    const nombre = m[3].replace(/&amp;/g, "&").replace(/&quot;/g, '"').trim();
    let variantsJson: any[] = [];
    try {
      const decoded = m[1].replace(/&quot;/g, '"').replace(/&amp;/g, "&").replace(/&#39;/g, "'");
      variantsJson = JSON.parse(decoded);
    } catch { continue; }
    if (!variantsJson.length) continue;
    const v = variantsJson[0];
    const precio = Number(v.price_number) || 0;
    if (precio <= 0) continue;
    const stock = v.available === true && (v.stock === null || Number(v.stock) > 0);
    productos.push({ nombre, precio, url, stock, imagen: null });
  }
  return productos;
}

export const syncFV = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => z.object({ offset: z.number().int().min(0).default(0) }).parse(d ?? {}))
  .middleware([requireSupabaseAuth])
  .handler(async ({ data, context }): Promise<SyncResult> => {
    const { supabase, userId } = context;
    await ensureAdmin(supabase, userId);
    const proveedor = "FV Mayorista";
    const ahora = new Date().toISOString();
    let imported = 0, updated = 0, errors = 0;
    const errorSamples: string[] = [];
    const categoriaIdx = data.offset;
    if (categoriaIdx >= CATEGORIAS_FV.length) {
      await supabase.from("proveedores_config").update({ estado: "sincronizado", ultima_sincronizacion: ahora }).eq("nombre", proveedor);
      return { proveedor, ok: true, imported, updated, errors, totalDiscovered: CATEGORIAS_FV.length, processed: CATEGORIAS_FV.length, done: true, nextOffset: null, message: "FV Mayorista sincronizado completamente." };
    }
    const cat = CATEGORIAS_FV[categoriaIdx];
    try {
      const { csrfToken, cookie } = await obtenerSesion();
      let page = 1;
      while (page <= 30) {
        const url = `${FV_BASE}/v4/product/category?filter_page=${page}&filter_order=0&filter_categories%5B%5D=${cat.categoriaId}`;
        const json = await fetchJsonFV(url, csrfToken, cookie);
        const productos: FVApiProducto[] = json?.data || [];
        if (productos.length === 0) break;
        for (const p of productos) {
          const stock = tieneStockFV(p);
          const precio = precioRealFV(p);
          if (precio <= 0) continue;
          const precioCalc = precio + 10000;
          const urlProducto = `${FV_BASE}/${cat.tipo === "Batería" ? "bateria-originales" : "modulos-originales"}/${cat.marca.toLowerCase()}/${p.p_link}`;
          const modelo = modeloDesdeNombreFV(p.p_nombre, cat.marca);
          const calidad = inferirCalidadFV(p.p_nombre);
          const { data: existing } = await supabase.from("catalogo_repuestos").select("id").eq("proveedor", proveedor).eq("url_producto", urlProducto).maybeSingle();
          const row = { proveedor, marca: cat.marca, modelo, tipo_repuesto: cat.tipo, calidad, precio, precio_proveedor: precio, precio_calculado: precioCalc, stock, url_producto: urlProducto, fecha_actualizacion: ahora, ultima_sincronizacion: ahora };
          if (existing?.id) {
            const { error } = await supabase.from("catalogo_repuestos").update(row as any).eq("id", existing.id);
            if (error) { errorSamples.push(error.message); errors++; } else updated++;
          } else {
            const { error } = await supabase.from("catalogo_repuestos").insert(row as any);
            if (error) { errorSamples.push(error.message); errors++; } else imported++;
          }
        }
        if (productos.length < 12) break;
        page++;
      }
    } catch (e: any) {
      errors++;
      errorSamples.push(`${cat.marca} (${cat.tipo}): ${e.message}`);
    }
    const nextOffset = categoriaIdx + 1;
    const done = nextOffset >= CATEGORIAS_FV.length;
    await supabase.from("proveedores_config").update({ estado: done ? "sincronizado" : "sincronizando", ultima_sincronizacion: ahora, notas: JSON.stringify({ last_offset: done ? 0 : nextOffset, last_batch_at: ahora }) }).eq("nombre", proveedor);
    return { proveedor, ok: true, imported, updated, errors, totalDiscovered: CATEGORIAS_FV.length, processed: nextOffset, nextOffset: done ? null : nextOffset, done, errorSamples: errorSamples.length ? errorSamples.slice(0, 5) : undefined, message: done ? `FV sincronizado. +${imported} nuevos, ~${updated} actualizados.` : `${cat.marca} ${cat.tipo} (${categoriaIdx + 1}/${CATEGORIAS_FV.length}): +${imported} nuevos, ~${updated} actualizados.` };
  });

export const getFVStatus = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase } = context;
    const { data: cfg } = await supabase.from("proveedores_config").select("estado, ultima_sincronizacion, notas").eq("nombre", "FV Mayorista").maybeSingle();
    const { count } = await supabase.from("catalogo_repuestos").select("*", { count: "exact", head: true }).eq("proveedor", "FV Mayorista");
    let parsed: any = {};
    try { parsed = cfg?.notas ? JSON.parse(cfg.notas) : {}; } catch { parsed = {}; }
    return { estado: cfg?.estado ?? "no_configurado", ultima_sincronizacion: cfg?.ultima_sincronizacion ?? null, cargados: count ?? 0, last_offset: Number(parsed.last_offset) || 0, total_discovered: CATEGORIAS_FV.length, last_error: parsed.last_error ?? null, last_batch_at: parsed.last_batch_at ?? null, logs: [] };
  });

export const resetFVSync = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;
    await ensureAdmin(supabase, userId);
    await supabase.from("proveedores_config").update({ estado: "no_configurado", notas: null }).eq("nombre", "FV Mayorista");
    return { ok: true };
  });

export const buscarPatagoniaCell = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => z.object({ marca: z.string().min(1), modelo: z.string().min(1) }).parse(d ?? {}))
  .middleware([requireSupabaseAuth])
  .handler(async ({ data }): Promise<{ ok: boolean; productos: PCProducto[]; message: string }> => {
    const query = `${data.marca} ${data.modelo}`.trim();
    try {
      const puppeteer = await import("puppeteer");
      const browser = await puppeteer.default.launch({
        headless: true,
        args: ["--no-sandbox", "--disable-setuid-sandbox"],
      });
      const page = await browser.newPage();
      await page.setUserAgent(UA);
      await page.goto(`${PC_BASE}/search/?q=${encodeURIComponent(query)}`, {
        waitUntil: "networkidle2",
        timeout: 30000,
      });
      const html = await page.content();
      await browser.close();

      const fs = await import("fs");
      fs.writeFileSync("C:/Users/PCBOX/pc_debug.html", `LENGTH:${html.length}\n\n${html.slice(0, 3000)}`);

      const productos = parsearResultadosPC(html);
      return {
        ok: true,
        productos,
        message: productos.length > 0 ? `${productos.length} resultados en Patagonia Cell` : "Sin resultados en Patagonia Cell",
      };
    } catch (e: any) {
      return { ok: false, productos: [], message: e?.message || "Error buscando en Patagonia Cell" };
    }
  });

export const syncPatagonia = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<SyncResult> => {
    const { supabase, userId } = context;
    await ensureAdmin(supabase, userId);
    return { proveedor: "Patagonia Cell", ok: true, imported: 0, updated: 0, errors: 0, message: "Patagonia Cell usa búsqueda en tiempo real. No requiere sincronización previa." };
  });

export const syncTodo = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<SyncResult[]> => {
    const { supabase, userId } = context;
    await ensureAdmin(supabase, userId);
    return [
      { proveedor: "FV Mayorista", ok: false, imported: 0, updated: 0, errors: 0, message: "Usá el botón Sincronizar FV." },
      { proveedor: "Patagonia Cell", ok: true, imported: 0, updated: 0, errors: 0, message: "Búsqueda en tiempo real, no requiere sincronización." },
    ];
  });