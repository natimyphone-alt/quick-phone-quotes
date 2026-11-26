import { jsx, jsxs } from "react/jsx-runtime";
import * as React from "react";
import { useState, useEffect, useMemo } from "react";
import { s as supabase } from "./client-CzxaLLtB.js";
import { u as useAuth } from "./use-auth-GpmAL4wB.js";
import { C as Card, d as CardContent, a as CardHeader, b as CardTitle } from "./card-DQ5v2DYb.js";
import { I as Input } from "./input-C0QjszdI.js";
import { L as Label } from "./label-JU3yqRBo.js";
import { B as Button } from "./button-BC9oXVxV.js";
import { T as Textarea } from "./textarea-DSyJ1nlY.js";
import { B as Badge } from "./badge-DyfXZgLs.js";
import * as SwitchPrimitives from "@radix-ui/react-switch";
import { c as cn } from "./utils-H80jjgLf.js";
import { T as Tabs, a as TabsList, b as TabsTrigger, c as TabsContent } from "./tabs-D_u1EXWn.js";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { X, AlertTriangle, Camera, RefreshCw, Search, Clock, MessageCircle, CheckCircle2, Send } from "lucide-react";
import { S as Select, a as SelectTrigger, b as SelectValue, c as SelectContent, d as SelectItem } from "./select-CZRUt5a6.js";
import { toast } from "sonner";
import { a as abrirWhatsApp } from "./whatsapp-DYl72Axi.js";
import "@supabase/supabase-js";
import "@radix-ui/react-label";
import "class-variance-authority";
import "@radix-ui/react-slot";
import "clsx";
import "tailwind-merge";
import "@radix-ui/react-tabs";
import "@radix-ui/react-select";
import "./calculos-oJvkt5R_.js";
const Switch = React.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsx(
  SwitchPrimitives.Root,
  {
    className: cn(
      "peer inline-flex h-5 w-9 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-primary data-[state=unchecked]:bg-input",
      className
    ),
    ...props,
    ref,
    children: /* @__PURE__ */ jsx(
      SwitchPrimitives.Thumb,
      {
        className: cn(
          "pointer-events-none block h-4 w-4 rounded-full bg-background shadow-lg ring-0 transition-transform data-[state=checked]:translate-x-4 data-[state=unchecked]:translate-x-0"
        )
      }
    )
  }
));
Switch.displayName = SwitchPrimitives.Root.displayName;
const Dialog = DialogPrimitive.Root;
const DialogPortal = DialogPrimitive.Portal;
const DialogOverlay = React.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsx(
  DialogPrimitive.Overlay,
  {
    ref,
    className: cn(
      "fixed inset-0 z-50 bg-black/80  data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
      className
    ),
    ...props
  }
));
DialogOverlay.displayName = DialogPrimitive.Overlay.displayName;
const DialogContent = React.forwardRef(({ className, children, ...props }, ref) => /* @__PURE__ */ jsxs(DialogPortal, { children: [
  /* @__PURE__ */ jsx(DialogOverlay, {}),
  /* @__PURE__ */ jsxs(
    DialogPrimitive.Content,
    {
      ref,
      className: cn(
        "fixed left-[50%] top-[50%] z-50 grid w-full max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4 border bg-background p-6 shadow-lg duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 sm:rounded-lg",
        className
      ),
      ...props,
      children: [
        children,
        /* @__PURE__ */ jsxs(DialogPrimitive.Close, { className: "absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background cursor-pointer transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground", children: [
          /* @__PURE__ */ jsx(X, { className: "h-4 w-4" }),
          /* @__PURE__ */ jsx("span", { className: "sr-only", children: "Close" })
        ] })
      ]
    }
  )
] }));
DialogContent.displayName = DialogPrimitive.Content.displayName;
const DialogHeader = ({ className, ...props }) => /* @__PURE__ */ jsx("div", { className: cn("flex flex-col space-y-1.5 text-center sm:text-left", className), ...props });
DialogHeader.displayName = "DialogHeader";
const DialogTitle = React.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsx(
  DialogPrimitive.Title,
  {
    ref,
    className: cn("text-lg font-semibold leading-none tracking-tight", className),
    ...props
  }
));
DialogTitle.displayName = DialogPrimitive.Title.displayName;
const DialogDescription = React.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ jsx(
  DialogPrimitive.Description,
  {
    ref,
    className: cn("text-sm text-muted-foreground", className),
    ...props
  }
));
DialogDescription.displayName = DialogPrimitive.Description.displayName;
const db = supabase;
const FRASE_FIJA = "Vamos a revisar tu caso y te contactamos a la brevedad.";
const TIPOS = [{
  v: "cambio",
  l: "Cambio de producto"
}, {
  v: "reparacion",
  l: "Reparación que vuelve (reingreso)"
}, {
  v: "reclamo",
  l: "Reclamo (cliente enojado, pide que respondamos)"
}];
const ESTADOS_PRODUCTO = [{
  v: "sellado",
  l: "Sellado, sin abrir"
}, {
  v: "intacto_completo",
  l: "Abierto pero impecable y completo"
}, {
  v: "abierto_completo",
  l: "Abierto, usado, completo"
}, {
  v: "usado",
  l: "Usado / con marcas de uso"
}, {
  v: "danado",
  l: "Dañado (golpe, roto, mojado)"
}, {
  v: "incompleto",
  l: "Le falta algo (caja, cable, accesorio)"
}];
const QUE_PIDE = [{
  v: "cambio",
  l: "Cambiarlo por otro producto"
}, {
  v: "nota_credito",
  l: "Nota de crédito"
}, {
  v: "devolucion",
  l: "Que le devolvamos la plata"
}, {
  v: "revision",
  l: "Que revisemos el equipo / una respuesta"
}];
const FORMAS_PAGO = ["Efectivo", "Débito", "Crédito", "QR / Mercado Pago", "Transferencia", "Nota de crédito"];
const ESTADOS = {
  nuevo: "Nuevo",
  en_revision: "En revisión",
  esperando_taller: "Esperando taller",
  esperando_cliente: "Esperando cliente",
  con_vanesa: "Con Vanesa",
  resuelto: "Resuelto"
};
const COLOR_UI = {
  verde: {
    label: "VERDE",
    badge: "bg-success text-success-foreground",
    box: "border-success bg-success/10"
  },
  amarillo: {
    label: "AMARILLO",
    badge: "bg-warning text-warning-foreground",
    box: "border-warning bg-warning/10"
  },
  rojo: {
    label: "ROJO",
    badge: "bg-destructive text-destructive-foreground",
    box: "border-destructive bg-destructive/10"
  }
};
const labelDe = (lista, v) => lista.find((x) => x.v === v)?.l ?? v;
const hoyISO = () => (/* @__PURE__ */ new Date()).toLocaleDateString("en-CA");
const fecha = (iso) => iso ? new Date(iso).toLocaleString("es-AR", {
  dateStyle: "short",
  timeStyle: "short"
}) : "—";
const fechaCorta = (d) => d ? (/* @__PURE__ */ new Date(d + "T12:00:00")).toLocaleDateString("es-AR") : "—";
function telWhatsApp(tel) {
  let t = (tel || "").replace(/\D/g, "");
  if (t.startsWith("0")) t = t.slice(1);
  if (t.length === 10) t = "549" + t;
  return t;
}
async function comprimirImagen(file) {
  if (!file.type.startsWith("image/")) return file;
  try {
    const bmp = await createImageBitmap(file);
    const escala = Math.min(1, 1600 / Math.max(bmp.width, bmp.height));
    const canvas = document.createElement("canvas");
    canvas.width = Math.round(bmp.width * escala);
    canvas.height = Math.round(bmp.height * escala);
    canvas.getContext("2d").drawImage(bmp, 0, 0, canvas.width, canvas.height);
    return await new Promise((res) => canvas.toBlob((b) => res(b || file), "image/jpeg", 0.8));
  } catch {
    return file;
  }
}
function ReclamosPage() {
  const {
    isAdmin
  } = useAuth();
  const [rol, setRol] = useState("");
  const [tab, setTab] = useState("nuevo");
  const [recarga, setRecarga] = useState(0);
  useEffect(() => {
    db.rpc("reclamos_rol").then(({
      data
    }) => setRol(data || ""));
  }, []);
  const puedeGestionar = isAdmin || rol === "administrador" || rol === "encargado";
  const esAdmin = isAdmin || rol === "administrador";
  return /* @__PURE__ */ jsxs("div", { className: "space-y-4", children: [
    /* @__PURE__ */ jsxs("div", { children: [
      /* @__PURE__ */ jsx("h1", { className: "text-2xl font-bold", children: "Reclamos" }),
      /* @__PURE__ */ jsx("p", { className: "text-sm text-muted-foreground", children: "Cambios, notas de crédito, reingresos y reclamos de clientes." })
    ] }),
    /* @__PURE__ */ jsxs(Tabs, { value: tab, onValueChange: setTab, children: [
      /* @__PURE__ */ jsxs(TabsList, { className: `grid w-full ${puedeGestionar ? "grid-cols-3" : "grid-cols-2"}`, children: [
        /* @__PURE__ */ jsx(TabsTrigger, { value: "nuevo", children: "Nuevo caso" }),
        /* @__PURE__ */ jsx(TabsTrigger, { value: "casos", children: "Casos" }),
        puedeGestionar && /* @__PURE__ */ jsx(TabsTrigger, { value: "resumen", children: "Resumen" })
      ] }),
      /* @__PURE__ */ jsx(TabsContent, { value: "nuevo", children: /* @__PURE__ */ jsx(NuevoCaso, { puedeElegirLocal: puedeGestionar, onCreado: () => setRecarga((r) => r + 1), irACasos: () => setTab("casos") }) }),
      /* @__PURE__ */ jsx(TabsContent, { value: "casos", children: /* @__PURE__ */ jsx(ListaCasos, { puedeGestionar, recarga }) }),
      puedeGestionar && /* @__PURE__ */ jsx(TabsContent, { value: "resumen", children: /* @__PURE__ */ jsx(Resumen, { esAdmin }) })
    ] })
  ] });
}
const FORM_VACIO = {
  sucursal_id: "",
  atendido_por: "",
  cliente_nombre: "",
  cliente_telefono: "",
  tipo: "cambio",
  producto_u_orden: "",
  fecha_compra: hoyISO(),
  forma_pago: "",
  con_ticket: true,
  estado_producto: "",
  es_original_marca: false,
  que_pasa: "",
  que_probamos: "",
  que_pide: "",
  queda_saldo_favor: false,
  amenaza_externa: false
};
function NuevoCaso({
  puedeElegirLocal,
  onCreado,
  irACasos
}) {
  const {
    user,
    sucursalId,
    nombre
  } = useAuth();
  const [form, setForm] = useState({
    ...FORM_VACIO
  });
  const [fotos, setFotos] = useState([]);
  const [sucursales, setSucursales] = useState([]);
  const [enviando, setEnviando] = useState(false);
  const [creado, setCreado] = useState(null);
  useEffect(() => {
    supabase.from("sucursales").select("id, nombre").eq("activo", true).order("nombre").then(({
      data
    }) => setSucursales(data || []));
  }, []);
  useEffect(() => {
    setForm((f) => ({
      ...f,
      sucursal_id: f.sucursal_id || sucursalId || "",
      atendido_por: f.atendido_por || nombre || ""
    }));
  }, [sucursalId, nombre]);
  const set = (k, v) => setForm((f) => ({
    ...f,
    [k]: v
  }));
  const faltantes = () => {
    const f = [];
    if (!form.sucursal_id) f.push("local");
    if (!form.atendido_por.trim()) f.push("quién atiende");
    if (!form.cliente_nombre.trim()) f.push("nombre del cliente");
    if (form.cliente_telefono.replace(/\D/g, "").length < 8) f.push("teléfono del cliente");
    if (!form.producto_u_orden.trim()) f.push(form.tipo === "reparacion" ? "N° de orden" : "producto");
    if (!form.fecha_compra) f.push("fecha");
    if (!form.forma_pago) f.push("forma de pago");
    if (!form.estado_producto) f.push("estado del producto");
    if (!form.que_pasa.trim()) f.push("qué pasa");
    if (!form.que_probamos.trim()) f.push("qué probamos");
    if (!form.que_pide) f.push("qué pide el cliente");
    if (fotos.length === 0) f.push("al menos una foto");
    return f;
  };
  const enviar = async () => {
    if (!user) return;
    const falta = faltantes();
    if (falta.length) return toast.error(`Falta completar: ${falta.join(", ")}`);
    setEnviando(true);
    try {
      const rutas = [];
      for (let i = 0; i < fotos.length; i++) {
        const blob = await comprimirImagen(fotos[i]);
        const ruta = `${form.sucursal_id}/${Date.now()}-${i}.jpg`;
        const {
          error: error2
        } = await supabase.storage.from("reclamos").upload(ruta, blob, {
          contentType: "image/jpeg"
        });
        if (error2) throw new Error(`No se pudo subir la foto ${i + 1}: ${error2.message}`);
        rutas.push(ruta);
      }
      const {
        data,
        error
      } = await db.from("reclamos").insert({
        ...form,
        user_id: user.id,
        fotos: rutas
      }).select("*").single();
      if (error) throw new Error(error.message);
      setCreado(data);
      onCreado();
    } catch (e) {
      toast.error(e.message || "No se pudo guardar el caso");
    } finally {
      setEnviando(false);
    }
  };
  const otroCaso = () => {
    setCreado(null);
    setFotos([]);
    setForm({
      ...FORM_VACIO,
      sucursal_id: form.sucursal_id,
      atendido_por: form.atendido_por
    });
  };
  if (creado) return /* @__PURE__ */ jsx(Resultado, { caso: creado, otroCaso, irACasos });
  const esReparacion = form.tipo === "reparacion";
  return /* @__PURE__ */ jsxs("div", { className: "space-y-4", children: [
    /* @__PURE__ */ jsx(Card, { className: "border-destructive/40", children: /* @__PURE__ */ jsxs(CardContent, { className: "p-3 flex gap-2 text-sm", children: [
      /* @__PURE__ */ jsx(AlertTriangle, { className: "w-5 h-5 text-destructive shrink-0" }),
      /* @__PURE__ */ jsxs("span", { children: [
        /* @__PURE__ */ jsx("b", { children: "Si hay riesgo físico" }),
        " (violencia, robo, amenaza en el local): no cargues nada. Ponete a salvo y llamá a Vanesa, a Natalia o al 911."
      ] })
    ] }) }),
    /* @__PURE__ */ jsxs(Card, { children: [
      /* @__PURE__ */ jsx(CardHeader, { children: /* @__PURE__ */ jsx(CardTitle, { children: "Ficha del caso" }) }),
      /* @__PURE__ */ jsxs(CardContent, { className: "grid grid-cols-1 sm:grid-cols-2 gap-4", children: [
        puedeElegirLocal && !sucursalId && /* @__PURE__ */ jsx(F, { label: "Local *", children: /* @__PURE__ */ jsxs(Select, { value: form.sucursal_id, onValueChange: (v) => set("sucursal_id", v), children: [
          /* @__PURE__ */ jsx(SelectTrigger, { children: /* @__PURE__ */ jsx(SelectValue, { placeholder: "Elegí el local" }) }),
          /* @__PURE__ */ jsx(SelectContent, { children: sucursales.map((s) => /* @__PURE__ */ jsx(SelectItem, { value: String(s.id), children: s.nombre }, String(s.id))) })
        ] }) }),
        !puedeElegirLocal && !sucursalId && /* @__PURE__ */ jsx("p", { className: "sm:col-span-2 text-sm text-destructive", children: "Tu usuario no tiene un local asignado. Pedile a Vanesa que te lo asigne para poder cargar casos." }),
        /* @__PURE__ */ jsx(F, { label: "Quién atiende *", children: /* @__PURE__ */ jsx(Input, { value: form.atendido_por, onChange: (e) => set("atendido_por", e.target.value) }) }),
        /* @__PURE__ */ jsx(F, { label: "Tipo de caso *", full: true, children: /* @__PURE__ */ jsxs(Select, { value: form.tipo, onValueChange: (v) => set("tipo", v), children: [
          /* @__PURE__ */ jsx(SelectTrigger, { children: /* @__PURE__ */ jsx(SelectValue, {}) }),
          /* @__PURE__ */ jsx(SelectContent, { children: TIPOS.map((o) => /* @__PURE__ */ jsx(SelectItem, { value: o.v, children: o.l }, o.v)) })
        ] }) }),
        /* @__PURE__ */ jsx(F, { label: "Nombre del cliente *", children: /* @__PURE__ */ jsx(Input, { value: form.cliente_nombre, onChange: (e) => set("cliente_nombre", e.target.value) }) }),
        /* @__PURE__ */ jsx(F, { label: "Teléfono del cliente *", children: /* @__PURE__ */ jsx(Input, { inputMode: "tel", placeholder: "299 4 123456", value: form.cliente_telefono, onChange: (e) => set("cliente_telefono", e.target.value) }) }),
        /* @__PURE__ */ jsx(F, { label: esReparacion ? "N° de orden y equipo *" : "Producto *", children: /* @__PURE__ */ jsx(Input, { placeholder: esReparacion ? "Ej: 343R Moto G51" : "Ej: Auricular Redmi Buds 5", value: form.producto_u_orden, onChange: (e) => set("producto_u_orden", e.target.value) }) }),
        /* @__PURE__ */ jsx(F, { label: esReparacion ? "Fecha en que retiró el equipo *" : "Fecha de compra *", children: /* @__PURE__ */ jsx(Input, { type: "date", max: hoyISO(), value: form.fecha_compra, onChange: (e) => set("fecha_compra", e.target.value) }) }),
        /* @__PURE__ */ jsx(F, { label: "Forma de pago *", children: /* @__PURE__ */ jsxs(Select, { value: form.forma_pago, onValueChange: (v) => set("forma_pago", v), children: [
          /* @__PURE__ */ jsx(SelectTrigger, { children: /* @__PURE__ */ jsx(SelectValue, { placeholder: "Elegí" }) }),
          /* @__PURE__ */ jsx(SelectContent, { children: FORMAS_PAGO.map((o) => /* @__PURE__ */ jsx(SelectItem, { value: o, children: o }, o)) })
        ] }) }),
        /* @__PURE__ */ jsx(F, { label: "Estado del producto *", children: /* @__PURE__ */ jsxs(Select, { value: form.estado_producto, onValueChange: (v) => set("estado_producto", v), children: [
          /* @__PURE__ */ jsx(SelectTrigger, { children: /* @__PURE__ */ jsx(SelectValue, { placeholder: "Elegí" }) }),
          /* @__PURE__ */ jsx(SelectContent, { children: ESTADOS_PRODUCTO.map((o) => /* @__PURE__ */ jsx(SelectItem, { value: o.v, children: o.l }, o.v)) })
        ] }) }),
        /* @__PURE__ */ jsx(Si, { label: "Trae ticket o la venta aparece en el sistema", v: form.con_ticket, on: (v) => set("con_ticket", v) }),
        /* @__PURE__ */ jsx(Si, { label: "Es un original Apple o Samsung", v: form.es_original_marca, on: (v) => set("es_original_marca", v) }),
        /* @__PURE__ */ jsx(F, { label: "Qué pasa (en una frase) *", full: true, children: /* @__PURE__ */ jsx(Textarea, { rows: 2, placeholder: "Ej: el auricular derecho no enciende", value: form.que_pasa, onChange: (e) => set("que_pasa", e.target.value) }) }),
        /* @__PURE__ */ jsx(F, { label: "Qué probamos en el local *", full: true, children: /* @__PURE__ */ jsx(Textarea, { rows: 2, placeholder: "Ej: lo cargamos 30 min y probamos con otro celular: sigue sin andar", value: form.que_probamos, onChange: (e) => set("que_probamos", e.target.value) }) }),
        /* @__PURE__ */ jsx(F, { label: "Qué pide el cliente *", children: /* @__PURE__ */ jsxs(Select, { value: form.que_pide, onValueChange: (v) => set("que_pide", v), children: [
          /* @__PURE__ */ jsx(SelectTrigger, { children: /* @__PURE__ */ jsx(SelectValue, { placeholder: "Elegí" }) }),
          /* @__PURE__ */ jsx(SelectContent, { children: QUE_PIDE.map((o) => /* @__PURE__ */ jsx(SelectItem, { value: o.v, children: o.l }, o.v)) })
        ] }) }),
        /* @__PURE__ */ jsx(Si, { label: "Se lleva algo más barato (le queda saldo a favor)", v: form.queda_saldo_favor, on: (v) => set("queda_saldo_favor", v) }),
        /* @__PURE__ */ jsx(Si, { label: "Nombró Defensa del Consumidor, un abogado o las redes", v: form.amenaza_externa, on: (v) => set("amenaza_externa", v), full: true }),
        /* @__PURE__ */ jsxs("div", { className: "sm:col-span-2 space-y-2", children: [
          /* @__PURE__ */ jsx(Label, { children: "Fotos del producto, la caja y el ticket *" }),
          /* @__PURE__ */ jsxs("label", { className: "flex items-center justify-center gap-2 border-2 border-dashed rounded-lg p-4 cursor-pointer hover:bg-muted text-sm", children: [
            /* @__PURE__ */ jsx(Camera, { className: "w-5 h-5" }),
            " Sacar o elegir fotos",
            /* @__PURE__ */ jsx("input", { type: "file", accept: "image/*", multiple: true, className: "hidden", onChange: (e) => {
              setFotos((f) => [...f, ...Array.from(e.target.files || [])]);
              e.target.value = "";
            } })
          ] }),
          fotos.length > 0 && /* @__PURE__ */ jsx("div", { className: "flex flex-wrap gap-2", children: fotos.map((f, i) => /* @__PURE__ */ jsxs("div", { className: "relative", children: [
            /* @__PURE__ */ jsx("img", { src: URL.createObjectURL(f), alt: "", className: "w-20 h-20 object-cover rounded-md border" }),
            /* @__PURE__ */ jsx("button", { type: "button", onClick: () => setFotos(fotos.filter((_, j) => j !== i)), className: "absolute -top-2 -right-2 bg-destructive text-destructive-foreground rounded-full p-0.5", children: /* @__PURE__ */ jsx(X, { className: "w-3 h-3" }) })
          ] }, i)) })
        ] }),
        /* @__PURE__ */ jsx("div", { className: "sm:col-span-2", children: /* @__PURE__ */ jsx(Button, { onClick: enviar, disabled: enviando, className: "w-full h-11", size: "lg", children: enviando ? "Guardando..." : "Guardar caso" }) })
      ] })
    ] })
  ] });
}
function Resultado({
  caso,
  otroCaso,
  irACasos
}) {
  const ui = COLOR_UI[caso.color] ?? COLOR_UI.amarillo;
  const mandarFrase = () => abrirWhatsApp(telWhatsApp(caso.cliente_telefono), `Hola ${caso.cliente_nombre}, te escribimos de MyPhone. ${FRASE_FIJA}`);
  return /* @__PURE__ */ jsx(Card, { className: `border-2 ${ui.box}`, children: /* @__PURE__ */ jsxs(CardContent, { className: "p-6 space-y-4", children: [
    /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
      /* @__PURE__ */ jsx(Badge, { className: ui.badge, children: ui.label }),
      /* @__PURE__ */ jsxs("span", { className: "font-semibold", children: [
        "Caso ",
        caso.numero
      ] })
    ] }),
    caso.color === "verde" && /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
      /* @__PURE__ */ jsxs("p", { className: "text-lg font-semibold flex items-center gap-2", children: [
        /* @__PURE__ */ jsx(CheckCircle2, { className: "w-5 h-5 text-success" }),
        "Podés hacer el cambio."
      ] }),
      /* @__PURE__ */ jsxs("p", { className: "text-sm", children: [
        caso.motivo_color,
        ". Pasá el cambio por el sistema. El caso queda registrado, no hace falta avisar en el grupo."
      ] })
    ] }),
    caso.color === "amarillo" && /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
      /* @__PURE__ */ jsx("p", { className: "text-lg font-semibold", children: "Lo decide el encargado de turno." }),
      /* @__PURE__ */ jsxs("p", { className: "text-sm", children: [
        "Motivo: ",
        caso.motivo_color,
        ". No prometas nada. Decile al cliente:"
      ] }),
      /* @__PURE__ */ jsxs("p", { className: "text-base font-medium bg-background rounded-md p-3", children: [
        '"',
        FRASE_FIJA,
        '"'
      ] }),
      /* @__PURE__ */ jsx("p", { className: "text-sm text-muted-foreground", children: "La respuesta te aparece en la pestaña Casos." })
    ] }),
    caso.color === "rojo" && /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
      /* @__PURE__ */ jsx("p", { className: "text-lg font-semibold", children: "Lo decide Vanesa." }),
      /* @__PURE__ */ jsxs("p", { className: "text-sm", children: [
        "Motivo: ",
        caso.motivo_color,
        ". No expliques, no discutas y no mandes otros mensajes. Decile solamente:"
      ] }),
      /* @__PURE__ */ jsxs("p", { className: "text-base font-medium bg-background rounded-md p-3", children: [
        '"',
        FRASE_FIJA,
        '"'
      ] })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "flex flex-wrap gap-2", children: [
      caso.color !== "verde" && /* @__PURE__ */ jsxs(Button, { variant: "secondary", onClick: mandarFrase, children: [
        /* @__PURE__ */ jsx(MessageCircle, { className: "w-4 h-4 mr-1" }),
        "Mandar la frase por WhatsApp"
      ] }),
      /* @__PURE__ */ jsx(Button, { variant: "outline", onClick: irACasos, children: "Ver casos" }),
      /* @__PURE__ */ jsx(Button, { onClick: otroCaso, children: "Cargar otro caso" })
    ] })
  ] }) });
}
function ListaCasos({
  puedeGestionar,
  recarga
}) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [verResueltos, setVerResueltos] = useState(false);
  const [filtroColor, setFiltroColor] = useState("todos");
  const [q, setQ] = useState("");
  const [abierto, setAbierto] = useState(null);
  const load = async () => {
    setLoading(true);
    let query = db.from("reclamos").select("*, sucursales(nombre)").order("created_at", {
      ascending: false
    }).limit(300);
    if (!verResueltos) query = query.neq("estado", "resuelto");
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
  }, [verResueltos, recarga]);
  const visibles = useMemo(() => {
    const t = q.trim().toLowerCase();
    const peso = (r) => r.color === "rojo" ? 0 : estaAtrasado(r) ? 1 : r.color === "amarillo" ? 2 : 3;
    return items.filter((r) => filtroColor === "todos" || r.color === filtroColor).filter((r) => !t || [r.numero, r.cliente_nombre, r.cliente_telefono, r.producto_u_orden].some((x) => (x || "").toLowerCase().includes(t))).sort((a, b) => peso(a) - peso(b) || (a.created_at < b.created_at ? 1 : -1));
  }, [items, filtroColor, q]);
  const cuenta = (c) => items.filter((r) => r.color === c && r.estado !== "resuelto").length;
  return /* @__PURE__ */ jsxs("div", { className: "space-y-3", children: [
    /* @__PURE__ */ jsxs("div", { className: "flex flex-wrap gap-2 items-center", children: [
      ["todos", "rojo", "amarillo", "verde"].map((c) => /* @__PURE__ */ jsx(Button, { size: "sm", variant: filtroColor === c ? "default" : "outline", onClick: () => setFiltroColor(c), children: c === "todos" ? "Todos" : `${COLOR_UI[c].label} (${cuenta(c)})` }, c)),
      /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 ml-auto text-sm", children: [
        /* @__PURE__ */ jsx(Switch, { checked: verResueltos, onCheckedChange: setVerResueltos, id: "res" }),
        /* @__PURE__ */ jsx(Label, { htmlFor: "res", children: "Ver resueltos" }),
        /* @__PURE__ */ jsx(Button, { size: "sm", variant: "ghost", onClick: load, children: /* @__PURE__ */ jsx(RefreshCw, { className: "w-4 h-4" }) })
      ] })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "relative", children: [
      /* @__PURE__ */ jsx(Search, { className: "w-4 h-4 absolute left-3 top-3 text-muted-foreground" }),
      /* @__PURE__ */ jsx(Input, { className: "pl-9", placeholder: "Buscar por N° de caso, cliente, teléfono o producto", value: q, onChange: (e) => setQ(e.target.value) })
    ] }),
    loading ? /* @__PURE__ */ jsx("p", { className: "text-muted-foreground", children: "Cargando..." }) : visibles.length === 0 ? /* @__PURE__ */ jsxs("p", { className: "text-muted-foreground text-center py-8", children: [
      "No hay casos ",
      verResueltos ? "" : "abiertos",
      "."
    ] }) : /* @__PURE__ */ jsx("div", { className: "space-y-2", children: visibles.map((r) => {
      const ui = COLOR_UI[r.color] ?? COLOR_UI.amarillo;
      const atrasado = estaAtrasado(r);
      return /* @__PURE__ */ jsx(Card, { className: `cursor-pointer hover:shadow-md border-l-4 ${ui.box}`, onClick: () => setAbierto(r), children: /* @__PURE__ */ jsxs(CardContent, { className: "p-3 space-y-1", children: [
        /* @__PURE__ */ jsxs("div", { className: "flex flex-wrap items-center gap-2", children: [
          /* @__PURE__ */ jsx(Badge, { className: ui.badge, children: ui.label }),
          /* @__PURE__ */ jsx("span", { className: "font-semibold", children: r.numero }),
          /* @__PURE__ */ jsx("span", { className: "text-sm text-muted-foreground", children: r.sucursales?.nombre }),
          /* @__PURE__ */ jsx(Badge, { variant: "outline", children: ESTADOS[r.estado] }),
          atrasado && /* @__PURE__ */ jsxs(Badge, { className: "bg-destructive text-destructive-foreground", children: [
            /* @__PURE__ */ jsx(Clock, { className: "w-3 h-3 mr-1" }),
            "Atrasado"
          ] })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "text-sm", children: [
          /* @__PURE__ */ jsx("b", { children: r.cliente_nombre }),
          " · ",
          r.producto_u_orden
        ] }),
        /* @__PURE__ */ jsx("div", { className: "text-sm text-muted-foreground", children: r.que_pasa }),
        /* @__PURE__ */ jsxs("div", { className: "text-xs text-muted-foreground", children: [
          fecha(r.created_at),
          " · ",
          r.motivo_color,
          r.responsable ? ` · lo tiene ${r.responsable}` : ""
        ] })
      ] }) }, r.id);
    }) }),
    abierto && /* @__PURE__ */ jsx(DetalleCaso, { caso: abierto, puedeGestionar, onClose: () => setAbierto(null), onGuardado: () => {
      setAbierto(null);
      load();
    } })
  ] });
}
function estaAtrasado(r) {
  return r.estado !== "resuelto" && r.vence_at && new Date(r.vence_at) < /* @__PURE__ */ new Date();
}
function DetalleCaso({
  caso,
  puedeGestionar,
  onClose,
  onGuardado
}) {
  const {
    nombre
  } = useAuth();
  const [eventos, setEventos] = useState([]);
  const [urls, setUrls] = useState([]);
  const [comentario, setComentario] = useState("");
  const [g, setG] = useState({
    estado: caso.estado,
    color: caso.color,
    resolucion: caso.resolucion || "",
    nota_credito_nro: caso.nota_credito_nro || ""
  });
  const [guardando, setGuardando] = useState(false);
  const cargarEventos = async () => {
    const {
      data
    } = await db.from("reclamos_eventos").select("*").eq("reclamo_id", caso.id).order("created_at");
    setEventos(data || []);
  };
  useEffect(() => {
    cargarEventos();
    if (caso.fotos?.length) {
      supabase.storage.from("reclamos").createSignedUrls(caso.fotos, 3600).then(({
        data
      }) => setUrls((data || []).map((d) => d.signedUrl).filter(Boolean)));
    }
  }, [caso.id]);
  const comentar = async () => {
    if (!comentario.trim()) return;
    const {
      error
    } = await db.from("reclamos_eventos").insert({
      reclamo_id: caso.id,
      tipo: "comentario",
      texto: comentario.trim()
    });
    if (error) return toast.error(error.message);
    setComentario("");
    cargarEventos();
  };
  const guardar = async (extra = {}) => {
    if (g.estado === "resuelto" && !g.resolucion.trim()) return toast.error("Escribí qué se resolvió antes de cerrar el caso");
    setGuardando(true);
    const {
      error
    } = await db.from("reclamos").update({
      ...g,
      responsable: caso.responsable || nombre,
      ...extra
    }).eq("id", caso.id);
    setGuardando(false);
    if (error) return toast.error(error.message);
    toast.success(`Caso ${caso.numero} actualizado`);
    onGuardado();
  };
  const autorizarNC = () => guardar({
    nota_credito_autorizada_por: nombre || "encargado"
  });
  const mandarFrase = () => abrirWhatsApp(telWhatsApp(caso.cliente_telefono), `Hola ${caso.cliente_nombre}, te escribimos de MyPhone. ${FRASE_FIJA}`);
  const ui = COLOR_UI[caso.color] ?? COLOR_UI.amarillo;
  return /* @__PURE__ */ jsx(Dialog, { open: true, onOpenChange: (o) => !o && onClose(), children: /* @__PURE__ */ jsxs(DialogContent, { className: "max-w-2xl max-h-[90vh] overflow-y-auto", children: [
    /* @__PURE__ */ jsx(DialogHeader, { children: /* @__PURE__ */ jsxs(DialogTitle, { className: "flex flex-wrap items-center gap-2", children: [
      /* @__PURE__ */ jsx(Badge, { className: ui.badge, children: ui.label }),
      " ",
      caso.numero,
      /* @__PURE__ */ jsxs("span", { className: "text-sm font-normal text-muted-foreground", children: [
        caso.sucursales?.nombre,
        " · ",
        ESTADOS[caso.estado]
      ] })
    ] }) }),
    /* @__PURE__ */ jsxs("div", { className: "space-y-4 text-sm", children: [
      /* @__PURE__ */ jsx("p", { className: "text-muted-foreground", children: caso.motivo_color }),
      /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1", children: [
        /* @__PURE__ */ jsx(Dato, { l: "Cliente", v: `${caso.cliente_nombre} · ${caso.cliente_telefono}` }),
        /* @__PURE__ */ jsx(Dato, { l: "Atendió", v: caso.atendido_por }),
        /* @__PURE__ */ jsx(Dato, { l: "Tipo", v: labelDe(TIPOS, caso.tipo) }),
        /* @__PURE__ */ jsx(Dato, { l: caso.tipo === "reparacion" ? "Orden" : "Producto", v: caso.producto_u_orden }),
        /* @__PURE__ */ jsx(Dato, { l: caso.tipo === "reparacion" ? "Retiró el equipo" : "Compró", v: fechaCorta(caso.fecha_compra) }),
        /* @__PURE__ */ jsx(Dato, { l: "Pagó con", v: caso.forma_pago }),
        /* @__PURE__ */ jsx(Dato, { l: "Estado del producto", v: labelDe(ESTADOS_PRODUCTO, caso.estado_producto) }),
        /* @__PURE__ */ jsx(Dato, { l: "Ticket", v: caso.con_ticket ? "Sí" : "No" }),
        /* @__PURE__ */ jsx(Dato, { l: "Original Apple/Samsung", v: caso.es_original_marca ? "Sí" : "No" }),
        /* @__PURE__ */ jsx(Dato, { l: "Pide", v: labelDe(QUE_PIDE, caso.que_pide) }),
        caso.queda_saldo_favor && /* @__PURE__ */ jsx(Dato, { l: "Saldo", v: "Le queda saldo a favor" }),
        caso.amenaza_externa && /* @__PURE__ */ jsx(Dato, { l: "Atención", v: "Nombró Defensa del Consumidor, abogado o redes" }),
        /* @__PURE__ */ jsx(Dato, { l: "Creado", v: fecha(caso.created_at) }),
        /* @__PURE__ */ jsx(Dato, { l: "Vence", v: fecha(caso.vence_at) })
      ] }),
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("b", { children: "Qué pasa:" }),
        " ",
        caso.que_pasa
      ] }),
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("b", { children: "Qué probamos:" }),
        " ",
        caso.que_probamos
      ] }),
      caso.resolucion && /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("b", { children: "Resolución:" }),
        " ",
        caso.resolucion
      ] }),
      caso.nota_credito_autorizada_por && /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("b", { children: "Nota de crédito:" }),
        " autorizada por ",
        caso.nota_credito_autorizada_por,
        caso.nota_credito_nro ? ` · N° ${caso.nota_credito_nro}` : ""
      ] }),
      urls.length > 0 && /* @__PURE__ */ jsx("div", { className: "flex flex-wrap gap-2", children: urls.map((u) => /* @__PURE__ */ jsx("a", { href: u, target: "_blank", rel: "noreferrer", children: /* @__PURE__ */ jsx("img", { src: u, alt: "", className: "w-24 h-24 object-cover rounded-md border" }) }, u)) }),
      /* @__PURE__ */ jsxs(Button, { size: "sm", variant: "secondary", onClick: mandarFrase, children: [
        /* @__PURE__ */ jsx(MessageCircle, { className: "w-4 h-4 mr-1" }),
        "Mandar la frase fija al cliente"
      ] }),
      puedeGestionar && /* @__PURE__ */ jsx(Card, { className: "bg-muted/40", children: /* @__PURE__ */ jsxs(CardContent, { className: "p-3 grid grid-cols-1 sm:grid-cols-2 gap-3", children: [
        /* @__PURE__ */ jsx(F, { label: "Estado", children: /* @__PURE__ */ jsxs(Select, { value: g.estado, onValueChange: (v) => setG({
          ...g,
          estado: v
        }), children: [
          /* @__PURE__ */ jsx(SelectTrigger, { children: /* @__PURE__ */ jsx(SelectValue, {}) }),
          /* @__PURE__ */ jsx(SelectContent, { children: Object.entries(ESTADOS).map(([v, l]) => /* @__PURE__ */ jsx(SelectItem, { value: v, children: l }, v)) })
        ] }) }),
        /* @__PURE__ */ jsx(F, { label: "Color", children: /* @__PURE__ */ jsxs(Select, { value: g.color, onValueChange: (v) => setG({
          ...g,
          color: v
        }), children: [
          /* @__PURE__ */ jsx(SelectTrigger, { children: /* @__PURE__ */ jsx(SelectValue, {}) }),
          /* @__PURE__ */ jsx(SelectContent, { children: Object.entries(COLOR_UI).map(([v, c]) => /* @__PURE__ */ jsx(SelectItem, { value: v, children: c.label }, v)) })
        ] }) }),
        /* @__PURE__ */ jsx(F, { label: "Qué se decidió / qué se le dijo al cliente", full: true, children: /* @__PURE__ */ jsx(Textarea, { rows: 2, value: g.resolucion, onChange: (e) => setG({
          ...g,
          resolucion: e.target.value
        }) }) }),
        (caso.que_pide === "nota_credito" || caso.queda_saldo_favor || caso.nota_credito_autorizada_por) && /* @__PURE__ */ jsx(F, { label: "N° de nota de crédito (cuando se emita)", children: /* @__PURE__ */ jsx(Input, { value: g.nota_credito_nro, onChange: (e) => setG({
          ...g,
          nota_credito_nro: e.target.value
        }) }) }),
        /* @__PURE__ */ jsxs("div", { className: "sm:col-span-2 flex flex-wrap gap-2", children: [
          /* @__PURE__ */ jsx(Button, { onClick: () => guardar(), disabled: guardando, children: "Guardar" }),
          (caso.que_pide === "nota_credito" || caso.queda_saldo_favor) && !caso.nota_credito_autorizada_por && /* @__PURE__ */ jsx(Button, { variant: "outline", onClick: autorizarNC, disabled: guardando, children: "Autorizar nota de crédito" })
        ] })
      ] }) }),
      /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
        /* @__PURE__ */ jsx("h3", { className: "font-semibold", children: "Historial" }),
        eventos.map((e) => /* @__PURE__ */ jsxs("div", { className: "border-l-2 pl-3", children: [
          /* @__PURE__ */ jsxs("div", { className: "text-xs text-muted-foreground", children: [
            fecha(e.created_at),
            " · ",
            e.autor
          ] }),
          /* @__PURE__ */ jsx("div", { children: e.texto })
        ] }, e.id)),
        /* @__PURE__ */ jsxs("div", { className: "flex gap-2", children: [
          /* @__PURE__ */ jsx(Input, { placeholder: "Agregar un comentario", value: comentario, onChange: (e) => setComentario(e.target.value), onKeyDown: (e) => e.key === "Enter" && comentar() }),
          /* @__PURE__ */ jsx(Button, { size: "icon", onClick: comentar, children: /* @__PURE__ */ jsx(Send, { className: "w-4 h-4" }) })
        ] })
      ] })
    ] })
  ] }) });
}
function Resumen({
  esAdmin
}) {
  const [casos, setCasos] = useState([]);
  const [config, setConfig] = useState([]);
  const [loading, setLoading] = useState(true);
  const load = async () => {
    setLoading(true);
    const [{
      data: c
    }, {
      data: cfg
    }] = await Promise.all([db.from("reclamos_abiertos").select("*"), db.from("reclamos_config").select("*").order("clave")]);
    setCasos(c || []);
    setConfig(cfg || []);
    setLoading(false);
  };
  useEffect(() => {
    load();
  }, []);
  const paraVanesa = casos.filter((r) => r.color === "rojo" || r.atrasado).sort((a, b) => (a.sucursal_nombre || "").localeCompare(b.sucursal_nombre || "") || b.horas_abierto - a.horas_abierto);
  const telefono = config.find((c) => c.clave === "telefono_resumen")?.valor || "";
  const texto = () => {
    const hoy = (/* @__PURE__ */ new Date()).toLocaleDateString("es-AR");
    if (paraVanesa.length === 0) return `Resumen de reclamos ${hoy}

No hay casos rojos ni atrasados.`;
    const porLocal = {};
    paraVanesa.forEach((r) => (porLocal[r.sucursal_nombre || "Sin local"] ||= []).push(r));
    const bloques = Object.entries(porLocal).map(([local, rs]) => `*${local}*
` + rs.map((r) => `- ${r.numero} ${r.color === "rojo" ? "ROJO" : "atrasado"} · ${r.producto_u_orden} · ${r.que_pasa} · ${ESTADOS[r.estado]} · ${r.horas_abierto} hs`).join("\n"));
    return `Resumen de reclamos ${hoy}
${paraVanesa.length} casos para ver (rojos y atrasados)

${bloques.join("\n\n")}`;
  };
  const enviar = () => {
    if (!telefono) return toast.error("Falta cargar el WhatsApp del resumen en Ajustes");
    abrirWhatsApp(telefono, texto());
  };
  const copiar = async () => {
    await navigator.clipboard.writeText(texto());
    toast.success("Resumen copiado");
  };
  const guardarConfig = async (clave, valor) => {
    const {
      error
    } = await db.from("reclamos_config").update({
      valor
    }).eq("clave", clave);
    if (error) return toast.error(error.message);
    toast.success("Ajuste guardado");
    load();
  };
  if (loading) return /* @__PURE__ */ jsx("p", { className: "text-muted-foreground", children: "Cargando..." });
  return /* @__PURE__ */ jsxs("div", { className: "space-y-4", children: [
    /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-3 gap-2 text-center", children: [
      /* @__PURE__ */ jsx(Stat, { n: casos.filter((r) => r.color === "rojo").length, l: "Rojos", cls: "text-destructive" }),
      /* @__PURE__ */ jsx(Stat, { n: casos.filter((r) => r.color === "amarillo").length, l: "Amarillos", cls: "text-warning-foreground" }),
      /* @__PURE__ */ jsx(Stat, { n: casos.filter((r) => r.atrasado).length, l: "Atrasados", cls: "text-destructive" })
    ] }),
    /* @__PURE__ */ jsxs(Card, { children: [
      /* @__PURE__ */ jsx(CardHeader, { children: /* @__PURE__ */ jsx(CardTitle, { children: "Resumen de las 19 hs" }) }),
      /* @__PURE__ */ jsxs(CardContent, { className: "space-y-3", children: [
        /* @__PURE__ */ jsx("pre", { className: "whitespace-pre-wrap text-sm bg-muted rounded-md p-3 font-sans", children: texto() }),
        /* @__PURE__ */ jsxs("div", { className: "flex flex-wrap gap-2", children: [
          /* @__PURE__ */ jsxs(Button, { onClick: enviar, children: [
            /* @__PURE__ */ jsx(MessageCircle, { className: "w-4 h-4 mr-1" }),
            "Mandar por WhatsApp"
          ] }),
          /* @__PURE__ */ jsx(Button, { variant: "outline", onClick: copiar, children: "Copiar" }),
          /* @__PURE__ */ jsx(Button, { variant: "ghost", onClick: load, children: /* @__PURE__ */ jsx(RefreshCw, { className: "w-4 h-4" }) })
        ] })
      ] })
    ] }),
    esAdmin && /* @__PURE__ */ jsxs(Card, { children: [
      /* @__PURE__ */ jsx(CardHeader, { children: /* @__PURE__ */ jsx(CardTitle, { children: "Ajustes del semáforo" }) }),
      /* @__PURE__ */ jsx(CardContent, { className: "space-y-3", children: config.map((c) => /* @__PURE__ */ jsx(AjusteFila, { c, onGuardar: guardarConfig }, c.clave)) })
    ] })
  ] });
}
function AjusteFila({
  c,
  onGuardar
}) {
  const [v, setV] = useState(c.valor);
  return /* @__PURE__ */ jsxs("div", { className: "flex flex-col sm:flex-row sm:items-end gap-2", children: [
    /* @__PURE__ */ jsxs("div", { className: "flex-1 space-y-1", children: [
      /* @__PURE__ */ jsx(Label, { children: c.descripcion }),
      /* @__PURE__ */ jsx(Input, { value: v, onChange: (e) => setV(e.target.value) })
    ] }),
    /* @__PURE__ */ jsx(Button, { variant: "outline", disabled: v === c.valor, onClick: () => onGuardar(c.clave, v), children: "Guardar" })
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
function Si({
  label,
  v,
  on,
  full
}) {
  return /* @__PURE__ */ jsxs("label", { className: `flex items-center justify-between gap-3 rounded-md border p-3 cursor-pointer ${full ? "sm:col-span-2" : ""}`, children: [
    /* @__PURE__ */ jsx("span", { className: "text-sm", children: label }),
    /* @__PURE__ */ jsx(Switch, { checked: v, onCheckedChange: on })
  ] });
}
function Dato({
  l,
  v
}) {
  return /* @__PURE__ */ jsxs("div", { children: [
    /* @__PURE__ */ jsxs("span", { className: "text-muted-foreground", children: [
      l,
      ":"
    ] }),
    " ",
    v
  ] });
}
function Stat({
  n,
  l,
  cls
}) {
  return /* @__PURE__ */ jsx(Card, { children: /* @__PURE__ */ jsxs(CardContent, { className: "p-3", children: [
    /* @__PURE__ */ jsx("div", { className: `text-2xl font-bold ${cls}`, children: n }),
    /* @__PURE__ */ jsx("div", { className: "text-xs text-muted-foreground", children: l })
  ] }) });
}
export {
  ReclamosPage as component
};
