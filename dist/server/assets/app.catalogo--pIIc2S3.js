import { jsxs, jsx, Fragment } from "react/jsx-runtime";
import * as React from "react";
import { useState, useRef, useEffect } from "react";
import { useRouter, isRedirect } from "@tanstack/react-router";
import { s as supabase } from "./client-CzxaLLtB.js";
import { u as useAuth } from "./use-auth-GpmAL4wB.js";
import { C as Card, d as CardContent, a as CardHeader, b as CardTitle } from "./card-DQ5v2DYb.js";
import { B as Button } from "./button-BC9oXVxV.js";
import { I as Input } from "./input-C0QjszdI.js";
import { L as Label } from "./label-JU3yqRBo.js";
import { S as Select, a as SelectTrigger, b as SelectValue, c as SelectContent, d as SelectItem } from "./select-CZRUt5a6.js";
import { B as Badge } from "./badge-DyfXZgLs.js";
import { P as PROVEEDORES, b as calcularPrecioFinal, R as RECARGO_FV } from "./proveedores-BtLRfzm7.js";
import { f as formatARS } from "./calculos-BajsDPnH.js";
import { toast } from "sonner";
import { Plus, RefreshCw, X, Search, Save, ExternalLink, Pencil, Trash2 } from "lucide-react";
import { T as TSS_SERVER_FUNCTION, g as getServerFnById, a as createServerFn } from "./server-D4jtmMi8.js";
import { r as requireSupabaseAuth } from "./auth-middleware-CmMiDqXq.js";
import { z } from "zod";
import "@supabase/supabase-js";
import "./utils-H80jjgLf.js";
import "clsx";
import "tailwind-merge";
import "@radix-ui/react-slot";
import "class-variance-authority";
import "@radix-ui/react-label";
import "@radix-ui/react-select";
import "node:async_hooks";
import "h3-v2";
import "@tanstack/router-core";
import "seroval";
import "@tanstack/history";
import "@tanstack/router-core/ssr/client";
import "@tanstack/router-core/ssr/server";
import "@tanstack/react-router/ssr/server";
function useServerFn(serverFn) {
  const router = useRouter();
  return React.useCallback(async (...args) => {
    try {
      const res = await serverFn(...args);
      if (isRedirect(res)) throw res;
      return res;
    } catch (err) {
      if (isRedirect(err)) {
        err.options._fromLocation = router.stores.location.get();
        return router.navigate(router.resolveRedirect(err).options);
      }
      throw err;
    }
  }, [router, serverFn]);
}
var createSsrRpc = (functionId) => {
  const url = "/_serverFn/" + functionId;
  const serverFnMeta = { id: functionId };
  const fn = async (...args) => {
    return (await getServerFnById(functionId))(...args);
  };
  return Object.assign(fn, {
    url,
    serverFnMeta,
    [TSS_SERVER_FUNCTION]: true
  });
};
const syncFV = createServerFn({
  method: "POST"
}).inputValidator((d) => z.object({
  offset: z.number().int().min(0).default(0)
}).parse(d ?? {})).middleware([requireSupabaseAuth]).handler(createSsrRpc("d115dd01f1487e84a5f694a1598f1629dcafd366fd6995269f607478d9c8e7f3"));
const getFVStatus = createServerFn({
  method: "GET"
}).middleware([requireSupabaseAuth]).handler(createSsrRpc("6fb47804253e2f3fb020a9f92c7f4312bd88fedca1a4de80577fe7121eafd85d"));
const resetFVSync = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).handler(createSsrRpc("c63936a6b43fd016315d31de961315c3edba136430b6691dcc2b9d8cf75fc0e1"));
createServerFn({
  method: "POST"
}).inputValidator((d) => z.object({
  marca: z.string().min(1),
  modelo: z.string().min(1)
}).parse(d ?? {})).middleware([requireSupabaseAuth]).handler(createSsrRpc("114a4314d0424fb03270f3bdf40223424b1ec0a12448a1cebfe96accbfaeb595"));
const syncPatagonia = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).handler(createSsrRpc("ebda9d23883f8b16b4b0415043fcd51034f51a3d5c345a6de83026889b08d0b5"));
const syncTodo = createServerFn({
  method: "POST"
}).middleware([requireSupabaseAuth]).handler(createSsrRpc("b076758050c17bfe4516f9eb84b6f74ca5ce94327d54649da172e68a96aaec22"));
const VACIO = {
  proveedor: "Patagonia Cell",
  marca: "",
  modelo: "",
  tipo_repuesto: "Cambio de módulo",
  calidad: "OLED",
  precio: 0,
  url_producto: ""
};
function Catalogo() {
  const {
    isAdmin
  } = useAuth();
  const [items, setItems] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [fvLastSync, setFvLastSync] = useState(null);
  const [q, setQ] = useState("");
  const [filtroProv, setFiltroProv] = useState("todos");
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(null);
  const [creando, setCreando] = useState(false);
  const [nuevo, setNuevo] = useState(VACIO);
  const [editId, setEditId] = useState(null);
  const [edit, setEdit] = useState(VACIO);
  const syncPatagoniaFn = useServerFn(syncPatagonia);
  const syncFVFn = useServerFn(syncFV);
  const syncTodoFn = useServerFn(syncTodo);
  const getFVStatusFn = useServerFn(getFVStatus);
  const resetFVSyncFn = useServerFn(resetFVSync);
  const [fvStatus, setFvStatus] = useState(null);
  const [showLogs, setShowLogs] = useState(false);
  const cancelRef = useRef(false);
  const load = async () => {
    setLoading(true);
    const [{
      data,
      error
    }, countRes, cfgRes, statusRes] = await Promise.all([supabase.from("catalogo_repuestos").select("*").order("marca").order("modelo").limit(500), supabase.from("catalogo_repuestos").select("*", {
      count: "exact",
      head: true
    }), supabase.from("proveedores_config").select("ultima_sincronizacion").eq("nombre", "FV Mayorista").maybeSingle(), isAdmin ? getFVStatusFn().catch(() => null) : Promise.resolve(null)]);
    setLoading(false);
    if (error) return toast.error(error.message);
    setItems(data || []);
    setTotalCount(countRes.count ?? 0);
    setFvLastSync(cfgRes.data?.ultima_sincronizacion ?? null);
    setFvStatus(statusRes);
  };
  useEffect(() => {
    load();
  }, [isAdmin]);
  const crear = async () => {
    if (!nuevo.marca.trim() || !nuevo.modelo.trim()) return toast.error("Marca y modelo requeridos");
    const precioProv = Number(nuevo.precio) || 0;
    const precioCalc = calcularPrecioFinal(nuevo.proveedor, precioProv);
    const {
      error
    } = await supabase.from("catalogo_repuestos").insert({
      ...nuevo,
      precio: precioProv,
      precio_proveedor: precioProv,
      precio_calculado: precioCalc,
      fecha_actualizacion: (/* @__PURE__ */ new Date()).toISOString()
    });
    if (error) return toast.error(error.message);
    toast.success("Repuesto agregado");
    setNuevo(VACIO);
    setCreando(false);
    load();
  };
  const eliminar = async (id) => {
    if (!confirm("¿Eliminar repuesto?")) return;
    const {
      error
    } = await supabase.from("catalogo_repuestos").delete().eq("id", id);
    if (error) return toast.error(error.message);
    load();
  };
  const startEdit = (r) => {
    setEditId(r.id);
    setEdit({
      proveedor: r.proveedor,
      marca: r.marca,
      modelo: r.modelo,
      tipo_repuesto: r.tipo_repuesto,
      calidad: r.calidad || "",
      precio: r.precio_proveedor ?? r.precio,
      url_producto: r.url_producto || ""
    });
  };
  const guardarEdit = async () => {
    if (!editId) return;
    const precioProv = Number(edit.precio) || 0;
    const precioCalc = calcularPrecioFinal(edit.proveedor, precioProv);
    const {
      error
    } = await supabase.from("catalogo_repuestos").update({
      ...edit,
      precio: precioProv,
      precio_proveedor: precioProv,
      precio_calculado: precioCalc,
      fecha_actualizacion: (/* @__PURE__ */ new Date()).toISOString()
    }).eq("id", editId);
    if (error) return toast.error(error.message);
    toast.success("Actualizado");
    setEditId(null);
    load();
  };
  const [syncStats, setSyncStats] = useState(null);
  const runSync = async (key, opts = {}) => {
    setSyncing(key);
    cancelRef.current = false;
    try {
      if (key === "patagonia") {
        const r = await syncPatagoniaFn();
        (r.ok ? toast.success : toast.message)(r.message);
      } else if (key === "fv") {
        let offset = opts.resume ? Number(fvStatus?.last_offset) || 0 : 0;
        if (!opts.resume && (fvStatus?.cargados ?? 0) > 0) {
          await resetFVSyncFn();
        }
        setSyncStats({
          total: fvStatus?.total_discovered || 0,
          processed: offset,
          imported: 0,
          updated: 0,
          errors: 0,
          errorSamples: []
        });
        let totalImp = 0, totalUpd = 0, totalErr = 0, total = 0;
        const samples = [];
        for (let i = 0; i < 500; i++) {
          if (cancelRef.current) {
            toast.message(`Sincronización cancelada en offset ${offset}.`);
            break;
          }
          const r = await syncFVFn({
            data: {
              offset
            }
          });
          if (!r.ok) {
            toast.error(r.message);
            samples.unshift(r.message);
            setSyncStats((s) => s && {
              ...s,
              errorSamples: samples.slice(0, 10)
            });
            break;
          }
          totalImp += r.imported;
          totalUpd += r.updated;
          totalErr += r.errors;
          total = r.totalDiscovered ?? total;
          if (r.errorSamples) samples.push(...r.errorSamples);
          setSyncStats({
            total,
            processed: r.processed ?? offset,
            imported: totalImp,
            updated: totalUpd,
            errors: totalErr,
            errorSamples: samples.slice(0, 10)
          });
          if (r.done || r.nextOffset == null) {
            toast.success(`FV Mayorista: +${totalImp} nuevos, ~${totalUpd} actualizados, ${totalErr} errores (${total} URLs).`);
            break;
          }
          offset = r.nextOffset;
        }
      } else {
        const rs = await syncTodoFn();
        rs.forEach((r) => (r.ok ? toast.success : toast.message)(r.message));
      }
      load();
    } catch (e) {
      toast.error(e?.message || "Error de sincronización");
    } finally {
      setSyncing(null);
    }
  };
  const cancelarSync = () => {
    cancelRef.current = true;
    toast.message("Cancelando después del lote actual…");
  };
  const filtrados = items.filter((r) => {
    if (filtroProv !== "todos" && r.proveedor !== filtroProv) return false;
    if (!q.trim()) return true;
    const term = q.toLowerCase();
    return [r.marca, r.modelo, r.tipo_repuesto, r.calidad].some((v) => (v || "").toLowerCase().includes(term));
  });
  return /* @__PURE__ */ jsxs("div", { className: "space-y-4 max-w-5xl mx-auto", children: [
    /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between flex-wrap gap-2", children: [
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("h1", { className: "text-2xl font-bold", children: "Catálogo de Repuestos" }),
        /* @__PURE__ */ jsxs("div", { className: "text-sm text-muted-foreground mt-0.5", children: [
          /* @__PURE__ */ jsx("strong", { children: totalCount }),
          " productos cargados",
          " • ",
          "Última sync FV: ",
          fvLastSync ? new Date(fvLastSync).toLocaleString("es-AR") : "nunca"
        ] })
      ] }),
      isAdmin && /* @__PURE__ */ jsxs(Button, { onClick: () => setCreando((c) => !c), size: "lg", children: [
        /* @__PURE__ */ jsx(Plus, { className: "w-4 h-4 mr-1" }),
        creando ? "Cerrar" : "Nuevo"
      ] })
    ] }),
    isAdmin && /* @__PURE__ */ jsxs(Card, { children: [
      /* @__PURE__ */ jsxs(CardContent, { className: "p-3 space-y-3", children: [
        fvStatus && /* @__PURE__ */ jsxs("div", { className: "text-xs border rounded-md p-2 bg-muted/30 space-y-0.5", children: [
          /* @__PURE__ */ jsxs("div", { className: "flex flex-wrap gap-x-4 gap-y-1", children: [
            /* @__PURE__ */ jsxs("span", { children: [
              /* @__PURE__ */ jsx("strong", { children: "FV estado:" }),
              " ",
              /* @__PURE__ */ jsx(Badge, { variant: fvStatus.estado === "error" ? "destructive" : "secondary", children: fvStatus.estado })
            ] }),
            /* @__PURE__ */ jsxs("span", { children: [
              /* @__PURE__ */ jsx("strong", { children: "Cargados:" }),
              " ",
              fvStatus.cargados
            ] }),
            fvStatus.total_discovered > 0 && /* @__PURE__ */ jsxs("span", { children: [
              /* @__PURE__ */ jsx("strong", { children: "Total URLs:" }),
              " ",
              fvStatus.total_discovered
            ] }),
            fvStatus.last_offset > 0 && /* @__PURE__ */ jsxs("span", { children: [
              /* @__PURE__ */ jsx("strong", { children: "Último offset:" }),
              " ",
              fvStatus.last_offset
            ] }),
            fvStatus.last_batch_at && /* @__PURE__ */ jsxs("span", { children: [
              /* @__PURE__ */ jsx("strong", { children: "Último lote:" }),
              " ",
              new Date(fvStatus.last_batch_at).toLocaleString("es-AR")
            ] })
          ] }),
          fvStatus.last_error && /* @__PURE__ */ jsxs("div", { className: "text-destructive mt-1", children: [
            /* @__PURE__ */ jsx("strong", { children: "Último error:" }),
            " ",
            fvStatus.last_error
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 sm:grid-cols-2 gap-2", children: [
          /* @__PURE__ */ jsxs(Button, { variant: "outline", onClick: () => runSync("patagonia"), disabled: !!syncing, children: [
            /* @__PURE__ */ jsx(RefreshCw, { className: `w-4 h-4 mr-2 ${syncing === "patagonia" ? "animate-spin" : ""}` }),
            "Sincronizar Patagonia Cell"
          ] }),
          /* @__PURE__ */ jsxs(Button, { variant: "outline", onClick: () => runSync("fv"), disabled: !!syncing, children: [
            /* @__PURE__ */ jsx(RefreshCw, { className: `w-4 h-4 mr-2 ${syncing === "fv" ? "animate-spin" : ""}` }),
            "Sincronizar FV Mayorista (desde 0)"
          ] }),
          fvStatus && fvStatus.last_offset > 0 && /* @__PURE__ */ jsxs(Button, { onClick: () => runSync("fv", {
            resume: true
          }), disabled: !!syncing, children: [
            /* @__PURE__ */ jsx(RefreshCw, { className: `w-4 h-4 mr-2 ${syncing === "fv" ? "animate-spin" : ""}` }),
            "Reanudar FV (desde ",
            fvStatus.last_offset,
            ")"
          ] }),
          syncing === "fv" && /* @__PURE__ */ jsxs(Button, { variant: "destructive", onClick: cancelarSync, children: [
            /* @__PURE__ */ jsx(X, { className: "w-4 h-4 mr-2" }),
            "Cancelar sincronización"
          ] }),
          /* @__PURE__ */ jsx(Button, { variant: "ghost", onClick: () => setShowLogs((s) => !s), children: showLogs ? "Ocultar logs" : "Ver logs" }),
          /* @__PURE__ */ jsxs(Button, { onClick: () => runSync("todo"), disabled: !!syncing, children: [
            /* @__PURE__ */ jsx(RefreshCw, { className: `w-4 h-4 mr-2 ${syncing === "todo" ? "animate-spin" : ""}` }),
            "Sincronizar Todo"
          ] })
        ] }),
        showLogs && fvStatus?.logs?.length > 0 && /* @__PURE__ */ jsxs("div", { className: "text-xs border rounded-md p-2 bg-muted/30 max-h-64 overflow-auto", children: [
          /* @__PURE__ */ jsxs("div", { className: "font-semibold mb-1", children: [
            "Logs FV (",
            fvStatus.logs.length,
            "):"
          ] }),
          /* @__PURE__ */ jsx("ul", { className: "space-y-0.5 font-mono", children: fvStatus.logs.map((l, i) => /* @__PURE__ */ jsx("li", { className: "whitespace-pre-wrap break-all", children: l }, i)) })
        ] })
      ] }),
      syncStats && /* @__PURE__ */ jsx(CardContent, { className: "pt-0", children: /* @__PURE__ */ jsxs("div", { className: "text-sm border rounded-md p-3 bg-muted/30 space-y-1", children: [
        /* @__PURE__ */ jsxs("div", { className: "flex justify-between flex-wrap gap-2", children: [
          /* @__PURE__ */ jsxs("span", { children: [
            /* @__PURE__ */ jsx("strong", { children: "Progreso FV:" }),
            " ",
            syncStats.processed,
            " / ",
            syncStats.total || "…",
            " URLs"
          ] }),
          /* @__PURE__ */ jsxs("span", { className: "text-success", children: [
            "+",
            syncStats.imported,
            " nuevos"
          ] }),
          /* @__PURE__ */ jsxs("span", { className: "text-primary", children: [
            "~",
            syncStats.updated,
            " actualizados"
          ] }),
          /* @__PURE__ */ jsxs("span", { className: syncStats.errors ? "text-destructive" : "text-muted-foreground", children: [
            syncStats.errors,
            " errores"
          ] })
        ] }),
        syncStats.total > 0 && /* @__PURE__ */ jsx("div", { className: "w-full h-2 bg-muted rounded overflow-hidden", children: /* @__PURE__ */ jsx("div", { className: "h-full bg-primary transition-all", style: {
          width: `${Math.min(100, syncStats.processed / syncStats.total * 100)}%`
        } }) }),
        syncStats.errorSamples.length > 0 && /* @__PURE__ */ jsxs("details", { className: "text-xs text-muted-foreground", children: [
          /* @__PURE__ */ jsx("summary", { className: "cursor-pointer", children: "Ver muestra de errores" }),
          /* @__PURE__ */ jsx("ul", { className: "list-disc pl-5 mt-1 space-y-0.5", children: syncStats.errorSamples.map((e, i) => /* @__PURE__ */ jsx("li", { className: "truncate", children: e }, i)) })
        ] })
      ] }) })
    ] }),
    isAdmin && creando && /* @__PURE__ */ jsxs(Card, { children: [
      /* @__PURE__ */ jsx(CardHeader, { children: /* @__PURE__ */ jsx(CardTitle, { children: "Nuevo repuesto" }) }),
      /* @__PURE__ */ jsxs(CardContent, { className: "grid grid-cols-1 sm:grid-cols-2 gap-3", children: [
        /* @__PURE__ */ jsx(Field, { label: "Proveedor", children: /* @__PURE__ */ jsxs(Select, { value: nuevo.proveedor, onValueChange: (v) => setNuevo({
          ...nuevo,
          proveedor: v
        }), children: [
          /* @__PURE__ */ jsx(SelectTrigger, { children: /* @__PURE__ */ jsx(SelectValue, {}) }),
          /* @__PURE__ */ jsx(SelectContent, { children: PROVEEDORES.map((p) => /* @__PURE__ */ jsx(SelectItem, { value: p, children: p }, p)) })
        ] }) }),
        /* @__PURE__ */ jsx(Field, { label: "Tipo de repuesto", children: /* @__PURE__ */ jsx(Input, { value: nuevo.tipo_repuesto, onChange: (e) => setNuevo({
          ...nuevo,
          tipo_repuesto: e.target.value
        }) }) }),
        /* @__PURE__ */ jsx(Field, { label: "Marca", children: /* @__PURE__ */ jsx(Input, { value: nuevo.marca, onChange: (e) => setNuevo({
          ...nuevo,
          marca: e.target.value
        }) }) }),
        /* @__PURE__ */ jsx(Field, { label: "Modelo", children: /* @__PURE__ */ jsx(Input, { value: nuevo.modelo, onChange: (e) => setNuevo({
          ...nuevo,
          modelo: e.target.value
        }) }) }),
        /* @__PURE__ */ jsx(Field, { label: "Calidad (OLED, Original, etc.)", children: /* @__PURE__ */ jsx(Input, { value: nuevo.calidad, onChange: (e) => setNuevo({
          ...nuevo,
          calidad: e.target.value
        }) }) }),
        /* @__PURE__ */ jsx(Field, { label: "Precio proveedor", children: /* @__PURE__ */ jsx(Input, { type: "number", min: 0, value: nuevo.precio, onChange: (e) => setNuevo({
          ...nuevo,
          precio: e.target.value
        }) }) }),
        /* @__PURE__ */ jsx(Field, { label: "URL del producto", full: true, children: /* @__PURE__ */ jsx(Input, { value: nuevo.url_producto, onChange: (e) => setNuevo({
          ...nuevo,
          url_producto: e.target.value
        }) }) }),
        /* @__PURE__ */ jsx("div", { className: "sm:col-span-2", children: /* @__PURE__ */ jsx(Button, { onClick: crear, className: "w-full", size: "lg", children: "Guardar" }) })
      ] })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 sm:grid-cols-[1fr_200px] gap-2", children: [
      /* @__PURE__ */ jsxs("div", { className: "relative", children: [
        /* @__PURE__ */ jsx(Search, { className: "absolute left-2 top-2.5 w-4 h-4 text-muted-foreground" }),
        /* @__PURE__ */ jsx(Input, { className: "pl-8", placeholder: "Buscar marca, modelo, tipo...", value: q, onChange: (e) => setQ(e.target.value) })
      ] }),
      /* @__PURE__ */ jsxs(Select, { value: filtroProv, onValueChange: setFiltroProv, children: [
        /* @__PURE__ */ jsx(SelectTrigger, { children: /* @__PURE__ */ jsx(SelectValue, {}) }),
        /* @__PURE__ */ jsxs(SelectContent, { children: [
          /* @__PURE__ */ jsx(SelectItem, { value: "todos", children: "Todos los proveedores" }),
          PROVEEDORES.map((p) => /* @__PURE__ */ jsx(SelectItem, { value: p, children: p }, p))
        ] })
      ] })
    ] }),
    loading ? /* @__PURE__ */ jsx("p", { className: "text-muted-foreground", children: "Cargando..." }) : filtrados.length === 0 ? /* @__PURE__ */ jsx("p", { className: "text-muted-foreground text-center py-8", children: "Sin resultados." }) : /* @__PURE__ */ jsx("div", { className: "space-y-2", children: filtrados.map((r) => {
      const precioProv = Number(r.precio_proveedor ?? r.precio);
      const final = Number(r.precio_calculado ?? calcularPrecioFinal(r.proveedor, precioProv));
      const enEdit = editId === r.id;
      const fechaSync = r.ultima_sincronizacion || r.fecha_actualizacion;
      return /* @__PURE__ */ jsx(Card, { children: /* @__PURE__ */ jsx(CardContent, { className: "p-3", children: enEdit ? /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 sm:grid-cols-2 gap-2", children: [
        /* @__PURE__ */ jsxs(Select, { value: edit.proveedor, onValueChange: (v) => setEdit({
          ...edit,
          proveedor: v
        }), children: [
          /* @__PURE__ */ jsx(SelectTrigger, { children: /* @__PURE__ */ jsx(SelectValue, {}) }),
          /* @__PURE__ */ jsx(SelectContent, { children: PROVEEDORES.map((p) => /* @__PURE__ */ jsx(SelectItem, { value: p, children: p }, p)) })
        ] }),
        /* @__PURE__ */ jsx(Input, { value: edit.tipo_repuesto, onChange: (e) => setEdit({
          ...edit,
          tipo_repuesto: e.target.value
        }), placeholder: "Tipo" }),
        /* @__PURE__ */ jsx(Input, { value: edit.marca, onChange: (e) => setEdit({
          ...edit,
          marca: e.target.value
        }), placeholder: "Marca" }),
        /* @__PURE__ */ jsx(Input, { value: edit.modelo, onChange: (e) => setEdit({
          ...edit,
          modelo: e.target.value
        }), placeholder: "Modelo" }),
        /* @__PURE__ */ jsx(Input, { value: edit.calidad, onChange: (e) => setEdit({
          ...edit,
          calidad: e.target.value
        }), placeholder: "Calidad" }),
        /* @__PURE__ */ jsx(Input, { type: "number", value: edit.precio, onChange: (e) => setEdit({
          ...edit,
          precio: e.target.value
        }), placeholder: "Precio proveedor" }),
        /* @__PURE__ */ jsx(Input, { className: "sm:col-span-2", value: edit.url_producto, onChange: (e) => setEdit({
          ...edit,
          url_producto: e.target.value
        }), placeholder: "URL" }),
        /* @__PURE__ */ jsxs("div", { className: "sm:col-span-2 flex gap-2", children: [
          /* @__PURE__ */ jsxs(Button, { onClick: guardarEdit, className: "flex-1", children: [
            /* @__PURE__ */ jsx(Save, { className: "w-4 h-4 mr-1" }),
            "Guardar"
          ] }),
          /* @__PURE__ */ jsx(Button, { variant: "ghost", onClick: () => setEditId(null), children: /* @__PURE__ */ jsx(X, { className: "w-4 h-4" }) })
        ] })
      ] }) : /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between gap-2 flex-wrap", children: [
        /* @__PURE__ */ jsxs("div", { className: "min-w-0 flex-1", children: [
          /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 flex-wrap", children: [
            /* @__PURE__ */ jsxs("span", { className: "font-semibold", children: [
              r.marca,
              " ",
              r.modelo
            ] }),
            /* @__PURE__ */ jsx(Badge, { variant: "secondary", children: r.tipo_repuesto }),
            r.calidad && /* @__PURE__ */ jsx(Badge, { children: r.calidad })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "text-xs text-muted-foreground mt-0.5", children: [
            r.proveedor,
            " • Proveedor ",
            formatARS(precioProv),
            r.proveedor === "FV Mayorista" && /* @__PURE__ */ jsxs("span", { children: [
              " (+",
              formatARS(RECARGO_FV),
              " recargo)"
            ] })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "text-[11px] text-muted-foreground", children: [
            "Última actualización: ",
            new Date(fechaSync).toLocaleString("es-AR")
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "text-right", children: [
          /* @__PURE__ */ jsx("div", { className: "text-xs text-muted-foreground", children: "Calculado" }),
          /* @__PURE__ */ jsx("div", { className: "font-bold text-primary", children: formatARS(final) }),
          /* @__PURE__ */ jsxs("div", { className: "flex gap-1 mt-1 justify-end", children: [
            r.url_producto && /* @__PURE__ */ jsx("a", { href: r.url_producto, target: "_blank", rel: "noreferrer", children: /* @__PURE__ */ jsx(Button, { size: "sm", variant: "ghost", children: /* @__PURE__ */ jsx(ExternalLink, { className: "w-4 h-4" }) }) }),
            isAdmin && /* @__PURE__ */ jsxs(Fragment, { children: [
              /* @__PURE__ */ jsx(Button, { size: "sm", variant: "ghost", onClick: () => startEdit(r), children: /* @__PURE__ */ jsx(Pencil, { className: "w-4 h-4" }) }),
              /* @__PURE__ */ jsx(Button, { size: "sm", variant: "ghost", onClick: () => eliminar(r.id), children: /* @__PURE__ */ jsx(Trash2, { className: "w-4 h-4 text-destructive" }) })
            ] })
          ] })
        ] })
      ] }) }) }, r.id);
    }) })
  ] });
}
function Field({
  label,
  children,
  full
}) {
  return /* @__PURE__ */ jsxs("div", { className: `space-y-1.5 ${full ? "sm:col-span-2" : ""}`, children: [
    /* @__PURE__ */ jsx(Label, { children: label }),
    children
  ] });
}
export {
  Catalogo as component
};
