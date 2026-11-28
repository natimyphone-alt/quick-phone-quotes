import { jsx, jsxs, Fragment } from "react/jsx-runtime";
import * as React from "react";
import { useState, useEffect, createContext, useMemo, useContext } from "react";
import { s as supabase } from "./client-CzxaLLtB.js";
import { u as useAuth } from "./use-auth-GpmAL4wB.js";
import { C as Card, a as CardHeader, b as CardTitle, d as CardContent } from "./card-DQ5v2DYb.js";
import { I as Input } from "./input-C0QjszdI.js";
import { L as Label } from "./label-JU3yqRBo.js";
import { B as Button } from "./button-BC9oXVxV.js";
import { T as Textarea } from "./textarea-DSyJ1nlY.js";
import { B as Badge } from "./badge-DyfXZgLs.js";
import * as SwitchPrimitives from "@radix-ui/react-switch";
import { c as cn } from "./utils-H80jjgLf.js";
import { T as Tabs, a as TabsList, b as TabsTrigger, c as TabsContent } from "./tabs-D_u1EXWn.js";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { X, Camera, RefreshCw, Search, Clock, MessageCircle, CheckCircle2, Send } from "lucide-react";
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
const TEMAS = [{
  v: "producto",
  l: "Producto"
}, {
  v: "reparacion",
  l: "Reparación (reingreso)"
}, {
  v: "varios",
  l: "Varios"
}, {
  v: "uso_nc",
  l: "Uso de nota de crédito (próximamente)",
  deshabilitado: true
}];
const TEMAS_VIEJOS = [{
  v: "cambio",
  l: "Producto"
}, {
  v: "reclamo",
  l: "Varios"
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
const ESTADOS_EQUIPO = [{
  v: "eq_igual",
  l: "Igual que cuando se entregó (sin marcas nuevas)"
}, {
  v: "eq_golpeado",
  l: "Con golpes, rayas o vidrio roto nuevos"
}, {
  v: "eq_mojado",
  l: "Mojado o con señales de humedad"
}, {
  v: "eq_manipulado",
  l: "Abierto o tocado por otro técnico"
}, {
  v: "eq_falta_pieza",
  l: "Le falta algo (tornillos, tapa, bandeja SIM)"
}];
const ESTADOS_TODOS = [...ESTADOS_PRODUCTO, ...ESTADOS_EQUIPO];
const QUE_PIDE = [{
  v: "cambio",
  l: "Cambio de producto"
}, {
  v: "devolucion",
  l: "Devolución (nota de crédito)"
}];
const QUE_PIDE_TODOS = [...QUE_PIDE, {
  v: "nota_credito",
  l: "Nota de crédito"
}, {
  v: "revision",
  l: "Que revisemos el equipo / una respuesta"
}];
const pideDevolucion = (c) => c.que_pide === "devolucion" || c.que_pide === "nota_credito";
const FORMAS_PAGO = ["Efectivo", "Débito", "Crédito", "QR / Mercado Pago", "Transferencia", "Nota de crédito"];
const CALIDADES = ["Original", "OLED", "No lleva repuesto"];
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
const temaDe = (v) => labelDe([...TEMAS, ...TEMAS_VIEJOS], v);
const esProducto = (c) => c.tipo === "producto" || c.tipo === "cambio";
const siNo = (v) => v === true ? "Sí" : v === false ? "No" : "—";
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
let localesCache = null;
function cargarLocales() {
  if (!localesCache) {
    localesCache = db.rpc("reclamos_sucursales").then(({
      data,
      error
    }) => {
      if (error) {
        localesCache = null;
        toast.error("No se pudieron leer los locales: falta correr la actualización de locales en Supabase");
        return [];
      }
      return (data || []).map((x) => ({
        id: String(x.id),
        nombre: x.nombre
      }));
    });
  }
  return localesCache;
}
async function conNombreLocal(casos) {
  const locales = await cargarLocales();
  return casos.map((c) => ({
    ...c,
    sucursal_nombre: locales.find((l) => l.id === String(c.sucursal_id))?.nombre
  }));
}
const CLAVE_VENDEDOR = "pendientes_vendedor";
const leerVendedor = () => {
  try {
    return localStorage.getItem(CLAVE_VENDEDOR) || "";
  } catch {
    return "";
  }
};
const guardarVendedor = (v) => {
  try {
    localStorage.setItem(CLAVE_VENDEDOR, v);
  } catch {
  }
};
const SesionCtx = createContext({
  modo: "local",
  nombre: ""
});
const useSesion = () => useContext(SesionCtx);
function ReclamosPage() {
  const {
    user,
    isAdmin,
    nombre,
    sucursalId
  } = useAuth();
  const [rol, setRol] = useState(null);
  const [tab, setTab] = useState("nuevo");
  const [recarga, setRecarga] = useState(0);
  const [vendedor, setVendedor] = useState("");
  useEffect(() => {
    if (!user) return;
    db.rpc("reclamos_rol").then(({
      data
    }) => setRol(data || ""));
  }, [user?.id]);
  useEffect(() => {
    setVendedor(leerVendedor());
  }, []);
  if (rol === null) return /* @__PURE__ */ jsx("p", { className: "text-muted-foreground", children: "Cargando..." });
  const loginAdmin = isAdmin || rol === "administrador";
  const puedeGestionar = loginAdmin || rol === "encargado";
  if (rol === "tecnico") {
    return /* @__PURE__ */ jsx("p", { className: "text-muted-foreground py-8 text-center", children: "Pendientes no está disponible para el usuario técnico." });
  }
  if (!puedeGestionar && !sucursalId) {
    return /* @__PURE__ */ jsx("p", { className: "text-destructive py-8 text-center", children: "Este usuario no tiene un local asignado. Pedile a Vanesa que lo asigne en la tabla de usuarios." });
  }
  const sesion = puedeGestionar ? {
    modo: "encargado",
    nombre: nombre || (loginAdmin ? "Administración" : "Encargado")
  } : {
    modo: "local",
    sucursal_id: String(sucursalId),
    nombre: vendedor || nombre || "Vendedor"
  };
  return /* @__PURE__ */ jsx(SesionCtx.Provider, { value: sesion, children: /* @__PURE__ */ jsxs("div", { className: "space-y-4", children: [
    /* @__PURE__ */ jsxs("div", { className: "flex flex-wrap items-end justify-between gap-2", children: [
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("h1", { className: "text-2xl font-bold", children: "Pendientes" }),
        /* @__PURE__ */ jsx("p", { className: "text-sm text-muted-foreground", children: puedeGestionar ? "Todos los locales" : nombre })
      ] }),
      !puedeGestionar && /* @__PURE__ */ jsxs("div", { className: "w-48 space-y-1", children: [
        /* @__PURE__ */ jsx(Label, { className: "text-xs", children: "Vendedor de turno" }),
        /* @__PURE__ */ jsx(Input, { value: vendedor, placeholder: "Tu nombre", onChange: (e) => {
          setVendedor(e.target.value);
          guardarVendedor(e.target.value);
        } })
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
      puedeGestionar && /* @__PURE__ */ jsx(TabsContent, { value: "resumen", children: /* @__PURE__ */ jsx(Resumen, { esAdmin: loginAdmin }) })
    ] })
  ] }) });
}
const TIPO_CORTO = {
  producto: "PRODUCTO",
  reparacion: "REINGRESO",
  varios: "VARIOS",
  uso_nc: "USO DE NOTA DE CRÉDITO",
  cambio: "PRODUCTO",
  reclamo: "VARIOS"
};
function textoGrupo(c, local, conFotos = false) {
  const color = COLOR_UI[c.color]?.label ?? "";
  const l = [];
  l.push(`*CASO ${c.numero} – ${color} – ${TIPO_CORTO[c.tipo] ?? c.tipo}*`);
  l.push(`Local: ${local || c.sucursal_nombre || "-"} · Vendedor: ${c.atendido_por}`);
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
    l.push(`Cómo vuelve: ${labelDe(ESTADOS_TODOS, c.estado_producto)}`);
  } else if (esProducto(c)) {
    l.push(`Producto: ${c.producto_u_orden}${c.es_original_marca ? " (ORIGINAL)" : ""}`);
    l.push(`Compró: ${fechaCorta(c.fecha_compra)} · Pagó con: ${c.forma_pago} · Ticket: ${c.con_ticket ? "Sí" : "No"}`);
    if (c.prod_fallado != null) {
      l.push(`Fallado: ${siNo(c.prod_fallado)}${c.prod_fallado && c.prod_falla ? ` (${c.prod_falla})` : ""}`);
      l.push(`Completo con accesorios: ${siNo(c.prod_completo)} · Packaging en buen estado: ${siNo(c.prod_packaging_ok)}`);
      l.push(`Marcas de uso: ${siNo(c.prod_marcas_uso)}${c.prod_marcas_uso && c.prod_marcas_desc ? ` (${c.prod_marcas_desc})` : ""}`);
      if (c.prod_liquidacion != null) l.push(`Liquidación o promo: ${siNo(c.prod_liquidacion)}`);
    } else if (c.estado_producto) {
      l.push(`Estado: ${labelDe(ESTADOS_TODOS, c.estado_producto)}`);
    }
  } else if (c.tema_detalle) {
    l.push(`Tema: ${c.tema_detalle}`);
  }
  if (c.que_pasa) l.push(`${c.tipo === "reparacion" ? "Qué falla ahora" : "Qué pasa"}: ${c.que_pasa}`);
  if (c.que_probamos) l.push(`Qué probamos: ${c.que_probamos}`);
  if (c.que_pide) l.push(`Pide: ${labelDe(QUE_PIDE_TODOS, c.que_pide)}`);
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
const esCelular = () => /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
async function compartirCelular(texto, files = []) {
  const nav = navigator;
  try {
    if (files.length && nav.canShare?.({
      files,
      text: texto
    })) await nav.share({
      files,
      text: texto
    });
    else await nav.share({
      text: texto
    });
    return true;
  } catch {
    return false;
  }
}
async function copiarTexto(texto) {
  try {
    await navigator.clipboard.writeText(texto);
  } catch {
    const t = document.createElement("textarea");
    t.value = texto;
    document.body.appendChild(t);
    t.select();
    document.execCommand("copy");
    t.remove();
  }
}
function ResumenGrupo({
  titulo,
  texto,
  files,
  onListo,
  onClose
}) {
  const [listo, setListo] = useState(false);
  const copiar = async () => {
    await copiarTexto(texto);
    toast.success("Resumen copiado: pegalo en el grupo de pendientes");
    setListo(true);
    onListo?.();
  };
  const compartir = async () => {
    const fs = files ? await files().catch(() => []) : [];
    if (await compartirCelular(texto, fs)) {
      setListo(true);
      onListo?.();
    }
  };
  return /* @__PURE__ */ jsx(Dialog, { open: true, onOpenChange: (o) => !o && onClose(), children: /* @__PURE__ */ jsxs(DialogContent, { className: "max-w-lg max-h-[90vh] overflow-y-auto", children: [
    /* @__PURE__ */ jsx(DialogHeader, { children: /* @__PURE__ */ jsx(DialogTitle, { children: titulo }) }),
    /* @__PURE__ */ jsx("pre", { className: "whitespace-pre-wrap text-sm bg-muted rounded-md p-3 font-sans max-h-[50vh] overflow-y-auto", children: texto }),
    /* @__PURE__ */ jsxs("p", { className: "text-sm text-muted-foreground", children: [
      "Tocá ",
      /* @__PURE__ */ jsx("b", { children: "Copiar resumen" }),
      ", abrí el grupo de pendientes en WhatsApp y pegalo. Las fotos adjuntalas vos."
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "flex flex-wrap gap-2", children: [
      /* @__PURE__ */ jsxs(Button, { onClick: copiar, children: [
        /* @__PURE__ */ jsx(Send, { className: "w-4 h-4 mr-1" }),
        "Copiar resumen"
      ] }),
      esCelular() && /* @__PURE__ */ jsx(Button, { variant: "outline", onClick: compartir, children: "Compartir (con fotos)" }),
      /* @__PURE__ */ jsx(Button, { variant: "ghost", onClick: onClose, children: listo ? "Listo" : "Cerrar" })
    ] })
  ] }) });
}
async function marcarAvisado(id, autor, momento = "alta") {
  const {
    error
  } = await db.rpc("reclamos_marcar_avisado", {
    p_id: id,
    p_autor: autor,
    p_momento: momento
  });
  if (error) toast.error(`No se pudo registrar el aviso: ${error.message}`);
  return !error;
}
function BotonesGrupo({
  caso,
  local,
  files,
  onAvisado,
  momento = "alta",
  texto
}) {
  const sesion = useSesion();
  const [abierto, setAbierto] = useState(false);
  const [avisado, setAvisado] = useState(false);
  const cerrar = () => {
    setAbierto(false);
    if (avisado) onAvisado();
  };
  return /* @__PURE__ */ jsxs(Fragment, { children: [
    /* @__PURE__ */ jsxs(Button, { onClick: () => setAbierto(true), children: [
      /* @__PURE__ */ jsx(Send, { className: "w-4 h-4 mr-1" }),
      momento === "resolucion" ? "Resumen de la resolución para el grupo" : "Resumen para el grupo de pendientes"
    ] }),
    abierto && /* @__PURE__ */ jsx(ResumenGrupo, { titulo: momento === "resolucion" ? `Resolución del caso ${caso.numero}` : `Caso ${caso.numero}`, texto: texto ? texto() : textoGrupo(caso, local), files: momento === "alta" ? files : void 0, onListo: async () => {
      if (!avisado && await marcarAvisado(caso.id, sesion.nombre, momento)) setAvisado(true);
    }, onClose: cerrar })
  ] });
}
const FORM_VACIO = {
  sucursal_id: "",
  atendido_por: "",
  cliente_nombre: "",
  cliente_telefono: "",
  tipo: "producto",
  tema_detalle: "",
  producto_u_orden: "",
  fecha_compra: hoyISO(),
  forma_pago: "",
  con_ticket: true,
  es_original_marca: false,
  prod_fallado: null,
  prod_falla: "",
  prod_completo: null,
  prod_packaging_ok: null,
  prod_marcas_uso: null,
  prod_marcas_desc: "",
  prod_liquidacion: null,
  estado_producto: "",
  que_pasa: "",
  que_probamos: "",
  que_pide: "",
  amenaza_externa: false,
  // Solo reingresos de reparación
  rep_fecha_ingreso: "",
  rep_taller: "",
  rep_trabajo: "",
  rep_calidad: "",
  rep_remito: "",
  rep_presupuesto: "",
  rep_sena: "",
  rep_saldo: ""
};
const CAMPOS_REP = ["rep_fecha_ingreso", "rep_taller", "rep_trabajo", "rep_calidad", "rep_remito", "rep_presupuesto", "rep_sena", "rep_saldo"];
const CAMPOS_PROD = ["prod_fallado", "prod_falla", "prod_completo", "prod_packaging_ok", "prod_marcas_uso", "prod_marcas_desc", "prod_liquidacion"];
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
  const nombre = sesion.modo === "local" ? leerVendedor() : sesion.nombre;
  const [form, setForm] = useState({
    ...FORM_VACIO
  });
  const [fotos, setFotos] = useState([]);
  const [sucursales, setSucursales] = useState([]);
  const [enviando, setEnviando] = useState(false);
  const [creado, setCreado] = useState(null);
  const [fotosCreado, setFotosCreado] = useState([]);
  useEffect(() => {
    cargarLocales().then(setSucursales);
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
  const tema = form.tipo;
  const esReparacion = tema === "reparacion";
  const esProd = tema === "producto";
  const esVarios = tema === "varios";
  const faltantes = () => {
    const f = [];
    const vacio = (v) => !v || !v.trim();
    if (!form.sucursal_id) f.push("local");
    if (vacio(form.atendido_por)) f.push("vendedor");
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
    }
    if (esProd) {
      if (vacio(form.producto_u_orden)) f.push("producto");
      if (!form.fecha_compra) f.push("fecha de compra");
      if (!form.forma_pago) f.push("forma de pago");
      if (form.prod_fallado === null) f.push("¿está fallado?");
      if (form.prod_fallado && vacio(form.prod_falla)) f.push("descripción de la falla");
      if (form.prod_completo === null) f.push("¿está completo?");
      if (form.prod_packaging_ok === null) f.push("¿packaging en buen estado?");
      if (form.prod_marcas_uso === null) f.push("¿tiene marcas de uso?");
      if (form.prod_marcas_uso && vacio(form.prod_marcas_desc)) f.push("descripción de las marcas de uso");
      if (form.prod_liquidacion === null) f.push("¿se vendió en liquidación o promo?");
    }
    if (esVarios && vacio(form.tema_detalle)) f.push("de qué se trata");
    if (vacio(form.que_pasa)) f.push(esVarios ? "qué pasa" : esReparacion ? "qué falla ahora" : "qué pasa");
    if (!esVarios) {
      if (vacio(form.que_probamos)) f.push("qué probamos");
      if (!form.que_pide) f.push("qué pide el cliente");
      if (fotos.length === 0) f.push("al menos una foto");
    }
    return f;
  };
  const enviar = async () => {
    if (!user) return;
    if (tema === "uso_nc") return toast.error("El uso de nota de crédito llega en la próxima etapa");
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
      const vaciar = (campos) => campos.forEach((k) => datos[k] = null);
      if (!datos.prod_fallado) datos.prod_falla = null;
      if (!datos.prod_marcas_uso) datos.prod_marcas_desc = null;
      if (esReparacion) {
        datos.forma_pago = "Reparación (ver seña y saldo)";
        datos.con_ticket = true;
        datos.es_original_marca = false;
        datos.tema_detalle = null;
        vaciar(CAMPOS_PROD);
      } else if (esProd) {
        datos.estado_producto = null;
        datos.tema_detalle = null;
        vaciar(CAMPOS_REP);
      } else {
        datos.producto_u_orden = datos.producto_u_orden?.trim() || null;
        datos.fecha_compra = null;
        datos.forma_pago = null;
        datos.con_ticket = false;
        datos.es_original_marca = false;
        datos.estado_producto = null;
        datos.que_probamos = datos.que_probamos?.trim() || null;
        datos.que_pide = datos.que_pide || null;
        vaciar(CAMPOS_REP);
        vaciar(CAMPOS_PROD);
      }
      const {
        data,
        error
      } = await db.from("reclamos").insert(datos).select("*").single();
      if (error) throw new Error(error.message);
      if (sesion.modo === "local") guardarVendedor(form.atendido_por.trim());
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
    const local = sucursales.find((s) => s.id === String(creado.sucursal_id))?.nombre;
    return /* @__PURE__ */ jsx(Resultado, { caso: creado, local, fotos: fotosCreado, otroCaso, irACasos });
  }
  return /* @__PURE__ */ jsx("div", { className: "space-y-4", children: /* @__PURE__ */ jsxs(Card, { children: [
    /* @__PURE__ */ jsx(CardHeader, { children: /* @__PURE__ */ jsx(CardTitle, { children: "Ficha del caso" }) }),
    /* @__PURE__ */ jsxs(CardContent, { className: "grid grid-cols-1 sm:grid-cols-2 gap-4", children: [
      puedeElegirLocal && /* @__PURE__ */ jsx(F, { label: "Local *", children: /* @__PURE__ */ jsxs(Select, { value: form.sucursal_id, onValueChange: (v) => set("sucursal_id", v), children: [
        /* @__PURE__ */ jsx(SelectTrigger, { children: /* @__PURE__ */ jsx(SelectValue, { placeholder: "Elegí el local" }) }),
        /* @__PURE__ */ jsx(SelectContent, { children: sucursales.map((s) => /* @__PURE__ */ jsx(SelectItem, { value: s.id, children: s.nombre }, s.id)) })
      ] }) }),
      /* @__PURE__ */ jsx(F, { label: "Vendedor *", children: /* @__PURE__ */ jsx(Input, { value: form.atendido_por, onChange: (e) => set("atendido_por", e.target.value) }) }),
      /* @__PURE__ */ jsx(F, { label: "Tema *", full: true, children: /* @__PURE__ */ jsxs(Select, { value: form.tipo, onValueChange: (v) => setForm((f) => ({
        ...f,
        tipo: v,
        estado_producto: "",
        rep_calidad: ""
      })), children: [
        /* @__PURE__ */ jsx(SelectTrigger, { children: /* @__PURE__ */ jsx(SelectValue, {}) }),
        /* @__PURE__ */ jsx(SelectContent, { children: TEMAS.map((o) => /* @__PURE__ */ jsx(SelectItem, { value: o.v, disabled: o.deshabilitado, children: o.l }, o.v)) })
      ] }) }),
      /* @__PURE__ */ jsx(F, { label: "Nombre del cliente *", children: /* @__PURE__ */ jsx(Input, { value: form.cliente_nombre, onChange: (e) => set("cliente_nombre", e.target.value) }) }),
      /* @__PURE__ */ jsx(F, { label: "Teléfono del cliente *", children: /* @__PURE__ */ jsx(Input, { inputMode: "tel", placeholder: "299 4 123456", value: form.cliente_telefono, onChange: (e) => set("cliente_telefono", e.target.value) }) }),
      esReparacion && /* @__PURE__ */ jsxs(Fragment, { children: [
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
        /* @__PURE__ */ jsx(Seccion, { titulo: "Cómo vuelve hoy" }),
        /* @__PURE__ */ jsx(F, { label: "Estado del equipo hoy *", full: true, children: /* @__PURE__ */ jsxs(Select, { value: form.estado_producto, onValueChange: (v) => set("estado_producto", v), children: [
          /* @__PURE__ */ jsx(SelectTrigger, { children: /* @__PURE__ */ jsx(SelectValue, { placeholder: "Elegí" }) }),
          /* @__PURE__ */ jsx(SelectContent, { children: ESTADOS_EQUIPO.map((o) => /* @__PURE__ */ jsx(SelectItem, { value: o.v, children: o.l }, o.v)) })
        ] }) })
      ] }),
      esProd && /* @__PURE__ */ jsxs(Fragment, { children: [
        /* @__PURE__ */ jsx(F, { label: "Producto *", children: /* @__PURE__ */ jsx(Input, { placeholder: "Ej: Auricular Redmi Buds 5", value: form.producto_u_orden, onChange: (e) => set("producto_u_orden", e.target.value) }) }),
        /* @__PURE__ */ jsx(F, { label: "Fecha de compra *", children: /* @__PURE__ */ jsx(Input, { type: "date", max: hoyISO(), value: form.fecha_compra, onChange: (e) => set("fecha_compra", e.target.value) }) }),
        /* @__PURE__ */ jsx(F, { label: "Forma de pago *", children: /* @__PURE__ */ jsxs(Select, { value: form.forma_pago, onValueChange: (v) => set("forma_pago", v), children: [
          /* @__PURE__ */ jsx(SelectTrigger, { children: /* @__PURE__ */ jsx(SelectValue, { placeholder: "Elegí" }) }),
          /* @__PURE__ */ jsx(SelectContent, { children: FORMAS_PAGO.map((o) => /* @__PURE__ */ jsx(SelectItem, { value: o, children: o }, o)) })
        ] }) }),
        /* @__PURE__ */ jsx(Si, { label: "Trae ticket o la venta aparece en el sistema", v: form.con_ticket, on: (v) => set("con_ticket", v) }),
        /* @__PURE__ */ jsx(Si, { label: "Es un producto original (Apple, Samsung, JBL, Xiaomi, etc.)", v: form.es_original_marca, on: (v) => set("es_original_marca", v), full: true }),
        form.es_original_marca && /* @__PURE__ */ jsxs("p", { className: "sm:col-span-2 text-sm rounded-md bg-warning/10 border border-warning p-3", children: [
          "Los productos originales se abren y se prueban con el cliente antes de que salgan del local, así que",
          /* @__PURE__ */ jsx("b", { children: " no tienen cambio" }),
          ". No se lo prometas: cargá el caso igual y el encargado lo confirma."
        ] }),
        /* @__PURE__ */ jsx(Seccion, { titulo: "Estado del producto" }),
        /* @__PURE__ */ jsx(SiNoPregunta, { label: "¿Se vendió en liquidación o promo?", v: form.prod_liquidacion, on: (v) => set("prod_liquidacion", v) }),
        form.prod_liquidacion && /* @__PURE__ */ jsxs("p", { className: "sm:col-span-2 text-sm rounded-md bg-warning/10 border border-warning p-3", children: [
          "Lo vendido en liquidación o promo ",
          /* @__PURE__ */ jsx("b", { children: "no tiene cambio" }),
          ". No se lo digas al cliente: cargá el caso y lo confirma el encargado."
        ] }),
        /* @__PURE__ */ jsx(SiNoPregunta, { label: "¿Está fallado?", v: form.prod_fallado, on: (v) => set("prod_fallado", v) }),
        form.prod_fallado && /* @__PURE__ */ jsx(F, { label: "Describí la falla *", full: true, children: /* @__PURE__ */ jsx(Textarea, { rows: 2, placeholder: "Ej: el auricular derecho no carga", value: form.prod_falla, onChange: (e) => set("prod_falla", e.target.value) }) }),
        /* @__PURE__ */ jsx(SiNoPregunta, { label: "¿Está completo, con accesorios?", v: form.prod_completo, on: (v) => set("prod_completo", v) }),
        form.prod_completo === false && /* @__PURE__ */ jsxs("p", { className: "sm:col-span-2 text-sm rounded-md bg-warning/10 border border-warning p-3", children: [
          "Si no está completo ",
          /* @__PURE__ */ jsx("b", { children: "no tiene cambio" }),
          ". No se lo digas al cliente: cargá el caso y lo confirma el encargado."
        ] }),
        /* @__PURE__ */ jsx(SiNoPregunta, { label: "¿El packaging está en buen estado?", v: form.prod_packaging_ok, on: (v) => set("prod_packaging_ok", v) }),
        /* @__PURE__ */ jsx(SiNoPregunta, { label: "¿Tiene marcas de uso?", v: form.prod_marcas_uso, on: (v) => set("prod_marcas_uso", v) }),
        form.prod_marcas_uso && /* @__PURE__ */ jsx(F, { label: "Describí las marcas de uso *", full: true, children: /* @__PURE__ */ jsx(Textarea, { rows: 2, placeholder: "Ej: rayas en la carcasa, cera en las gomitas", value: form.prod_marcas_desc, onChange: (e) => set("prod_marcas_desc", e.target.value) }) })
      ] }),
      esVarios && /* @__PURE__ */ jsx(F, { label: "¿De qué se trata? *", full: true, children: /* @__PURE__ */ jsx(Input, { placeholder: "Ej: consulta por una garantía, un pedido especial, un problema con un pago", value: form.tema_detalle, onChange: (e) => set("tema_detalle", e.target.value) }) }),
      tema !== "uso_nc" && /* @__PURE__ */ jsxs(Fragment, { children: [
        /* @__PURE__ */ jsx(F, { label: esReparacion ? "Qué falla ahora (en una frase) *" : esVarios ? "Contá qué pasa *" : "Qué pasa (en una frase) *", full: true, children: /* @__PURE__ */ jsx(Textarea, { rows: 2, placeholder: esReparacion ? "Ej: la pantalla quedó sin imagen" : esVarios ? "Todo lo que haga falta para entender el caso" : "Ej: compró el modelo equivocado", value: form.que_pasa, onChange: (e) => set("que_pasa", e.target.value) }) }),
        /* @__PURE__ */ jsx(F, { label: esVarios ? "Qué probamos o qué hicimos (si aplica)" : "Qué probamos en el local *", full: true, children: /* @__PURE__ */ jsx(Textarea, { rows: 2, placeholder: "Ej: lo cargamos 30 min y probamos con otro cargador: sigue igual", value: form.que_probamos, onChange: (e) => set("que_probamos", e.target.value) }) }),
        /* @__PURE__ */ jsx(F, { label: esVarios ? "Qué pide el cliente (si aplica)" : "Qué pide el cliente *", children: /* @__PURE__ */ jsxs(Select, { value: form.que_pide, onValueChange: (v) => set("que_pide", v), children: [
          /* @__PURE__ */ jsx(SelectTrigger, { children: /* @__PURE__ */ jsx(SelectValue, { placeholder: "Elegí" }) }),
          /* @__PURE__ */ jsx(SelectContent, { children: QUE_PIDE.map((o) => /* @__PURE__ */ jsx(SelectItem, { value: o.v, children: o.l }, o.v)) })
        ] }) }),
        /* @__PURE__ */ jsx(Si, { label: "Nombró Defensa del Consumidor, un abogado o las redes", v: form.amenaza_externa, on: (v) => set("amenaza_externa", v), full: true }),
        /* @__PURE__ */ jsxs("div", { className: "sm:col-span-2 space-y-2", children: [
          /* @__PURE__ */ jsx(Label, { children: esReparacion ? "Fotos del equipo como vuelve y de la orden de ingreso *" : esVarios ? "Fotos (si hacen falta)" : "Fotos del producto, el packaging y el ticket *" }),
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
  ] }) });
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
  const mandarFrase = () => abrirWhatsApp(telWhatsApp(caso.cliente_telefono), `Hola ${caso.cliente_nombre}, te escribimos de MyPhone. Tu número de caso es ${caso.numero}. ${FRASE_FIJA}`);
  return /* @__PURE__ */ jsx(Card, { className: `border-2 ${ui.box}`, children: /* @__PURE__ */ jsxs(CardContent, { className: "p-6 space-y-4", children: [
    /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
      /* @__PURE__ */ jsx(Badge, { className: ui.badge, children: ui.label }),
      /* @__PURE__ */ jsxs("span", { className: "font-semibold", children: [
        "Caso ",
        caso.numero
      ] })
    ] }),
    caso.color === "verde" && /* @__PURE__ */ jsx("div", { className: "space-y-2", children: pideDevolucion(caso) ? /* @__PURE__ */ jsxs(Fragment, { children: [
      /* @__PURE__ */ jsxs("p", { className: "text-lg font-semibold flex items-center gap-2", children: [
        /* @__PURE__ */ jsx(CheckCircle2, { className: "w-5 h-5 text-success" }),
        "Podés hacer la nota de crédito."
      ] }),
      /* @__PURE__ */ jsx("p", { className: "text-sm", children: "Mandá la foto de la nota de crédito al grupo de pendientes." })
    ] }) : /* @__PURE__ */ jsxs(Fragment, { children: [
      /* @__PURE__ */ jsxs("p", { className: "text-lg font-semibold flex items-center gap-2", children: [
        /* @__PURE__ */ jsx(CheckCircle2, { className: "w-5 h-5 text-success" }),
        "Podés hacer el cambio."
      ] }),
      /* @__PURE__ */ jsxs("p", { className: "text-sm", children: [
        caso.motivo_color,
        ". Pasá el cambio por el sistema y avisá en el grupo de pendientes con el botón de abajo."
      ] })
    ] }) }),
    caso.color === "amarillo" && /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
      /* @__PURE__ */ jsx("p", { className: "text-lg font-semibold", children: "Lo decide el encargado de turno." }),
      /* @__PURE__ */ jsxs("p", { className: "text-sm", children: [
        "Motivo: ",
        caso.motivo_color,
        ". No prometas nada. Decile al cliente:"
      ] }),
      caso.es_original_marca && esProducto(caso) && /* @__PURE__ */ jsx("p", { className: "text-sm", children: "Los originales salen probados del local: en principio no tienen cambio. Lo confirma el encargado." }),
      pideDevolucion(caso) && /* @__PURE__ */ jsx("p", { className: "text-sm", children: "Pide devolución: no se devuelve en el momento. Si el encargado la autoriza, se hace con nota de crédito y la emitís vos." }),
      caso.prod_completo === false && /* @__PURE__ */ jsx("p", { className: "text-sm", children: "Si no está completo, en principio no tiene cambio. Lo confirma el encargado." }),
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
      caso.color !== "verde" && /* @__PURE__ */ jsx("p", { className: "text-sm", children: "Cuando el encargado lo resuelva, lo vas a ver en la pestaña Casos y vas a tener que avisar la resolución." }),
      /* @__PURE__ */ jsx("p", { className: "text-sm text-muted-foreground", children: "Abrí el resumen, copialo y pegalo en el grupo de pendientes junto con las fotos." }),
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
    let query = db.from("reclamos").select("*").order("created_at", {
      ascending: false
    }).limit(300);
    if (!verResueltos) query = query.or("estado.neq.resuelto,and(avisado_resolucion_at.is.null,color.neq.verde)");
    if (sesion.modo === "local") query = query.eq("sucursal_id", sesion.sucursal_id);
    const {
      data,
      error
    } = await query;
    setLoading(false);
    if (error) return toast.error(error.message);
    setItems(await conNombreLocal(data || []));
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
          /* @__PURE__ */ jsx("span", { className: "text-sm text-muted-foreground", children: r.sucursal_nombre }),
          /* @__PURE__ */ jsx(Badge, { variant: "outline", children: ESTADOS[r.estado] }),
          atrasado && /* @__PURE__ */ jsxs(Badge, { className: "bg-destructive text-destructive-foreground", children: [
            /* @__PURE__ */ jsx(Clock, { className: "w-3 h-3 mr-1" }),
            "Atrasado"
          ] }),
          !r.avisado_grupo_at && /* @__PURE__ */ jsx(Badge, { variant: "outline", className: "border-destructive text-destructive", children: "Sin avisar al grupo" }),
          faltaAvisarResolucion(r) && /* @__PURE__ */ jsx(Badge, { className: "bg-destructive text-destructive-foreground", children: "Resuelto: avisar al grupo" })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "text-sm", children: [
          /* @__PURE__ */ jsx("b", { children: r.cliente_nombre }),
          " · ",
          temaDe(r.tipo),
          r.producto_u_orden ? ` · ${r.producto_u_orden}` : r.tema_detalle ? ` · ${r.tema_detalle}` : ""
        ] }),
        /* @__PURE__ */ jsx("div", { className: "text-sm text-muted-foreground", children: r.que_pasa }),
        r.estado === "resuelto" && r.resolucion && /* @__PURE__ */ jsxs("div", { className: "text-sm", children: [
          /* @__PURE__ */ jsx("b", { children: "Resolución:" }),
          " ",
          r.resolucion
        ] }),
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
function faltaAvisarResolucion(r) {
  return r.estado === "resuelto" && r.color !== "verde" && !r.avisado_resolucion_at;
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
  const [avisadoResAt, setAvisadoResAt] = useState(caso.avisado_resolucion_at);
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
    } = await db.from("reclamos").select("*").eq("id", caso.id).single();
    if (nuevo) setCaso((await conNombreLocal([nuevo]))[0]);
    await cargarEventos();
    toast.success(`Caso ${caso.numero} actualizado. Mandá el resumen al grupo.`);
    onGuardado();
  };
  const [verResumen, setVerResumen] = useState(false);
  const copiarResumen = async () => {
    await copiarTexto(textoResumen(caso, eventos));
    toast.success("Resumen copiado: pegalo en el grupo de pendientes");
  };
  const autorizarNC = () => guardar({
    nota_credito_autorizada_por: nombre || "encargado"
  });
  const mandarFrase = () => abrirWhatsApp(telWhatsApp(caso.cliente_telefono), `Hola ${caso.cliente_nombre}, te escribimos de MyPhone. Tu número de caso es ${caso.numero}. ${FRASE_FIJA}`);
  const ui = COLOR_UI[caso.color] ?? COLOR_UI.amarillo;
  return /* @__PURE__ */ jsxs(Dialog, { open: true, onOpenChange: (o) => !o && onClose(), children: [
    /* @__PURE__ */ jsxs(DialogContent, { className: "max-w-2xl max-h-[90vh] overflow-y-auto", children: [
      /* @__PURE__ */ jsx(DialogHeader, { children: /* @__PURE__ */ jsxs(DialogTitle, { className: "flex flex-wrap items-center gap-2", children: [
        /* @__PURE__ */ jsx(Badge, { className: ui.badge, children: ui.label }),
        " ",
        caso.numero,
        /* @__PURE__ */ jsxs("span", { className: "text-sm font-normal text-muted-foreground", children: [
          caso.sucursal_nombre,
          " · ",
          ESTADOS[caso.estado]
        ] })
      ] }) }),
      /* @__PURE__ */ jsxs("div", { className: "space-y-4 text-sm", children: [
        /* @__PURE__ */ jsx("p", { className: "text-muted-foreground", children: caso.motivo_color }),
        /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1", children: [
          /* @__PURE__ */ jsx(Dato, { l: "Cliente", v: `${caso.cliente_nombre} · ${caso.cliente_telefono}` }),
          /* @__PURE__ */ jsx(Dato, { l: "Vendedor", v: caso.atendido_por }),
          /* @__PURE__ */ jsx(Dato, { l: "Tema", v: temaDe(caso.tipo) }),
          caso.tema_detalle && /* @__PURE__ */ jsx(Dato, { l: "De qué se trata", v: caso.tema_detalle }),
          caso.tipo === "reparacion" ? /* @__PURE__ */ jsxs(Fragment, { children: [
            /* @__PURE__ */ jsx(Dato, { l: "Orden y equipo", v: caso.producto_u_orden }),
            /* @__PURE__ */ jsx(Dato, { l: "Ingresó", v: fechaCorta(caso.rep_fecha_ingreso) }),
            /* @__PURE__ */ jsx(Dato, { l: "Se entregó", v: fechaCorta(caso.fecha_compra) }),
            /* @__PURE__ */ jsx(Dato, { l: "Taller", v: caso.rep_taller || "—" }),
            /* @__PURE__ */ jsx(Dato, { l: "Repuesto", v: caso.rep_calidad || "—" }),
            /* @__PURE__ */ jsx(Dato, { l: "Presupuesto", v: caso.rep_presupuesto || "—" }),
            /* @__PURE__ */ jsx(Dato, { l: "Seña", v: caso.rep_sena || "—" }),
            /* @__PURE__ */ jsx(Dato, { l: "Saldo", v: caso.rep_saldo || "—" }),
            /* @__PURE__ */ jsx(Dato, { l: "Cómo vuelve", v: labelDe(ESTADOS_TODOS, caso.estado_producto) })
          ] }) : esProducto(caso) ? /* @__PURE__ */ jsxs(Fragment, { children: [
            /* @__PURE__ */ jsx(Dato, { l: "Producto", v: caso.producto_u_orden }),
            /* @__PURE__ */ jsx(Dato, { l: "Compró", v: fechaCorta(caso.fecha_compra) }),
            /* @__PURE__ */ jsx(Dato, { l: "Pagó con", v: caso.forma_pago }),
            /* @__PURE__ */ jsx(Dato, { l: "Ticket", v: caso.con_ticket ? "Sí" : "No" }),
            /* @__PURE__ */ jsx(Dato, { l: "Original", v: caso.es_original_marca ? "Sí" : "No" }),
            caso.prod_fallado != null ? /* @__PURE__ */ jsxs(Fragment, { children: [
              /* @__PURE__ */ jsx(Dato, { l: "Fallado", v: siNo(caso.prod_fallado) + (caso.prod_fallado && caso.prod_falla ? ` (${caso.prod_falla})` : "") }),
              /* @__PURE__ */ jsx(Dato, { l: "Completo con accesorios", v: siNo(caso.prod_completo) }),
              /* @__PURE__ */ jsx(Dato, { l: "Packaging en buen estado", v: siNo(caso.prod_packaging_ok) }),
              /* @__PURE__ */ jsx(Dato, { l: "Marcas de uso", v: siNo(caso.prod_marcas_uso) + (caso.prod_marcas_uso && caso.prod_marcas_desc ? ` (${caso.prod_marcas_desc})` : "") }),
              caso.prod_liquidacion != null && /* @__PURE__ */ jsx(Dato, { l: "Liquidación o promo", v: siNo(caso.prod_liquidacion) })
            ] }) : /* @__PURE__ */ jsx(Dato, { l: "Estado del producto", v: labelDe(ESTADOS_TODOS, caso.estado_producto) })
          ] }) : null,
          caso.que_pide && /* @__PURE__ */ jsx(Dato, { l: "Pide", v: labelDe(QUE_PIDE_TODOS, caso.que_pide) }),
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
        caso.que_probamos && /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("b", { children: "Qué probamos:" }),
          " ",
          caso.que_probamos
        ] }),
        caso.resolucion && /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("b", { children: "Resolución:" }),
          " ",
          caso.resolucion
        ] }),
        pideDevolucion(caso) && caso.nota_credito_autorizada_por && !caso.nota_credito_nro && /* @__PURE__ */ jsxs("p", { className: "rounded-md border border-success bg-success/10 p-3", children: [
          /* @__PURE__ */ jsx("b", { children: "Nota de crédito autorizada." }),
          " El local la emite en el sistema por el total y le avisa al cliente."
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
        caso.estado === "resuelto" && caso.color !== "verde" && (avisadoResAt ? /* @__PURE__ */ jsxs("p", { className: "text-sm flex items-center gap-1", children: [
          /* @__PURE__ */ jsx(CheckCircle2, { className: "w-4 h-4 text-success" }),
          "Resolución avisada al grupo ",
          fecha(avisadoResAt),
          caso.avisado_resolucion_por ? ` por ${caso.avisado_resolucion_por}` : ""
        ] }) : /* @__PURE__ */ jsxs("div", { className: "rounded-md border-2 border-destructive p-3 space-y-2", children: [
          /* @__PURE__ */ jsx("p", { className: "font-semibold", children: "Caso resuelto: avisá en el grupo de pendientes qué se hizo." }),
          caso.resolucion && /* @__PURE__ */ jsxs("p", { className: "text-sm", children: [
            /* @__PURE__ */ jsx("b", { children: "Resolución:" }),
            " ",
            caso.resolucion
          ] }),
          /* @__PURE__ */ jsx(BotonesGrupo, { caso, files: async () => [], momento: "resolucion", texto: () => textoResumen(caso, eventos), onAvisado: () => {
            setAvisadoResAt((/* @__PURE__ */ new Date()).toISOString());
            onGuardado();
          } })
        ] })),
        /* @__PURE__ */ jsxs("div", { className: "flex flex-wrap gap-2", children: [
          /* @__PURE__ */ jsxs(Button, { size: "sm", variant: "secondary", onClick: mandarFrase, children: [
            /* @__PURE__ */ jsx(MessageCircle, { className: "w-4 h-4 mr-1" }),
            "Mandar la frase fija al cliente"
          ] }),
          puedeGestionar && caso.color !== "verde" && /* @__PURE__ */ jsxs(Button, { size: "sm", variant: "outline", onClick: () => setVerResumen(true), children: [
            /* @__PURE__ */ jsx(Send, { className: "w-4 h-4 mr-1" }),
            "Resumen para el grupo"
          ] })
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
          (pideDevolucion(caso) || caso.nota_credito_autorizada_por) && /* @__PURE__ */ jsx(F, { label: "N° de nota de crédito (cuando se emita)", children: /* @__PURE__ */ jsx(Input, { value: g.nota_credito_nro, onChange: (e) => setG({
            ...g,
            nota_credito_nro: e.target.value
          }) }) }),
          /* @__PURE__ */ jsxs("div", { className: "sm:col-span-2 flex flex-wrap gap-2", children: [
            /* @__PURE__ */ jsx(Button, { onClick: () => guardar(), disabled: guardando, children: "Guardar" }),
            pideDevolucion(caso) && !caso.nota_credito_autorizada_por && /* @__PURE__ */ jsx(Button, { variant: "outline", onClick: autorizarNC, disabled: guardando, children: "Autorizar nota de crédito" })
          ] })
        ] }) }),
        /* @__PURE__ */ jsx(Card, { className: "border-primary/40", children: /* @__PURE__ */ jsxs(CardContent, { className: "p-3 space-y-2", children: [
          /* @__PURE__ */ jsx("h3", { className: "font-semibold", children: "Resumen del caso" }),
          /* @__PURE__ */ jsx("p", { className: "text-xs text-muted-foreground", children: "Cuenta todo lo que pasó, listo para mandar al grupo de pendientes. Se actualiza solo con cada cambio o comentario." }),
          /* @__PURE__ */ jsx("pre", { className: "whitespace-pre-wrap text-xs bg-muted rounded-md p-3 font-sans max-h-64 overflow-y-auto", children: textoResumen(caso, eventos) }),
          /* @__PURE__ */ jsx("div", { className: "flex flex-wrap gap-2", children: /* @__PURE__ */ jsxs(Button, { size: "sm", onClick: copiarResumen, children: [
            /* @__PURE__ */ jsx(Send, { className: "w-4 h-4 mr-1" }),
            "Copiar resumen"
          ] }) })
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
    ] }),
    verResumen && /* @__PURE__ */ jsx(ResumenGrupo, { titulo: `Resumen del caso ${caso.numero}`, texto: textoResumen(caso, eventos), onClose: () => setVerResumen(false) })
  ] });
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
function SiNoPregunta({
  label,
  v,
  on
}) {
  return /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between gap-3 rounded-md border p-3", children: [
    /* @__PURE__ */ jsxs("span", { className: "text-sm", children: [
      label,
      " *"
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "flex gap-1", children: [
      /* @__PURE__ */ jsx(Button, { type: "button", size: "sm", variant: v === true ? "default" : "outline", onClick: () => on(true), children: "Sí" }),
      /* @__PURE__ */ jsx(Button, { type: "button", size: "sm", variant: v === false ? "default" : "outline", onClick: () => on(false), children: "No" })
    ] })
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
