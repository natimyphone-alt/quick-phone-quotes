import { jsx, jsxs, Fragment } from "react/jsx-runtime";
import * as React from "react";
import { useState, useEffect, createContext, useMemo, useContext } from "react";
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
import { X, LogOut, AlertTriangle, Camera, RefreshCw, Search, Clock, MessageCircle, CheckCircle2, Send } from "lucide-react";
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
  timeStyle: "short",
  hour12: false
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
const CLAVE_SESION = "reclamos_sesion";
const HORAS_SESION = 12;
function leerSesion() {
  try {
    const s = JSON.parse(localStorage.getItem(CLAVE_SESION) || "null");
    return s && s.hasta > Date.now() ? s : null;
  } catch {
    return null;
  }
}
function guardarSesion(s) {
  try {
    if (s) localStorage.setItem(CLAVE_SESION, JSON.stringify(s));
    else localStorage.removeItem(CLAVE_SESION);
  } catch {
  }
}
const SesionCtx = createContext({
  modo: "local",
  nombre: "",
  hasta: 0
});
const useSesion = () => useContext(SesionCtx);
function ReclamosPage() {
  const {
    isAdmin,
    nombre
  } = useAuth();
  const [rol, setRol] = useState(null);
  const [tab, setTab] = useState("nuevo");
  const [recarga, setRecarga] = useState(0);
  const [sesion, setSesion] = useState(null);
  useEffect(() => {
    db.rpc("reclamos_rol").then(({
      data
    }) => setRol(data || ""));
    setSesion(leerSesion());
  }, []);
  const loginAdmin = isAdmin || rol === "administrador";
  const loginGestor = loginAdmin || rol === "encargado";
  const entrar = (s) => {
    guardarSesion(s);
    setSesion(s);
    setTab("nuevo");
  };
  const salir = () => {
    guardarSesion(null);
    setSesion(null);
  };
  if (rol === null) return /* @__PURE__ */ jsx("p", { className: "text-muted-foreground", children: "Cargando..." });
  const activa = loginGestor ? {
    modo: "encargado",
    nombre: nombre || (loginAdmin ? "Administración" : "Encargado"),
    hasta: Infinity
  } : sesion;
  if (!activa) return /* @__PURE__ */ jsx(Entrada, { onEntrar: entrar });
  const puedeGestionar = activa.modo === "encargado";
  const esAdmin = loginAdmin;
  return /* @__PURE__ */ jsx(SesionCtx.Provider, { value: activa, children: /* @__PURE__ */ jsxs("div", { className: "space-y-4", children: [
    /* @__PURE__ */ jsxs("div", { className: "flex flex-wrap items-start justify-between gap-2", children: [
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("h1", { className: "text-2xl font-bold", children: "Reclamos" }),
        /* @__PURE__ */ jsxs("p", { className: "text-sm text-muted-foreground", children: [
          puedeGestionar ? "Todos los locales" : `Local ${activa.sucursal_nombre}`,
          " · ",
          activa.nombre
        ] })
      ] }),
      !loginGestor && /* @__PURE__ */ jsxs(Button, { variant: "outline", size: "sm", onClick: salir, children: [
        /* @__PURE__ */ jsx(LogOut, { className: "w-4 h-4 mr-1" }),
        "Cambiar local / salir"
      ] })
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
  ] }) });
}
function Entrada({
  onEntrar
}) {
  const [sucursales, setSucursales] = useState([]);
  const [conPin, setConPin] = useState(null);
  const [clave, setClave] = useState("");
  const [nombre, setNombre] = useState("");
  const [pin, setPin] = useState("");
  const [validando, setValidando] = useState(false);
  useEffect(() => {
    supabase.from("sucursales").select("id, nombre").eq("activo", true).order("nombre").then(({
      data
    }) => setSucursales(data || []));
    db.rpc("reclamos_pines_configurados").then(({
      data,
      error
    }) => {
      if (error) toast.error("Falta correr la actualización v4 de Reclamos en Supabase");
      setConPin((data || []).map((x) => typeof x === "string" ? x : x.reclamos_pines_configurados));
    });
  }, []);
  const tienePin = !!conPin?.includes(clave);
  const entrar = async () => {
    if (!clave) return toast.error("Elegí tu local");
    if (nombre.trim().length < 2) return toast.error("Escribí tu nombre");
    if (!tienePin) return toast.error("Este local todavía no tiene PIN. Pedile a Vanesa que lo cargue.");
    setValidando(true);
    const {
      data,
      error
    } = await db.rpc("reclamos_validar_pin", {
      p_clave: clave,
      p_pin: pin
    });
    setValidando(false);
    if (error) return toast.error(error.message);
    if (!data) {
      setPin("");
      return toast.error("PIN incorrecto");
    }
    const suc = sucursales.find((s) => String(s.id) === clave);
    onEntrar({
      modo: "local",
      sucursal_id: clave,
      sucursal_nombre: suc?.nombre,
      nombre: nombre.trim(),
      hasta: Date.now() + HORAS_SESION * 3600 * 1e3
    });
  };
  return /* @__PURE__ */ jsxs("div", { className: "max-w-sm mx-auto space-y-4 pt-4", children: [
    /* @__PURE__ */ jsxs("div", { className: "text-center", children: [
      /* @__PURE__ */ jsx("h1", { className: "text-2xl font-bold", children: "Reclamos" }),
      /* @__PURE__ */ jsx("p", { className: "text-sm text-muted-foreground", children: "Elegí tu local, escribí tu nombre y el PIN." })
    ] }),
    /* @__PURE__ */ jsx(Card, { children: /* @__PURE__ */ jsxs(CardContent, { className: "p-4 space-y-4", children: [
      /* @__PURE__ */ jsx(F, { label: "Local", children: /* @__PURE__ */ jsxs(Select, { value: clave, onValueChange: (v) => {
        setClave(v);
        setPin("");
      }, children: [
        /* @__PURE__ */ jsx(SelectTrigger, { children: /* @__PURE__ */ jsx(SelectValue, { placeholder: "Elegí" }) }),
        /* @__PURE__ */ jsx(SelectContent, { children: sucursales.map((s) => /* @__PURE__ */ jsx(SelectItem, { value: String(s.id), children: s.nombre }, String(s.id))) })
      ] }) }),
      /* @__PURE__ */ jsx(F, { label: "Tu nombre", children: /* @__PURE__ */ jsx(Input, { value: nombre, onChange: (e) => setNombre(e.target.value), placeholder: "Ej: Juan" }) }),
      clave && tienePin && /* @__PURE__ */ jsx(F, { label: "PIN", children: /* @__PURE__ */ jsx(Input, { type: "password", inputMode: "numeric", autoComplete: "off", maxLength: 8, value: pin, onChange: (e) => setPin(e.target.value.replace(/\D/g, "")), onKeyDown: (e) => e.key === "Enter" && entrar() }) }),
      clave && !tienePin && conPin && /* @__PURE__ */ jsx("p", { className: "text-sm text-destructive", children: "Este local todavía no tiene PIN. Pedile a Vanesa que lo cargue." }),
      /* @__PURE__ */ jsx(Button, { className: "w-full h-11", onClick: entrar, disabled: validando, children: validando ? "Verificando..." : "Entrar" })
    ] }) })
  ] });
}
const CALIDADES = ["Original", "OLED / Incell de buena calidad", "Genérico", "Alternativo", "No lleva repuesto (software, limpieza, etc.)"];
const TIPO_CORTO = {
  cambio: "CAMBIO",
  reparacion: "REINGRESO",
  reclamo: "RECLAMO"
};
function textoGrupo(c, local, conFotos = false) {
  const color = COLOR_UI[c.color]?.label ?? "";
  const l = [];
  l.push(`*CASO ${c.numero} – ${color} – ${TIPO_CORTO[c.tipo] ?? c.tipo}*`);
  l.push(`Local: ${local || c.sucursales?.nombre || c.sucursal_nombre || "-"} · Atiende: ${c.atendido_por}`);
  l.push(`Cliente: ${c.cliente_nombre} · ${c.cliente_telefono}`);
  if (c.tipo === "reparacion") {
    l.push(`Orden y equipo: ${c.producto_u_orden}`);
    l.push(`Ingresó: ${fechaCorta(c.rep_fecha_ingreso)} · Entregado: ${fechaCorta(c.fecha_compra)}`);
    l.push(`Taller: ${c.rep_taller || "-"}`);
    l.push(`Qué se le hizo: ${c.rep_trabajo || "-"}`);
    l.push(`Repuesto: ${c.rep_calidad || "-"}`);
    l.push(`Remito de ingreso: ${c.rep_remito || "-"}`);
    l.push(`Presupuesto: ${c.rep_presupuesto || "-"}`);
    l.push(`Seña: ${c.rep_sena || "-"}`);
    l.push(`Saldo: ${c.rep_saldo || "-"}`);
    if (c.rep_garantia) l.push(`Garantía informada: ${c.rep_garantia}`);
    l.push(`Cómo vuelve: ${labelDe(ESTADOS_PRODUCTO, c.estado_producto)}`);
  } else {
    l.push(`Producto: ${c.producto_u_orden}`);
    l.push(`Compró: ${fechaCorta(c.fecha_compra)} · Pagó con: ${c.forma_pago} · Ticket: ${c.con_ticket ? "Sí" : "No"}`);
    l.push(`Estado: ${labelDe(ESTADOS_PRODUCTO, c.estado_producto)}${c.es_original_marca ? " · Original Apple/Samsung" : ""}`);
    if (c.queda_saldo_favor) l.push("Le queda saldo a favor");
  }
  l.push(`${c.tipo === "reparacion" ? "Qué falla ahora" : "Qué pasa"}: ${c.que_pasa}`);
  l.push(`Qué probamos: ${c.que_probamos}`);
  l.push(`Pide: ${labelDe(QUE_PIDE, c.que_pide)}`);
  if (c.amenaza_externa) l.push("ATENCIÓN: nombró Defensa del Consumidor, abogado o redes");
  l.push("");
  l.push(c.color === "verde" ? `VERDE – resuelto por el vendedor (${c.motivo_color})` : `Motivo: ${c.motivo_color}`);
  if (!conFotos) l.push("Fotos: en el Hub, caso " + c.numero);
  return l.join("\n");
}
function textoResumen(c, eventos) {
  const color = COLOR_UI[c.color]?.label ?? "";
  const ficha = textoGrupo(c).split("\n");
  const fin = ficha.findIndex((x) => x === "");
  const cuerpo = ficha.slice(1, fin === -1 ? void 0 : fin);
  const l = [];
  l.push(`*RESUMEN CASO ${c.numero} – ${color} – ${TIPO_CORTO[c.tipo] ?? c.tipo}*`);
  l.push(`Estado: ${ESTADOS[c.estado] ?? c.estado}${c.responsable ? ` · Lo tiene: ${c.responsable}` : ""}`);
  l.push("");
  l.push(...cuerpo);
  l.push("");
  l.push("*Qué pasó:*");
  eventos.forEach((e) => {
    const cuando = new Date(e.created_at).toLocaleString("es-AR", {
      day: "2-digit",
      month: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false
    });
    const texto = e.tipo === "comentario" ? `"${e.texto}"` : String(e.texto).replace(/\b(nuevo|en_revision|esperando_taller|esperando_cliente|con_vanesa|resuelto|verde|amarillo|rojo)\b/g, (m) => ESTADOS[m] ?? COLOR_UI[m]?.label ?? m);
    l.push(`- ${cuando} · ${e.autor}: ${texto}`);
  });
  l.push("");
  if (c.resolucion) l.push(`*Decisión:* ${c.resolucion}`);
  if (c.nota_credito_autorizada_por) l.push(`*Nota de crédito:* autorizada por ${c.nota_credito_autorizada_por}${c.nota_credito_nro ? ` · N° ${c.nota_credito_nro}` : ""}`);
  if (c.estado === "resuelto") l.push(`*Caso cerrado*${c.resuelto_at ? ` el ${fecha(c.resuelto_at)}` : ""}`);
  else if (c.vence_at) l.push(`Plazo para resolver: ${fecha(c.vence_at)}`);
  return l.join("\n").replace(/\n{3,}/g, "\n\n");
}
async function compartirEnGrupo(texto, files = []) {
  const nav = navigator;
  if (files.length && nav.canShare?.({
    files,
    text: texto
  })) {
    try {
      await nav.share({
        files,
        text: texto
      });
      return true;
    } catch (e) {
      if (e?.name === "AbortError") return false;
    }
  }
  window.open(`https://wa.me/?text=${encodeURIComponent(texto)}`, "_blank", "noopener,noreferrer");
  return true;
}
async function marcarAvisado(id, autor) {
  const {
    error
  } = await db.rpc("reclamos_marcar_avisado", {
    p_id: id,
    p_autor: autor
  });
  if (error) toast.error(`No se pudo registrar el aviso: ${error.message}`);
  return !error;
}
function BotonesGrupo({
  caso,
  local,
  files,
  onAvisado
}) {
  const sesion = useSesion();
  const [trabajando, setTrabajando] = useState(false);
  const mandar = async () => {
    setTrabajando(true);
    const fs = await files().catch(() => []);
    const ok = await compartirEnGrupo(textoGrupo(caso, local, fs.length > 0), fs);
    if (ok && await marcarAvisado(caso.id, sesion.nombre)) onAvisado();
    setTrabajando(false);
  };
  const copiar = async () => {
    await navigator.clipboard.writeText(textoGrupo(caso, local));
    toast.success("Mensaje copiado: pegalo en el grupo de pendientes con las fotos");
    if (await marcarAvisado(caso.id, sesion.nombre)) onAvisado();
  };
  return /* @__PURE__ */ jsxs("div", { className: "flex flex-wrap gap-2", children: [
    /* @__PURE__ */ jsxs(Button, { onClick: mandar, disabled: trabajando, children: [
      /* @__PURE__ */ jsx(Send, { className: "w-4 h-4 mr-1" }),
      "Mandar al grupo de pendientes"
    ] }),
    /* @__PURE__ */ jsx(Button, { variant: "outline", onClick: copiar, children: "Copiar mensaje" })
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
  amenaza_externa: false,
  // Solo reingresos de reparación
  rep_fecha_ingreso: "",
  rep_taller: "",
  rep_trabajo: "",
  rep_calidad: "",
  rep_remito: "",
  rep_presupuesto: "",
  rep_sena: "",
  rep_saldo: "",
  rep_garantia: ""
};
const CAMPOS_REP = ["rep_fecha_ingreso", "rep_taller", "rep_trabajo", "rep_calidad", "rep_remito", "rep_presupuesto", "rep_sena", "rep_saldo", "rep_garantia"];
function NuevoCaso({
  puedeElegirLocal,
  onCreado,
  irACasos
}) {
  const {
    user
  } = useAuth();
  const sesion = useSesion();
  const sucursalId = sesion.modo === "local" ? sesion.sucursal_id : void 0;
  const nombre = sesion.nombre;
  const [form, setForm] = useState({
    ...FORM_VACIO
  });
  const [fotos, setFotos] = useState([]);
  const [sucursales, setSucursales] = useState([]);
  const [enviando, setEnviando] = useState(false);
  const [creado, setCreado] = useState(null);
  const [fotosCreado, setFotosCreado] = useState([]);
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
  const esReparacion = form.tipo === "reparacion";
  const faltantes = () => {
    const f = [];
    const vacio = (v) => !v || !v.trim();
    if (!form.sucursal_id) f.push("local");
    if (vacio(form.atendido_por)) f.push("quién atiende");
    if (vacio(form.cliente_nombre)) f.push("nombre del cliente");
    if (form.cliente_telefono.replace(/\D/g, "").length < 8) f.push("teléfono del cliente");
    if (esReparacion) {
      if (vacio(form.producto_u_orden)) f.push("N° de orden y equipo");
      if (!form.rep_fecha_ingreso) f.push("fecha de ingreso");
      if (!form.fecha_compra) f.push("fecha de entrega");
      if (form.rep_fecha_ingreso && form.fecha_compra && form.rep_fecha_ingreso > form.fecha_compra) f.push("la fecha de ingreso no puede ser posterior a la de entrega");
      if (vacio(form.rep_taller)) f.push("taller");
      if (vacio(form.rep_trabajo)) f.push("qué se le hizo");
      if (!form.rep_calidad) f.push("calidad del repuesto");
      if (vacio(form.rep_remito)) f.push("qué dice el remito de ingreso");
      if (vacio(form.rep_presupuesto)) f.push("presupuesto que se pasó");
      if (vacio(form.rep_sena)) f.push("seña (cuándo y cómo pagó)");
      if (vacio(form.rep_saldo)) f.push("saldo (cuándo y cómo pagó)");
      if (!form.estado_producto) f.push("cómo vuelve el equipo");
    } else {
      if (vacio(form.producto_u_orden)) f.push("producto");
      if (!form.fecha_compra) f.push("fecha de compra");
      if (!form.forma_pago) f.push("forma de pago");
      if (!form.estado_producto) f.push("estado del producto");
    }
    if (vacio(form.que_pasa)) f.push("qué pasa");
    if (vacio(form.que_probamos)) f.push("qué probamos");
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
      const comprimidas = [];
      for (let i = 0; i < fotos.length; i++) {
        const blob = await comprimirImagen(fotos[i]);
        comprimidas.push(new File([blob], `foto-${i + 1}.jpg`, {
          type: "image/jpeg"
        }));
        const ruta = `${form.sucursal_id}/${Date.now()}-${i}.jpg`;
        const {
          error: error2
        } = await supabase.storage.from("reclamos").upload(ruta, blob, {
          contentType: "image/jpeg"
        });
        if (error2) throw new Error(`No se pudo subir la foto ${i + 1}: ${error2.message}`);
        rutas.push(ruta);
      }
      const datos = {
        ...form,
        user_id: user.id,
        fotos: rutas
      };
      if (esReparacion) {
        datos.forma_pago = "Reparación (ver seña y saldo)";
        datos.con_ticket = true;
        datos.es_original_marca = false;
        datos.queda_saldo_favor = false;
        if (!datos.rep_garantia?.trim()) datos.rep_garantia = null;
      } else {
        CAMPOS_REP.forEach((k) => datos[k] = null);
      }
      const {
        data,
        error
      } = await db.from("reclamos").insert(datos).select("*").single();
      if (error) throw new Error(error.message);
      setFotosCreado(comprimidas);
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
    setFotosCreado([]);
    setForm({
      ...FORM_VACIO,
      sucursal_id: form.sucursal_id,
      atendido_por: form.atendido_por
    });
  };
  if (creado) {
    const local = sucursales.find((s) => String(s.id) === String(creado.sucursal_id))?.nombre;
    return /* @__PURE__ */ jsx(Resultado, { caso: creado, local, fotos: fotosCreado, otroCaso, irACasos });
  }
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
        puedeElegirLocal && /* @__PURE__ */ jsx(F, { label: "Local *", children: /* @__PURE__ */ jsxs(Select, { value: form.sucursal_id, onValueChange: (v) => set("sucursal_id", v), children: [
          /* @__PURE__ */ jsx(SelectTrigger, { children: /* @__PURE__ */ jsx(SelectValue, { placeholder: "Elegí el local" }) }),
          /* @__PURE__ */ jsx(SelectContent, { children: sucursales.map((s) => /* @__PURE__ */ jsx(SelectItem, { value: String(s.id), children: s.nombre }, String(s.id))) })
        ] }) }),
        /* @__PURE__ */ jsx(F, { label: "Quién atiende *", children: /* @__PURE__ */ jsx(Input, { value: form.atendido_por, onChange: (e) => set("atendido_por", e.target.value) }) }),
        /* @__PURE__ */ jsx(F, { label: "Tipo de caso *", full: true, children: /* @__PURE__ */ jsxs(Select, { value: form.tipo, onValueChange: (v) => set("tipo", v), children: [
          /* @__PURE__ */ jsx(SelectTrigger, { children: /* @__PURE__ */ jsx(SelectValue, {}) }),
          /* @__PURE__ */ jsx(SelectContent, { children: TIPOS.map((o) => /* @__PURE__ */ jsx(SelectItem, { value: o.v, children: o.l }, o.v)) })
        ] }) }),
        /* @__PURE__ */ jsx(F, { label: "Nombre del cliente *", children: /* @__PURE__ */ jsx(Input, { value: form.cliente_nombre, onChange: (e) => set("cliente_nombre", e.target.value) }) }),
        /* @__PURE__ */ jsx(F, { label: "Teléfono del cliente *", children: /* @__PURE__ */ jsx(Input, { inputMode: "tel", placeholder: "299 4 123456", value: form.cliente_telefono, onChange: (e) => set("cliente_telefono", e.target.value) }) }),
        esReparacion ? /* @__PURE__ */ jsxs(Fragment, { children: [
          /* @__PURE__ */ jsx(Seccion, { titulo: "Datos de la reparación original" }),
          /* @__PURE__ */ jsx(F, { label: "N° de orden y equipo *", full: true, children: /* @__PURE__ */ jsx(Input, { placeholder: "Ej: 343R Moto G51", value: form.producto_u_orden, onChange: (e) => set("producto_u_orden", e.target.value) }) }),
          /* @__PURE__ */ jsx(F, { label: "Cuándo ingresó el equipo *", children: /* @__PURE__ */ jsx(Input, { type: "date", max: hoyISO(), value: form.rep_fecha_ingreso, onChange: (e) => set("rep_fecha_ingreso", e.target.value) }) }),
          /* @__PURE__ */ jsx(F, { label: "Cuándo se le entregó al cliente *", children: /* @__PURE__ */ jsx(Input, { type: "date", max: hoyISO(), value: form.fecha_compra, onChange: (e) => set("fecha_compra", e.target.value) }) }),
          /* @__PURE__ */ jsx(F, { label: "En qué taller se reparó *", children: /* @__PURE__ */ jsx(Input, { placeholder: "Ej: Lucas, Illia, Tana", value: form.rep_taller, onChange: (e) => set("rep_taller", e.target.value) }) }),
          /* @__PURE__ */ jsx(F, { label: "Calidad del repuesto que se puso *", children: /* @__PURE__ */ jsxs(Select, { value: form.rep_calidad, onValueChange: (v) => set("rep_calidad", v), children: [
            /* @__PURE__ */ jsx(SelectTrigger, { children: /* @__PURE__ */ jsx(SelectValue, { placeholder: "Elegí" }) }),
            /* @__PURE__ */ jsx(SelectContent, { children: CALIDADES.map((o) => /* @__PURE__ */ jsx(SelectItem, { value: o, children: o }, o)) })
          ] }) }),
          /* @__PURE__ */ jsx(F, { label: "Qué se le hizo (todo lo que hizo el taller, no solo el motivo de ingreso) *", full: true, children: /* @__PURE__ */ jsx(Textarea, { rows: 2, placeholder: "Ej: cambio de batería y reparación de capacitor en placa", value: form.rep_trabajo, onChange: (e) => set("rep_trabajo", e.target.value) }) }),
          /* @__PURE__ */ jsx(F, { label: "Qué dice el remito / orden de ingreso *", full: true, children: /* @__PURE__ */ jsx(Textarea, { rows: 2, placeholder: "Cómo ingresó: golpes, rayas, tornillos, qué funcionaba y qué no, si se avisó que se borraban los datos", value: form.rep_remito, onChange: (e) => set("rep_remito", e.target.value) }) }),
          /* @__PURE__ */ jsx(F, { label: "Presupuesto que se pasó *", full: true, children: /* @__PURE__ */ jsx(Input, { placeholder: "Ej: $85.000 módulo OLED con colocación", value: form.rep_presupuesto, onChange: (e) => set("rep_presupuesto", e.target.value) }) }),
          /* @__PURE__ */ jsx(F, { label: "Seña: monto, cuándo y cómo pagó *", children: /* @__PURE__ */ jsx(Input, { placeholder: "Ej: $42.500 el 10/11 en efectivo", value: form.rep_sena, onChange: (e) => set("rep_sena", e.target.value) }) }),
          /* @__PURE__ */ jsx(F, { label: "Saldo: monto, cuándo y cómo pagó *", children: /* @__PURE__ */ jsx(Input, { placeholder: "Ej: $42.500 el 14/11 con débito", value: form.rep_saldo, onChange: (e) => set("rep_saldo", e.target.value) }) }),
          /* @__PURE__ */ jsx(F, { label: "Garantía que se le informó (si se sabe)", full: true, children: /* @__PURE__ */ jsx(Input, { placeholder: "Ej: 30 días, figura en la orden", value: form.rep_garantia, onChange: (e) => set("rep_garantia", e.target.value) }) }),
          /* @__PURE__ */ jsx(Seccion, { titulo: "Cómo vuelve hoy" }),
          /* @__PURE__ */ jsx(F, { label: "Estado del equipo hoy *", full: true, children: /* @__PURE__ */ jsxs(Select, { value: form.estado_producto, onValueChange: (v) => set("estado_producto", v), children: [
            /* @__PURE__ */ jsx(SelectTrigger, { children: /* @__PURE__ */ jsx(SelectValue, { placeholder: "Elegí" }) }),
            /* @__PURE__ */ jsx(SelectContent, { children: ESTADOS_PRODUCTO.map((o) => /* @__PURE__ */ jsx(SelectItem, { value: o.v, children: o.l }, o.v)) })
          ] }) })
        ] }) : /* @__PURE__ */ jsxs(Fragment, { children: [
          /* @__PURE__ */ jsx(F, { label: "Producto *", children: /* @__PURE__ */ jsx(Input, { placeholder: "Ej: Auricular Redmi Buds 5", value: form.producto_u_orden, onChange: (e) => set("producto_u_orden", e.target.value) }) }),
          /* @__PURE__ */ jsx(F, { label: "Fecha de compra *", children: /* @__PURE__ */ jsx(Input, { type: "date", max: hoyISO(), value: form.fecha_compra, onChange: (e) => set("fecha_compra", e.target.value) }) }),
          /* @__PURE__ */ jsx(F, { label: "Forma de pago *", children: /* @__PURE__ */ jsxs(Select, { value: form.forma_pago, onValueChange: (v) => set("forma_pago", v), children: [
            /* @__PURE__ */ jsx(SelectTrigger, { children: /* @__PURE__ */ jsx(SelectValue, { placeholder: "Elegí" }) }),
            /* @__PURE__ */ jsx(SelectContent, { children: FORMAS_PAGO.map((o) => /* @__PURE__ */ jsx(SelectItem, { value: o, children: o }, o)) })
          ] }) }),
          /* @__PURE__ */ jsx(Si, { label: "Es un original Apple o Samsung", v: form.es_original_marca, on: (v) => setForm((f) => ({
            ...f,
            es_original_marca: v,
            estado_producto: v && f.estado_producto === "sellado" ? "" : f.estado_producto
          })) }),
          /* @__PURE__ */ jsx(F, { label: "Estado del producto *", children: /* @__PURE__ */ jsxs(Select, { value: form.estado_producto, onValueChange: (v) => set("estado_producto", v), children: [
            /* @__PURE__ */ jsx(SelectTrigger, { children: /* @__PURE__ */ jsx(SelectValue, { placeholder: "Elegí" }) }),
            /* @__PURE__ */ jsx(SelectContent, { children: ESTADOS_PRODUCTO.filter((o) => !(form.es_original_marca && o.v === "sellado")).map((o) => /* @__PURE__ */ jsx(SelectItem, { value: o.v, children: o.l }, o.v)) })
          ] }) }),
          /* @__PURE__ */ jsx(Si, { label: "Trae ticket o la venta aparece en el sistema", v: form.con_ticket, on: (v) => set("con_ticket", v), full: true }),
          form.es_original_marca && form.tipo === "cambio" && /* @__PURE__ */ jsxs("p", { className: "sm:col-span-2 text-sm rounded-md bg-warning/10 border border-warning p-3", children: [
            "Los originales Apple y Samsung se abren y se prueban con el cliente antes de que salgan del local, así que",
            /* @__PURE__ */ jsx("b", { children: " no tienen cambio" }),
            ". No se lo prometas: cargá el caso igual y el encargado lo confirma."
          ] })
        ] }),
        /* @__PURE__ */ jsx(F, { label: esReparacion ? "Qué falla ahora (en una frase) *" : "Qué pasa (en una frase) *", full: true, children: /* @__PURE__ */ jsx(Textarea, { rows: 2, placeholder: esReparacion ? "Ej: la pantalla quedó sin imagen" : "Ej: el auricular derecho no enciende", value: form.que_pasa, onChange: (e) => set("que_pasa", e.target.value) }) }),
        /* @__PURE__ */ jsx(F, { label: "Qué probamos en el local *", full: true, children: /* @__PURE__ */ jsx(Textarea, { rows: 2, placeholder: "Ej: lo cargamos 30 min y probamos con otro cargador: sigue igual", value: form.que_probamos, onChange: (e) => set("que_probamos", e.target.value) }) }),
        /* @__PURE__ */ jsx(F, { label: "Qué pide el cliente *", children: /* @__PURE__ */ jsxs(Select, { value: form.que_pide, onValueChange: (v) => set("que_pide", v), children: [
          /* @__PURE__ */ jsx(SelectTrigger, { children: /* @__PURE__ */ jsx(SelectValue, { placeholder: "Elegí" }) }),
          /* @__PURE__ */ jsx(SelectContent, { children: QUE_PIDE.map((o) => /* @__PURE__ */ jsx(SelectItem, { value: o.v, children: o.l }, o.v)) })
        ] }) }),
        !esReparacion && /* @__PURE__ */ jsx(Si, { label: "Se lleva algo más barato (le queda saldo a favor)", v: form.queda_saldo_favor, on: (v) => set("queda_saldo_favor", v) }),
        /* @__PURE__ */ jsx(Si, { label: "Nombró Defensa del Consumidor, un abogado o las redes", v: form.amenaza_externa, on: (v) => set("amenaza_externa", v), full: true }),
        /* @__PURE__ */ jsxs("div", { className: "sm:col-span-2 space-y-2", children: [
          /* @__PURE__ */ jsx(Label, { children: esReparacion ? "Fotos del equipo como vuelve y de la orden de ingreso *" : "Fotos del producto, la caja y el ticket *" }),
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
  local,
  fotos,
  otroCaso,
  irACasos
}) {
  const ui = COLOR_UI[caso.color] ?? COLOR_UI.amarillo;
  const [avisado, setAvisado] = useState(false);
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
        ". Pasá el cambio por el sistema y avisá en el grupo de pendientes con el botón de abajo."
      ] })
    ] }),
    caso.color === "amarillo" && /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
      /* @__PURE__ */ jsx("p", { className: "text-lg font-semibold", children: "Lo decide el encargado de turno." }),
      /* @__PURE__ */ jsxs("p", { className: "text-sm", children: [
        "Motivo: ",
        caso.motivo_color,
        ". No prometas nada. Decile al cliente:"
      ] }),
      caso.es_original_marca && caso.tipo === "cambio" && /* @__PURE__ */ jsx("p", { className: "text-sm", children: "Los originales salen probados del local: en principio no tienen cambio. Lo confirma el encargado." }),
      /* @__PURE__ */ jsxs("p", { className: "text-base font-medium bg-background rounded-md p-3", children: [
        '"',
        FRASE_FIJA,
        '"'
      ] })
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
    /* @__PURE__ */ jsx("div", { className: `rounded-md border-2 p-3 space-y-2 ${avisado ? "border-success bg-background" : "border-destructive bg-background"}`, children: avisado ? /* @__PURE__ */ jsxs("p", { className: "font-semibold flex items-center gap-2", children: [
      /* @__PURE__ */ jsx(CheckCircle2, { className: "w-5 h-5 text-success" }),
      "Avisado al grupo de pendientes."
    ] }) : /* @__PURE__ */ jsxs(Fragment, { children: [
      /* @__PURE__ */ jsx("p", { className: "font-semibold", children: "Obligatorio: avisá en el grupo de pendientes de tu local." }),
      /* @__PURE__ */ jsx("p", { className: "text-sm text-muted-foreground", children: 'En el celular se abre "Compartir" con el mensaje y las fotos: elegí WhatsApp y el grupo. En la compu se abre WhatsApp Web con el mensaje; las fotos adjuntalas vos.' }),
      /* @__PURE__ */ jsx(BotonesGrupo, { caso, local, files: async () => fotos, onAvisado: () => setAvisado(true) })
    ] }) }),
    /* @__PURE__ */ jsxs("div", { className: "flex flex-wrap gap-2", children: [
      caso.color !== "verde" && /* @__PURE__ */ jsxs(Button, { variant: "secondary", onClick: mandarFrase, children: [
        /* @__PURE__ */ jsx(MessageCircle, { className: "w-4 h-4 mr-1" }),
        "Mandar la frase al cliente"
      ] }),
      /* @__PURE__ */ jsx(Button, { variant: "outline", onClick: irACasos, children: "Ver casos" }),
      /* @__PURE__ */ jsx(Button, { onClick: otroCaso, disabled: !avisado, children: "Cargar otro caso" })
    ] }),
    !avisado && /* @__PURE__ */ jsx("p", { className: "text-xs text-muted-foreground", children: "Para cargar otro caso, primero avisá al grupo." })
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
  const sesion = useSesion();
  const load = async () => {
    setLoading(true);
    let query = db.from("reclamos").select("*, sucursales(nombre)").order("created_at", {
      ascending: false
    }).limit(300);
    if (!verResueltos) query = query.neq("estado", "resuelto");
    if (sesion.modo === "local") query = query.eq("sucursal_id", sesion.sucursal_id);
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
          ] }),
          !r.avisado_grupo_at && /* @__PURE__ */ jsx(Badge, { variant: "outline", className: "border-destructive text-destructive", children: "Sin avisar al grupo" })
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
    abierto && /* @__PURE__ */ jsx(DetalleCaso, { caso: abierto, puedeGestionar, onClose: () => {
      setAbierto(null);
      load();
    }, onGuardado: load })
  ] });
}
function estaAtrasado(r) {
  return r.estado !== "resuelto" && r.vence_at && new Date(r.vence_at) < /* @__PURE__ */ new Date();
}
function DetalleCaso({
  caso: casoInicial,
  puedeGestionar,
  onClose,
  onGuardado
}) {
  const {
    nombre
  } = useSesion();
  const [caso, setCaso] = useState(casoInicial);
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
  const [avisadoAt, setAvisadoAt] = useState(caso.avisado_grupo_at);
  const archivosFotos = async () => Promise.all(urls.map(async (u, i) => {
    const blob = await (await fetch(u)).blob();
    return new File([blob], `foto-${i + 1}.jpg`, {
      type: blob.type || "image/jpeg"
    });
  }));
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
      texto: comentario.trim(),
      autor: nombre
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
      modificado_por: nombre,
      ...extra
    }).eq("id", caso.id);
    setGuardando(false);
    if (error) return toast.error(error.message);
    const {
      data: nuevo
    } = await db.from("reclamos").select("*, sucursales(nombre)").eq("id", caso.id).single();
    if (nuevo) setCaso(nuevo);
    await cargarEventos();
    toast.success(`Caso ${caso.numero} actualizado. Mandá el resumen al grupo.`);
    onGuardado();
  };
  const mandarResumen = async () => {
    const ok = await compartirEnGrupo(textoResumen(caso, eventos));
    if (ok) toast.success("Resumen listo para mandar");
  };
  const copiarResumen = async () => {
    await navigator.clipboard.writeText(textoResumen(caso, eventos));
    toast.success("Resumen copiado");
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
        caso.tipo === "reparacion" ? /* @__PURE__ */ jsxs(Fragment, { children: [
          /* @__PURE__ */ jsx(Dato, { l: "Orden y equipo", v: caso.producto_u_orden }),
          /* @__PURE__ */ jsx(Dato, { l: "Ingresó", v: fechaCorta(caso.rep_fecha_ingreso) }),
          /* @__PURE__ */ jsx(Dato, { l: "Se entregó", v: fechaCorta(caso.fecha_compra) }),
          /* @__PURE__ */ jsx(Dato, { l: "Taller", v: caso.rep_taller || "—" }),
          /* @__PURE__ */ jsx(Dato, { l: "Repuesto", v: caso.rep_calidad || "—" }),
          /* @__PURE__ */ jsx(Dato, { l: "Presupuesto", v: caso.rep_presupuesto || "—" }),
          /* @__PURE__ */ jsx(Dato, { l: "Seña", v: caso.rep_sena || "—" }),
          /* @__PURE__ */ jsx(Dato, { l: "Saldo", v: caso.rep_saldo || "—" }),
          caso.rep_garantia && /* @__PURE__ */ jsx(Dato, { l: "Garantía informada", v: caso.rep_garantia }),
          /* @__PURE__ */ jsx(Dato, { l: "Cómo vuelve", v: labelDe(ESTADOS_PRODUCTO, caso.estado_producto) })
        ] }) : /* @__PURE__ */ jsxs(Fragment, { children: [
          /* @__PURE__ */ jsx(Dato, { l: "Producto", v: caso.producto_u_orden }),
          /* @__PURE__ */ jsx(Dato, { l: "Compró", v: fechaCorta(caso.fecha_compra) }),
          /* @__PURE__ */ jsx(Dato, { l: "Pagó con", v: caso.forma_pago }),
          /* @__PURE__ */ jsx(Dato, { l: "Estado del producto", v: labelDe(ESTADOS_PRODUCTO, caso.estado_producto) }),
          /* @__PURE__ */ jsx(Dato, { l: "Ticket", v: caso.con_ticket ? "Sí" : "No" }),
          /* @__PURE__ */ jsx(Dato, { l: "Original Apple/Samsung", v: caso.es_original_marca ? "Sí" : "No" })
        ] }),
        /* @__PURE__ */ jsx(Dato, { l: "Pide", v: labelDe(QUE_PIDE, caso.que_pide) }),
        caso.queda_saldo_favor && /* @__PURE__ */ jsx(Dato, { l: "Saldo", v: "Le queda saldo a favor" }),
        caso.amenaza_externa && /* @__PURE__ */ jsx(Dato, { l: "Atención", v: "Nombró Defensa del Consumidor, abogado o redes" }),
        /* @__PURE__ */ jsx(Dato, { l: "Creado", v: fecha(caso.created_at) }),
        /* @__PURE__ */ jsx(Dato, { l: "Vence", v: fecha(caso.vence_at) })
      ] }),
      caso.tipo === "reparacion" && /* @__PURE__ */ jsxs(Fragment, { children: [
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("b", { children: "Qué se le hizo:" }),
          " ",
          caso.rep_trabajo || "—"
        ] }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("b", { children: "Remito de ingreso:" }),
          " ",
          caso.rep_remito || "—"
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsxs("b", { children: [
          caso.tipo === "reparacion" ? "Qué falla ahora" : "Qué pasa",
          ":"
        ] }),
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
      avisadoAt ? /* @__PURE__ */ jsxs("p", { className: "text-sm flex items-center gap-1", children: [
        /* @__PURE__ */ jsx(CheckCircle2, { className: "w-4 h-4 text-success" }),
        "Avisado al grupo ",
        fecha(avisadoAt),
        caso.avisado_por ? ` por ${caso.avisado_por}` : ""
      ] }) : /* @__PURE__ */ jsxs("div", { className: "rounded-md border-2 border-destructive p-3 space-y-2", children: [
        /* @__PURE__ */ jsx("p", { className: "font-semibold", children: "Este caso todavía no se avisó al grupo de pendientes." }),
        /* @__PURE__ */ jsx(BotonesGrupo, { caso, files: archivosFotos, onAvisado: () => setAvisadoAt((/* @__PURE__ */ new Date()).toISOString()) })
      ] }),
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
      /* @__PURE__ */ jsx(Card, { className: "border-primary/40", children: /* @__PURE__ */ jsxs(CardContent, { className: "p-3 space-y-2", children: [
        /* @__PURE__ */ jsx("h3", { className: "font-semibold", children: "Resumen del caso" }),
        /* @__PURE__ */ jsx("p", { className: "text-xs text-muted-foreground", children: "Cuenta todo lo que pasó, listo para mandar al grupo de pendientes. Se actualiza solo con cada cambio o comentario." }),
        /* @__PURE__ */ jsx("pre", { className: "whitespace-pre-wrap text-xs bg-muted rounded-md p-3 font-sans max-h-64 overflow-y-auto", children: textoResumen(caso, eventos) }),
        /* @__PURE__ */ jsxs("div", { className: "flex flex-wrap gap-2", children: [
          /* @__PURE__ */ jsxs(Button, { size: "sm", onClick: mandarResumen, children: [
            /* @__PURE__ */ jsx(Send, { className: "w-4 h-4 mr-1" }),
            "Mandar resumen al grupo"
          ] }),
          /* @__PURE__ */ jsx(Button, { size: "sm", variant: "outline", onClick: copiarResumen, children: "Copiar" })
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
    esAdmin && /* @__PURE__ */ jsx(PinesCard, {}),
    esAdmin && /* @__PURE__ */ jsxs(Card, { children: [
      /* @__PURE__ */ jsx(CardHeader, { children: /* @__PURE__ */ jsx(CardTitle, { children: "Ajustes del semáforo" }) }),
      /* @__PURE__ */ jsx(CardContent, { className: "space-y-3", children: config.map((c) => /* @__PURE__ */ jsx(AjusteFila, { c, onGuardar: guardarConfig }, c.clave)) })
    ] })
  ] });
}
function PinesCard() {
  const [sucursales, setSucursales] = useState([]);
  const [conPin, setConPin] = useState([]);
  const [nuevos, setNuevos] = useState({});
  const load = async () => {
    const [{
      data: s
    }, {
      data: p
    }] = await Promise.all([supabase.from("sucursales").select("id, nombre").eq("activo", true).order("nombre"), db.rpc("reclamos_pines_configurados")]);
    setSucursales(s || []);
    setConPin((p || []).map((x) => typeof x === "string" ? x : x.reclamos_pines_configurados));
  };
  useEffect(() => {
    load();
  }, []);
  const filas = sucursales.map((s) => ({
    clave: String(s.id),
    nombre: `Local ${s.nombre}`
  }));
  const guardar = async (clave) => {
    const pin = nuevos[clave] || "";
    if (!/^[0-9]{4,8}$/.test(pin)) return toast.error("El PIN tiene que tener entre 4 y 8 números");
    const {
      error
    } = await db.rpc("reclamos_cambiar_pin", {
      p_clave: clave,
      p_pin: pin
    });
    if (error) return toast.error(error.message);
    toast.success("PIN guardado");
    setNuevos((n) => ({
      ...n,
      [clave]: ""
    }));
    load();
  };
  return /* @__PURE__ */ jsxs(Card, { children: [
    /* @__PURE__ */ jsx(CardHeader, { children: /* @__PURE__ */ jsx(CardTitle, { children: "PIN de acceso" }) }),
    /* @__PURE__ */ jsxs(CardContent, { className: "space-y-3", children: [
      /* @__PURE__ */ jsx("p", { className: "text-sm text-muted-foreground", children: "Los PIN se guardan cifrados: no se pueden ver, solo cambiar. Si alguien se olvida el suyo, cargá uno nuevo." }),
      filas.map((f) => /* @__PURE__ */ jsxs("div", { className: "flex flex-col sm:flex-row sm:items-end gap-2", children: [
        /* @__PURE__ */ jsxs("div", { className: "flex-1 space-y-1", children: [
          /* @__PURE__ */ jsxs(Label, { children: [
            f.nombre,
            " ",
            conPin.includes(f.clave) ? /* @__PURE__ */ jsx(Badge, { variant: "outline", className: "ml-1", children: "Tiene PIN" }) : /* @__PURE__ */ jsx(Badge, { className: "ml-1 bg-destructive text-destructive-foreground", children: "Sin PIN" })
          ] }),
          /* @__PURE__ */ jsx(Input, { type: "password", inputMode: "numeric", autoComplete: "new-password", maxLength: 8, placeholder: "PIN nuevo (4 a 8 números)", value: nuevos[f.clave] || "", onChange: (e) => setNuevos((n) => ({
            ...n,
            [f.clave]: e.target.value.replace(/\D/g, "")
          })) })
        ] }),
        /* @__PURE__ */ jsx(Button, { variant: "outline", disabled: !nuevos[f.clave], onClick: () => guardar(f.clave), children: "Guardar" })
      ] }, f.clave))
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
function Seccion({
  titulo
}) {
  return /* @__PURE__ */ jsx("h3", { className: "sm:col-span-2 font-semibold border-b pb-1 mt-2", children: titulo });
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
