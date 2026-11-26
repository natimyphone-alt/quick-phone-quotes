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
import { AlertTriangle, Camera, CheckCircle2, Clock, LogOut, MessageCircle, RefreshCw, Search, Send, X } from "lucide-react";
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

const TIPOS = [
  { v: "cambio", l: "Cambio de producto" },
  { v: "reparacion", l: "Reparación que vuelve (reingreso)" },
  { v: "reclamo", l: "Reclamo (cliente enojado, pide que respondamos)" },
];
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
  { v: "cambio", l: "Cambiarlo por otro producto" },
  { v: "nota_credito", l: "Nota de crédito" },
  { v: "devolucion", l: "Que le devolvamos la plata" },
  { v: "revision", l: "Que revisemos el equipo / una respuesta" },
];
const FORMAS_PAGO = ["Efectivo", "Débito", "Crédito", "QR / Mercado Pago", "Transferencia", "Nota de crédito"];

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
// Sesión de la pantalla: local + nombre (todos usan el mismo usuario del Hub)
// ------------------------------------------------------------------
type Sesion = { modo: "local" | "encargado"; sucursal_id?: string; sucursal_nombre?: string; nombre: string; hasta: number };
const CLAVE_SESION = "reclamos_sesion";
const HORAS_SESION = 12;

function leerSesion(): Sesion | null {
  try {
    const s = JSON.parse(localStorage.getItem(CLAVE_SESION) || "null");
    return s && s.hasta > Date.now() ? s : null;
  } catch {
    return null;
  }
}
function guardarSesion(s: Sesion | null) {
  try {
    if (s) localStorage.setItem(CLAVE_SESION, JSON.stringify(s));
    else localStorage.removeItem(CLAVE_SESION);
  } catch {
    /* el navegador no deja guardar: la sesión dura hasta recargar */
  }
}

const SesionCtx = createContext<Sesion>({ modo: "local", nombre: "", hasta: 0 });
const useSesion = () => useContext(SesionCtx);

// ------------------------------------------------------------------
// Página
// ------------------------------------------------------------------
function ReclamosPage() {
  const { isAdmin, nombre } = useAuth();
  const [rol, setRol] = useState<string | null>(null);
  const [tab, setTab] = useState("nuevo");
  const [recarga, setRecarga] = useState(0);
  const [sesion, setSesion] = useState<Sesion | null>(null);

  useEffect(() => {
    db.rpc("reclamos_rol").then(({ data }: any) => setRol(data || ""));
    setSesion(leerSesion());
  }, []);

  // Administrador y encargado entran con su propio mail: ven todo, sin PIN.
  // El PIN es solo para el usuario que comparten los vendedores.
  const loginAdmin = isAdmin || rol === "administrador";
  const loginGestor = loginAdmin || rol === "encargado";

  const entrar = (s: Sesion) => {
    guardarSesion(s);
    setSesion(s);
    setTab("nuevo");
  };
  const salir = () => {
    guardarSesion(null);
    setSesion(null);
  };

  if (rol === null) return <p className="text-muted-foreground">Cargando...</p>;

  const activa: Sesion | null = loginGestor
    ? { modo: "encargado", nombre: nombre || (loginAdmin ? "Administración" : "Encargado"), hasta: Infinity }
    : sesion;
  if (!activa) return <Entrada onEntrar={entrar} />;

  const puedeGestionar = activa.modo === "encargado";
  const esAdmin = loginAdmin;

  return (
    <SesionCtx.Provider value={activa}>
      <div className="space-y-4">
        <div className="flex flex-wrap items-start justify-between gap-2">
          <div>
            <h1 className="text-2xl font-bold">Reclamos</h1>
            <p className="text-sm text-muted-foreground">
              {puedeGestionar ? "Todos los locales" : `Local ${activa.sucursal_nombre}`} · {activa.nombre}
            </p>
          </div>
          {!loginGestor && (
            <Button variant="outline" size="sm" onClick={salir}><LogOut className="w-4 h-4 mr-1" />Cambiar local / salir</Button>
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
              <Resumen esAdmin={esAdmin} />
            </TabsContent>
          )}
        </Tabs>
      </div>
    </SesionCtx.Provider>
  );
}

