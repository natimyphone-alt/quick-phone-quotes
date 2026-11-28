import { createFileRoute } from "@tanstack/react-router";
import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Camera, CheckCircle2, Clock, MessageCircle, RefreshCw, Search, Send, X } from "lucide-react";
import { abrirWhatsApp } from "@/lib/whatsapp";

export const Route = createFileRoute("/app/reclamos")({
  component: ReclamosPage,
});

// Las tablas de reclamos todavía no están en los tipos generados de Supabase.
const db = supabase as any;

// ------------------------------------------------------------------
// Textos y opciones
// ------------------------------------------------------------------
const FRASE_FIJA = "Vamos a revisar tu caso y te contactamos a la brevedad.";

const TEMAS = [
  { v: "producto", l: "Producto" },
  { v: "reparacion", l: "Reparación (reingreso)" },
  { v: "varios", l: "Varios" },
  { v: "uso_nc", l: "Uso de nota de crédito (próximamente)", deshabilitado: true },
];
// Temas de casos cargados antes de la etapa 1
const TEMAS_VIEJOS = [
  { v: "cambio", l: "Producto" },
  { v: "reclamo", l: "Varios" },
];
// Estados de producto usados antes de la etapa 1 (solo para mostrar casos viejos)
const ESTADOS_PRODUCTO = [
  { v: "sellado", l: "Sellado, sin abrir" },
  { v: "intacto_completo", l: "Abierto pero impecable y completo" },
  { v: "abierto_completo", l: "Abierto, usado, completo" },
  { v: "usado", l: "Usado / con marcas de uso" },
  { v: "danado", l: "Dañado (golpe, roto, mojado)" },
  { v: "incompleto", l: "Le falta algo (caja, cable, accesorio)" },
];
// Cómo vuelve un equipo reparado (reingresos)
const ESTADOS_EQUIPO = [
  { v: "eq_igual", l: "Igual que cuando se entregó (sin marcas nuevas)" },
  { v: "eq_golpeado", l: "Con golpes, rayas o vidrio roto nuevos" },
  { v: "eq_mojado", l: "Mojado o con señales de humedad" },
  { v: "eq_manipulado", l: "Abierto o tocado por otro técnico" },
  { v: "eq_falta_pieza", l: "Le falta algo (tornillos, tapa, bandeja SIM)" },
];
const ESTADOS_TODOS = [...ESTADOS_PRODUCTO, ...ESTADOS_EQUIPO];
const QUE_PIDE = [
  { v: "cambio", l: "Cambio de producto" },
  { v: "devolucion", l: "Devolución (nota de crédito)" },
];
// Opciones de casos viejos (solo para mostrarlos)
const QUE_PIDE_TODOS = [
  ...QUE_PIDE,
  { v: "nota_credito", l: "Nota de crédito" },
  { v: "revision", l: "Que revisemos el equipo / una respuesta" },
];
const pideDevolucion = (c: any) => c.que_pide === "devolucion" || c.que_pide === "nota_credito";
const FORMAS_PAGO = ["Efectivo", "Débito", "Crédito", "QR / Mercado Pago", "Transferencia", "Nota de crédito"];
const CALIDADES = ["Original", "OLED", "No lleva repuesto"];

const ESTADOS: Record<string, string> = {
  nuevo: "Nuevo",
  en_revision: "En revisión",
  esperando_taller: "Esperando taller",
  esperando_cliente: "Esperando cliente",
  con_vanesa: "Con Vanesa",
  resuelto: "Resuelto",
};

const COLOR_UI: Record<string, { label: string; badge: string; box: string }> = {
  verde: { label: "VERDE", badge: "bg-success text-success-foreground", box: "border-success bg-success/10" },
  amarillo: { label: "AMARILLO", badge: "bg-warning text-warning-foreground", box: "border-warning bg-warning/10" },
  rojo: { label: "ROJO", badge: "bg-destructive text-destructive-foreground", box: "border-destructive bg-destructive/10" },
};

const labelDe = (lista: { v: string; l: string }[], v: string) => lista.find(x => x.v === v)?.l ?? v;
const temaDe = (v: string) => labelDe([...TEMAS, ...TEMAS_VIEJOS], v);
const esProducto = (c: any) => c.tipo === "producto" || c.tipo === "cambio";
const siNo = (v: any) => (v === true ? "Sí" : v === false ? "No" : "—");
const hoyISO = () => new Date().toLocaleDateString("en-CA");
const fecha = (iso?: string | null) => (iso ? new Date(iso).toLocaleString("es-AR", { dateStyle: "short", timeStyle: "short", hour12: false }) : "—");
const fechaCorta = (d?: string | null) => (d ? new Date(d + "T12:00:00").toLocaleDateString("es-AR") : "—");

// Teléfonos de Neuquén/Río Negro: 2994721359 → 5492994721359 para WhatsApp
function telWhatsApp(tel?: string | null) {
  let t = (tel || "").replace(/\D/g, "");
  if (t.startsWith("0")) t = t.slice(1);
  if (t.length === 10) t = "549" + t;
  return t;
}

// Achica las fotos del celular antes de subirlas (máx. 1600 px, JPEG)
async function comprimirImagen(file: File): Promise<Blob> {
  if (!file.type.startsWith("image/")) return file;
  try {
    const bmp = await createImageBitmap(file);
    const escala = Math.min(1, 1600 / Math.max(bmp.width, bmp.height));
    const canvas = document.createElement("canvas");
    canvas.width = Math.round(bmp.width * escala);
    canvas.height = Math.round(bmp.height * escala);
    canvas.getContext("2d")!.drawImage(bmp, 0, 0, canvas.width, canvas.height);
    return await new Promise<Blob>(res => canvas.toBlob(b => res(b || file), "image/jpeg", 0.8));
  } catch {
    return file;
  }
}

// ------------------------------------------------------------------
// Locales (se leen con una función de la base)
// ------------------------------------------------------------------
type Local = { id: string; nombre: string };
let localesCache: Promise<Local[]> | null = null;
function cargarLocales(): Promise<Local[]> {
  if (!localesCache) {
    localesCache = (db.rpc("reclamos_sucursales") as Promise<any>).then(({ data, error }: any) => {
      if (error) {
        localesCache = null;
        toast.error("No se pudieron leer los locales: falta correr la actualización de locales en Supabase");
        return [];
      }
      return (data || []).map((x: any) => ({ id: String(x.id), nombre: x.nombre }));
    });
  }
  return localesCache as Promise<Local[]>;
}
// Agrega el nombre del local a cada caso
async function conNombreLocal<T extends { sucursal_id?: any }>(casos: T[]): Promise<(T & { sucursal_nombre?: string })[]> {
  const locales = await cargarLocales();
  return casos.map(c => ({ ...c, sucursal_nombre: locales.find(l => l.id === String(c.sucursal_id))?.nombre }));
}

// ------------------------------------------------------------------
// Sesión: sale del usuario del Hub (un usuario por local)
// ------------------------------------------------------------------
type Sesion = { modo: "local" | "encargado"; sucursal_id?: string; nombre: string };
const CLAVE_VENDEDOR = "pendientes_vendedor";
const leerVendedor = () => { try { return localStorage.getItem(CLAVE_VENDEDOR) || ""; } catch { return ""; } };
const guardarVendedor = (v: string) => { try { localStorage.setItem(CLAVE_VENDEDOR, v); } catch { /* sin almacenamiento */ } };

const SesionCtx = createContext<Sesion>({ modo: "local", nombre: "" });
const useSesion = () => useContext(SesionCtx);

