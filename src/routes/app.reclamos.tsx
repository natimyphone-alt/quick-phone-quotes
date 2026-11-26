import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
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
import { AlertTriangle, Camera, CheckCircle2, Clock, MessageCircle, RefreshCw, Search, Send, X } from "lucide-react";
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
const fecha = (iso?: string | null) => (iso ? new Date(iso).toLocaleString("es-AR", { dateStyle: "short", timeStyle: "short" }) : "—");
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
// Página
// ------------------------------------------------------------------
function ReclamosPage() {
  const { isAdmin } = useAuth();
  const [rol, setRol] = useState<string>("");
  const [tab, setTab] = useState("nuevo");
  const [recarga, setRecarga] = useState(0);

  useEffect(() => {
    db.rpc("reclamos_rol").then(({ data }: any) => setRol(data || ""));
  }, []);

  const puedeGestionar = isAdmin || rol === "administrador" || rol === "encargado";
  const esAdmin = isAdmin || rol === "administrador";

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold">Reclamos</h1>
        <p className="text-sm text-muted-foreground">Cambios, notas de crédito, reingresos y reclamos de clientes.</p>
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
};

function NuevoCaso({ puedeElegirLocal, onCreado, irACasos }: { puedeElegirLocal: boolean; onCreado: () => void; irACasos: () => void }) {
  const { user, sucursalId, nombre } = useAuth();
  const [form, setForm] = useState({ ...FORM_VACIO });
  const [fotos, setFotos] = useState<File[]>([]);
  const [sucursales, setSucursales] = useState<{ id: string | number; nombre: string }[]>([]);
  const [enviando, setEnviando] = useState(false);
  const [creado, setCreado] = useState<any>(null);

  useEffect(() => {
    supabase.from("sucursales").select("id, nombre").eq("activo", true).order("nombre")
      .then(({ data }) => setSucursales(data || []));
  }, []);
  useEffect(() => {
    setForm(f => ({ ...f, sucursal_id: f.sucursal_id || sucursalId || "", atendido_por: f.atendido_por || nombre || "" }));
  }, [sucursalId, nombre]);

  const set = (k: keyof typeof FORM_VACIO, v: any) => setForm(f => ({ ...f, [k]: v }));

  const faltantes = () => {
    const f: string[] = [];
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
      const rutas: string[] = [];
      for (let i = 0; i < fotos.length; i++) {
        const blob = await comprimirImagen(fotos[i]);
        const ruta = `${form.sucursal_id}/${Date.now()}-${i}.jpg`;
        const { error } = await supabase.storage.from("reclamos").upload(ruta, blob, { contentType: "image/jpeg" });
        if (error) throw new Error(`No se pudo subir la foto ${i + 1}: ${error.message}`);
        rutas.push(ruta);
      }
      const { data, error } = await db.from("reclamos")
        .insert({ ...form, user_id: user.id, fotos: rutas })
        .select("*")
        .single();
      if (error) throw new Error(error.message);
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
    setForm({ ...FORM_VACIO, sucursal_id: form.sucursal_id, atendido_por: form.atendido_por });
  };

  if (creado) return <Resultado caso={creado} otroCaso={otroCaso} irACasos={irACasos} />;

  const esReparacion = form.tipo === "reparacion";

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
          {puedeElegirLocal && !sucursalId && (
            <F label="Local *">
              <Select value={form.sucursal_id} onValueChange={v => set("sucursal_id", v)}>
                <SelectTrigger><SelectValue placeholder="Elegí el local" /></SelectTrigger>
                <SelectContent>{sucursales.map(s => <SelectItem key={String(s.id)} value={String(s.id)}>{s.nombre}</SelectItem>)}</SelectContent>
              </Select>
            </F>
          )}
          {!puedeElegirLocal && !sucursalId && (
            <p className="sm:col-span-2 text-sm text-destructive">
              Tu usuario no tiene un local asignado. Pedile a Vanesa que te lo asigne para poder cargar casos.
            </p>
          )}
          <F label="Quién atiende *"><Input value={form.atendido_por} onChange={e => set("atendido_por", e.target.value)} /></F>

          <F label="Tipo de caso *" full>
            <Select value={form.tipo} onValueChange={v => set("tipo", v)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>{TIPOS.map(o => <SelectItem key={o.v} value={o.v}>{o.l}</SelectItem>)}</SelectContent>
            </Select>
          </F>

          <F label="Nombre del cliente *"><Input value={form.cliente_nombre} onChange={e => set("cliente_nombre", e.target.value)} /></F>
          <F label="Teléfono del cliente *">
            <Input inputMode="tel" placeholder="299 4 123456" value={form.cliente_telefono} onChange={e => set("cliente_telefono", e.target.value)} />
          </F>

          <F label={esReparacion ? "N° de orden y equipo *" : "Producto *"}>
            <Input placeholder={esReparacion ? "Ej: 343R Moto G51" : "Ej: Auricular Redmi Buds 5"} value={form.producto_u_orden} onChange={e => set("producto_u_orden", e.target.value)} />
          </F>
          <F label={esReparacion ? "Fecha en que retiró el equipo *" : "Fecha de compra *"}>
            <Input type="date" max={hoyISO()} value={form.fecha_compra} onChange={e => set("fecha_compra", e.target.value)} />
          </F>

          <F label="Forma de pago *">
            <Select value={form.forma_pago} onValueChange={v => set("forma_pago", v)}>
              <SelectTrigger><SelectValue placeholder="Elegí" /></SelectTrigger>
              <SelectContent>{FORMAS_PAGO.map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}</SelectContent>
            </Select>
          </F>
          <F label="Estado del producto *">
            <Select value={form.estado_producto} onValueChange={v => set("estado_producto", v)}>
              <SelectTrigger><SelectValue placeholder="Elegí" /></SelectTrigger>
              <SelectContent>{ESTADOS_PRODUCTO.map(o => <SelectItem key={o.v} value={o.v}>{o.l}</SelectItem>)}</SelectContent>
            </Select>
          </F>

          <Si label="Trae ticket o la venta aparece en el sistema" v={form.con_ticket} on={v => set("con_ticket", v)} />
          <Si label="Es un original Apple o Samsung" v={form.es_original_marca} on={v => set("es_original_marca", v)} />

          <F label="Qué pasa (en una frase) *" full>
            <Textarea rows={2} placeholder="Ej: el auricular derecho no enciende" value={form.que_pasa} onChange={e => set("que_pasa", e.target.value)} />
          </F>
          <F label="Qué probamos en el local *" full>
            <Textarea rows={2} placeholder="Ej: lo cargamos 30 min y probamos con otro celular: sigue sin andar" value={form.que_probamos} onChange={e => set("que_probamos", e.target.value)} />
          </F>

          <F label="Qué pide el cliente *">
            <Select value={form.que_pide} onValueChange={v => set("que_pide", v)}>
              <SelectTrigger><SelectValue placeholder="Elegí" /></SelectTrigger>
              <SelectContent>{QUE_PIDE.map(o => <SelectItem key={o.v} value={o.v}>{o.l}</SelectItem>)}</SelectContent>
            </Select>
          </F>
          <Si label="Se lleva algo más barato (le queda saldo a favor)" v={form.queda_saldo_favor} on={v => set("queda_saldo_favor", v)} />
          <Si label="Nombró Defensa del Consumidor, un abogado o las redes" v={form.amenaza_externa} on={v => set("amenaza_externa", v)} full />

          <div className="sm:col-span-2 space-y-2">
            <Label>Fotos del producto, la caja y el ticket *</Label>
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

function Resultado({ caso, otroCaso, irACasos }: { caso: any; otroCaso: () => void; irACasos: () => void }) {
  const ui = COLOR_UI[caso.color] ?? COLOR_UI.amarillo;
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
            <p className="text-sm">{caso.motivo_color}. Pasá el cambio por el sistema. El caso queda registrado, no hace falta avisar en el grupo.</p>
          </div>
        )}
        {caso.color === "amarillo" && (
          <div className="space-y-2">
            <p className="text-lg font-semibold">Lo decide el encargado de turno.</p>
            <p className="text-sm">Motivo: {caso.motivo_color}. No prometas nada. Decile al cliente:</p>
            <p className="text-base font-medium bg-background rounded-md p-3">"{FRASE_FIJA}"</p>
            <p className="text-sm text-muted-foreground">La respuesta te aparece en la pestaña Casos.</p>
          </div>
        )}
        {caso.color === "rojo" && (
          <div className="space-y-2">
            <p className="text-lg font-semibold">Lo decide Vanesa.</p>
            <p className="text-sm">Motivo: {caso.motivo_color}. No expliques, no discutas y no mandes otros mensajes. Decile solamente:</p>
            <p className="text-base font-medium bg-background rounded-md p-3">"{FRASE_FIJA}"</p>
          </div>
        )}

        <div className="flex flex-wrap gap-2">
          {caso.color !== "verde" && (
            <Button variant="secondary" onClick={mandarFrase}><MessageCircle className="w-4 h-4 mr-1" />Mandar la frase por WhatsApp</Button>
          )}
          <Button variant="outline" onClick={irACasos}>Ver casos</Button>
          <Button onClick={otroCaso}>Cargar otro caso</Button>
        </div>
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

  const load = async () => {
    setLoading(true);
    let query = db.from("reclamos").select("*, sucursales(nombre)").order("created_at", { ascending: false }).limit(300);
    if (!verResueltos) query = query.neq("estado", "resuelto");
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
        <DetalleCaso caso={abierto} puedeGestionar={puedeGestionar} onClose={() => setAbierto(null)} onGuardado={() => { setAbierto(null); load(); }} />
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
function DetalleCaso({ caso, puedeGestionar, onClose, onGuardado }: { caso: any; puedeGestionar: boolean; onClose: () => void; onGuardado: () => void }) {
  const { nombre } = useAuth();
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
    const { error } = await db.from("reclamos_eventos").insert({ reclamo_id: caso.id, tipo: "comentario", texto: comentario.trim() });
    if (error) return toast.error(error.message);
    setComentario("");
    cargarEventos();
  };

  const guardar = async (extra: Record<string, any> = {}) => {
    if (g.estado === "resuelto" && !g.resolucion.trim()) return toast.error("Escribí qué se resolvió antes de cerrar el caso");
    setGuardando(true);
    const { error } = await db.from("reclamos").update({ ...g, responsable: caso.responsable || nombre, ...extra }).eq("id", caso.id);
    setGuardando(false);
    if (error) return toast.error(error.message);
    toast.success(`Caso ${caso.numero} actualizado`);
    onGuardado();
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
            <Dato l={caso.tipo === "reparacion" ? "Orden" : "Producto"} v={caso.producto_u_orden} />
            <Dato l={caso.tipo === "reparacion" ? "Retiró el equipo" : "Compró"} v={fechaCorta(caso.fecha_compra)} />
            <Dato l="Pagó con" v={caso.forma_pago} />
            <Dato l="Estado del producto" v={labelDe(ESTADOS_PRODUCTO, caso.estado_producto)} />
            <Dato l="Ticket" v={caso.con_ticket ? "Sí" : "No"} />
            <Dato l="Original Apple/Samsung" v={caso.es_original_marca ? "Sí" : "No"} />
            <Dato l="Pide" v={labelDe(QUE_PIDE, caso.que_pide)} />
            {caso.queda_saldo_favor && <Dato l="Saldo" v="Le queda saldo a favor" />}
            {caso.amenaza_externa && <Dato l="Atención" v="Nombró Defensa del Consumidor, abogado o redes" />}
            <Dato l="Creado" v={fecha(caso.created_at)} />
            <Dato l="Vence" v={fecha(caso.vence_at)} />
          </div>
          <div><b>Qué pasa:</b> {caso.que_pasa}</div>
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
function Dato({ l, v }: { l: string; v: string }) {
  return <div><span className="text-muted-foreground">{l}:</span> {v}</div>;
}
function Stat({ n, l, cls }: { n: number; l: string; cls: string }) {
  return (
    <Card><CardContent className="p-3"><div className={`text-2xl font-bold ${cls}`}>{n}</div><div className="text-xs text-muted-foreground">{l}</div></CardContent></Card>
  );
}
