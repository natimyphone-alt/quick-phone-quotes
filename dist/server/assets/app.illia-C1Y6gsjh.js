import { jsxs, jsx, Fragment } from "react/jsx-runtime";
import { useState, useCallback } from "react";
import { C as Card, a as CardHeader, b as CardTitle, d as CardContent } from "./card-DQ5v2DYb.js";
import { I as Input } from "./input-C0QjszdI.js";
import { L as Label } from "./label-JU3yqRBo.js";
import { B as Button } from "./button-BC9oXVxV.js";
import { B as Badge } from "./badge-DyfXZgLs.js";
import { f as formatARS, c as calcularManoObraModuloIphone, a as calcularManoObraBateriaIphone, b as calcularManoObraAndroid, d as calcularManoObraBateriaAndroid } from "./calculos-BajsDPnH.js";
import { E as ENVIO_PATAGONIA, a as ENVIO_FV, c as calcularOpcion } from "./proveedores-BZ25tzXp.js";
import { d as descargarPDFMultiOpciones } from "./pdf-4OY4ncHI.js";
import { s as supabase } from "./client-CzxaLLtB.js";
import { u as useAuth } from "./use-auth-GpmAL4wB.js";
import { toast } from "sonner";
import { Loader2, Search, Check, Save, FileDown } from "lucide-react";
import "./utils-H80jjgLf.js";
import "clsx";
import "tailwind-merge";
import "@radix-ui/react-label";
import "class-variance-authority";
import "@radix-ui/react-slot";
import "jspdf";
import "@supabase/supabase-js";
async function buscarPrecioMercado(marca, modelo) {
  try {
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-6",
        max_tokens: 100,
        messages: [{
          role: "user",
          content: `¿Cuál es el precio de venta aproximado en pesos argentinos del ${marca} ${modelo} en julio 2026 en Argentina? Respondé SOLO con el número sin puntos ni comas ni símbolo $. Por ejemplo: 350000`
        }]
      })
    });
    const data = await response.json();
    const texto = data.content?.[0]?.text?.trim() || "0";
    const numero = parseInt(texto.replace(/\D/g, ""), 10);
    return isNaN(numero) ? 0 : numero;
  } catch {
    return 0;
  }
}
function IlliaPage() {
  const {
    user,
    sucursalId,
    nombre,
    isAdmin
  } = useAuth();
  const [form, setForm] = useState({
    marca: "",
    modelo: "",
    tipo_reparacion: "Módulo",
    con_ic: false,
    con_condicion: false
  });
  const [buscando, setBuscando] = useState(false);
  const [opciones, setOpciones] = useState([]);
  const [seleccionada, setSeleccionada] = useState(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(null);
  const [precioMercado, setPrecioMercado] = useState(0);
  const esIphone = form.marca.toLowerCase().includes("iphone") || form.marca.toLowerCase().includes("apple");
  const upd = (k, v) => {
    setForm((f) => ({
      ...f,
      [k]: v
    }));
    setOpciones([]);
    setSeleccionada(null);
    setSaved(null);
    setPrecioMercado(0);
  };
  const calcularManoObra = (precioVenta) => {
    if (esIphone) {
      if (form.tipo_reparacion === "Módulo") return calcularManoObraModuloIphone(form.modelo, form.con_ic);
      if (form.tipo_reparacion === "Batería") return calcularManoObraBateriaIphone(form.modelo, form.con_condicion);
      return 0;
    }
    if (form.tipo_reparacion === "Módulo") return calcularManoObraAndroid(precioVenta);
    if (form.tipo_reparacion === "Batería") return calcularManoObraBateriaAndroid(precioVenta);
    return 0;
  };
  const buscarRepuestos = useCallback(async () => {
    if (!form.marca.trim() || !form.modelo.trim()) return toast.error("Ingresá marca y modelo");
    setBuscando(true);
    toast.info("Buscando...");
    const [{
      data,
      error
    }, precioVenta] = await Promise.all([supabase.rpc("buscar_modelo_exacto", {
      p_marca: form.marca.trim(),
      p_modelo: form.modelo.trim().toUpperCase(),
      p_tipo: form.tipo_reparacion
    }), buscarPrecioMercado(form.marca.trim(), form.modelo.trim())]);
    setBuscando(false);
    setPrecioMercado(precioVenta);
    if (error) {
      toast.error(error.message);
      return;
    }
    const resultados = data || [];
    if (resultados.length === 0) {
      toast.error("Sin coincidencias en el catálogo");
      return;
    }
    const manoObra = calcularManoObra(precioVenta);
    const ops = resultados.map((r) => {
      const precioRepuesto = Number(r.precio_calculado ?? r.precio_proveedor ?? r.precio);
      const envio = r.proveedor === "Patagonia Cell" ? ENVIO_PATAGONIA : ENVIO_FV;
      return calcularOpcion({
        proveedor: r.proveedor,
        calidad: r.calidad,
        precioCalculado: precioRepuesto,
        manoObra,
        envio,
        url_producto: r.url_producto,
        catalogo_id: r.id,
        nombre_producto: r.nombre_completo || r.modelo
      });
    });
    setOpciones(ops);
    setSeleccionada(null);
    toast.success(`${ops.length} opciones encontradas${precioVenta > 0 ? ` · Precio mercado: ${formatARS(precioVenta)}` : ""}`);
  }, [form, esIphone]);
  const guardar = async () => {
    if (opciones.length === 0 || !user) return;
    setSaving(true);
    const elegida = seleccionada !== null ? opciones[seleccionada] : opciones[0];
    const {
      data: presu,
      error
    } = await supabase.from("presupuestos").insert({
      tipo: "illia",
      cliente: "-",
      telefono: "-",
      marca: form.marca,
      modelo: form.modelo,
      reparacion: form.tipo_reparacion,
      costo: elegida.costo_repuesto + elegida.mano_obra,
      ganancia: elegida.ganancia,
      envio: elegida.envio,
      subtotal: elegida.subtotal,
      iva: elegida.iva,
      total: elegida.total,
      sucursal_id: sucursalId,
      user_id: user.id
    }).select("id, numero").single();
    if (error || !presu) {
      setSaving(false);
      return toast.error(error?.message || "Error");
    }
    const filas = opciones.map((op, i) => ({
      presupuesto_id: presu.id,
      proveedor: op.proveedor,
      calidad: op.calidad,
      costo_repuesto: op.costo_repuesto,
      mano_obra: op.mano_obra,
      envio: op.envio,
      ganancia: op.ganancia,
      iva: op.iva,
      total: op.total,
      seleccionada: seleccionada === i
    }));
    const {
      error: errOps
    } = await supabase.from("opciones_presupuesto").insert(filas);
    setSaving(false);
    if (errOps) return toast.error(errOps.message);
    setSaved({
      numero: presu.numero,
      id: presu.id
    });
    toast.success(`Presupuesto N° ${presu.numero} guardado`);
  };
  const marcarSeleccion = async (idx) => {
    setSeleccionada(idx);
    if (saved) {
      const {
        data: ops
      } = await supabase.from("opciones_presupuesto").select("id, proveedor, calidad").eq("presupuesto_id", saved.id);
      if (ops) {
        const target = opciones[idx];
        const match = ops.find((o) => o.proveedor === target.proveedor && (o.calidad || "") === (target.calidad || ""));
        if (match) {
          await supabase.from("opciones_presupuesto").update({
            seleccionada: false
          }).eq("presupuesto_id", saved.id);
          await supabase.from("opciones_presupuesto").update({
            seleccionada: true
          }).eq("id", match.id);
          await supabase.from("presupuestos").update({
            costo: target.costo_repuesto + target.mano_obra,
            ganancia: target.ganancia,
            envio: target.envio,
            subtotal: target.subtotal,
            iva: target.iva,
            total: target.total
          }).eq("id", saved.id);
        }
      }
    }
  };
  const pdf = () => {
    if (opciones.length === 0) return;
    descargarPDFMultiOpciones({
      numero: saved?.numero ?? 0,
      fecha: (/* @__PURE__ */ new Date()).toLocaleString("es-AR"),
      cliente: "-",
      telefono: "-",
      marca: form.marca,
      modelo: form.modelo,
      reparacion: form.tipo_reparacion,
      opciones,
      seleccionadaIdx: seleccionada,
      usuario: nombre
    });
  };
  return /* @__PURE__ */ jsxs("div", { className: "space-y-4 max-w-3xl mx-auto", children: [
    /* @__PURE__ */ jsx("h1", { className: "text-2xl font-bold", children: "Presupuesto" }),
    /* @__PURE__ */ jsxs(Card, { children: [
      /* @__PURE__ */ jsx(CardHeader, { children: /* @__PURE__ */ jsx(CardTitle, { children: "Datos del equipo" }) }),
      /* @__PURE__ */ jsxs(CardContent, { className: "grid grid-cols-1 sm:grid-cols-2 gap-3", children: [
        /* @__PURE__ */ jsx(Field, { label: "Marca *", children: /* @__PURE__ */ jsx(Input, { value: form.marca, onChange: (e) => upd("marca", e.target.value), placeholder: "Samsung" }) }),
        /* @__PURE__ */ jsx(Field, { label: "Modelo *", children: /* @__PURE__ */ jsx(Input, { value: form.modelo, onChange: (e) => upd("modelo", e.target.value), placeholder: "A15" }) }),
        /* @__PURE__ */ jsx(Field, { label: "Tipo de reparación *", full: true, children: /* @__PURE__ */ jsx("div", { className: "flex gap-2", children: ["Módulo", "Batería"].map((t) => /* @__PURE__ */ jsx("button", { onClick: () => upd("tipo_reparacion", t), className: `flex-1 py-2 px-2 rounded-md text-sm font-medium border transition-colors ${form.tipo_reparacion === t ? "bg-primary text-primary-foreground border-primary" : "bg-background border-input hover:bg-accent"}`, children: t }, t)) }) }),
        esIphone && form.tipo_reparacion === "Módulo" && /* @__PURE__ */ jsx(Field, { label: "Tipo de cambio módulo iPhone *", full: true, children: /* @__PURE__ */ jsx("div", { className: "flex gap-2", children: [{
          label: "Sin IC",
          value: false
        }, {
          label: "Con IC",
          value: true
        }].map((opt) => /* @__PURE__ */ jsx("button", { onClick: () => upd("con_ic", opt.value), className: `flex-1 py-2 px-3 rounded-md text-sm font-medium border transition-colors ${form.con_ic === opt.value ? "bg-primary text-primary-foreground border-primary" : "bg-background border-input hover:bg-accent"}`, children: opt.label }, String(opt.value))) }) }),
        esIphone && form.tipo_reparacion === "Batería" && /* @__PURE__ */ jsx(Field, { label: "Tipo de cambio batería iPhone *", full: true, children: /* @__PURE__ */ jsx("div", { className: "flex gap-2", children: [{
          label: "Sin condición",
          value: false
        }, {
          label: "Con condición",
          value: true
        }].map((opt) => /* @__PURE__ */ jsx("button", { onClick: () => upd("con_condicion", opt.value), className: `flex-1 py-2 px-3 rounded-md text-sm font-medium border transition-colors ${form.con_condicion === opt.value ? "bg-primary text-primary-foreground border-primary" : "bg-background border-input hover:bg-accent"}`, children: opt.label }, String(opt.value))) }) }),
        /* @__PURE__ */ jsx("div", { className: "sm:col-span-2", children: /* @__PURE__ */ jsx(Button, { onClick: buscarRepuestos, disabled: buscando, className: "w-full h-11", size: "lg", children: buscando ? /* @__PURE__ */ jsxs(Fragment, { children: [
          /* @__PURE__ */ jsx(Loader2, { className: "w-4 h-4 mr-2 animate-spin" }),
          "Buscando..."
        ] }) : /* @__PURE__ */ jsxs(Fragment, { children: [
          /* @__PURE__ */ jsx(Search, { className: "w-4 h-4 mr-2" }),
          "Buscar opciones"
        ] }) }) })
      ] })
    ] }),
    precioMercado > 0 && /* @__PURE__ */ jsxs("p", { className: "text-sm text-muted-foreground text-center", children: [
      "Precio de mercado estimado: ",
      /* @__PURE__ */ jsx("strong", { children: formatARS(precioMercado) })
    ] }),
    opciones.length > 0 && /* @__PURE__ */ jsxs("div", { className: "space-y-3", children: [
      /* @__PURE__ */ jsxs("h2", { className: "text-lg font-semibold", children: [
        "Opciones (",
        opciones.length,
        ")"
      ] }),
      opciones.map((op, i) => {
        const elegida = seleccionada === i;
        return /* @__PURE__ */ jsx(Card, { className: elegida ? "border-2 border-primary" : "", children: /* @__PURE__ */ jsx(CardContent, { className: "p-4", children: /* @__PURE__ */ jsxs("div", { className: "flex justify-between items-center flex-wrap gap-2", children: [
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("div", { className: "font-semibold text-lg", children: op.proveedor === "FV Mayorista" ? "Cipolletti" : op.proveedor === "Patagonia Cell" ? "Neuquén" : op.proveedor }),
            op.nombre_producto && /* @__PURE__ */ jsx("div", { className: "text-sm text-muted-foreground mt-0.5", children: op.nombre_producto }),
            op.calidad && /* @__PURE__ */ jsx(Badge, { className: "mt-1", children: op.proveedor === "Patagonia Cell" && op.calidad === "Original" ? "Calidad Original" : op.calidad }),
            isAdmin && op.url_producto && /* @__PURE__ */ jsx("a", { href: op.url_producto, target: "_blank", rel: "noreferrer", className: "block text-xs text-primary underline mt-1", children: "Ver producto" })
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "text-right", children: [
            /* @__PURE__ */ jsx("div", { className: "text-2xl font-bold text-primary", children: formatARS(op.total) }),
            /* @__PURE__ */ jsx(Button, { size: "sm", variant: elegida ? "default" : "outline", onClick: () => marcarSeleccion(i), className: "mt-2", children: elegida ? /* @__PURE__ */ jsxs(Fragment, { children: [
              /* @__PURE__ */ jsx(Check, { className: "w-4 h-4 mr-1" }),
              "Elegida"
            ] }) : "Elegir" })
          ] })
        ] }) }) }, i);
      }),
      /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2", children: [
        /* @__PURE__ */ jsxs(Button, { onClick: guardar, disabled: saving || !!saved, size: "lg", children: [
          /* @__PURE__ */ jsx(Save, { className: "w-4 h-4 mr-2" }),
          saved ? `Guardado N° ${saved.numero}` : "Guardar"
        ] }),
        /* @__PURE__ */ jsxs(Button, { onClick: pdf, variant: "secondary", size: "lg", children: [
          /* @__PURE__ */ jsx(FileDown, { className: "w-4 h-4 mr-2" }),
          "PDF"
        ] })
      ] })
    ] })
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
  IlliaPage as component
};
