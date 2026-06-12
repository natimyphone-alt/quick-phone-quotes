import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { z } from "zod";

async function ensureAdmin(supabase: any, userId: string) {
  const { data, error } = await supabase
    .from("user_roles")
    .select("role")
    .eq("user_id", userId)
    .eq("role", "admin")
    .maybeSingle();
  if (error) throw new Response(error.message, { status: 500 });
  if (!data) throw new Response("Solo administradores pueden sincronizar proveedores", { status: 403 });
}

interface SyncResult {
  proveedor: string;
  ok: boolean;
  imported: number;
  updated: number;
  errors: number;
  message: string;
  needs_setup?: boolean;
  // FV paginado
  totalDiscovered?: number;
  processed?: number;
  nextOffset?: number | null;
  done?: boolean;
  errorSamples?: string[];
}

// ============ FV MAYORISTA — real connector ============

const FV_BASE = "https://www.fvmayorista.com";
const FV_PRODUCT_RE = /^https?:\/\/www\.fvmayorista\.com\/modulos-(originales|genericos)\/([^/]+)\/([^/]+)\/?$/i;

const MARCAS_CANON: Record<string, string> = {
  samsung: "Samsung", motorola: "Motorola", xiaomi: "Xiaomi", redmi: "Redmi",
  poco: "Poco", iphone: "iPhone", apple: "iPhone", huawei: "Huawei", honor: "Honor",
  oppo: "Oppo", "oppo-realme": "Oppo", realme: "Realme", zte: "ZTE", nokia: "Nokia",
  tcl: "TCL", alcatel: "Alcatel", lg: "LG", noblex: "Noblex", infinix: "Infinix",
  itel: "Itel", "tecno-spark": "Tecno", tecno: "Tecno", nubia: "Nubia", blu: "BLU",
  oukitel: "Oukitel", ulefone: "Ulefone", caterpillar: "Caterpillar",
};

function normalizarMarca(slug: string, titulo: string): string {
  const s = slug.toLowerCase();
  if (MARCAS_CANON[s]) return MARCAS_CANON[s];
  const t = titulo.toLowerCase();
  for (const [k, v] of Object.entries(MARCAS_CANON)) {
    if (t.includes(k.replace("-", " ")) || t.includes(k)) return v;
  }
  // Capitalize slug
  return s.charAt(0).toUpperCase() + s.slice(1);
}

function inferirTipo(titulo: string, _categoria: string): string {
  const t = titulo.toLowerCase();
  if (/bater[ií]a/.test(t)) return "Batería";
  if (/pin de carga|conector de carga|flex de carga/.test(t)) return "Pin de carga";
  if (/tapa/.test(t)) return "Tapa";
  if (/c[áa]mara/.test(t)) return "Cámara";
  if (/flex/.test(t)) return "Flex";
  if (/m[óo]dulo|display|pantalla|lcd|oled/.test(t)) return "Módulo";
  return "Módulo";
}

function inferirCalidad(categoria: string, titulo: string): string {
  if (categoria === "originales") return "Original";
  const t = titulo.toLowerCase();
  if (/oled/.test(t)) return "OLED";
  if (/incell|in-cell/.test(t)) return "Incell";
  return "Genérico";
}

function modeloDesdeTitulo(titulo: string, marca: string): string {
  // Quitar prefijos típicos
  let m = titulo
    .replace(/^M[óo]dulo (Original |Gen[ée]rico |)/i, "")
    .replace(/^Bater[ií]a (Original |Gen[ée]rico |)/i, "")
    .replace(/^Pin de carga /i, "")
    .replace(/^Tapa /i, "")
    .replace(new RegExp(`^${marca}\\s+`, "i"), "")
    .replace(/\s*[-–]\s*(OLED|INCELL|ORIGINAL|GENERICO|GENÉRICO).*$/i, "")
    .trim();
  return m || titulo;
}

async function fetchWithRetry(url: string, opts: RequestInit = {}, retries = 3, timeoutMs = 12000): Promise<Response> {
  let lastErr: unknown;
  for (let i = 0; i < retries; i++) {
    const ctrl = new AbortController();
    const t = setTimeout(() => ctrl.abort(), timeoutMs);
    try {
      const res = await fetch(url, {
        ...opts,
        signal: ctrl.signal,
        headers: {
          "User-Agent": "Mozilla/5.0 (compatible; MyPhoneHubBot/1.0)",
          Accept: "text/html,application/xhtml+xml,application/xml",
          ...(opts.headers || {}),
        },
      });
      clearTimeout(t);
      if (res.status === 429 || res.status >= 500) {
        await new Promise((r) => setTimeout(r, 500 * (i + 1)));
        continue;
      }
      return res;
    } catch (e) {
      clearTimeout(t);
      lastErr = e;
      await new Promise((r) => setTimeout(r, 500 * (i + 1)));
    }
  }
  throw lastErr ?? new Error(`Falló fetch ${url}`);
}

