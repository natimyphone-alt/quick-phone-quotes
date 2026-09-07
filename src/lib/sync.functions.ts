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
  { marca: "iPhone", tipo: "Batería", categoriaId: 4383701 },
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

async function fetchHtmlFV(url: string, csrfToken: string, cookie: string): Promise<string> {
  const res = await fetch(url, {
    headers: {
      "User-Agent": UA, Accept: "text/html,application/xhtml+xml",
      Referer: `${FV_BASE}/`, "X-Csrf-Token": csrfToken,
      ...(cookie ? { Cookie: cookie } : {}),
    },
    signal: AbortSignal.timeout(15000),
  });
  if (!res.ok) throw new Error(`HTTP ${res.status} en ${url}`);
  return res.text();
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

async function sincronizarManualesFV(supabase: any, csrfToken: string, cookie: string): Promise<{ imported: number; updated: number; errors: number }> {
  const { data: manuales } = await supabase
    .from("productos_manuales")
    .select("url")
    .eq("activo", true)
    .eq("proveedor", "FV Mayorista");

  if (!manuales || manuales.length === 0) return { imported: 0, updated: 0, errors: 0 };

  let imported = 0, updated = 0, errors = 0;
  const ahora = new Date().toISOString();

  for (const { url } of manuales) {
    try {
      const html = await fetchHtmlFV(url, csrfToken, cookie);

      // Extraer precio del JSON embebido en la página
      const precioMatch = html.match(/"p_precio"\s*:\s*(\d+)/);
      const nombreMatch = html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i);
      const stockMatch = html.match(/"s_cantidad"\s*:\s*(\d+)/) || html.match(/"s_ilimitado"\s*:\s*(\d+)/);

      const precio = precioMatch ? Number(precioMatch[1]) : 0;
      if (precio <= 0) { errors++; continue; }

      const nombre = nombreMatch
        ? nombreMatch[1].replace(/<[^>]+>/g, "").trim()
        : url.split("/").filter(Boolean).pop()?.replace(/-/g, " ").toUpperCase() || "Producto";

      const stock = stockMatch ? Number(stockMatch[1]) > 0 : true;
      const precioCalc = Math.round(precio * 1.21) + 10000;

      // Detectar marca y tipo desde URL
      let marca = "Desconocida";
      let tipo: "Módulo" | "Batería" = "Módulo";
      if (url.includes("iphone") || url.includes("apple")) marca = "iPhone";
      else if (url.includes("samsung")) marca = "Samsung";
      else if (url.includes("motorola") || url.includes("moto")) marca = "Motorola";
      else if (url.includes("xiaomi") || url.includes("redmi")) marca = "Xiaomi";
      if (url.includes("bateria")) tipo = "Batería";

      const modelo = modeloDesdeNombreFV(nombre, marca);
      const calidad = inferirCalidadFV(nombre);

      const { data: existing } = await supabase
        .from("catalogo_repuestos").select("id")
        .eq("proveedor", "FV Mayorista").eq("url_producto", url).maybeSingle();

      const row = {
        proveedor: "FV Mayorista", marca, modelo, nombre_completo: nombre,
        tipo_repuesto: tipo, calidad, precio, precio_proveedor: precio,
        precio_calculado: precioCalc, stock, url_producto: url,
        fecha_actualizacion: ahora, ultima_sincronizacion: ahora,
      };

      if (existing?.id) {
        const { error } = await supabase.from("catalogo_repuestos").update(row as any).eq("id", existing.id);
        if (error) errors++; else updated++;
      } else {
        const { error } = await supabase.from("catalogo_repuestos").insert(row as any);
        if (error) errors++; else imported++;
      }
    } catch (e: any) {
      errors++;
    }
  }

  return { imported, updated, errors };
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
      // Sincronizar productos manuales al finalizar
      const { csrfToken, cookie } = await obtenerSesion();
      const manuales = await sincronizarManualesFV(supabase, csrfToken, cookie);
      await supabase.from("proveedores_config").update({ estado: "sincronizado", ultima_sincronizacion: ahora }).eq("nombre", proveedor);
      return {
        proveedor, ok: true,
        imported: manuales.imported, updated: manuales.updated, errors: manuales.errors,
        totalDiscovered: CATEGORIAS_FV.length, processed: CATEGORIAS_FV.length,
        done: true, nextOffset: null,
        message: `FV sincronizado. Manuales: +${manuales.imported} nuevos, ~${manuales.updated} actualizados.`,
      };
    }

    const cat = CATEGORIAS_FV[categoriaIdx];
    try {
      const { csrfToken, cookie } = await obtenerSesion();
      let page = 1;
      while (page <= 50) {
        const url = `${FV_BASE}/v4/product/category?filter_page=${page}&filter_order=0&filter_categories%5B%5D=${cat.categoriaId}`;
        const json = await fetchJsonFV(url, csrfToken, cookie);
        const productos: FVApiProducto[] = json?.data || [];
        if (productos.length === 0) break;
        for (const p of productos) {
          const stock = tieneStockFV(p);
          const precio = precioRealFV(p);
          if (precio <= 0) continue;
          const precioCalc = Math.round(precio * 1.21) + 10000;
          const urlProducto = `${FV_BASE}/${cat.tipo === "Batería" ? "bateria-originales" : "modulos-originales"}/${cat.marca.toLowerCase()}/${p.p_link}`;
          const modelo = modeloDesdeNombreFV(p.p_nombre, cat.marca);
          const calidad = inferirCalidadFV(p.p_nombre);
          const { data: existing } = await supabase.from("catalogo_repuestos").select("id").eq("proveedor", proveedor).eq("url_producto", urlProducto).maybeSingle();
          const row = {
            proveedor, marca: cat.marca, modelo, nombre_completo: p.p_nombre,
            tipo_repuesto: cat.tipo, calidad, precio, precio_proveedor: precio,
            precio_calculado: precioCalc, stock, url_producto: urlProducto,
            fecha_actualizacion: ahora, ultima_sincronizacion: ahora,
          };
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
    await supabase.from("proveedores_config").update({
      estado: done ? "sincronizando_manuales" : "sincronizando",
      ultima_sincronizacion: ahora,
      notas: JSON.stringify({ last_offset: done ? 0 : nextOffset, last_batch_at: ahora }),
    }).eq("nombre", proveedor);

    return {
      proveedor, ok: true, imported, updated, errors,
      totalDiscovered: CATEGORIAS_FV.length, processed: nextOffset,
      nextOffset: done ? CATEGORIAS_FV.length : nextOffset,
      done: false,
      errorSamples: errorSamples.length ? errorSamples.slice(0, 5) : undefined,
      message: `${cat.marca} ${cat.tipo} (${categoriaIdx + 1}/${CATEGORIAS_FV.length}): +${imported} nuevos, ~${updated} actualizados.`,
    };
  });

export const getFVStatus = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase } = context;
    const { data: cfg } = await supabase.from("proveedores_config").select("estado, ultima_sincronizacion, notas").eq("nombre", "FV Mayorista").maybeSingle();
    const { count } = await supabase.from("catalogo_repuestos").select("*", { count: "exact", head: true }).eq("proveedor", "FV Mayorista");
    let parsed: any = {};
    try { parsed = cfg?.notas ? JSON.parse(cfg.notas) : {}; } catch { parsed = {}; }
    return {
      estado: cfg?.estado ?? "no_configurado",
      ultima_sincronizacion: cfg?.ultima_sincronizacion ?? null,
      cargados: count ?? 0,
      last_offset: Number(parsed.last_offset) || 0,
      total_discovered: CATEGORIAS_FV.length,
      last_error: parsed.last_error ?? null,
      last_batch_at: parsed.last_batch_at ?? null,
      logs: [],
    };
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
  .handler(async (): Promise<{ ok: boolean; productos: any[]; message: string }> => {
    return { ok: true, productos: [], message: "Patagonia Cell usa catálogo local." };
  });

