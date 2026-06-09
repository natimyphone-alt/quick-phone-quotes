import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

/**
 * Verifica que el usuario autenticado sea administrador.
 * Lanza Response 403 si no lo es.
 */
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
  message: string;
  needs_setup?: boolean;
}

/**
 * Sincronizar Patagonia Cell.
 *
 * Estado actual: Infraestructura lista. La extracción real requiere
 * que el proveedor publique:
 *   a) Un endpoint/API de catálogo, o
 *   b) Credenciales válidas para iniciar sesión y scrapear el sitio.
 *
 * Mientras no estén configuradas en `proveedores_config`, esta función
 * devuelve un resultado informativo sin tocar el catálogo.
 */
export const syncPatagonia = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<SyncResult> => {
    const { supabase, userId } = context;
    await ensureAdmin(supabase, userId);

    const { data: cfg } = await supabase
      .from("proveedores_config")
      .select("*")
      .eq("nombre", "Patagonia Cell")
      .maybeSingle();

    if (!cfg || !cfg.url || !cfg.usuario || !cfg.password_encrypted) {
      await supabase
        .from("proveedores_config")
        .update({ estado: "credenciales_faltantes", ultima_sincronizacion: new Date().toISOString() })
        .eq("nombre", "Patagonia Cell");
      return {
        proveedor: "Patagonia Cell",
        ok: false,
        imported: 0,
        updated: 0,
        needs_setup: true,
        message: "Faltan credenciales de Patagonia Cell. Configurálas en Configuración → Proveedores.",
      };
    }

    // TODO: Implementar fetch real al sitio del proveedor con cfg.url / cfg.usuario.
    // Por ahora marcamos el intento.
    await supabase
      .from("proveedores_config")
      .update({ estado: "pendiente_integracion", ultima_sincronizacion: new Date().toISOString() })
      .eq("nombre", "Patagonia Cell");

    return {
      proveedor: "Patagonia Cell",
      ok: false,
      imported: 0,
      updated: 0,
      message:
        "Credenciales configuradas. Falta el conector HTTP real con el sitio de Patagonia Cell (endpoint o scraper autenticado).",
    };
  });

export const syncFV = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<SyncResult> => {
    const { supabase, userId } = context;
    await ensureAdmin(supabase, userId);

    const { data: cfg } = await supabase
      .from("proveedores_config")
      .select("*")
      .eq("nombre", "FV Mayorista")
      .maybeSingle();

    if (!cfg || !cfg.url || !cfg.usuario || !cfg.password_encrypted) {
      await supabase
        .from("proveedores_config")
        .update({ estado: "credenciales_faltantes", ultima_sincronizacion: new Date().toISOString() })
        .eq("nombre", "FV Mayorista");
      return {
        proveedor: "FV Mayorista",
        ok: false,
        imported: 0,
        updated: 0,
        needs_setup: true,
        message: "Faltan credenciales de FV Mayorista. Configurálas en Configuración → Proveedores.",
      };
    }

    await supabase
      .from("proveedores_config")
      .update({ estado: "pendiente_integracion", ultima_sincronizacion: new Date().toISOString() })
      .eq("nombre", "FV Mayorista");

    return {
      proveedor: "FV Mayorista",
      ok: false,
      imported: 0,
      updated: 0,
      message:
        "Credenciales configuradas. Falta el conector HTTP real con el portal de FV Mayorista (login + scraping del listado).",
    };
  });

export const syncTodo = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<SyncResult[]> => {
    const { supabase, userId } = context;
    await ensureAdmin(supabase, userId);
    // Reutilizamos la lógica llamando a las mismas rutinas
    const results: SyncResult[] = [];
    for (const nombre of ["Patagonia Cell", "FV Mayorista"]) {
      const { data: cfg } = await supabase
        .from("proveedores_config")
        .select("*").eq("nombre", nombre).maybeSingle();
      const faltan = !cfg || !cfg.url || !cfg.usuario || !cfg.password_encrypted;
      await supabase
        .from("proveedores_config")
        .update({
          estado: faltan ? "credenciales_faltantes" : "pendiente_integracion",
          ultima_sincronizacion: new Date().toISOString(),
        })
        .eq("nombre", nombre);
      results.push({
        proveedor: nombre, ok: false, imported: 0, updated: 0,
        needs_setup: faltan,
        message: faltan
          ? `Faltan credenciales para ${nombre}.`
          : `Credenciales OK para ${nombre}. Falta el conector HTTP real.`,
      });
    }
    return results;
  });
