import { jsxs, jsx } from "react/jsx-runtime";
import { useState, useEffect } from "react";
import { s as supabase } from "./client-CzxaLLtB.js";
import { I as Input } from "./input-C0QjszdI.js";
import { C as Card, d as CardContent } from "./card-DQ5v2DYb.js";
import { B as Badge } from "./badge-DyfXZgLs.js";
import { B as Button } from "./button-BC9oXVxV.js";
import { S as Select, a as SelectTrigger, b as SelectValue, c as SelectContent, d as SelectItem } from "./select-CZRUt5a6.js";
import { f as formatARS } from "./calculos-BajsDPnH.js";
import { a as descargarPDF } from "./pdf-4OY4ncHI.js";
import { a as abrirWhatsApp, b as buildMensajeWhatsApp } from "./whatsapp-BNoO2_jB.js";
import { u as useAuth } from "./use-auth-GpmAL4wB.js";
import { toast } from "sonner";
import { Search, FileDown, MessageCircle } from "lucide-react";
import "@supabase/supabase-js";
import "./utils-H80jjgLf.js";
import "clsx";
import "tailwind-merge";
import "class-variance-authority";
import "@radix-ui/react-slot";
import "@radix-ui/react-select";
import "jspdf";
const ESTADOS = ["pendiente", "aprobado", "rechazado", "entregado"];
const ESTADO_COLORS = {
  pendiente: "bg-warning/20 text-warning-foreground",
  aprobado: "bg-success/20 text-success",
  rechazado: "bg-destructive/20 text-destructive",
  entregado: "bg-primary/20 text-primary"
};
function Historial() {
  const {
    nombre
  } = useAuth();
  const [items, setItems] = useState([]);
  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(true);
  const load = async () => {
    setLoading(true);
    let query = supabase.from("presupuestos").select("*, sucursales(nombre), opciones_presupuesto(proveedor, calidad, seleccionada, total)").order("created_at", {
      ascending: false
    }).limit(200);
    if (q.trim()) {
      const term = `%${q.trim()}%`;
      query = query.or(`cliente.ilike.${term},telefono.ilike.${term},modelo.ilike.${term}`);
    }
    const {
      data,
      error
    } = await query;
    setLoading(false);
    if (error) return toast.error(error.message);
    setItems(data || []);
  };
  useEffect(() => {
    load();
  }, []);
  const cambiarEstado = async (id, estado) => {
    const {
      error
    } = await supabase.from("presupuestos").update({
      estado
    }).eq("id", id);
    if (error) return toast.error(error.message);
    setItems(items.map((it) => it.id === id ? {
      ...it,
      estado
    } : it));
  };
  const pdf = (p) => descargarPDF({
    numero: p.numero,
    fecha: new Date(p.created_at).toLocaleString("es-AR"),
    cliente: p.cliente,
    telefono: p.telefono,
    marca: p.marca,
    modelo: p.modelo,
    reparacion: p.reparacion,
    tipo_trabajo: p.tipo_trabajo,
    tipo: p.tipo,
    costo: p.costo,
    ganancia: p.ganancia,
    envio: p.envio,
    precio_base: p.precio_base,
    subtotal: p.subtotal,
    iva: p.iva,
    total: p.total,
    sucursal: p.sucursales?.nombre,
    usuario: nombre
  });
  const wsp = (p) => abrirWhatsApp(p.telefono, buildMensajeWhatsApp({
    cliente: p.cliente,
    marca: p.marca,
    modelo: p.modelo,
    reparacion: p.reparacion,
    tipo_trabajo: p.tipo_trabajo,
    total: Number(p.total)
  }));
  return /* @__PURE__ */ jsxs("div", { className: "space-y-4", children: [
    /* @__PURE__ */ jsx("h1", { className: "text-2xl font-bold", children: "Historial" }),
    /* @__PURE__ */ jsxs("form", { onSubmit: (e) => {
      e.preventDefault();
      load();
    }, className: "flex gap-2", children: [
      /* @__PURE__ */ jsx(Input, { placeholder: "Buscar por cliente, teléfono o modelo...", value: q, onChange: (e) => setQ(e.target.value) }),
      /* @__PURE__ */ jsx(Button, { type: "submit", children: /* @__PURE__ */ jsx(Search, { className: "w-4 h-4" }) })
    ] }),
    loading ? /* @__PURE__ */ jsx("p", { className: "text-muted-foreground", children: "Cargando..." }) : items.length === 0 ? /* @__PURE__ */ jsx("p", { className: "text-muted-foreground text-center py-8", children: "Sin presupuestos." }) : /* @__PURE__ */ jsx("div", { className: "space-y-3", children: items.map((p) => /* @__PURE__ */ jsx(Card, { children: /* @__PURE__ */ jsxs(CardContent, { className: "p-4 space-y-2", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex flex-wrap items-center justify-between gap-2", children: [
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsxs("div", { className: "font-semibold", children: [
            "N° ",
            p.numero,
            " — ",
            p.cliente
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "text-xs text-muted-foreground", children: [
            new Date(p.created_at).toLocaleString("es-AR"),
            " • ",
            p.sucursales?.nombre || "—",
            " • ",
            p.tipo.toUpperCase()
          ] })
        ] }),
        /* @__PURE__ */ jsx(Badge, { className: ESTADO_COLORS[p.estado], children: p.estado })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "text-sm", children: [
        p.marca,
        " ",
        p.modelo,
        " — ",
        /* @__PURE__ */ jsx("span", { className: "text-muted-foreground", children: p.reparacion || p.tipo_trabajo })
      ] }),
      (() => {
        const sel = (p.opciones_presupuesto || []).find((o) => o.seleccionada);
        if (sel) return /* @__PURE__ */ jsxs("div", { className: "text-xs", children: [
          /* @__PURE__ */ jsx(Badge, { variant: "secondary", children: sel.proveedor }),
          " ",
          sel.calidad && /* @__PURE__ */ jsx(Badge, { children: sel.calidad })
        ] });
        if ((p.opciones_presupuesto || []).length > 0) return /* @__PURE__ */ jsxs("div", { className: "text-xs text-muted-foreground", children: [
          p.opciones_presupuesto.length,
          " opciones disponibles — sin selección"
        ] });
        return null;
      })(),
      /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between flex-wrap gap-2", children: [
        /* @__PURE__ */ jsx("div", { className: "font-bold text-primary text-lg", children: formatARS(Number(p.total)) }),
        /* @__PURE__ */ jsxs("div", { className: "flex gap-2 flex-wrap", children: [
          /* @__PURE__ */ jsxs(Select, { value: p.estado, onValueChange: (v) => cambiarEstado(p.id, v), children: [
            /* @__PURE__ */ jsx(SelectTrigger, { className: "h-9 w-36", children: /* @__PURE__ */ jsx(SelectValue, {}) }),
            /* @__PURE__ */ jsx(SelectContent, { children: ESTADOS.map((e) => /* @__PURE__ */ jsx(SelectItem, { value: e, children: e }, e)) })
          ] }),
          /* @__PURE__ */ jsx(Button, { size: "sm", variant: "secondary", onClick: () => pdf(p), children: /* @__PURE__ */ jsx(FileDown, { className: "w-4 h-4" }) }),
          /* @__PURE__ */ jsx(Button, { size: "sm", className: "bg-success text-success-foreground hover:opacity-90", onClick: () => wsp(p), children: /* @__PURE__ */ jsx(MessageCircle, { className: "w-4 h-4" }) })
        ] })
      ] })
    ] }) }, p.id)) })
  ] });
}
export {
  Historial as component
};
