import { jsxs, jsx } from "react/jsx-runtime";
import { useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { s as supabase } from "./client-CzxaLLtB.js";
import { u as useAuth } from "./use-auth-GpmAL4wB.js";
import { C as Card, a as CardHeader, b as CardTitle, d as CardContent } from "./card-DQ5v2DYb.js";
import { B as Button } from "./button-BC9oXVxV.js";
import { I as Input } from "./input-C0QjszdI.js";
import { L as Label } from "./label-JU3yqRBo.js";
import { T as Tabs, a as TabsList, b as TabsTrigger, c as TabsContent } from "./tabs-D_u1EXWn.js";
import { S as Select, a as SelectTrigger, b as SelectValue, c as SelectContent, d as SelectItem } from "./select-CZRUt5a6.js";
import { f as formatARS } from "./calculos-BajsDPnH.js";
import { toast } from "sonner";
import "@supabase/supabase-js";
import "./utils-H80jjgLf.js";
import "clsx";
import "tailwind-merge";
import "@radix-ui/react-slot";
import "class-variance-authority";
import "@radix-ui/react-label";
import "@radix-ui/react-tabs";
import "@radix-ui/react-select";
import "lucide-react";
function Configuracion() {
  const navigate = useNavigate();
  const {
    isAdmin,
    loading
  } = useAuth();
  useEffect(() => {
    if (!loading && !isAdmin) navigate({
      to: "/app"
    });
  }, [loading, isAdmin]);
  if (!isAdmin) return null;
  return /* @__PURE__ */ jsxs("div", { className: "space-y-4 max-w-4xl mx-auto", children: [
    /* @__PURE__ */ jsx("h1", { className: "text-2xl font-bold", children: "Configuración" }),
    /* @__PURE__ */ jsxs(Tabs, { defaultValue: "sucursales", children: [
      /* @__PURE__ */ jsxs(TabsList, { className: "flex flex-wrap h-auto", children: [
        /* @__PURE__ */ jsx(TabsTrigger, { value: "sucursales", children: "Sucursales" }),
        /* @__PURE__ */ jsx(TabsTrigger, { value: "usuarios", children: "Usuarios" }),
        /* @__PURE__ */ jsx(TabsTrigger, { value: "precios", children: "Precios Soft" }),
        /* @__PURE__ */ jsx(TabsTrigger, { value: "mano_obra", children: "Mano de Obra" }),
        /* @__PURE__ */ jsx(TabsTrigger, { value: "proveedores", children: "Proveedores" })
      ] }),
      /* @__PURE__ */ jsx(TabsContent, { value: "sucursales", children: /* @__PURE__ */ jsx(SucursalesTab, {}) }),
      /* @__PURE__ */ jsx(TabsContent, { value: "usuarios", children: /* @__PURE__ */ jsx(UsuariosTab, {}) }),
      /* @__PURE__ */ jsx(TabsContent, { value: "precios", children: /* @__PURE__ */ jsx(PreciosTab, {}) }),
      /* @__PURE__ */ jsx(TabsContent, { value: "mano_obra", children: /* @__PURE__ */ jsx(ManoObraTab, {}) }),
      /* @__PURE__ */ jsx(TabsContent, { value: "proveedores", children: /* @__PURE__ */ jsx(ProveedoresTab, {}) })
    ] })
  ] });
}
function SucursalesTab() {
  const [items, setItems] = useState([]);
  const [nuevo, setNuevo] = useState({
    nombre: "",
    direccion: "",
    telefono: ""
  });
  const load = () => supabase.from("sucursales").select("*").order("nombre").then(({
    data
  }) => setItems(data || []));
  useEffect(() => {
    load();
  }, []);
  const crear = async () => {
    if (!nuevo.nombre.trim()) return;
    const {
      error
    } = await supabase.from("sucursales").insert(nuevo);
    if (error) return toast.error(error.message);
    toast.success("Sucursal creada");
    setNuevo({
      nombre: "",
      direccion: "",
      telefono: ""
    });
    load();
  };
  const eliminar = async (id) => {
    if (!confirm("¿Eliminar sucursal?")) return;
    const {
      error
    } = await supabase.from("sucursales").delete().eq("id", id);
    if (error) return toast.error(error.message);
    load();
  };
  return /* @__PURE__ */ jsxs(Card, { children: [
    /* @__PURE__ */ jsx(CardHeader, { children: /* @__PURE__ */ jsx(CardTitle, { children: "Sucursales" }) }),
    /* @__PURE__ */ jsxs(CardContent, { className: "space-y-3", children: [
      /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 sm:grid-cols-4 gap-2", children: [
        /* @__PURE__ */ jsx(Input, { placeholder: "Nombre", value: nuevo.nombre, onChange: (e) => setNuevo({
          ...nuevo,
          nombre: e.target.value
        }) }),
        /* @__PURE__ */ jsx(Input, { placeholder: "Dirección", value: nuevo.direccion, onChange: (e) => setNuevo({
          ...nuevo,
          direccion: e.target.value
        }) }),
        /* @__PURE__ */ jsx(Input, { placeholder: "Teléfono", value: nuevo.telefono, onChange: (e) => setNuevo({
          ...nuevo,
          telefono: e.target.value
        }) }),
        /* @__PURE__ */ jsx(Button, { onClick: crear, children: "Crear" })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "divide-y border rounded-md", children: [
        items.map((s) => /* @__PURE__ */ jsxs("div", { className: "p-3 flex justify-between items-center", children: [
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("div", { className: "font-medium", children: s.nombre }),
            /* @__PURE__ */ jsxs("div", { className: "text-xs text-muted-foreground", children: [
              s.direccion,
              " • ",
              s.telefono
            ] })
          ] }),
          /* @__PURE__ */ jsx(Button, { size: "sm", variant: "destructive", onClick: () => eliminar(s.id), children: "Eliminar" })
        ] }, s.id)),
        items.length === 0 && /* @__PURE__ */ jsx("div", { className: "p-4 text-sm text-muted-foreground text-center", children: "Sin sucursales" })
      ] })
    ] })
  ] });
}
function UsuariosTab() {
  const [items, setItems] = useState([]);
  const [sucursales, setSucursales] = useState([]);
  const [roles, setRoles] = useState({});
  const load = async () => {
    const [{
      data: profs
    }, {
      data: sucs
    }, {
      data: rs
    }] = await Promise.all([supabase.from("profiles").select("*"), supabase.from("sucursales").select("*").order("nombre"), supabase.from("user_roles").select("*")]);
    setItems(profs || []);
    setSucursales(sucs || []);
    const map = {};
    (rs || []).forEach((r) => {
      (map[r.user_id] ||= []).push(r.role);
    });
    setRoles(map);
  };
  useEffect(() => {
    load();
  }, []);
  const setSucursal = async (uid, sucursal_id) => {
    const v = sucursal_id === "_none" ? null : sucursal_id;
    const {
      error
    } = await supabase.from("profiles").update({
      sucursal_id: v
    }).eq("id", uid);
    if (error) return toast.error(error.message);
    toast.success("Sucursal asignada");
    load();
  };
  const toggleAdmin = async (uid, esAdmin) => {
    if (esAdmin) {
      await supabase.from("user_roles").delete().eq("user_id", uid).eq("role", "admin");
    } else {
      await supabase.from("user_roles").insert({
        user_id: uid,
        role: "admin"
      });
    }
    load();
  };
  return /* @__PURE__ */ jsxs(Card, { children: [
    /* @__PURE__ */ jsx(CardHeader, { children: /* @__PURE__ */ jsx(CardTitle, { children: "Usuarios" }) }),
    /* @__PURE__ */ jsx(CardContent, { children: /* @__PURE__ */ jsx("div", { className: "divide-y border rounded-md", children: items.map((u) => {
      const esAdmin = (roles[u.id] || []).includes("admin");
      return /* @__PURE__ */ jsxs("div", { className: "p-3 grid grid-cols-1 sm:grid-cols-3 gap-2 items-center", children: [
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("div", { className: "font-medium", children: u.nombre || "—" }),
          /* @__PURE__ */ jsx("div", { className: "text-xs text-muted-foreground", children: u.email })
        ] }),
        /* @__PURE__ */ jsxs(Select, { value: u.sucursal_id || "_none", onValueChange: (v) => setSucursal(u.id, v), children: [
          /* @__PURE__ */ jsx(SelectTrigger, { children: /* @__PURE__ */ jsx(SelectValue, { placeholder: "Sucursal..." }) }),
          /* @__PURE__ */ jsxs(SelectContent, { children: [
            /* @__PURE__ */ jsx(SelectItem, { value: "_none", children: "Sin asignar" }),
            sucursales.map((s) => /* @__PURE__ */ jsx(SelectItem, { value: s.id, children: s.nombre }, s.id))
          ] })
        ] }),
        /* @__PURE__ */ jsx(Button, { size: "sm", variant: esAdmin ? "destructive" : "default", onClick: () => toggleAdmin(u.id, esAdmin), children: esAdmin ? "Quitar admin" : "Hacer admin" })
      ] }, u.id);
    }) }) })
  ] });
}
function PreciosTab() {
  const [items, setItems] = useState([]);
  const load = () => supabase.from("precios_referencia").select("*").order("orden").then(({
    data
  }) => setItems(data || []));
  useEffect(() => {
    load();
  }, []);
  const guardar = async (id, precio) => {
    const {
      error
    } = await supabase.from("precios_referencia").update({
      precio
    }).eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("Precio actualizado");
  };
  return /* @__PURE__ */ jsxs(Card, { children: [
    /* @__PURE__ */ jsx(CardHeader, { children: /* @__PURE__ */ jsx(CardTitle, { children: "Precios de referencia (Soft)" }) }),
    /* @__PURE__ */ jsx(CardContent, { className: "space-y-2", children: items.map((p) => /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 sm:grid-cols-3 gap-2 items-center border-b pb-2", children: [
      /* @__PURE__ */ jsx(Label, { children: p.etiqueta }),
      /* @__PURE__ */ jsx(Input, { type: "number", defaultValue: p.precio, onBlur: (e) => guardar(p.id, Number(e.target.value)) }),
      /* @__PURE__ */ jsxs("span", { className: "text-sm text-muted-foreground", children: [
        "Actual: ",
        formatARS(Number(p.precio))
      ] })
    ] }, p.id)) })
  ] });
}
function ManoObraTab() {
  const [items, setItems] = useState([]);
  const [nuevo, setNuevo] = useState({
    tipo_reparacion: "",
    precio: 0
  });
  const load = () => supabase.from("mano_obra").select("*").order("tipo_reparacion").then(({
    data
  }) => setItems(data || []));
  useEffect(() => {
    load();
  }, []);
  const crear = async () => {
    if (!nuevo.tipo_reparacion.trim()) return;
    const {
      error
    } = await supabase.from("mano_obra").insert({
      tipo_reparacion: nuevo.tipo_reparacion.trim(),
      precio: Number(nuevo.precio) || 0
    });
    if (error) return toast.error(error.message);
    toast.success("Creado");
    setNuevo({
      tipo_reparacion: "",
      precio: 0
    });
    load();
  };
  const guardar = async (id, patch) => {
    const {
      error
    } = await supabase.from("mano_obra").update(patch).eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("Actualizado");
  };
  const eliminar = async (id) => {
    if (!confirm("¿Eliminar tipo de reparación?")) return;
    const {
      error
    } = await supabase.from("mano_obra").delete().eq("id", id);
    if (error) return toast.error(error.message);
    load();
  };
  return /* @__PURE__ */ jsxs(Card, { children: [
    /* @__PURE__ */ jsx(CardHeader, { children: /* @__PURE__ */ jsx(CardTitle, { children: "Mano de Obra por tipo de reparación" }) }),
    /* @__PURE__ */ jsxs(CardContent, { className: "space-y-3", children: [
      /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 sm:grid-cols-[1fr_140px_auto] gap-2", children: [
        /* @__PURE__ */ jsx(Input, { placeholder: "Tipo de reparación (ej: Módulo básico)", value: nuevo.tipo_reparacion, onChange: (e) => setNuevo({
          ...nuevo,
          tipo_reparacion: e.target.value
        }) }),
        /* @__PURE__ */ jsx(Input, { type: "number", placeholder: "Mano de obra", value: nuevo.precio, onChange: (e) => setNuevo({
          ...nuevo,
          precio: Number(e.target.value)
        }) }),
        /* @__PURE__ */ jsx(Button, { onClick: crear, children: "Agregar" })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "divide-y border rounded-md", children: [
        /* @__PURE__ */ jsxs("div", { className: "p-2 grid grid-cols-1 sm:grid-cols-[1fr_140px_140px_auto] gap-2 text-xs text-muted-foreground font-medium", children: [
          /* @__PURE__ */ jsx("div", { children: "Tipo" }),
          /* @__PURE__ */ jsx("div", { children: "Mano de obra" }),
          /* @__PURE__ */ jsx("div", { children: "Mín. final ($)" }),
          /* @__PURE__ */ jsx("div", {})
        ] }),
        items.map((m) => /* @__PURE__ */ jsxs("div", { className: "p-3 grid grid-cols-1 sm:grid-cols-[1fr_140px_140px_auto] gap-2 items-center", children: [
          /* @__PURE__ */ jsx("div", { className: "font-medium", children: m.tipo_reparacion }),
          /* @__PURE__ */ jsx(Input, { type: "number", defaultValue: m.precio, onBlur: (e) => guardar(m.id, {
            precio: Number(e.target.value)
          }) }),
          /* @__PURE__ */ jsx(Input, { type: "number", defaultValue: m.minimo_final ?? "", placeholder: "—", onBlur: (e) => guardar(m.id, {
            minimo_final: e.target.value === "" ? null : Number(e.target.value)
          }) }),
          /* @__PURE__ */ jsx(Button, { size: "sm", variant: "destructive", onClick: () => eliminar(m.id), children: "Eliminar" })
        ] }, m.id)),
        items.length === 0 && /* @__PURE__ */ jsx("div", { className: "p-4 text-sm text-muted-foreground text-center", children: "Sin tipos cargados" })
      ] }),
      /* @__PURE__ */ jsx("p", { className: "text-xs text-muted-foreground", children: 'El "mínimo final" se aplica al total del presupuesto (ej.: Pin de carga gama alta = $80.000).' })
    ] })
  ] });
}
function ProveedoresTab() {
  const [items, setItems] = useState([]);
  const [drafts, setDrafts] = useState({});
  const load = () => supabase.from("proveedores_config").select("*").order("nombre").then(({
    data
  }) => {
    setItems(data || []);
    setDrafts({});
  });
  useEffect(() => {
    load();
  }, []);
  const setField = (id, k, v) => setDrafts((d) => ({
    ...d,
    [id]: {
      ...d[id] || {},
      [k]: v
    }
  }));
  const guardar = async (row) => {
    const patch = drafts[row.id] || {};
    if (Object.keys(patch).length === 0) return;
    const update = {
      ...patch
    };
    if ("password" in update) {
      update.password_encrypted = update.password;
      delete update.password;
    }
    if (update.url || update.usuario || update.password_encrypted) {
      update.estado = "configurado";
    }
    const {
      error
    } = await supabase.from("proveedores_config").update(update).eq("id", row.id);
    if (error) return toast.error(error.message);
    toast.success(`${row.nombre} actualizado`);
    load();
  };
  return /* @__PURE__ */ jsxs(Card, { children: [
    /* @__PURE__ */ jsx(CardHeader, { children: /* @__PURE__ */ jsx(CardTitle, { children: "Credenciales de proveedores" }) }),
    /* @__PURE__ */ jsxs(CardContent, { className: "space-y-4", children: [
      /* @__PURE__ */ jsx("p", { className: "text-sm text-muted-foreground", children: "Solo administradores pueden ver y modificar estas credenciales. Se usan para sincronizar precios automáticamente desde cada proveedor." }),
      items.map((p) => {
        const d = drafts[p.id] || {};
        return /* @__PURE__ */ jsxs("div", { className: "border rounded-md p-3 space-y-2", children: [
          /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between flex-wrap gap-2", children: [
            /* @__PURE__ */ jsx("div", { className: "font-semibold", children: p.nombre }),
            /* @__PURE__ */ jsx("span", { className: `text-xs px-2 py-0.5 rounded ${p.estado === "configurado" ? "bg-success/15 text-success" : p.estado === "credenciales_faltantes" ? "bg-destructive/15 text-destructive" : "bg-muted text-muted-foreground"}`, children: p.estado })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 sm:grid-cols-3 gap-2", children: [
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx(Label, { className: "text-xs", children: "URL" }),
              /* @__PURE__ */ jsx(Input, { defaultValue: p.url || "", onChange: (e) => setField(p.id, "url", e.target.value) })
            ] }),
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx(Label, { className: "text-xs", children: "Usuario" }),
              /* @__PURE__ */ jsx(Input, { defaultValue: p.usuario || "", onChange: (e) => setField(p.id, "usuario", e.target.value) })
            ] }),
            /* @__PURE__ */ jsxs("div", { children: [
              /* @__PURE__ */ jsx(Label, { className: "text-xs", children: "Contraseña" }),
              /* @__PURE__ */ jsx(Input, { type: "password", placeholder: p.password_encrypted ? "•••• guardada" : "", onChange: (e) => setField(p.id, "password", e.target.value) })
            ] })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between text-xs text-muted-foreground", children: [
            /* @__PURE__ */ jsxs("span", { children: [
              "Última sincronización: ",
              p.ultima_sincronizacion ? new Date(p.ultima_sincronizacion).toLocaleString("es-AR") : "nunca"
            ] }),
            /* @__PURE__ */ jsx(Button, { size: "sm", onClick: () => guardar(p), disabled: Object.keys(d).length === 0, children: "Guardar" })
          ] })
        ] }, p.id);
      }),
      /* @__PURE__ */ jsxs("div", { className: "text-xs text-muted-foreground border-t pt-3", children: [
        /* @__PURE__ */ jsx("strong", { children: "Nota:" }),
        " La infraestructura está lista. Para activar la sincronización real falta el conector HTTP con cada proveedor (endpoint o login + scraping del sitio). Mientras tanto, las cargas manuales y los recargos siguen funcionando."
      ] })
    ] })
  ] });
}
export {
  Configuracion as component
};