async function obtenerUrlsProductosFV(): Promise<string[]> {
  const res = await fetchWithRetry(`${FV_BASE}/sitemap.xml`);
  if (!res.ok) throw new Error(`Sitemap respondió ${res.status}`);
  const xml = await res.text();
  const locs: string[] = [];
  const re = /<loc>([^<]+)<\/loc>/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(xml)) !== null) {
    const url = m[1].trim();
    if (FV_PRODUCT_RE.test(url)) locs.push(url);
  }
  return locs;
}

interface FVProducto {
  url: string;
  categoria: "originales" | "genericos";
  marcaSlug: string;
  titulo: string;
  precioProveedor: number;
  precioAnterior: number | null;
  stock: boolean;
  imagen: string | null;
}

async function scrapearProductoFV(url: string): Promise<FVProducto | null> {
  const res = await fetchWithRetry(url);
  if (!res.ok) throw new Error(`HTTP ${res.status} en ${url}`);
  const html = await res.text();

  // Variables canónicas de Empretienda
  const sProdMatch = html.match(/var\s+s_producto\s*=\s*(\{[^;]+\});/);
  const stockMatch = html.match(/var\s+stock\s*=\s*(\[[^;]+\]);/);
  if (!sProdMatch) return null;

  let sProd: any;
  try { sProd = JSON.parse(sProdMatch[1]); } catch { return null; }
  let stockArr: any[] = [];
  if (stockMatch) { try { stockArr = JSON.parse(stockMatch[1]); } catch { /* noop */ } }

  // Precio: usar oferta si está activa, sino precio normal
  let precio = Number(sProd.precio) || 0;
  let precioAnterior: number | null = sProd.precio_anterior ? Number(sProd.precio_anterior) : null;
  if (stockArr.length > 0) {
    const s0 = stockArr[0];
    if (s0.s_oferta && s0.s_precio_oferta) {
      precio = Number(s0.s_precio_oferta);
      precioAnterior = Number(s0.s_precio);
    } else if (s0.s_precio) {
      precio = Number(s0.s_precio);
    }
  }

  // Stock: cualquier item con s_ilimitado=1 o s_cantidad>0
  const stock = stockArr.length === 0
    ? !!sProd.stock
    : stockArr.some((s) => s.s_ilimitado === 1 || Number(s.s_cantidad) > 0);

  // Título
  const h1 = html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i);
  const ogTitle = html.match(/<meta\s+property=["']og:title["']\s+content=["']([^"']+)["']/i);
  const titulo = (h1?.[1] || ogTitle?.[1] || "")
    .replace(/<[^>]+>/g, "")
    .replace(/&amp;/g, "&").replace(/&nbsp;/g, " ")
    .trim();

  // Imagen
  const ogImg = html.match(/<meta\s+property=["']og:image["']\s+content=["']([^"']+)["']/i);
  const imagen = ogImg?.[1] || null;

  const parsed = url.match(FV_PRODUCT_RE)!;
  return {
    url,
    categoria: parsed[1].toLowerCase() as "originales" | "genericos",
    marcaSlug: parsed[2],
    titulo,
    precioProveedor: precio,
    precioAnterior,
    stock,
    imagen,
  };
}

async function procesarConConcurrencia<T, R>(
  items: T[],
  concurrencia: number,
  fn: (item: T) => Promise<R>,
): Promise<{ resultados: R[]; errores: { item: T; error: string }[] }> {
  const resultados: R[] = [];
  const errores: { item: T; error: string }[] = [];
  let i = 0;
  async function worker() {
    while (i < items.length) {
      const idx = i++;
      try {
        const r = await fn(items[idx]);
        resultados.push(r);
      } catch (e: any) {
        errores.push({ item: items[idx], error: e?.message || String(e) });
      }
    }
  }
  await Promise.all(Array.from({ length: concurrencia }, worker));
  return { resultados, errores };
}

const FV_BATCH_SIZE = 30;
const FV_CONCURRENCY = 5;

export const syncFV = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) =>
    z.object({ offset: z.number().int().min(0).default(0) }).parse(d ?? {}),
  )
  .middleware([requireSupabaseAuth])
  .handler(async ({ data, context }): Promise<SyncResult> => {
    const { supabase, userId } = context;
    await ensureAdmin(supabase, userId);

    const proveedor = "FV Mayorista";
    const ahora = new Date().toISOString();

    try {
      const todasUrls = await obtenerUrlsProductosFV();
      const total = todasUrls.length;
      const slice = todasUrls.slice(data.offset, data.offset + FV_BATCH_SIZE);

      if (slice.length === 0) {
        await supabase.from("proveedores_config")
          .update({ estado: "sincronizado", ultima_sincronizacion: ahora })
          .eq("nombre", proveedor);
        return {
          proveedor, ok: true, imported: 0, updated: 0, errors: 0,
          totalDiscovered: total, processed: data.offset, done: true,
          nextOffset: null,
          message: `Sincronización completada. ${total} URLs procesadas en total.`,
        };
      }

      const { resultados, errores } = await procesarConConcurrencia(
        slice, FV_CONCURRENCY, scrapearProductoFV,
      );

      let imported = 0, updated = 0;
      const errorSamples: string[] = errores.slice(0, 3).map((e) => `${e.item}: ${e.error}`);

      for (const p of resultados) {
        if (!p || !p.titulo || p.precioProveedor <= 0) continue;

        const marca = normalizarMarca(p.marcaSlug, p.titulo);
        const modelo = modeloDesdeTitulo(p.titulo, marca);
        const tipo = inferirTipo(p.titulo, p.categoria);
        const calidad = inferirCalidad(p.categoria, p.titulo);
        const precioCalc = p.precioProveedor + 10000; // recargo FV

        // ¿Existe?
        const { data: existing } = await supabase
          .from("catalogo_repuestos")
          .select("id")
          .eq("proveedor", proveedor)
          .eq("url_producto", p.url)
          .maybeSingle();

        const row = {
          proveedor,
          marca,
          modelo,
          tipo_repuesto: tipo,
          calidad,
          precio: p.precioProveedor,
          precio_proveedor: p.precioProveedor,
          precio_calculado: precioCalc,
          url_producto: p.url,
          fecha_actualizacion: ahora,
          ultima_sincronizacion: ahora,
        };

        if (existing?.id) {
          const { error } = await supabase.from("catalogo_repuestos")
            .update(row).eq("id", existing.id);
          if (error) errorSamples.push(`update ${p.url}: ${error.message}`);
          else updated++;
        } else {
          const { error } = await supabase.from("catalogo_repuestos").insert(row);
          if (error) errorSamples.push(`insert ${p.url}: ${error.message}`);
          else imported++;
        }
      }

      const nextOffset = data.offset + slice.length;
      const done = nextOffset >= total;

      await supabase.from("proveedores_config")
        .update({
          estado: done ? "sincronizado" : "sincronizando",
          ultima_sincronizacion: ahora,
        })
        .eq("nombre", proveedor);

      return {
        proveedor,
        ok: true,
        imported,
        updated,
        errors: errores.length,
        totalDiscovered: total,
        processed: nextOffset,
        nextOffset: done ? null : nextOffset,
        done,
        errorSamples: errorSamples.length ? errorSamples.slice(0, 5) : undefined,
        message: done
          ? `FV Mayorista sincronizado. Lote: +${imported} nuevos / ~${updated} actualizados / ${errores.length} errores.`
          : `Lote ${data.offset}-${nextOffset} de ${total}: +${imported} nuevos, ~${updated} actualizados, ${errores.length} errores.`,
      };
    } catch (e: any) {
      await supabase.from("proveedores_config")
        .update({ estado: "error", ultima_sincronizacion: ahora })
        .eq("nombre", proveedor);
      return {
        proveedor, ok: false, imported: 0, updated: 0, errors: 1,
        message: `Error sincronizando FV Mayorista: ${e?.message || e}`,
      };
    }
  });

// ============ PATAGONIA CELL — pendiente conector real ============

export const syncPatagonia = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<SyncResult> => {
    const { supabase, userId } = context;
    await ensureAdmin(supabase, userId);

    const { data: cfg } = await supabase
      .from("proveedores_config").select("*")
      .eq("nombre", "Patagonia Cell").maybeSingle();

    const faltan = !cfg || !cfg.url || !cfg.usuario || !cfg.password_encrypted;
    await supabase.from("proveedores_config")
      .update({
        estado: faltan ? "credenciales_faltantes" : "pendiente_integracion",
        ultima_sincronizacion: new Date().toISOString(),
      })
      .eq("nombre", "Patagonia Cell");

    return {
      proveedor: "Patagonia Cell",
      ok: false, imported: 0, updated: 0, errors: 0,
      needs_setup: faltan,
      message: faltan
        ? "Faltan credenciales de Patagonia Cell. Configurálas en Configuración → Proveedores."
        : "Credenciales OK. Falta implementar el scraper autenticado de Patagonia Cell.",
    };
  });

export const syncTodo = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<SyncResult[]> => {
    const { supabase, userId } = context;
    await ensureAdmin(supabase, userId);
    // Solo informa estados, la UI debe disparar syncFV en bucle por su cuenta.
    const results: SyncResult[] = [];
    const { data: cfgs } = await supabase.from("proveedores_config").select("*");
    for (const cfg of cfgs || []) {
      results.push({
        proveedor: cfg.nombre, ok: false, imported: 0, updated: 0, errors: 0,
        message: cfg.nombre === "FV Mayorista"
          ? "Usá el botón 'Sincronizar FV Mayorista' (corre en lotes)."
          : "Pendiente conector real.",
      });
    }
    return results;
  });
