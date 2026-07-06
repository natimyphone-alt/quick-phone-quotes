import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { formatARS } from "@/lib/calculos";
import { calcularOpcion, OpcionCalculada } from "@/lib/proveedores";
import { descargarPDFMultiOpciones } from "@/lib/pdf";
import { buildMensajeWhatsApp, abrirWhatsApp } from "@/lib/whatsapp";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { toast } from "sonner";
import { FileDown, MessageCircle, Save, Search, Check } from "lucide-react";

export const Route = createFileRoute("/app/illia")({
  component: IlliaPage,
});

interface TipoReparacion {
  reparacion: string;
  importe: number;
}

interface PCProducto {
  nombre: string;
  precio: number;
  url: string;
  stock: boolean;
}

const PC_BASE = "https://neuquenpatagoniacell.com.ar";

async function buscarEnPatagoniaCell(marca: string, modelo: string): Promise<PCProducto[]> {
  try {
    const query = `${marca} ${modelo}`.trim();
    const url = `${PC_BASE}/search/?q=${encodeURIComponent(query)}`;
    const res = await fetch(url, {
      headers: { Accept: "text/html" },
    });
    if (!res.ok) return [];
    const html = await res.text();

    const productos: PCProducto[] = [];
    const vistos = new Set<string>();
    const bloqueRe = /data-variants="([^"]+)"[\s\S]{0,3000}?href="(https?:\/\/[^"]+\/productos\/[^"]+)"[^>]*title="([^"]+)"/g;
    let m: RegExpExecArray | null;

    while ((m = bloqueRe.exec(html)) !== null) {
      const url = m[2];
      if (vistos.has(url)) continue;
      vistos.add(url);
      const nombre = m[3].replace(/&amp;/g, "&").replace(/&quot;/g, '"').trim();
      let variants: any[] = [];
      try {
        const decoded = m[1].replace(/&quot;/g, '"').replace(/&amp;/g, "&").replace(/&#39;/g, "'");
        variants = JSON.parse(decoded);
      } catch { continue; }
      if (!variants.length) continue;
      const v = variants[0];
      const precio = Number(v.price_number) || 0;
      if (precio <= 0) continue;
      const stock = v.available === true && (v.stock === null || Number(v.stock) > 0);
      productos.push({ nombre, precio, url, stock });
    }
    return productos;
  } catch {
    return [];
  }
}

function IlliaPage() {
  const { user, sucursalId, nombre } = useAuth();
  const [form, setForm] = useState({
    cliente: "", telefono: "", marca: "", modelo: "",
    tipo_reparacion: "", envio: 0,
  });
  const [tiposReparacion, setTiposReparacion] = useState<TipoReparacion[]>([]);
  const [buscando, setBuscando] = useState(false);
  const [opciones, setOpciones] = useState<OpcionCalculada[]>([]);
  const [seleccionada, setSeleccionada] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState<{ numero: number; id: string } | null>(null);

  useEffect(() => {
    supabase.from("mano_obra").select("reparacion, importe").order("reparacion")
      .then(({ data }) => setTiposReparacion((data as any) || []));
  }, []);

  const tipoActual = useMemo(
    () => tiposReparacion.find(t => t.reparacion === form.tipo_reparacion),
    [tiposReparacion, form.tipo_reparacion],
  );
  const manoObraValor = Number(tipoActual?.importe) || 0;

  const upd = (k: string, v: any) => {
    setForm(f => ({ ...f, [k]: v }));
    setOpciones([]);
    setSeleccionada(null);
    setSaved(null);
  };

  const tipoRepuestoFiltro = useMemo(() => {
    const r = form.tipo_reparacion.toLowerCase();
    if (r.includes("batería") || r.includes("bateria")) return "Batería";
    if (r.includes("placa") || r.includes("pin")) return "Placa de carga";
    return "Módulo";
  }, [form.tipo_reparacion]);

  const buscarRepuestos = async () => {
    if (!form.marca.trim() || !form.modelo.trim()) return toast.error("Ingresá marca y modelo");
    if (!form.tipo_reparacion) return toast.error("Seleccioná el tipo de reparación");
    setBuscando(true);

    let queryFV = supabase.from("catalogo_repuestos")
      .select("*")
      .ilike("marca", `%${form.marca.trim()}%`)
      .ilike("modelo", `%${form.modelo.trim()}%`)
      .eq("stock", true)
      .ilike("tipo_repuesto", `%${tipoRepuestoFiltro}%`);

    const [fvResult, pcProductos] = await Promise.all([
      queryFV,
      buscarEnPatagoniaCell(form.marca.trim(), form.modelo.trim()),
    ]);

    setBuscando(false);

    const fvData = fvResult.data || [];
    const opsFV = fvData.map((r: any) => calcularOpcion({
      proveedor: r.proveedor, calidad: r.calidad,
      precioProveedor: Number(r.precio_proveedor ?? r.precio),
      precioCalculado: r.precio_calculado != null ? Number(r.precio_calculado) : undefined,
      manoObra: manoObraValor,
      envio: Number(form.envio) || 0,
      minimoFinal: null,
      url_producto: r.url_producto,
      catalogo_id: r.id,
    }));

    const productospcFiltrados = pcProductos.filter(p => {
      if (!p.stock) return false;
      const n = p.nombre.toLowerCase();
      if (tipoRepuestoFiltro === "Batería") return n.includes("bater");
      if (tipoRepuestoFiltro === "Placa de carga") return n.includes("placa") || n.includes("carga");
      return n.includes("módulo") || n.includes("modulo") || n.includes("pantalla") || n.includes("service pack");
    });

    const opsPC = productospcFiltrados.map(p => calcularOpcion({
      proveedor: "Patagonia Cell",
      calidad: /oled/i.test(p.nombre) ? "OLED" : /incell/i.test(p.nombre) ? "Incell" : /service pack/i.test(p.nombre) ? "Service Pack" : "Original",
      precioProveedor: p.precio,
      manoObra: manoObraValor,
      envio: Number(form.envio) || 0,
      minimoFinal: null,
      url_producto: p.url,
    }));

    const todasOpciones = [...opsFV, ...opsPC];
    setOpciones(todasOpciones);
    setSeleccionada(null);

    if (todasOpciones.length === 0) {
      toast.error("Sin coincidencias en ningún proveedor");
    } else {
      toast.success(`${todasOpciones.length} opciones encontradas`);
    }
  };

  const guardar = async () => {
    if (opciones.length === 0 || !user) return;
    if (!form.cliente.trim()) return toast.error("Ingresá el cliente");
    setSaving(true);
    const elegida = seleccionada !== null ? opciones[seleccionada] : opciones[0];
    const { data: presu, error } = await supabase.from("presupuestos").insert({
      tipo: "illia",
      cliente: form.cliente, telefono: form.telefono,
      marca: form.marca, modelo: form.modelo, reparacion: form.tipo_reparacion,
      costo: elegida.costo_repuesto + elegida.mano_obra,
      ganancia: elegida.ganancia, envio: elegida.envio,
      subtotal: elegida.subtotal, iva: elegida.iva, total: elegida.total,
      sucursal_id: sucursalId, user_id: user.id,
    }).select("id, numero").single();
    if (error || !presu) { setSaving(false); return toast.error(error?.message || "Error"); }
    const filas = opciones.map((op, i) => ({
      presupuesto_id: presu.id,
      proveedor: op.proveedor, calidad: op.calidad,
      costo_repuesto: op.costo_repuesto, mano_obra: op.mano_obra, envio: op.envio,
      ganancia: op.ganancia, iva: op.iva, total: op.total,
      seleccionada: seleccionada === i,
    }));
    const { error: errOps } = await supabase.from("opciones_presupuesto").insert(filas);
    setSaving(false);
    if (errOps) return toast.error(errOps.message);
    setSaved({ numero: presu.numero, id: presu.id });
    toast.success(`Presupuesto N° ${presu.numero} guardado`);
  };

  const marcarSeleccion = async (idx: number) => {
    setSeleccionada(idx);
    if (saved) {
      const { data: ops } = await supabase.from("opciones_presupuesto")
        .select("id, proveedor, calidad").eq("presupuesto_id", saved.id);
      if (ops) {
        const target = opciones[idx];
        const match = ops.find((o: any) => o.proveedor === target.proveedor && (o.calidad || "") === (target.calidad || ""));
        if (match) {
          await supabase.from("opciones_presupuesto").update({ seleccionada: false }).eq("presupuesto_id", saved.id);
          await supabase.from("opciones_presupuesto").update({ seleccionada: true }).eq("id", (match as any).id);
          await supabase.from("presupuestos").update({
            costo: target.costo_repuesto + target.mano_obra,
            ganancia: target.ganancia, envio: target.envio,
            subtotal: target.subtotal, iva: target.iva, total: target.total,
          }).eq("id", saved.id);
          toast.success("Opción seleccionada actualizada");
        }
      }
    }
  };

  const pdf = () => {
    if (opciones.length === 0) return;
    descargarPDFMultiOpciones({
      numero: saved?.numero ?? 0,
      fecha: new Date().toLocaleString("es-AR"),
      cliente: form.cliente, telefono: form.telefono,
      marca: form.marca, modelo: form.modelo,
      reparacion: form.tipo_reparacion,
      opciones, seleccionadaIdx: seleccionada, usuario: nombre,
    });
  };

  const whatsapp = () => {
    if (opciones.length === 0) return;
    const elegida = seleccionada !== null ? opciones[seleccionada] : null;
    let msg: string;
    if (elegida) {
      msg = buildMensajeWhatsApp({
        cliente: form.cliente, marca: form.marca, modelo: form.modelo,
        reparacion: `${form.tipo_reparacion} (${elegida.proveedor} ${elegida.calidad || ""})`,
        total: elegida.total,
      });
    } else {
      const lineas = opciones.map((o, i) =>
        `Opción ${i + 1}: ${o.proveedor} ${o.calidad || ""} — ${formatARS(o.total)}`
      ).join("\n");
      msg = `Hola ${form.cliente}.\n\nPresupuesto para tu ${form.marca} ${form.modelo} (${form.tipo_reparacion}):\n\n${lineas}\n\nMuchas gracias.\nMyPhone`;
    }
    abrirWhatsApp(form.telefono, msg);
  };

  return (
    <div className="space-y-4 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold">Presupuesto</h1>

      <Card>
        <CardHeader><CardTitle>Datos del equipo</CardTitle></CardHeader>
        <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Field label="Cliente *"><Input value={form.cliente} onChange={e => upd("cliente", e.target.value)} /></Field>
          <Field label="Teléfono"><Input value={form.telefono} onChange={e => upd("telefono", e.target.value)} /></Field>
          <Field label="Marca *"><Input value={form.marca} onChange={e => upd("marca", e.target.value)} placeholder="Samsung" /></Field>
          <Field label="Modelo *"><Input value={form.modelo} onChange={e => upd("modelo", e.target.value)} placeholder="A15" /></Field>
          <Field label="Tipo de reparación *" full>
            <Select value={form.tipo_reparacion} onValueChange={v => upd("tipo_reparacion", v)}>
              <SelectTrigger><SelectValue placeholder="Seleccioná el tipo de reparación" /></SelectTrigger>
              <SelectContent>
                {tiposReparacion.map(t => (
                  <SelectItem key={t.reparacion} value={t.reparacion}>
                    {t.reparacion} — m.o. {formatARS(Number(t.importe))}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
          <Field label="Envío"><Input type="number" min={0} value={form.envio} onChange={e => upd("envio", e.target.value)} /></Field>
          <div className="flex items-end">
            <Button onClick={buscarRepuestos} disabled={buscando} className="w-full h-11" size="lg">
              <Search className="w-4 h-4 mr-2" />{buscando ? "Buscando..." : "Buscar opciones"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {opciones.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-lg font-semibold">Opciones encontradas ({opciones.length})</h2>
          {opciones.map((op, i) => {
            const elegida = seleccionada === i;
            return (
              <Card key={i} className={elegida ? "border-2 border-primary" : ""}>
                <CardContent className="p-4 space-y-2">
                  <div className="flex justify-between items-start flex-wrap gap-2">
                    <div>
                      <div className="font-semibold">Opción {i + 1}: {op.proveedor}</div>
                      {op.calidad && <Badge className="mt-1">{op.calidad}</Badge>}
                      {op.url_producto && (
                        <a href={op.url_producto} target="_blank" rel="noreferrer" className="block text-xs text-primary underline mt-1">
                          Ver producto
                        </a>
                      )}
                    </div>
                    <Button size="sm" variant={elegida ? "default" : "outline"} onClick={() => marcarSeleccion(i)}>
                      {elegida ? <><Check className="w-4 h-4 mr-1" />Elegida</> : "Cliente elige esta"}
                    </Button>
                  </div>
                  <div className="text-sm space-y-1">
                    <Row k="Costo repuesto" v={formatARS(op.costo_repuesto)} />
                    <Row k="Mano de obra" v={formatARS(op.mano_obra)} />
                    <Row k="Envío" v={formatARS(op.envio)} />
                    <Row k="Ganancia" v={formatARS(op.ganancia)} />
                    <Row k="IVA 21%" v={formatARS(op.iva)} />
                  </div>
                  <div className="flex justify-between bg-primary text-primary-foreground rounded-md p-3 font-bold">
                    <span>TOTAL</span><span>{formatARS(op.total)}</span>
                  </div>
                </CardContent>
              </Card>
            );
          })}

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-2">
            <Button onClick={guardar} disabled={saving || !!saved} size="lg">
              <Save className="w-4 h-4 mr-2" />{saved ? `Guardado N° ${saved.numero}` : "Guardar"}
            </Button>
            <Button onClick={pdf} variant="secondary" size="lg"><FileDown className="w-4 h-4 mr-2" />PDF</Button>
            <Button onClick={whatsapp} size="lg" className="bg-success text-success-foreground hover:opacity-90">
              <MessageCircle className="w-4 h-4 mr-2" />WhatsApp
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

function Field({ label, children, full }: { label: string; children: React.ReactNode; full?: boolean }) {
  return <div className={`space-y-1.5 ${full ? "sm:col-span-2" : ""}`}><Label>{label}</Label>{children}</div>;
}
function Row({ k, v }: { k: string; v: string }) {
  return <div className="flex justify-between text-sm border-b pb-1"><span className="text-muted-foreground">{k}</span><span className="font-medium">{v}</span></div>;
}