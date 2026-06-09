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

interface Repuesto {
  id: string; proveedor: string; marca: string; modelo: string;
  tipo_repuesto: string; calidad: string | null; precio: number; url_producto: string | null;
}

function IlliaPage() {
  const { user, sucursalId, nombre } = useAuth();
  const [form, setForm] = useState({
    cliente: "", telefono: "", marca: "", modelo: "", tipo_reparacion: "Cambio de módulo", envio: 0,
  });
  const [tiposReparacion, setTiposReparacion] = useState<{ tipo_reparacion: string; precio: number; minimo_final: number | null }[]>([]);
  const [repuestos, setRepuestos] = useState<Repuesto[]>([]);
  const [buscando, setBuscando] = useState(false);
  const [opciones, setOpciones] = useState<OpcionCalculada[]>([]);
  const [seleccionada, setSeleccionada] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState<{ numero: number; id: string } | null>(null);

  useEffect(() => {
    supabase.from("mano_obra").select("tipo_reparacion, precio, minimo_final").order("tipo_reparacion")
      .then(({ data }) => setTiposReparacion((data as any) || []));
  }, []);

  const tipoActual = useMemo(
    () => tiposReparacion.find(t => t.tipo_reparacion === form.tipo_reparacion),
    [tiposReparacion, form.tipo_reparacion],
  );
  const manoObraValor = Number(tipoActual?.precio) || 0;
  const minimoFinal = tipoActual?.minimo_final ?? null;

  const upd = (k: string, v: any) => { setForm(f => ({ ...f, [k]: v })); setOpciones([]); setSeleccionada(null); setSaved(null); };

  const buscarRepuestos = async () => {
    if (!form.marca.trim() || !form.modelo.trim()) return toast.error("Ingresá marca y modelo");
    setBuscando(true);
    const { data, error } = await supabase.from("catalogo_repuestos")
      .select("*")
      .ilike("marca", `%${form.marca.trim()}%`)
      .ilike("modelo", `%${form.modelo.trim()}%`);
    setBuscando(false);
    if (error) return toast.error(error.message);
    setRepuestos((data as any) || []);
    if (!data || data.length === 0) { setOpciones([]); return toast.error("Sin coincidencias en catálogo"); }
    const ops = data.map((r: any) => calcularOpcion({
      proveedor: r.proveedor, calidad: r.calidad,
      precioProveedor: Number(r.precio_proveedor ?? r.precio),
      precioCalculado: r.precio_calculado != null ? Number(r.precio_calculado) : undefined,
      manoObra: manoObraValor,
      envio: Number(form.envio) || 0,
      minimoFinal,
      url_producto: r.url_producto,
      catalogo_id: r.id,
    }));
    setOpciones(ops);
    setSeleccionada(null);
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
      ganancia: elegida.ganancia,
      envio: elegida.envio,
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
      // Actualizar registro en DB
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
      opciones,
      seleccionadaIdx: seleccionada,
      usuario: nombre,
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
      msg = `Hola ${form.cliente}.\n\nPresupuesto para tu ${form.marca} ${form.modelo} (${form.tipo_reparacion}):\n\n${lineas}\n\nMuchas gracias.\nMyPhone Hub`;
    }
    abrirWhatsApp(form.telefono, msg);
  };

  return (
    <div className="space-y-4 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold">Presupuesto Illia</h1>

      <Card>
        <CardHeader><CardTitle>Datos del equipo</CardTitle></CardHeader>
        <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Field label="Cliente *"><Input value={form.cliente} onChange={e => upd("cliente", e.target.value)} /></Field>
          <Field label="Teléfono"><Input value={form.telefono} onChange={e => upd("telefono", e.target.value)} /></Field>
          <Field label="Marca *"><Input value={form.marca} onChange={e => upd("marca", e.target.value)} placeholder="Samsung" /></Field>
          <Field label="Modelo *"><Input value={form.modelo} onChange={e => upd("modelo", e.target.value)} placeholder="A15" /></Field>
          <Field label="Tipo de reparación" full>
            <Select value={form.tipo_reparacion} onValueChange={v => upd("tipo_reparacion", v)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {tiposReparacion.map(t => (
                  <SelectItem key={t.tipo_reparacion} value={t.tipo_reparacion}>
                    {t.tipo_reparacion} — m.o. {formatARS(Number(t.precio))}
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
                  {op.ajustado_minimo && (
                    <p className="text-xs text-muted-foreground">
                      ⓘ Ajustado al mínimo final configurado para este tipo de reparación.
                    </p>
                  )}
                </CardContent>
              </Card>
            );
          })}

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-2">
            <Button onClick={guardar} disabled={saving || !!saved} size="lg"><Save className="w-4 h-4 mr-2" />{saved ? `Guardado N° ${saved.numero}` : "Guardar"}</Button>
            <Button onClick={pdf} variant="secondary" size="lg"><FileDown className="w-4 h-4 mr-2" />PDF</Button>
            <Button onClick={whatsapp} size="lg" className="bg-success text-success-foreground hover:opacity-90"><MessageCircle className="w-4 h-4 mr-2" />WhatsApp</Button>
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
