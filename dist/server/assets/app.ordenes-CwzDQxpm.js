import { jsx, jsxs } from "react/jsx-runtime";
import * as React from "react";
import { useState, useEffect } from "react";
import { s as supabase } from "./client-CzxaLLtB.js";
import { u as useAuth } from "./use-auth-GpmAL4wB.js";
import { C as Card, a as CardHeader, b as CardTitle, d as CardContent } from "./card-DQ5v2DYb.js";
import { I as Input } from "./input-C0QjszdI.js";
import { L as Label } from "./label-JU3yqRBo.js";
import { B as Button } from "./button-BC9oXVxV.js";
import { c as cn } from "./utils-H80jjgLf.js";
import { B as Badge } from "./badge-DyfXZgLs.js";
import { S as Select, a as SelectTrigger, b as SelectValue, c as SelectContent, d as SelectItem } from "./select-CZRUt5a6.js";
import { toast } from "sonner";
import { Plus, Search, FileDown, MessageCircle } from "lucide-react";
import jsPDF from "jspdf";
import { a as abrirWhatsApp } from "./whatsapp-BNoO2_jB.js";
import "@supabase/supabase-js";
import "@radix-ui/react-label";
import "class-variance-authority";
import "@radix-ui/react-slot";
import "clsx";
import "tailwind-merge";
import "@radix-ui/react-select";
import "./calculos-BajsDPnH.js";
const Textarea = React.forwardRef(
  ({ className, ...props }, ref) => {
    return /* @__PURE__ */ jsx(
      "textarea",
      {
        className: cn(
          "flex min-h-[60px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-base shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
          className
        ),
        ref,
        ...props
      }
    );
  }
);
Textarea.displayName = "Textarea";
function generarOrdenPDF(o) {
  const doc = new jsPDF({ unit: "pt", format: "a4" });
  const W = doc.internal.pageSize.getWidth();
  doc.setFillColor(28, 36, 84);
  doc.rect(0, 0, W, 90, "F");
  doc.setTextColor(255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(24);
  doc.text("MyPhone Hub", 40, 45);
  doc.setFontSize(11);
  doc.setFont("helvetica", "normal");
  doc.text("Orden de Trabajo", 40, 65);
  doc.setFontSize(10);
  doc.text(`OT-${String(o.numero).padStart(6, "0")}`, W - 40, 40, { align: "right" });
  doc.text(o.fecha, W - 40, 58, { align: "right" });
  if (o.sucursal) doc.text(`Sucursal: ${o.sucursal}`, W - 40, 74, { align: "right" });
  doc.setTextColor(20, 20, 30);
  let y = 130;
  const line = (label, value) => {
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.text(label, 40, y);
    doc.setFont("helvetica", "normal");
    doc.text(value || "-", 160, y);
    y += 18;
  };
  line("Cliente:", o.cliente);
  line("Teléfono:", o.telefono);
  line("Equipo:", [o.marca, o.modelo].filter(Boolean).join(" "));
  line("IMEI:", o.imei);
  line("Técnico:", o.tecnico);
  line("Estado:", o.estado);
  line("Clave/Patrón:", o.clave_desbloqueo);
  line("Accesorios:", o.accesorios);
  y += 6;
  doc.setFont("helvetica", "bold");
  doc.text("Falla declarada:", 40, y);
  y += 16;
  doc.setFont("helvetica", "normal");
  const split = doc.splitTextToSize(o.falla || "-", W - 80);
  doc.text(split, 40, y);
  doc.setTextColor(120);
  doc.setFontSize(9);
  const fy = doc.internal.pageSize.getHeight() - 40;
  doc.text(`Generado por ${o.usuario || "-"} • ${o.fecha}`, 40, fy);
  doc.text("MyPhone Hub", W - 40, fy, { align: "right" });
  return doc;
}
function descargarOrdenPDF(o) {
  generarOrdenPDF(o).save(`OT-${String(o.numero).padStart(6, "0")}.pdf`);
}
function formatOTNumero(n) {
  return `OT-${String(n).padStart(6, "0")}`;
}
const ESTADOS = ["ingresado", "en_revision", "en_reparacion", "listo", "entregado", "no_reparado"];
const ESTADO_COLOR = {
  ingresado: "bg-muted text-foreground",
  en_revision: "bg-warning/20 text-warning-foreground",
  en_reparacion: "bg-accent/20 text-accent-foreground",
  listo: "bg-success/20 text-success",
  entregado: "bg-primary/20 text-primary",
  no_reparado: "bg-destructive/20 text-destructive"
};
function OrdenesPage() {
  const {
    user,
    sucursalId,
    nombre
  } = useAuth();
  const [items, setItems] = useState([]);
  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    cliente: "",
    telefono: "",
    marca: "",
    modelo: "",
    imei: "",
    falla: "",
    accesorios: "",
    clave_desbloqueo: "",
    tecnico: ""
  });
  const load = async () => {
    setLoading(true);
    let query = supabase.from("ordenes_trabajo").select("*, sucursales(nombre)").order("created_at", {
      ascending: false
    }).limit(200);
    if (q.trim()) {
      const t = `%${q.trim()}%`;
      query = query.or(`cliente.ilike.${t},telefono.ilike.${t},modelo.ilike.${t},imei.ilike.${t}`);
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
  const crear = async () => {
    if (!user) return;
    if (!form.cliente.trim()) return toast.error("Ingresá el cliente");
    const {
      data,
      error
    } = await supabase.from("ordenes_trabajo").insert({
      ...form,
      user_id: user.id,
      sucursal_id: sucursalId
    }).select("numero").single();
    if (error) return toast.error(error.message);
    toast.success(`${formatOTNumero(data.numero)} creada`);
    setForm({
      cliente: "",
      telefono: "",
      marca: "",
      modelo: "",
      imei: "",
      falla: "",
      accesorios: "",
      clave_desbloqueo: "",
      tecnico: ""
    });
    setShowForm(false);
    load();
  };
  const cambiarEstado = async (id, estado) => {
    const {
      error
    } = await supabase.from("ordenes_trabajo").update({
      estado
    }).eq("id", id);
    if (error) return toast.error(error.message);
    setItems(items.map((it) => it.id === id ? {
      ...it,
      estado
    } : it));
  };
  const pdf = (o) => descargarOrdenPDF({
    numero: o.numero,
    fecha: new Date(o.created_at).toLocaleString("es-AR"),
    cliente: o.cliente,
    telefono: o.telefono,
    marca: o.marca,
    modelo: o.modelo,
    imei: o.imei,
    falla: o.falla,
    accesorios: o.accesorios,
    clave_desbloqueo: o.clave_desbloqueo,
    tecnico: o.tecnico,
    estado: o.estado,
    sucursal: o.sucursales?.nombre,
    usuario: nombre
  });
  const wsp = (o) => {
    const msg = `Hola ${o.cliente}.

Tu orden de trabajo ${formatOTNumero(o.numero)} está en estado: ${o.estado.replace("_", " ")}.

Gracias.
MyPhone Hub`;
    abrirWhatsApp(o.telefono, msg);
  };
  return /* @__PURE__ */ jsxs("div", { className: "space-y-4", children: [
    /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between", children: [
      /* @__PURE__ */ jsx("h1", { className: "text-2xl font-bold", children: "Órdenes de Trabajo" }),
      /* @__PURE__ */ jsxs(Button, { onClick: () => setShowForm((s) => !s), children: [
        /* @__PURE__ */ jsx(Plus, { className: "w-4 h-4 mr-1" }),
        "Nueva OT"
      ] })
    ] }),
    showForm && /* @__PURE__ */ jsxs(Card, { children: [
      /* @__PURE__ */ jsx(CardHeader, { children: /* @__PURE__ */ jsx(CardTitle, { children: "Nueva orden" }) }),
      /* @__PURE__ */ jsxs(CardContent, { className: "grid grid-cols-1 sm:grid-cols-2 gap-3", children: [
        /* @__PURE__ */ jsx(F, { label: "Cliente *", children: /* @__PURE__ */ jsx(Input, { value: form.cliente, onChange: (e) => setForm({
          ...form,
          cliente: e.target.value
        }) }) }),
        /* @__PURE__ */ jsx(F, { label: "Teléfono", children: /* @__PURE__ */ jsx(Input, { value: form.telefono, onChange: (e) => setForm({
          ...form,
          telefono: e.target.value
        }) }) }),
        /* @__PURE__ */ jsx(F, { label: "Marca", children: /* @__PURE__ */ jsx(Input, { value: form.marca, onChange: (e) => setForm({
          ...form,
          marca: e.target.value
        }) }) }),
        /* @__PURE__ */ jsx(F, { label: "Modelo", children: /* @__PURE__ */ jsx(Input, { value: form.modelo, onChange: (e) => setForm({
          ...form,
          modelo: e.target.value
        }) }) }),
        /* @__PURE__ */ jsx(F, { label: "IMEI", children: /* @__PURE__ */ jsx(Input, { value: form.imei, onChange: (e) => setForm({
          ...form,
          imei: e.target.value
        }) }) }),
        /* @__PURE__ */ jsx(F, { label: "Técnico", children: /* @__PURE__ */ jsx(Input, { value: form.tecnico, onChange: (e) => setForm({
          ...form,
          tecnico: e.target.value
        }) }) }),
        /* @__PURE__ */ jsx(F, { label: "Clave / Patrón", children: /* @__PURE__ */ jsx(Input, { value: form.clave_desbloqueo, onChange: (e) => setForm({
          ...form,
          clave_desbloqueo: e.target.value
        }) }) }),
        /* @__PURE__ */ jsx(F, { label: "Accesorios", children: /* @__PURE__ */ jsx(Input, { value: form.accesorios, onChange: (e) => setForm({
          ...form,
          accesorios: e.target.value
        }) }) }),
        /* @__PURE__ */ jsx(F, { label: "Falla declarada", full: true, children: /* @__PURE__ */ jsx(Textarea, { rows: 3, value: form.falla, onChange: (e) => setForm({
          ...form,
          falla: e.target.value
        }) }) }),
        /* @__PURE__ */ jsx("div", { className: "sm:col-span-2", children: /* @__PURE__ */ jsx(Button, { onClick: crear, className: "w-full h-11", size: "lg", children: "Crear OT" }) })
      ] })
    ] }),
    /* @__PURE__ */ jsxs("form", { onSubmit: (e) => {
      e.preventDefault();
      load();
    }, className: "flex gap-2", children: [
      /* @__PURE__ */ jsx(Input, { placeholder: "Buscar por cliente, teléfono, modelo o IMEI...", value: q, onChange: (e) => setQ(e.target.value) }),
      /* @__PURE__ */ jsx(Button, { type: "submit", children: /* @__PURE__ */ jsx(Search, { className: "w-4 h-4" }) })
    ] }),
    loading ? /* @__PURE__ */ jsx("p", { className: "text-muted-foreground", children: "Cargando..." }) : items.length === 0 ? /* @__PURE__ */ jsx("p", { className: "text-muted-foreground text-center py-8", children: "Sin órdenes." }) : /* @__PURE__ */ jsx("div", { className: "space-y-3", children: items.map((o) => /* @__PURE__ */ jsx(Card, { children: /* @__PURE__ */ jsxs(CardContent, { className: "p-4 space-y-2", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex flex-wrap items-center justify-between gap-2", children: [
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsxs("div", { className: "font-semibold", children: [
            formatOTNumero(o.numero),
            " — ",
            o.cliente
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "text-xs text-muted-foreground", children: [
            new Date(o.created_at).toLocaleString("es-AR"),
            " • ",
            o.sucursales?.nombre || "—"
          ] })
        ] }),
        /* @__PURE__ */ jsx(Badge, { className: ESTADO_COLOR[o.estado], children: o.estado.replace("_", " ") })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "text-sm", children: [
        o.marca,
        " ",
        o.modelo,
        " ",
        o.imei && /* @__PURE__ */ jsxs("span", { className: "text-muted-foreground", children: [
          "• IMEI ",
          o.imei
        ] })
      ] }),
      o.falla && /* @__PURE__ */ jsx("div", { className: "text-sm text-muted-foreground", children: o.falla }),
      /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-end flex-wrap gap-2", children: [
        /* @__PURE__ */ jsxs(Select, { value: o.estado, onValueChange: (v) => cambiarEstado(o.id, v), children: [
          /* @__PURE__ */ jsx(SelectTrigger, { className: "h-9 w-44", children: /* @__PURE__ */ jsx(SelectValue, {}) }),
          /* @__PURE__ */ jsx(SelectContent, { children: ESTADOS.map((e) => /* @__PURE__ */ jsx(SelectItem, { value: e, children: e.replace("_", " ") }, e)) })
        ] }),
        /* @__PURE__ */ jsx(Button, { size: "sm", variant: "secondary", onClick: () => pdf(o), children: /* @__PURE__ */ jsx(FileDown, { className: "w-4 h-4" }) }),
        /* @__PURE__ */ jsx(Button, { size: "sm", className: "bg-success text-success-foreground hover:opacity-90", onClick: () => wsp(o), children: /* @__PURE__ */ jsx(MessageCircle, { className: "w-4 h-4" }) })
      ] })
    ] }) }, o.id)) })
  ] });
}
function F({
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
  OrdenesPage as component
};