// ------------------------------------------------------------------
// Entrada: local + nombre + PIN
// ------------------------------------------------------------------
function Entrada({ onEntrar }: { onEntrar: (s: Sesion) => void }) {
  const [sucursales, setSucursales] = useState<{ id: string | number; nombre: string }[]>([]);
  const [conPin, setConPin] = useState<string[] | null>(null);
  const [clave, setClave] = useState("");
  const [nombre, setNombre] = useState("");
  const [pin, setPin] = useState("");
  const [validando, setValidando] = useState(false);

  useEffect(() => {
    supabase.from("sucursales").select("id, nombre").eq("activo", true).order("nombre")
      .then(({ data }) => setSucursales(data || []));
    db.rpc("reclamos_pines_configurados").then(({ data, error }: any) => {
      if (error) toast.error("Falta correr la actualización v4 de Reclamos en Supabase");
      setConPin(((data || []) as any[]).map(x => (typeof x === "string" ? x : x.reclamos_pines_configurados)));
    });
  }, []);

  const tienePin = !!conPin?.includes(clave);

  const entrar = async () => {
    if (!clave) return toast.error("Elegí tu local");
    if (nombre.trim().length < 2) return toast.error("Escribí tu nombre");
    if (!tienePin) return toast.error("Este local todavía no tiene PIN. Pedile a Vanesa que lo cargue.");
    setValidando(true);
    const { data, error } = await db.rpc("reclamos_validar_pin", { p_clave: clave, p_pin: pin });
    setValidando(false);
    if (error) return toast.error(error.message);
    if (!data) {
      setPin("");
      return toast.error("PIN incorrecto");
    }
    const suc = sucursales.find(s => String(s.id) === clave);
    onEntrar({
      modo: "local",
      sucursal_id: clave,
      sucursal_nombre: suc?.nombre,
      nombre: nombre.trim(),
      hasta: Date.now() + HORAS_SESION * 3600 * 1000,
    });
  };

  return (
    <div className="max-w-sm mx-auto space-y-4 pt-4">
      <div className="text-center">
        <h1 className="text-2xl font-bold">Reclamos</h1>
        <p className="text-sm text-muted-foreground">Elegí tu local, escribí tu nombre y el PIN.</p>
      </div>
      <Card>
        <CardContent className="p-4 space-y-4">
          <F label="Local">
            <Select value={clave} onValueChange={v => { setClave(v); setPin(""); }}>
              <SelectTrigger><SelectValue placeholder="Elegí" /></SelectTrigger>
              <SelectContent>
                {sucursales.map(s => <SelectItem key={String(s.id)} value={String(s.id)}>{s.nombre}</SelectItem>)}
              </SelectContent>
            </Select>
          </F>
          <F label="Tu nombre">
            <Input value={nombre} onChange={e => setNombre(e.target.value)} placeholder="Ej: Juan" />
          </F>
          {clave && tienePin && (
            <F label="PIN">
              <Input type="password" inputMode="numeric" autoComplete="off" maxLength={8} value={pin}
                onChange={e => setPin(e.target.value.replace(/\D/g, ""))} onKeyDown={e => e.key === "Enter" && entrar()} />
            </F>
          )}
          {clave && !tienePin && conPin && (
            <p className="text-sm text-destructive">Este local todavía no tiene PIN. Pedile a Vanesa que lo cargue.</p>
          )}
          <Button className="w-full h-11" onClick={entrar} disabled={validando}>
            {validando ? "Verificando..." : "Entrar"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

// ------------------------------------------------------------------
// Aviso al grupo de pendientes
// ------------------------------------------------------------------
const CALIDADES = [
  "Original",
  "OLED / Incell de buena calidad",
  "Genérico",
  "Alternativo",
  "No lleva repuesto (software, limpieza, etc.)",
];
const TIPO_CORTO: Record<string, string> = { cambio: "CAMBIO", reparacion: "REINGRESO", reclamo: "RECLAMO" };

function textoGrupo(c: any, local?: string, conFotos = false) {
  const color = COLOR_UI[c.color]?.label ?? "";
  const l: string[] = [];
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
    l.push(`Cómo vuelve: ${labelDe(ESTADOS_TODOS, c.estado_producto)}`);
  } else {
    l.push(`Producto: ${c.producto_u_orden}`);
    l.push(`Compró: ${fechaCorta(c.fecha_compra)} · Pagó con: ${c.forma_pago} · Ticket: ${c.con_ticket ? "Sí" : "No"}`);
    l.push(`Estado: ${labelDe(ESTADOS_TODOS, c.estado_producto)}${c.es_original_marca ? " · Original Apple/Samsung" : ""}`);
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

// En el celular abre "Compartir" con las fotos (elegís el grupo de WhatsApp).
// En la compu abre WhatsApp Web con el texto para elegir el grupo.
async function compartirEnGrupo(texto: string, files: File[] = []): Promise<boolean> {
  const nav: any = navigator;
  if (files.length && nav.canShare?.({ files, text: texto })) {
    try {
      await nav.share({ files, text: texto });
      return true;
    } catch (e: any) {
      if (e?.name === "AbortError") return false;
    }
  }
  window.open(`https://wa.me/?text=${encodeURIComponent(texto)}`, "_blank", "noopener,noreferrer");
  return true;
}

async function marcarAvisado(id: number, autor: string) {
  const { error } = await db.rpc("reclamos_marcar_avisado", { p_id: id, p_autor: autor });
  if (error) toast.error(`No se pudo registrar el aviso: ${error.message}`);
  return !error;
}

function BotonesGrupo({ caso, local, files, onAvisado }: { caso: any; local?: string; files: () => Promise<File[]>; onAvisado: () => void }) {
  const sesion = useSesion();
  const [trabajando, setTrabajando] = useState(false);
  const mandar = async () => {
    setTrabajando(true);
    const fs = await files().catch(() => []);
    const ok = await compartirEnGrupo(textoGrupo(caso, local, fs.length > 0), fs);
    if (ok && (await marcarAvisado(caso.id, sesion.nombre))) onAvisado();
    setTrabajando(false);
  };
  const copiar = async () => {
    await navigator.clipboard.writeText(textoGrupo(caso, local));
    toast.success("Mensaje copiado: pegalo en el grupo de pendientes con las fotos");
    if (await marcarAvisado(caso.id, sesion.nombre)) onAvisado();
  };
  return (
    <div className="flex flex-wrap gap-2">
      <Button onClick={mandar} disabled={trabajando}><Send className="w-4 h-4 mr-1" />Mandar al grupo de pendientes</Button>
      <Button variant="outline" onClick={copiar}>Copiar mensaje</Button>
    </div>
  );
}

// ------------------------------------------------------------------
// 1. Nuevo caso (la ficha)
// ------------------------------------------------------------------
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
  rep_garantia: "",
};

const CAMPOS_REP = ["rep_fecha_ingreso", "rep_taller", "rep_trabajo", "rep_calidad", "rep_remito", "rep_presupuesto", "rep_sena", "rep_saldo", "rep_garantia"] as const;

function NuevoCaso({ puedeElegirLocal, onCreado, irACasos }: { puedeElegirLocal: boolean; onCreado: () => void; irACasos: () => void }) {
  const { user } = useAuth();
  const sesion = useSesion();
  const sucursalId = sesion.modo === "local" ? sesion.sucursal_id : undefined;
  const nombre = sesion.nombre;
  const [form, setForm] = useState({ ...FORM_VACIO });
  const [fotos, setFotos] = useState<File[]>([]);
  const [sucursales, setSucursales] = useState<{ id: string | number; nombre: string }[]>([]);
  const [enviando, setEnviando] = useState(false);
  const [creado, setCreado] = useState<any>(null);
  const [fotosCreado, setFotosCreado] = useState<File[]>([]);

  useEffect(() => {
    supabase.from("sucursales").select("id, nombre").eq("activo", true).order("nombre")
      .then(({ data }) => setSucursales(data || []));
  }, []);
  useEffect(() => {
    setForm(f => ({ ...f, sucursal_id: f.sucursal_id || sucursalId || "", atendido_por: f.atendido_por || nombre || "" }));
  }, [sucursalId, nombre]);

  const set = (k: keyof typeof FORM_VACIO, v: any) => setForm(f => ({ ...f, [k]: v }));
  const esReparacion = form.tipo === "reparacion";

  const faltantes = () => {
    const f: string[] = [];
    const vacio = (v: string) => !v || !v.trim();
    if (!form.sucursal_id) f.push("local");
    if (vacio(form.atendido_por)) f.push("quién atiende");
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
      if (esReparacion) {
        datos.forma_pago = "Reparación (ver seña y saldo)";
        datos.con_ticket = true;
        datos.es_original_marca = false;
        datos.queda_saldo_favor = false;
        if (!datos.rep_garantia?.trim()) datos.rep_garantia = null;
      } else {
        CAMPOS_REP.forEach(k => (datos[k] = null));
      }

      const { data, error } = await db.from("reclamos").insert(datos).select("*").single();
      if (error) throw new Error(error.message);
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
    const local = sucursales.find(s => String(s.id) === String(creado.sucursal_id))?.nombre;
    return <Resultado caso={creado} local={local} fotos={fotosCreado} otroCaso={otroCaso} irACasos={irACasos} />;
  }

  return (
    <div className="space-y-4">
      <Card className="border-destructive/40">
        <CardContent className="p-3 flex gap-2 text-sm">
          <AlertTriangle className="w-5 h-5 text-destructive shrink-0" />
          <span>
            <b>Si hay riesgo físico</b> (violencia, robo, amenaza en el local): no cargues nada. Ponete a salvo y llamá a Vanesa,
            a Natalia o al 911.
          </span>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Ficha del caso</CardTitle></CardHeader>
        <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {puedeElegirLocal && (
            <F label="Local *">
              <Select value={form.sucursal_id} onValueChange={v => set("sucursal_id", v)}>
                <SelectTrigger><SelectValue placeholder="Elegí el local" /></SelectTrigger>
                <SelectContent>{sucursales.map(s => <SelectItem key={String(s.id)} value={String(s.id)}>{s.nombre}</SelectItem>)}</SelectContent>
              </Select>
            </F>
          )}
          <F label="Quién atiende *"><Input value={form.atendido_por} onChange={e => set("atendido_por", e.target.value)} /></F>

          <F label="Tipo de caso *" full>
            <Select value={form.tipo} onValueChange={v => setForm(f => ({ ...f, tipo: v, estado_producto: "" }))}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>{TIPOS.map(o => <SelectItem key={o.v} value={o.v}>{o.l}</SelectItem>)}</SelectContent>
            </Select>
          </F>

          <F label="Nombre del cliente *"><Input value={form.cliente_nombre} onChange={e => set("cliente_nombre", e.target.value)} /></F>
          <F label="Teléfono del cliente *">
            <Input inputMode="tel" placeholder="299 4 123456" value={form.cliente_telefono} onChange={e => set("cliente_telefono", e.target.value)} />
          </F>

          {esReparacion ? (
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
              <F label="Garantía que se le informó (si se sabe)" full>
                <Input placeholder="Ej: 30 días, figura en la orden" value={form.rep_garantia} onChange={e => set("rep_garantia", e.target.value)} />
              </F>

              <Seccion titulo="Cómo vuelve hoy" />
              <F label="Estado del equipo hoy *" full>
                <Select value={form.estado_producto} onValueChange={v => set("estado_producto", v)}>
                  <SelectTrigger><SelectValue placeholder="Elegí" /></SelectTrigger>
                  <SelectContent>{ESTADOS_EQUIPO.map(o => <SelectItem key={o.v} value={o.v}>{o.l}</SelectItem>)}</SelectContent>
                </Select>
              </F>
            </>
          ) : (
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
              <Si label="Es un original Apple o Samsung" v={form.es_original_marca}
                on={v => setForm(f => ({ ...f, es_original_marca: v, estado_producto: v && f.estado_producto === "sellado" ? "" : f.estado_producto }))} />
              <F label="Estado del producto *">
                <Select value={form.estado_producto} onValueChange={v => set("estado_producto", v)}>
                  <SelectTrigger><SelectValue placeholder="Elegí" /></SelectTrigger>
                  <SelectContent>
                    {ESTADOS_PRODUCTO.filter(o => !(form.es_original_marca && o.v === "sellado"))
                      .map(o => <SelectItem key={o.v} value={o.v}>{o.l}</SelectItem>)}
                  </SelectContent>
                </Select>
              </F>
              <Si label="Trae ticket o la venta aparece en el sistema" v={form.con_ticket} on={v => set("con_ticket", v)} full />
              {form.es_original_marca && form.tipo === "cambio" && (
                <p className="sm:col-span-2 text-sm rounded-md bg-warning/10 border border-warning p-3">
                  Los originales Apple y Samsung se abren y se prueban con el cliente antes de que salgan del local, así que
                  <b> no tienen cambio</b>. No se lo prometas: cargá el caso igual y el encargado lo confirma.
                </p>
              )}
            </>
          )}

          <F label={esReparacion ? "Qué falla ahora (en una frase) *" : "Qué pasa (en una frase) *"} full>
            <Textarea rows={2} placeholder={esReparacion ? "Ej: la pantalla quedó sin imagen" : "Ej: el auricular derecho no enciende"} value={form.que_pasa} onChange={e => set("que_pasa", e.target.value)} />
          </F>
          <F label="Qué probamos en el local *" full>
            <Textarea rows={2} placeholder="Ej: lo cargamos 30 min y probamos con otro cargador: sigue igual" value={form.que_probamos} onChange={e => set("que_probamos", e.target.value)} />
          </F>

          <F label="Qué pide el cliente *">
            <Select value={form.que_pide} onValueChange={v => set("que_pide", v)}>
              <SelectTrigger><SelectValue placeholder="Elegí" /></SelectTrigger>
              <SelectContent>{QUE_PIDE.map(o => <SelectItem key={o.v} value={o.v}>{o.l}</SelectItem>)}</SelectContent>
            </Select>
          </F>
          {!esReparacion && (
            <Si label="Se lleva algo más barato (le queda saldo a favor)" v={form.queda_saldo_favor} on={v => set("queda_saldo_favor", v)} />
          )}
          <Si label="Nombró Defensa del Consumidor, un abogado o las redes" v={form.amenaza_externa} on={v => set("amenaza_externa", v)} full />

          <div className="sm:col-span-2 space-y-2">
            <Label>{esReparacion ? "Fotos del equipo como vuelve y de la orden de ingreso *" : "Fotos del producto, la caja y el ticket *"}</Label>
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
        </CardContent>
      </Card>
    </div>
  );
}

function Resultado({ caso, local, fotos, otroCaso, irACasos }: { caso: any; local?: string; fotos: File[]; otroCaso: () => void; irACasos: () => void }) {
  const ui = COLOR_UI[caso.color] ?? COLOR_UI.amarillo;
  const [avisado, setAvisado] = useState(false);
  const mandarFrase = () =>
    abrirWhatsApp(telWhatsApp(caso.cliente_telefono), `Hola ${caso.cliente_nombre}, te escribimos de MyPhone. ${FRASE_FIJA}`);

  return (
    <Card className={`border-2 ${ui.box}`}>
      <CardContent className="p-6 space-y-4">
        <div className="flex items-center gap-2">
          <Badge className={ui.badge}>{ui.label}</Badge>
          <span className="font-semibold">Caso {caso.numero}</span>
        </div>

        {caso.color === "verde" && (
          <div className="space-y-2">
            <p className="text-lg font-semibold flex items-center gap-2"><CheckCircle2 className="w-5 h-5 text-success" />Podés hacer el cambio.</p>
            <p className="text-sm">{caso.motivo_color}. Pasá el cambio por el sistema y avisá en el grupo de pendientes con el botón de abajo.</p>
          </div>
        )}
        {caso.color === "amarillo" && (
          <div className="space-y-2">
            <p className="text-lg font-semibold">Lo decide el encargado de turno.</p>
            <p className="text-sm">Motivo: {caso.motivo_color}. No prometas nada. Decile al cliente:</p>
            {caso.es_original_marca && caso.tipo === "cambio" && (
              <p className="text-sm">Los originales salen probados del local: en principio no tienen cambio. Lo confirma el encargado.</p>
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
              <p className="text-sm text-muted-foreground">
                En el celular se abre "Compartir" con el mensaje y las fotos: elegí WhatsApp y el grupo. En la compu se abre WhatsApp Web
                con el mensaje; las fotos adjuntalas vos.
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
    let query = db.from("reclamos").select("*, sucursales(nombre)").order("created_at", { ascending: false }).limit(300);
    if (!verResueltos) query = query.neq("estado", "resuelto");
    if (sesion.modo === "local") query = query.eq("sucursal_id", sesion.sucursal_id);
    const { data, error } = await query;
    setLoading(false);
    if (error) return toast.error(error.message);
    setItems(data || []);
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
                      <span className="text-sm text-muted-foreground">{r.sucursales?.nombre}</span>
                      <Badge variant="outline">{ESTADOS[r.estado]}</Badge>
                      {atrasado && <Badge className="bg-destructive text-destructive-foreground"><Clock className="w-3 h-3 mr-1" />Atrasado</Badge>}
                      {!r.avisado_grupo_at && <Badge variant="outline" className="border-destructive text-destructive">Sin avisar al grupo</Badge>}
                    </div>
                    <div className="text-sm"><b>{r.cliente_nombre}</b> · {r.producto_u_orden}</div>
                    <div className="text-sm text-muted-foreground">{r.que_pasa}</div>
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
    const { data: nuevo } = await db.from("reclamos").select("*, sucursales(nombre)").eq("id", caso.id).single();
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

  const autorizarNC = () => guardar({ nota_credito_autorizada_por: nombre || "encargado" });

  const mandarFrase = () =>
    abrirWhatsApp(telWhatsApp(caso.cliente_telefono), `Hola ${caso.cliente_nombre}, te escribimos de MyPhone. ${FRASE_FIJA}`);

  const ui = COLOR_UI[caso.color] ?? COLOR_UI.amarillo;

  return (
    <Dialog open onOpenChange={o => !o && onClose()}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex flex-wrap items-center gap-2">
            <Badge className={ui.badge}>{ui.label}</Badge> {caso.numero}
            <span className="text-sm font-normal text-muted-foreground">{caso.sucursales?.nombre} · {ESTADOS[caso.estado]}</span>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 text-sm">
          <p className="text-muted-foreground">{caso.motivo_color}</p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1">
            <Dato l="Cliente" v={`${caso.cliente_nombre} · ${caso.cliente_telefono}`} />
            <Dato l="Atendió" v={caso.atendido_por} />
            <Dato l="Tipo" v={labelDe(TIPOS, caso.tipo)} />
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
                {caso.rep_garantia && <Dato l="Garantía informada" v={caso.rep_garantia} />}
                <Dato l="Cómo vuelve" v={labelDe(ESTADOS_TODOS, caso.estado_producto)} />
              </>
            ) : (
              <>
                <Dato l="Producto" v={caso.producto_u_orden} />
                <Dato l="Compró" v={fechaCorta(caso.fecha_compra)} />
                <Dato l="Pagó con" v={caso.forma_pago} />
                <Dato l="Estado del producto" v={labelDe(ESTADOS_TODOS, caso.estado_producto)} />
                <Dato l="Ticket" v={caso.con_ticket ? "Sí" : "No"} />
                <Dato l="Original Apple/Samsung" v={caso.es_original_marca ? "Sí" : "No"} />
              </>
            )}
            <Dato l="Pide" v={labelDe(QUE_PIDE, caso.que_pide)} />
            {caso.queda_saldo_favor && <Dato l="Saldo" v="Le queda saldo a favor" />}
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
          <div><b>Qué probamos:</b> {caso.que_probamos}</div>
          {caso.resolucion && <div><b>Resolución:</b> {caso.resolucion}</div>}
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

          <Button size="sm" variant="secondary" onClick={mandarFrase}><MessageCircle className="w-4 h-4 mr-1" />Mandar la frase fija al cliente</Button>

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
                {(caso.que_pide === "nota_credito" || caso.queda_saldo_favor || caso.nota_credito_autorizada_por) && (
                  <F label="N° de nota de crédito (cuando se emita)">
                    <Input value={g.nota_credito_nro} onChange={e => setG({ ...g, nota_credito_nro: e.target.value })} />
                  </F>
                )}
                <div className="sm:col-span-2 flex flex-wrap gap-2">
                  <Button onClick={() => guardar()} disabled={guardando}>Guardar</Button>
                  {(caso.que_pide === "nota_credito" || caso.queda_saldo_favor) && !caso.nota_credito_autorizada_por && (
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
                <Button size="sm" onClick={mandarResumen}><Send className="w-4 h-4 mr-1" />Mandar resumen al grupo</Button>
                <Button size="sm" variant="outline" onClick={copiarResumen}>Copiar</Button>
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

      {esAdmin && <PinesCard />}

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

function PinesCard() {
  const [sucursales, setSucursales] = useState<{ id: string | number; nombre: string }[]>([]);
  const [conPin, setConPin] = useState<string[]>([]);
  const [nuevos, setNuevos] = useState<Record<string, string>>({});

  const load = async () => {
    const [{ data: s }, { data: p }] = await Promise.all([
      supabase.from("sucursales").select("id, nombre").eq("activo", true).order("nombre"),
      db.rpc("reclamos_pines_configurados"),
    ]);
    setSucursales(s || []);
    setConPin(((p || []) as any[]).map(x => (typeof x === "string" ? x : x.reclamos_pines_configurados)));
  };
  useEffect(() => { load(); }, []);

  const filas = sucursales.map(s => ({ clave: String(s.id), nombre: `Local ${s.nombre}` }));

  const guardar = async (clave: string) => {
    const pin = nuevos[clave] || "";
    if (!/^[0-9]{4,8}$/.test(pin)) return toast.error("El PIN tiene que tener entre 4 y 8 números");
    const { error } = await db.rpc("reclamos_cambiar_pin", { p_clave: clave, p_pin: pin });
    if (error) return toast.error(error.message);
    toast.success("PIN guardado");
    setNuevos(n => ({ ...n, [clave]: "" }));
    load();
  };

  return (
    <Card>
      <CardHeader><CardTitle>PIN de acceso</CardTitle></CardHeader>
      <CardContent className="space-y-3">
        <p className="text-sm text-muted-foreground">
          Los PIN se guardan cifrados: no se pueden ver, solo cambiar. Si alguien se olvida el suyo, cargá uno nuevo.
        </p>
        {filas.map(f => (
          <div key={f.clave} className="flex flex-col sm:flex-row sm:items-end gap-2">
            <div className="flex-1 space-y-1">
              <Label>{f.nombre} {conPin.includes(f.clave) ? <Badge variant="outline" className="ml-1">Tiene PIN</Badge> : <Badge className="ml-1 bg-destructive text-destructive-foreground">Sin PIN</Badge>}</Label>
              <Input type="password" inputMode="numeric" autoComplete="new-password" maxLength={8} placeholder="PIN nuevo (4 a 8 números)"
                value={nuevos[f.clave] || ""} onChange={e => setNuevos(n => ({ ...n, [f.clave]: e.target.value.replace(/\D/g, "") }))} />
            </div>
            <Button variant="outline" disabled={!nuevos[f.clave]} onClick={() => guardar(f.clave)}>Guardar</Button>
          </div>
        ))}
      </CardContent>
    </Card>
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