export const syncPatagonia = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<SyncResult> => {
    const { supabase, userId } = context;
    await ensureAdmin(supabase, userId);
    return { proveedor: "Patagonia Cell", ok: true, imported: 0, updated: 0, errors: 0, message: "Patagonia Cell se sincroniza con el script local sync-patagonia.mjs" };
  });

export const buscarPrecioMercadoFn = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => z.object({ marca: z.string(), modelo: z.string() }).parse(d ?? {}))
  .middleware([requireSupabaseAuth])
  .handler(async ({ data }): Promise<{ precio: number }> => {
    try {
      const response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": process.env.ANTHROPIC_API_KEY || "",
          "anthropic-version": "2023-06-01",
        },
        body: JSON.stringify({
          model: "claude-sonnet-4-6",
          max_tokens: 100,
          messages: [{
            role: "user",
            content: `¿Cuál es el precio de venta aproximado en pesos argentinos del ${data.marca} ${data.modelo} en julio 2026 en Argentina? Respondé SOLO con el número sin puntos ni comas ni símbolo $. Por ejemplo: 350000`,
          }],
        }),
      });
      const result = await response.json();
      const texto = result.content?.[0]?.text?.trim() || "0";
      const numero = parseInt(texto.replace(/\D/g, ""), 10);
      return { precio: isNaN(numero) ? 0 : numero };
    } catch {
      return { precio: 0 };
    }
  });

export const syncTodo = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<SyncResult[]> => {
    const { supabase, userId } = context;
    await ensureAdmin(supabase, userId);
    return [
      { proveedor: "FV Mayorista", ok: false, imported: 0, updated: 0, errors: 0, message: "Usá el botón Sincronizar FV." },
      { proveedor: "Patagonia Cell", ok: true, imported: 0, updated: 0, errors: 0, message: "Usá el script local sync-patagonia.mjs" },
    ];
  });