// ------------------------------------------------------------------
// Página
// ------------------------------------------------------------------
function ReclamosPage() {
  const { user, isAdmin, nombre, sucursalId } = useAuth();
  const [rol, setRol] = useState<string | null>(null);
  const [tab, setTab] = useState("nuevo");
  const [recarga, setRecarga] = useState(0);
  const [vendedor, setVendedor] = useState("");

  // Se vuelve a consultar el rol cuando cambia el usuario (por ejemplo, al terminar de iniciar sesión)
  useEffect(() => {
    if (!user) return;
    db.rpc("reclamos_rol").then(({ data }: any) => setRol(data || ""));
  }, [user?.id]);
  useEffect(() => { setVendedor(leerVendedor()); }, []);

  if (rol === null) return <p className="text-muted-foreground">Cargando...</p>;

  const loginAdmin = isAdmin || rol === "administrador";
  const puedeGestionar = loginAdmin || rol === "encargado";

  if (rol === "tecnico") {
    return <p className="text-muted-foreground py-8 text-center">Pendientes no está disponible para el usuario técnico.</p>;
  }
  if (!puedeGestionar && !sucursalId) {
    return (
      <p className="text-destructive py-8 text-center">
        Este usuario no tiene un local asignado. Pedile a Vanesa que lo asigne en la tabla de usuarios.
      </p>
    );
  }

  const sesion: Sesion = puedeGestionar
    ? { modo: "encargado", nombre: nombre || (loginAdmin ? "Administración" : "Encargado") }
    : { modo: "local", sucursal_id: String(sucursalId), nombre: vendedor || nombre || "Vendedor" };

  return (
    <SesionCtx.Provider value={sesion}>
      <div className="space-y-4">
        <div className="flex flex-wrap items-end justify-between gap-2">
          <div>
            <h1 className="text-2xl font-bold">Pendientes</h1>
            <p className="text-sm text-muted-foreground">{puedeGestionar ? "Todos los locales" : nombre}</p>
          </div>
          {!puedeGestionar && (
            <div className="w-48 space-y-1">
              <Label className="text-xs">Vendedor de turno</Label>
              <Input value={vendedor} placeholder="Tu nombre"
                onChange={e => { setVendedor(e.target.value); guardarVendedor(e.target.value); }} />
            </div>
          )}
        </div>

        <Tabs value={tab} onValueChange={setTab}>
          <TabsList className={`grid w-full ${puedeGestionar ? "grid-cols-3" : "grid-cols-2"}`}>
            <TabsTrigger value="nuevo">Nuevo caso</TabsTrigger>
            <TabsTrigger value="casos">Casos</TabsTrigger>
            {puedeGestionar && <TabsTrigger value="resumen">Resumen</TabsTrigger>}
          </TabsList>

          <TabsContent value="nuevo">
            <NuevoCaso puedeElegirLocal={puedeGestionar} onCreado={() => setRecarga(r => r + 1)} irACasos={() => setTab("casos")} />
          </TabsContent>
          <TabsContent value="casos">
            <ListaCasos puedeGestionar={puedeGestionar} recarga={recarga} />
          </TabsContent>
          {puedeGestionar && (
            <TabsContent value="resumen">
              <Resumen esAdmin={loginAdmin} />
            </TabsContent>
          )}
        </Tabs>
      </div>
    </SesionCtx.Provider>
  );
}

// ------------------------------------------------------------------
// Aviso al grupo de pendientes
// ------------------------------------------------------------------
const TIPO_CORTO: Record<string, string> = {
  producto: "PRODUCTO", reparacion: "REINGRESO", varios: "VARIOS", uso_nc: "USO DE NOTA DE CRÉDITO",
  cambio: "PRODUCTO", reclamo: "VARIOS",
};

function textoGrupo(c: any, local?: string, conFotos = false) {
  const color = COLOR_UI[c.color]?.label ?? "";
  const l: string[] = [];
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

// Resumen completo del caso: ficha + todo lo que pasó + cómo quedó
function textoResumen(c: any, eventos: any[]) {
  const color = COLOR_UI[c.color]?.label ?? "";
  const ficha = textoGrupo(c).split("\n");
  // la ficha sin su título ni sus líneas finales (motivo y fotos)
  const fin = ficha.findIndex(x => x === "");
  const cuerpo = ficha.slice(1, fin === -1 ? undefined : fin);
  const l: string[] = [];
  l.push(`*RESUMEN CASO ${c.numero} – ${color} – ${TIPO_CORTO[c.tipo] ?? c.tipo}*`);
  l.push(`Estado: ${ESTADOS[c.estado] ?? c.estado}${c.responsable ? ` · Lo tiene: ${c.responsable}` : ""}`);
  l.push("");
  l.push(...cuerpo);
  l.push("");
  l.push("*Qué pasó:*");
  eventos.forEach(e => {
    const cuando = new Date(e.created_at).toLocaleString("es-AR", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit", hour12: false });
    // "Estado: nuevo → con_vanesa" → "Estado: Nuevo → Con Vanesa"
    const texto = e.tipo === "comentario"
      ? `"${e.texto}"`
      : String(e.texto).replace(/\b(nuevo|en_revision|esperando_taller|esperando_cliente|con_vanesa|resuelto|verde|amarillo|rojo)\b/g,
          (m: string) => ESTADOS[m] ?? COLOR_UI[m]?.label ?? m);
    l.push(`- ${cuando} · ${e.autor}: ${texto}`);
  });
  l.push("");
  if (c.resolucion) l.push(`*Decisión:* ${c.resolucion}`);
  if (c.nota_credito_autorizada_por)
    l.push(`*Nota de crédito:* autorizada por ${c.nota_credito_autorizada_por}${c.nota_credito_nro ? ` · N° ${c.nota_credito_nro}` : ""}`);
  if (c.estado === "resuelto") l.push(`*Caso cerrado*${c.resuelto_at ? ` el ${fecha(c.resuelto_at)}` : ""}`);
  else if (c.vence_at) l.push(`Plazo para resolver: ${fecha(c.vence_at)}`);
  return l.join("\n").replace(/\n{3,}/g, "\n\n");
}

// Solo en el celular se ofrece "Compartir" (en la compu abre la app de escritorio y se traba)
const esCelular = () => /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);

async function compartirCelular(texto: string, files: File[] = []): Promise<boolean> {
  const nav: any = navigator;
  try {
    if (files.length && nav.canShare?.({ files, text: texto })) await nav.share({ files, text: texto });
    else await nav.share({ text: texto });
    return true;
  } catch {
    return false;
  }
}

async function copiarTexto(texto: string) {
  try {
    await navigator.clipboard.writeText(texto);
  } catch {
    // Navegadores viejos
    const t = document.createElement("textarea");
    t.value = texto; document.body.appendChild(t); t.select(); document.execCommand("copy"); t.remove();
  }
}

// Ventana con el resumen listo para copiar y pegar en el grupo de pendientes
function ResumenGrupo({ titulo, texto, files, onListo, onClose }: {
  titulo: string; texto: string; files?: () => Promise<File[]>; onListo?: () => void; onClose: () => void;
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
    if (await compartirCelular(texto, fs)) { setListo(true); onListo?.(); }
  };
  return (
    <Dialog open onOpenChange={o => !o && onClose()}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader><DialogTitle>{titulo}</DialogTitle></DialogHeader>
        <pre className="whitespace-pre-wrap text-sm bg-muted rounded-md p-3 font-sans max-h-[50vh] overflow-y-auto">{texto}</pre>
        <p className="text-sm text-muted-foreground">
          Tocá <b>Copiar resumen</b>, abrí el grupo de pendientes en WhatsApp y pegalo. Las fotos adjuntalas vos.
        </p>
        <div className="flex flex-wrap gap-2">
          <Button onClick={copiar}><Send className="w-4 h-4 mr-1" />Copiar resumen</Button>
          {esCelular() && <Button variant="outline" onClick={compartir}>Compartir (con fotos)</Button>}
          <Button variant="ghost" onClick={onClose}>{listo ? "Listo" : "Cerrar"}</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

async function marcarAvisado(id: number, autor: string, momento: "alta" | "resolucion" = "alta") {
  const { error } = await db.rpc("reclamos_marcar_avisado", { p_id: id, p_autor: autor, p_momento: momento });
  if (error) toast.error(`No se pudo registrar el aviso: ${error.message}`);
  return !error;
}

function BotonesGrupo({ caso, local, files, onAvisado, momento = "alta", texto }: {
  caso: any; local?: string; files: () => Promise<File[]>; onAvisado: () => void;
  momento?: "alta" | "resolucion"; texto?: () => string;
}) {
  const sesion = useSesion();
  const [abierto, setAbierto] = useState(false);
  const [avisado, setAvisado] = useState(false);
  const cerrar = () => { setAbierto(false); if (avisado) onAvisado(); };
  return (
    <>
      <Button onClick={() => setAbierto(true)}>
        <Send className="w-4 h-4 mr-1" />{momento === "resolucion" ? "Resumen de la resolución para el grupo" : "Resumen para el grupo de pendientes"}
      </Button>
      {abierto && (
        <ResumenGrupo
          titulo={momento === "resolucion" ? `Resolución del caso ${caso.numero}` : `Caso ${caso.numero}`}
          texto={texto ? texto() : textoGrupo(caso, local)}
          files={momento === "alta" ? files : undefined}
          onListo={async () => { if (!avisado && (await marcarAvisado(caso.id, sesion.nombre, momento))) setAvisado(true); }}
          onClose={cerrar}
        />
      )}
    </>
  );
}

// ------------------------------------------------------------------
// 1. Nuevo caso (la ficha)
// ------------------------------------------------------------------
type SN = boolean | null; // pregunta de sí o no: null = sin responder

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
  prod_fallado: null as SN,
  prod_falla: "",
  prod_completo: null as SN,
  prod_packaging_ok: null as SN,
  prod_marcas_uso: null as SN,
  prod_marcas_desc: "",
  prod_liquidacion: null as SN,
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
  rep_saldo: "",
};

const CAMPOS_REP = ["rep_fecha_ingreso", "rep_taller", "rep_trabajo", "rep_calidad", "rep_remito", "rep_presupuesto", "rep_sena", "rep_saldo"] as const;
const CAMPOS_PROD = ["prod_fallado", "prod_falla", "prod_completo", "prod_packaging_ok", "prod_marcas_uso", "prod_marcas_desc", "prod_liquidacion"] as const;

function NuevoCaso({ puedeElegirLocal, onCreado, irACasos }: { puedeElegirLocal: boolean; onCreado: () => void; irACasos: () => void }) {
  const { user } = useAuth();
  const sesion = useSesion();
  const sucursalId = sesion.modo === "local" ? sesion.sucursal_id : undefined;
  const nombre = sesion.modo === "local" ? leerVendedor() : sesion.nombre;
  const [form, setForm] = useState({ ...FORM_VACIO });
  const [fotos, setFotos] = useState<File[]>([]);
  const [sucursales, setSucursales] = useState<Local[]>([]);
  const [enviando, setEnviando] = useState(false);
  const [creado, setCreado] = useState<any>(null);
  const [fotosCreado, setFotosCreado] = useState<File[]>([]);

  useEffect(() => {
    cargarLocales().then(setSucursales);
  }, []);
  useEffect(() => {
    setForm(f => ({ ...f, sucursal_id: f.sucursal_id || sucursalId || "", atendido_por: f.atendido_por || nombre || "" }));
  }, [sucursalId, nombre]);

  const set = (k: keyof typeof FORM_VACIO, v: any) => setForm(f => ({ ...f, [k]: v }));
  const tema = form.tipo;
  const esReparacion = tema === "reparacion";
  const esProd = tema === "producto";
  const esVarios = tema === "varios";

  const faltantes = () => {
    const f: string[] = [];
    const vacio = (v: string) => !v || !v.trim();
    if (!form.sucursal_id) f.push("local");
    if (vacio(form.atendido_por)) f.push("vendedor");
    if (vacio(form.cliente_nombre)) f.push("nombre del cliente");
    if (form.cliente_telefono.replace(/\D/g, "").length < 8) f.push("teléfono del cliente");
    if (esReparacion) {
      if (vacio(form.producto_u_orden)) f.push("N° de orden y equipo");
      if (!form.rep_fecha_ingreso) f.push("fecha de ingreso");
      if (!form.fecha_compra) f.push("fecha de entrega");
      if (form.rep_fecha_ingreso && form.fecha_compra && form.rep_fecha_ingreso > form.fecha_compra)
        f.push("la fecha de ingreso no puede ser posterior a la de entrega");
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
      const rutas: string[] = [];
      const comprimidas: File[] = [];
      for (let i = 0; i < fotos.length; i++) {
        const blob = await comprimirImagen(fotos[i]);
        comprimidas.push(new File([blob], `foto-${i + 1}.jpg`, { type: "image/jpeg" }));
        const ruta = `${form.sucursal_id}/${Date.now()}-${i}.jpg`;
        const { error } = await supabase.storage.from("reclamos").upload(ruta, blob, { contentType: "image/jpeg" });
        if (error) throw new Error(`No se pudo subir la foto ${i + 1}: ${error.message}`);
        rutas.push(ruta);
      }

      const datos: Record<string, any> = { ...form, user_id: user.id, fotos: rutas };
      const vaciar = (campos: readonly string[]) => campos.forEach(k => (datos[k] = null));
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
        // Varios
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

      const { data, error } = await db.from("reclamos").insert(datos).select("*").single();
      if (error) throw new Error(error.message);
      if (sesion.modo === "local") guardarVendedor(form.atendido_por.trim());
      setFotosCreado(comprimidas);
      setCreado(data);
      onCreado();
    } catch (e: any) {
      toast.error(e.message || "No se pudo guardar el caso");
    } finally {
      setEnviando(false);
    }
  };

  const otroCaso = () => {
    setCreado(null);
    setFotos([]);
    setFotosCreado([]);
    setForm({ ...FORM_VACIO, sucursal_id: form.sucursal_id, atendido_por: form.atendido_por });
  };

  if (creado) {
    const local = sucursales.find(s => s.id === String(creado.sucursal_id))?.nombre;
    return <Resultado caso={creado} local={local} fotos={fotosCreado} otroCaso={otroCaso} irACasos={irACasos} />;
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader><CardTitle>Ficha del caso</CardTitle></CardHeader>
        <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {puedeElegirLocal && (
            <F label="Local *">
              <Select value={form.sucursal_id} onValueChange={v => set("sucursal_id", v)}>
                <SelectTrigger><SelectValue placeholder="Elegí el local" /></SelectTrigger>
                <SelectContent>{sucursales.map(s => <SelectItem key={s.id} value={s.id}>{s.nombre}</SelectItem>)}</SelectContent>
              </Select>
            </F>
          )}
          <F label="Vendedor *"><Input value={form.atendido_por} onChange={e => set("atendido_por", e.target.value)} /></F>

          <F label="Tema *" full>
            <Select value={form.tipo} onValueChange={v => setForm(f => ({ ...f, tipo: v, estado_producto: "", rep_calidad: "" }))}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {TEMAS.map(o => <SelectItem key={o.v} value={o.v} disabled={o.deshabilitado}>{o.l}</SelectItem>)}
              </SelectContent>
            </Select>
          </F>

          <F label="Nombre del cliente *"><Input value={form.cliente_nombre} onChange={e => set("cliente_nombre", e.target.value)} /></F>
          <F label="Teléfono del cliente *">
            <Input inputMode="tel" placeholder="299 4 123456" value={form.cliente_telefono} onChange={e => set("cliente_telefono", e.target.value)} />
          </F>

          {esReparacion && (
            <>
              <Seccion titulo="Datos de la reparación original" />
              <F label="N° de orden y equipo *" full>
                <Input placeholder="Ej: 343R Moto G51" value={form.producto_u_orden} onChange={e => set("producto_u_orden", e.target.value)} />
              </F>
              <F label="Cuándo ingresó el equipo *">
                <Input type="date" max={hoyISO()} value={form.rep_fecha_ingreso} onChange={e => set("rep_fecha_ingreso", e.target.value)} />
              </F>
              <F label="Cuándo se le entregó al cliente *">
                <Input type="date" max={hoyISO()} value={form.fecha_compra} onChange={e => set("fecha_compra", e.target.value)} />
              </F>
              <F label="En qué taller se reparó *">
                <Input placeholder="Ej: Lucas, Illia, Tana" value={form.rep_taller} onChange={e => set("rep_taller", e.target.value)} />
              </F>
              <F label="Calidad del repuesto que se puso *">
                <Select value={form.rep_calidad} onValueChange={v => set("rep_calidad", v)}>
                  <SelectTrigger><SelectValue placeholder="Elegí" /></SelectTrigger>
                  <SelectContent>{CALIDADES.map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}</SelectContent>
                </Select>
              </F>
              <F label="Qué se le hizo (todo lo que hizo el taller, no solo el motivo de ingreso) *" full>
                <Textarea rows={2} placeholder="Ej: cambio de batería y reparación de capacitor en placa" value={form.rep_trabajo} onChange={e => set("rep_trabajo", e.target.value)} />
              </F>
              <F label="Qué dice el remito / orden de ingreso *" full>
                <Textarea rows={2} placeholder="Cómo ingresó: golpes, rayas, tornillos, qué funcionaba y qué no, si se avisó que se borraban los datos" value={form.rep_remito} onChange={e => set("rep_remito", e.target.value)} />
              </F>
              <F label="Presupuesto que se pasó *" full>
                <Input placeholder="Ej: $85.000 módulo OLED con colocación" value={form.rep_presupuesto} onChange={e => set("rep_presupuesto", e.target.value)} />
              </F>
              <F label="Seña: monto, cuándo y cómo pagó *">
                <Input placeholder="Ej: $42.500 el 10/11 en efectivo" value={form.rep_sena} onChange={e => set("rep_sena", e.target.value)} />
              </F>
              <F label="Saldo: monto, cuándo y cómo pagó *">
                <Input placeholder="Ej: $42.500 el 14/11 con débito" value={form.rep_saldo} onChange={e => set("rep_saldo", e.target.value)} />
              </F>

              <Seccion titulo="Cómo vuelve hoy" />
              <F label="Estado del equipo hoy *" full>
                <Select value={form.estado_producto} onValueChange={v => set("estado_producto", v)}>
                  <SelectTrigger><SelectValue placeholder="Elegí" /></SelectTrigger>
                  <SelectContent>{ESTADOS_EQUIPO.map(o => <SelectItem key={o.v} value={o.v}>{o.l}</SelectItem>)}</SelectContent>
                </Select>
              </F>
            </>
          )}

          {esProd && (
            <>
              <F label="Producto *">
                <Input placeholder="Ej: Auricular Redmi Buds 5" value={form.producto_u_orden} onChange={e => set("producto_u_orden", e.target.value)} />
              </F>
              <F label="Fecha de compra *">
                <Input type="date" max={hoyISO()} value={form.fecha_compra} onChange={e => set("fecha_compra", e.target.value)} />
              </F>
              <F label="Forma de pago *">
                <Select value={form.forma_pago} onValueChange={v => set("forma_pago", v)}>
                  <SelectTrigger><SelectValue placeholder="Elegí" /></SelectTrigger>
                  <SelectContent>{FORMAS_PAGO.map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}</SelectContent>
                </Select>
              </F>
              <Si label="Trae ticket o la venta aparece en el sistema" v={form.con_ticket} on={v => set("con_ticket", v)} />
              <Si label="Es un producto original (Apple, Samsung, JBL, Xiaomi, etc.)" v={form.es_original_marca}
                on={v => set("es_original_marca", v)} full />
              {form.es_original_marca && (
                <p className="sm:col-span-2 text-sm rounded-md bg-warning/10 border border-warning p-3">
                  Los productos originales se abren y se prueban con el cliente antes de que salgan del local, así que
                  <b> no tienen cambio</b>. No se lo prometas: cargá el caso igual y el encargado lo confirma.
                </p>
              )}

              <Seccion titulo="Estado del producto" />
              <SiNoPregunta label="¿Se vendió en liquidación o promo?" v={form.prod_liquidacion} on={v => set("prod_liquidacion", v)} />
              {form.prod_liquidacion && (
                <p className="sm:col-span-2 text-sm rounded-md bg-warning/10 border border-warning p-3">
                  Lo vendido en liquidación o promo <b>no tiene cambio</b>. No se lo digas al cliente: cargá el caso y lo confirma el encargado.
                </p>
              )}
              <SiNoPregunta label="¿Está fallado?" v={form.prod_fallado} on={v => set("prod_fallado", v)} />
              {form.prod_fallado && (
                <F label="Describí la falla *" full>
                  <Textarea rows={2} placeholder="Ej: el auricular derecho no carga" value={form.prod_falla} onChange={e => set("prod_falla", e.target.value)} />
                </F>
              )}
              <SiNoPregunta label="¿Está completo, con accesorios?" v={form.prod_completo} on={v => set("prod_completo", v)} />
              {form.prod_completo === false && (
                <p className="sm:col-span-2 text-sm rounded-md bg-warning/10 border border-warning p-3">
                  Si no está completo <b>no tiene cambio</b>. No se lo digas al cliente: cargá el caso y lo confirma el encargado.
                </p>
              )}
              <SiNoPregunta label="¿El packaging está en buen estado?" v={form.prod_packaging_ok} on={v => set("prod_packaging_ok", v)} />
              <SiNoPregunta label="¿Tiene marcas de uso?" v={form.prod_marcas_uso} on={v => set("prod_marcas_uso", v)} />
              {form.prod_marcas_uso && (
                <F label="Describí las marcas de uso *" full>
                  <Textarea rows={2} placeholder="Ej: rayas en la carcasa, cera en las gomitas" value={form.prod_marcas_desc} onChange={e => set("prod_marcas_desc", e.target.value)} />
                </F>
              )}
            </>
          )}

          {esVarios && (
            <F label="¿De qué se trata? *" full>
              <Input placeholder="Ej: consulta por una garantía, un pedido especial, un problema con un pago" value={form.tema_detalle} onChange={e => set("tema_detalle", e.target.value)} />
            </F>
          )}

          {tema !== "uso_nc" && (
            <>
              <F label={esReparacion ? "Qué falla ahora (en una frase) *" : esVarios ? "Contá qué pasa *" : "Qué pasa (en una frase) *"} full>
                <Textarea rows={2} placeholder={esReparacion ? "Ej: la pantalla quedó sin imagen" : esVarios ? "Todo lo que haga falta para entender el caso" : "Ej: compró el modelo equivocado"} value={form.que_pasa} onChange={e => set("que_pasa", e.target.value)} />
              </F>
              <F label={esVarios ? "Qué probamos o qué hicimos (si aplica)" : "Qué probamos en el local *"} full>
                <Textarea rows={2} placeholder="Ej: lo cargamos 30 min y probamos con otro cargador: sigue igual" value={form.que_probamos} onChange={e => set("que_probamos", e.target.value)} />
              </F>

              <F label={esVarios ? "Qué pide el cliente (si aplica)" : "Qué pide el cliente *"}>
                <Select value={form.que_pide} onValueChange={v => set("que_pide", v)}>
                  <SelectTrigger><SelectValue placeholder="Elegí" /></SelectTrigger>
                  <SelectContent>{QUE_PIDE.map(o => <SelectItem key={o.v} value={o.v}>{o.l}</SelectItem>)}</SelectContent>
                </Select>
              </F>
              <Si label="Nombró Defensa del Consumidor, un abogado o las redes" v={form.amenaza_externa} on={v => set("amenaza_externa", v)} full />

              <div className="sm:col-span-2 space-y-2">
                <Label>
                  {esReparacion ? "Fotos del equipo como vuelve y de la orden de ingreso *"
                    : esVarios ? "Fotos (si hacen falta)" : "Fotos del producto, el packaging y el ticket *"}
                </Label>
                <label className="flex items-center justify-center gap-2 border-2 border-dashed rounded-lg p-4 cursor-pointer hover:bg-muted text-sm">
                  <Camera className="w-5 h-5" /> Sacar o elegir fotos
                  <input type="file" accept="image/*" multiple className="hidden"
                    onChange={e => { setFotos(f => [...f, ...Array.from(e.target.files || [])]); e.target.value = ""; }} />
                </label>
                {fotos.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {fotos.map((f, i) => (
                      <div key={i} className="relative">
                        <img src={URL.createObjectURL(f)} alt="" className="w-20 h-20 object-cover rounded-md border" />
                        <button type="button" onClick={() => setFotos(fotos.filter((_, j) => j !== i))}
                          className="absolute -top-2 -right-2 bg-destructive text-destructive-foreground rounded-full p-0.5">
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="sm:col-span-2">
                <Button onClick={enviar} disabled={enviando} className="w-full h-11" size="lg">
                  {enviando ? "Guardando..." : "Guardar caso"}
                </Button>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function Resultado({ caso, local, fotos, otroCaso, irACasos }: { caso: any; local?: string; fotos: File[]; otroCaso: () => void; irACasos: () => void }) {
  const ui = COLOR_UI[caso.color] ?? COLOR_UI.amarillo;
  const [avisado, setAvisado] = useState(false);
  const mandarFrase = () =>
    abrirWhatsApp(telWhatsApp(caso.cliente_telefono), `Hola ${caso.cliente_nombre}, te escribimos de MyPhone. Tu número de caso es ${caso.numero}. ${FRASE_FIJA}`);

  return (
    <Card className={`border-2 ${ui.box}`}>
      <CardContent className="p-6 space-y-4">
        <div className="flex items-center gap-2">
          <Badge className={ui.badge}>{ui.label}</Badge>
          <span className="font-semibold">Caso {caso.numero}</span>
        </div>

        {caso.color === "verde" && (
          <div className="space-y-2">
            {pideDevolucion(caso) ? (
              <>
                <p className="text-lg font-semibold flex items-center gap-2"><CheckCircle2 className="w-5 h-5 text-success" />Podés hacer la nota de crédito.</p>
                <p className="text-sm">Mandá la foto de la nota de crédito al grupo de pendientes.</p>
              </>
            ) : (
              <>
                <p className="text-lg font-semibold flex items-center gap-2"><CheckCircle2 className="w-5 h-5 text-success" />Podés hacer el cambio.</p>
                <p className="text-sm">{caso.motivo_color}. Pasá el cambio por el sistema y avisá en el grupo de pendientes con el botón de abajo.</p>
              </>
            )}
          </div>
        )}
        {caso.color === "amarillo" && (
          <div className="space-y-2">
            <p className="text-lg font-semibold">Lo decide el encargado de turno.</p>
            <p className="text-sm">Motivo: {caso.motivo_color}. No prometas nada. Decile al cliente:</p>
            {caso.es_original_marca && esProducto(caso) && (
              <p className="text-sm">Los originales salen probados del local: en principio no tienen cambio. Lo confirma el encargado.</p>
            )}
            {pideDevolucion(caso) && (
              <p className="text-sm">Pide devolución: no se devuelve en el momento. Si el encargado la autoriza, se hace con nota de crédito y la emitís vos.</p>
            )}
            {caso.prod_completo === false && (
              <p className="text-sm">Si no está completo, en principio no tiene cambio. Lo confirma el encargado.</p>
            )}
            <p className="text-base font-medium bg-background rounded-md p-3">"{FRASE_FIJA}"</p>
          </div>
        )}
        {caso.color === "rojo" && (
          <div className="space-y-2">
            <p className="text-lg font-semibold">Lo decide Vanesa.</p>
            <p className="text-sm">Motivo: {caso.motivo_color}. No expliques, no discutas y no mandes otros mensajes. Decile solamente:</p>
            <p className="text-base font-medium bg-background rounded-md p-3">"{FRASE_FIJA}"</p>
          </div>
        )}

        <div className={`rounded-md border-2 p-3 space-y-2 ${avisado ? "border-success bg-background" : "border-destructive bg-background"}`}>
          {avisado ? (
            <p className="font-semibold flex items-center gap-2"><CheckCircle2 className="w-5 h-5 text-success" />Avisado al grupo de pendientes.</p>
          ) : (
            <>
              <p className="font-semibold">Obligatorio: avisá en el grupo de pendientes de tu local.</p>
              {caso.color !== "verde" && (
                <p className="text-sm">Cuando el encargado lo resuelva, lo vas a ver en la pestaña Casos y vas a tener que avisar la resolución.</p>
              )}
              <p className="text-sm text-muted-foreground">
                Abrí el resumen, copialo y pegalo en el grupo de pendientes junto con las fotos.
              </p>
              <BotonesGrupo caso={caso} local={local} files={async () => fotos} onAvisado={() => setAvisado(true)} />
            </>
          )}
        </div>

        <div className="flex flex-wrap gap-2">
          {caso.color !== "verde" && (
            <Button variant="secondary" onClick={mandarFrase}><MessageCircle className="w-4 h-4 mr-1" />Mandar la frase al cliente</Button>
          )}
          <Button variant="outline" onClick={irACasos}>Ver casos</Button>
          <Button onClick={otroCaso} disabled={!avisado}>Cargar otro caso</Button>
        </div>
        {!avisado && <p className="text-xs text-muted-foreground">Para cargar otro caso, primero avisá al grupo.</p>}
      </CardContent>
    </Card>
  );
}

// ------------------------------------------------------------------
// 2. Lista de casos
// ------------------------------------------------------------------
function ListaCasos({ puedeGestionar, recarga }: { puedeGestionar: boolean; recarga: number }) {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [verResueltos, setVerResueltos] = useState(false);
  const [filtroColor, setFiltroColor] = useState<string>("todos");
  const [q, setQ] = useState("");
  const [abierto, setAbierto] = useState<any>(null);

  const sesion = useSesion();
  const load = async () => {
    setLoading(true);
    let query = db.from("reclamos").select("*").order("created_at", { ascending: false }).limit(300);
    // Abiertos + resueltos cuya resolución todavía no se avisó al grupo
    if (!verResueltos) query = query.or("estado.neq.resuelto,and(avisado_resolucion_at.is.null,color.neq.verde)");
    if (sesion.modo === "local") query = query.eq("sucursal_id", sesion.sucursal_id);
    const { data, error } = await query;
    setLoading(false);
    if (error) return toast.error(error.message);
    setItems(await conNombreLocal(data || []));
  };
  useEffect(() => { load(); }, [verResueltos, recarga]);

  const visibles = useMemo(() => {
    const t = q.trim().toLowerCase();
    const peso = (r: any) => (r.color === "rojo" ? 0 : estaAtrasado(r) ? 1 : r.color === "amarillo" ? 2 : 3);
    return items
      .filter(r => filtroColor === "todos" || r.color === filtroColor)
      .filter(r => !t || [r.numero, r.cliente_nombre, r.cliente_telefono, r.producto_u_orden].some((x: string) => (x || "").toLowerCase().includes(t)))
      .sort((a, b) => peso(a) - peso(b) || (a.created_at < b.created_at ? 1 : -1));
  }, [items, filtroColor, q]);

  const cuenta = (c: string) => items.filter(r => r.color === c && r.estado !== "resuelto").length;

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2 items-center">
        {["todos", "rojo", "amarillo", "verde"].map(c => (
          <Button key={c} size="sm" variant={filtroColor === c ? "default" : "outline"} onClick={() => setFiltroColor(c)}>
            {c === "todos" ? "Todos" : `${COLOR_UI[c].label} (${cuenta(c)})`}
          </Button>
        ))}
        <div className="flex items-center gap-2 ml-auto text-sm">
          <Switch checked={verResueltos} onCheckedChange={setVerResueltos} id="res" />
          <Label htmlFor="res">Ver resueltos</Label>
          <Button size="sm" variant="ghost" onClick={load}><RefreshCw className="w-4 h-4" /></Button>
        </div>
      </div>
      <div className="relative">
        <Search className="w-4 h-4 absolute left-3 top-3 text-muted-foreground" />
        <Input className="pl-9" placeholder="Buscar por N° de caso, cliente, teléfono o producto" value={q} onChange={e => setQ(e.target.value)} />
      </div>

      {loading ? <p className="text-muted-foreground">Cargando...</p> :
        visibles.length === 0 ? <p className="text-muted-foreground text-center py-8">No hay casos {verResueltos ? "" : "abiertos"}.</p> :
          <div className="space-y-2">
            {visibles.map(r => {
              const ui = COLOR_UI[r.color] ?? COLOR_UI.amarillo;
              const atrasado = estaAtrasado(r);
              return (
                <Card key={r.id} className={`cursor-pointer hover:shadow-md border-l-4 ${ui.box}`} onClick={() => setAbierto(r)}>
                  <CardContent className="p-3 space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge className={ui.badge}>{ui.label}</Badge>
                      <span className="font-semibold">{r.numero}</span>
                      <span className="text-sm text-muted-foreground">{r.sucursal_nombre}</span>
                      <Badge variant="outline">{ESTADOS[r.estado]}</Badge>
                      {atrasado && <Badge className="bg-destructive text-destructive-foreground"><Clock className="w-3 h-3 mr-1" />Atrasado</Badge>}
                      {!r.avisado_grupo_at && <Badge variant="outline" className="border-destructive text-destructive">Sin avisar al grupo</Badge>}
                      {faltaAvisarResolucion(r) && <Badge className="bg-destructive text-destructive-foreground">Resuelto: avisar al grupo</Badge>}
                    </div>
                    <div className="text-sm"><b>{r.cliente_nombre}</b> · {temaDe(r.tipo)}{r.producto_u_orden ? ` · ${r.producto_u_orden}` : r.tema_detalle ? ` · ${r.tema_detalle}` : ""}</div>
                    <div className="text-sm text-muted-foreground">{r.que_pasa}</div>
                    {r.estado === "resuelto" && r.resolucion && <div className="text-sm"><b>Resolución:</b> {r.resolucion}</div>}
                    <div className="text-xs text-muted-foreground">{fecha(r.created_at)} · {r.motivo_color}{r.responsable ? ` · lo tiene ${r.responsable}` : ""}</div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
      }

      {abierto && (
        <DetalleCaso caso={abierto} puedeGestionar={puedeGestionar} onClose={() => { setAbierto(null); load(); }} onGuardado={load} />
      )}
    </div>
  );
}

function faltaAvisarResolucion(r: any) {
  return r.estado === "resuelto" && r.color !== "verde" && !r.avisado_resolucion_at;
}

function estaAtrasado(r: any) {
  return r.estado !== "resuelto" && r.vence_at && new Date(r.vence_at) < new Date();
}

// ------------------------------------------------------------------
// 3. Detalle de un caso
// ------------------------------------------------------------------
function DetalleCaso({ caso: casoInicial, puedeGestionar, onClose, onGuardado }: { caso: any; puedeGestionar: boolean; onClose: () => void; onGuardado: () => void }) {
  const { nombre } = useSesion();
  const [caso, setCaso] = useState<any>(casoInicial);
  const [eventos, setEventos] = useState<any[]>([]);
  const [urls, setUrls] = useState<string[]>([]);
  const [comentario, setComentario] = useState("");
  const [g, setG] = useState({
    estado: caso.estado,
    color: caso.color,
    resolucion: caso.resolucion || "",
    nota_credito_nro: caso.nota_credito_nro || "",
  });
  const [guardando, setGuardando] = useState(false);
  const [avisadoAt, setAvisadoAt] = useState<string | null>(caso.avisado_grupo_at);
  const [avisadoResAt, setAvisadoResAt] = useState<string | null>(caso.avisado_resolucion_at);

  // Descarga las fotos del caso para poder compartirlas en el grupo
  const archivosFotos = async () =>
    Promise.all(urls.map(async (u, i) => {
      const blob = await (await fetch(u)).blob();
      return new File([blob], `foto-${i + 1}.jpg`, { type: blob.type || "image/jpeg" });
    }));

  const cargarEventos = async () => {
    const { data } = await db.from("reclamos_eventos").select("*").eq("reclamo_id", caso.id).order("created_at");
    setEventos(data || []);
  };
  useEffect(() => {
    cargarEventos();
    if (caso.fotos?.length) {
      supabase.storage.from("reclamos").createSignedUrls(caso.fotos, 3600)
        .then(({ data }) => setUrls((data || []).map((d: any) => d.signedUrl).filter(Boolean)));
    }
  }, [caso.id]);

  const comentar = async () => {
    if (!comentario.trim()) return;
    const { error } = await db.from("reclamos_eventos").insert({ reclamo_id: caso.id, tipo: "comentario", texto: comentario.trim(), autor: nombre });
    if (error) return toast.error(error.message);
    setComentario("");
    cargarEventos();
  };

  const guardar = async (extra: Record<string, any> = {}) => {
    if (g.estado === "resuelto" && !g.resolucion.trim()) return toast.error("Escribí qué se resolvió antes de cerrar el caso");
    setGuardando(true);
    const { error } = await db.from("reclamos").update({ ...g, responsable: caso.responsable || nombre, modificado_por: nombre, ...extra }).eq("id", caso.id);
    setGuardando(false);
    if (error) return toast.error(error.message);
    const { data: nuevo } = await db.from("reclamos").select("*").eq("id", caso.id).single();
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

  const autorizarNC = () => guardar({ nota_credito_autorizada_por: nombre || "encargado" });

  const mandarFrase = () =>
    abrirWhatsApp(telWhatsApp(caso.cliente_telefono), `Hola ${caso.cliente_nombre}, te escribimos de MyPhone. Tu número de caso es ${caso.numero}. ${FRASE_FIJA}`);

  const ui = COLOR_UI[caso.color] ?? COLOR_UI.amarillo;

  return (
    <Dialog open onOpenChange={o => !o && onClose()}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex flex-wrap items-center gap-2">
            <Badge className={ui.badge}>{ui.label}</Badge> {caso.numero}
            <span className="text-sm font-normal text-muted-foreground">{caso.sucursal_nombre} · {ESTADOS[caso.estado]}</span>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 text-sm">
          <p className="text-muted-foreground">{caso.motivo_color}</p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1">
            <Dato l="Cliente" v={`${caso.cliente_nombre} · ${caso.cliente_telefono}`} />
            <Dato l="Vendedor" v={caso.atendido_por} />
            <Dato l="Tema" v={temaDe(caso.tipo)} />
            {caso.tema_detalle && <Dato l="De qué se trata" v={caso.tema_detalle} />}
            {caso.tipo === "reparacion" ? (
              <>
                <Dato l="Orden y equipo" v={caso.producto_u_orden} />
                <Dato l="Ingresó" v={fechaCorta(caso.rep_fecha_ingreso)} />
                <Dato l="Se entregó" v={fechaCorta(caso.fecha_compra)} />
                <Dato l="Taller" v={caso.rep_taller || "—"} />
                <Dato l="Repuesto" v={caso.rep_calidad || "—"} />
                <Dato l="Presupuesto" v={caso.rep_presupuesto || "—"} />
                <Dato l="Seña" v={caso.rep_sena || "—"} />
                <Dato l="Saldo" v={caso.rep_saldo || "—"} />
                <Dato l="Cómo vuelve" v={labelDe(ESTADOS_TODOS, caso.estado_producto)} />
              </>
            ) : esProducto(caso) ? (
              <>
                <Dato l="Producto" v={caso.producto_u_orden} />
                <Dato l="Compró" v={fechaCorta(caso.fecha_compra)} />
                <Dato l="Pagó con" v={caso.forma_pago} />
                <Dato l="Ticket" v={caso.con_ticket ? "Sí" : "No"} />
                <Dato l="Original" v={caso.es_original_marca ? "Sí" : "No"} />
                {caso.prod_fallado != null ? (
                  <>
                    <Dato l="Fallado" v={siNo(caso.prod_fallado) + (caso.prod_fallado && caso.prod_falla ? ` (${caso.prod_falla})` : "")} />
                    <Dato l="Completo con accesorios" v={siNo(caso.prod_completo)} />
                    <Dato l="Packaging en buen estado" v={siNo(caso.prod_packaging_ok)} />
                    <Dato l="Marcas de uso" v={siNo(caso.prod_marcas_uso) + (caso.prod_marcas_uso && caso.prod_marcas_desc ? ` (${caso.prod_marcas_desc})` : "")} />
                    {caso.prod_liquidacion != null && <Dato l="Liquidación o promo" v={siNo(caso.prod_liquidacion)} />}
                  </>
                ) : (
                  <Dato l="Estado del producto" v={labelDe(ESTADOS_TODOS, caso.estado_producto)} />
                )}
              </>
            ) : null}
            {caso.que_pide && <Dato l="Pide" v={labelDe(QUE_PIDE_TODOS, caso.que_pide)} />}
            {caso.amenaza_externa && <Dato l="Atención" v="Nombró Defensa del Consumidor, abogado o redes" />}
            <Dato l="Creado" v={fecha(caso.created_at)} />
            <Dato l="Vence" v={fecha(caso.vence_at)} />
          </div>
          {caso.tipo === "reparacion" && (
            <>
              <div><b>Qué se le hizo:</b> {caso.rep_trabajo || "—"}</div>
              <div><b>Remito de ingreso:</b> {caso.rep_remito || "—"}</div>
            </>
          )}
          <div><b>{caso.tipo === "reparacion" ? "Qué falla ahora" : "Qué pasa"}:</b> {caso.que_pasa}</div>
          {caso.que_probamos && <div><b>Qué probamos:</b> {caso.que_probamos}</div>}
          {caso.resolucion && <div><b>Resolución:</b> {caso.resolucion}</div>}
          {pideDevolucion(caso) && caso.nota_credito_autorizada_por && !caso.nota_credito_nro && (
            <p className="rounded-md border border-success bg-success/10 p-3">
              <b>Nota de crédito autorizada.</b> El local la emite en el sistema por el total y le avisa al cliente.
            </p>
          )}
          {caso.nota_credito_autorizada_por && (
            <div><b>Nota de crédito:</b> autorizada por {caso.nota_credito_autorizada_por}{caso.nota_credito_nro ? ` · N° ${caso.nota_credito_nro}` : ""}</div>
          )}

          {urls.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {urls.map(u => <a key={u} href={u} target="_blank" rel="noreferrer"><img src={u} alt="" className="w-24 h-24 object-cover rounded-md border" /></a>)}
            </div>
          )}

          {avisadoAt ? (
            <p className="text-sm flex items-center gap-1"><CheckCircle2 className="w-4 h-4 text-success" />Avisado al grupo {fecha(avisadoAt)}{caso.avisado_por ? ` por ${caso.avisado_por}` : ""}</p>
          ) : (
            <div className="rounded-md border-2 border-destructive p-3 space-y-2">
              <p className="font-semibold">Este caso todavía no se avisó al grupo de pendientes.</p>
              <BotonesGrupo caso={caso} files={archivosFotos} onAvisado={() => setAvisadoAt(new Date().toISOString())} />
            </div>
          )}

          {caso.estado === "resuelto" && caso.color !== "verde" && (
            avisadoResAt ? (
              <p className="text-sm flex items-center gap-1"><CheckCircle2 className="w-4 h-4 text-success" />Resolución avisada al grupo {fecha(avisadoResAt)}{caso.avisado_resolucion_por ? ` por ${caso.avisado_resolucion_por}` : ""}</p>
            ) : (
              <div className="rounded-md border-2 border-destructive p-3 space-y-2">
                <p className="font-semibold">Caso resuelto: avisá en el grupo de pendientes qué se hizo.</p>
                {caso.resolucion && <p className="text-sm"><b>Resolución:</b> {caso.resolucion}</p>}
                <BotonesGrupo caso={caso} files={async () => []} momento="resolucion" texto={() => textoResumen(caso, eventos)}
                  onAvisado={() => { setAvisadoResAt(new Date().toISOString()); onGuardado(); }} />
              </div>
            )
          )}

          <div className="flex flex-wrap gap-2">
            <Button size="sm" variant="secondary" onClick={mandarFrase}><MessageCircle className="w-4 h-4 mr-1" />Mandar la frase fija al cliente</Button>
            {puedeGestionar && caso.color !== "verde" && (
              <Button size="sm" variant="outline" onClick={() => setVerResumen(true)}>
                <Send className="w-4 h-4 mr-1" />Resumen para el grupo
              </Button>
            )}
          </div>

          {puedeGestionar && (
            <Card className="bg-muted/40">
              <CardContent className="p-3 grid grid-cols-1 sm:grid-cols-2 gap-3">
                <F label="Estado">
                  <Select value={g.estado} onValueChange={v => setG({ ...g, estado: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>{Object.entries(ESTADOS).map(([v, l]) => <SelectItem key={v} value={v}>{l}</SelectItem>)}</SelectContent>
                  </Select>
                </F>
                <F label="Color">
                  <Select value={g.color} onValueChange={v => setG({ ...g, color: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>{Object.entries(COLOR_UI).map(([v, c]) => <SelectItem key={v} value={v}>{c.label}</SelectItem>)}</SelectContent>
                  </Select>
                </F>
                <F label="Qué se decidió / qué se le dijo al cliente" full>
                  <Textarea rows={2} value={g.resolucion} onChange={e => setG({ ...g, resolucion: e.target.value })} />
                </F>
                {(pideDevolucion(caso) || caso.nota_credito_autorizada_por) && (
                  <F label="N° de nota de crédito (cuando se emita)">
                    <Input value={g.nota_credito_nro} onChange={e => setG({ ...g, nota_credito_nro: e.target.value })} />
                  </F>
                )}
                <div className="sm:col-span-2 flex flex-wrap gap-2">
                  <Button onClick={() => guardar()} disabled={guardando}>Guardar</Button>
                  {pideDevolucion(caso) && !caso.nota_credito_autorizada_por && (
                    <Button variant="outline" onClick={autorizarNC} disabled={guardando}>Autorizar nota de crédito</Button>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          <Card className="border-primary/40">
            <CardContent className="p-3 space-y-2">
              <h3 className="font-semibold">Resumen del caso</h3>
              <p className="text-xs text-muted-foreground">
                Cuenta todo lo que pasó, listo para mandar al grupo de pendientes. Se actualiza solo con cada cambio o comentario.
              </p>
              <pre className="whitespace-pre-wrap text-xs bg-muted rounded-md p-3 font-sans max-h-64 overflow-y-auto">{textoResumen(caso, eventos)}</pre>
              <div className="flex flex-wrap gap-2">
                <Button size="sm" onClick={copiarResumen}><Send className="w-4 h-4 mr-1" />Copiar resumen</Button>
              </div>
            </CardContent>
          </Card>

          <div className="space-y-2">
            <h3 className="font-semibold">Historial</h3>
            {eventos.map(e => (
              <div key={e.id} className="border-l-2 pl-3">
                <div className="text-xs text-muted-foreground">{fecha(e.created_at)} · {e.autor}</div>
                <div>{e.texto}</div>
              </div>
            ))}
            <div className="flex gap-2">
              <Input placeholder="Agregar un comentario" value={comentario} onChange={e => setComentario(e.target.value)}
                onKeyDown={e => e.key === "Enter" && comentar()} />
              <Button size="icon" onClick={comentar}><Send className="w-4 h-4" /></Button>
            </div>
          </div>
        </div>
      </DialogContent>
      {verResumen && (
        <ResumenGrupo titulo={`Resumen del caso ${caso.numero}`} texto={textoResumen(caso, eventos)} onClose={() => setVerResumen(false)} />
      )}
    </Dialog>
  );
}

// ------------------------------------------------------------------
// 4. Resumen diario para Vanesa + ajustes
// ------------------------------------------------------------------
function Resumen({ esAdmin }: { esAdmin: boolean }) {
  const [casos, setCasos] = useState<any[]>([]);
  const [config, setConfig] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    const [{ data: c }, { data: cfg }] = await Promise.all([
      db.from("reclamos_abiertos").select("*"),
      db.from("reclamos_config").select("*").order("clave"),
    ]);
    setCasos(c || []);
    setConfig(cfg || []);
    setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const paraVanesa = casos
    .filter(r => r.color === "rojo" || r.atrasado)
    .sort((a, b) => (a.sucursal_nombre || "").localeCompare(b.sucursal_nombre || "") || b.horas_abierto - a.horas_abierto);
  const telefono = config.find(c => c.clave === "telefono_resumen")?.valor || "";

  const texto = () => {
    const hoy = new Date().toLocaleDateString("es-AR");
    if (paraVanesa.length === 0) return `Resumen de reclamos ${hoy}\n\nNo hay casos rojos ni atrasados.`;
    const porLocal: Record<string, any[]> = {};
    paraVanesa.forEach(r => (porLocal[r.sucursal_nombre || "Sin local"] ||= []).push(r));
    const bloques = Object.entries(porLocal).map(([local, rs]) =>
      `*${local}*\n` + rs.map(r =>
        `- ${r.numero} ${r.color === "rojo" ? "ROJO" : "atrasado"} · ${r.producto_u_orden} · ${r.que_pasa} · ${ESTADOS[r.estado]} · ${r.horas_abierto} hs`
      ).join("\n"));
    return `Resumen de reclamos ${hoy}\n${paraVanesa.length} casos para ver (rojos y atrasados)\n\n${bloques.join("\n\n")}`;
  };

  const enviar = () => {
    if (!telefono) return toast.error("Falta cargar el WhatsApp del resumen en Ajustes");
    abrirWhatsApp(telefono, texto());
  };
  const copiar = async () => {
    await navigator.clipboard.writeText(texto());
    toast.success("Resumen copiado");
  };

  const guardarConfig = async (clave: string, valor: string) => {
    const { error } = await db.from("reclamos_config").update({ valor }).eq("clave", clave);
    if (error) return toast.error(error.message);
    toast.success("Ajuste guardado");
    load();
  };

  if (loading) return <p className="text-muted-foreground">Cargando...</p>;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-2 text-center">
        <Stat n={casos.filter(r => r.color === "rojo").length} l="Rojos" cls="text-destructive" />
        <Stat n={casos.filter(r => r.color === "amarillo").length} l="Amarillos" cls="text-warning-foreground" />
        <Stat n={casos.filter(r => r.atrasado).length} l="Atrasados" cls="text-destructive" />
      </div>

      <Card>
        <CardHeader><CardTitle>Resumen de las 19 hs</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <pre className="whitespace-pre-wrap text-sm bg-muted rounded-md p-3 font-sans">{texto()}</pre>
          <div className="flex flex-wrap gap-2">
            <Button onClick={enviar}><MessageCircle className="w-4 h-4 mr-1" />Mandar por WhatsApp</Button>
            <Button variant="outline" onClick={copiar}>Copiar</Button>
            <Button variant="ghost" onClick={load}><RefreshCw className="w-4 h-4" /></Button>
          </div>
        </CardContent>
      </Card>


      {esAdmin && (
        <Card>
          <CardHeader><CardTitle>Ajustes del semáforo</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            {config.map(c => <AjusteFila key={c.clave} c={c} onGuardar={guardarConfig} />)}
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function AjusteFila({ c, onGuardar }: { c: any; onGuardar: (clave: string, valor: string) => void }) {
  const [v, setV] = useState(c.valor);
  return (
    <div className="flex flex-col sm:flex-row sm:items-end gap-2">
      <div className="flex-1 space-y-1">
        <Label>{c.descripcion}</Label>
        <Input value={v} onChange={e => setV(e.target.value)} />
      </div>
      <Button variant="outline" disabled={v === c.valor} onClick={() => onGuardar(c.clave, v)}>Guardar</Button>
    </div>
  );
}

// ------------------------------------------------------------------
// Piezas chicas
// ------------------------------------------------------------------
function F({ label, children, full }: { label: string; children: React.ReactNode; full?: boolean }) {
  return <div className={`space-y-1.5 ${full ? "sm:col-span-2" : ""}`}><Label>{label}</Label>{children}</div>;
}
function Si({ label, v, on, full }: { label: string; v: boolean; on: (v: boolean) => void; full?: boolean }) {
  return (
    <label className={`flex items-center justify-between gap-3 rounded-md border p-3 cursor-pointer ${full ? "sm:col-span-2" : ""}`}>
      <span className="text-sm">{label}</span>
      <Switch checked={v} onCheckedChange={on} />
    </label>
  );
}
// Pregunta de sí o no con dos botones (arranca sin responder)
function SiNoPregunta({ label, v, on }: { label: string; v: boolean | null; on: (v: boolean) => void }) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-md border p-3">
      <span className="text-sm">{label} *</span>
      <div className="flex gap-1">
        <Button type="button" size="sm" variant={v === true ? "default" : "outline"} onClick={() => on(true)}>Sí</Button>
        <Button type="button" size="sm" variant={v === false ? "default" : "outline"} onClick={() => on(false)}>No</Button>
      </div>
    </div>
  );
}
function Seccion({ titulo }: { titulo: string }) {
  return <h3 className="sm:col-span-2 font-semibold border-b pb-1 mt-2">{titulo}</h3>;
}
function Dato({ l, v }: { l: string; v: string }) {
  return <div><span className="text-muted-foreground">{l}:</span> {v}</div>;
}
function Stat({ n, l, cls }: { n: number; l: string; cls: string }) {
  return (
    <Card><CardContent className="p-3"><div className={`text-2xl font-bold ${cls}`}>{n}</div><div className="text-xs text-muted-foreground">{l}</div></CardContent></Card>
  );
}
