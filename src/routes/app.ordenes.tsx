import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { FileDown, MessageCircle, Plus, Search } from "lucide-react";
import { descargarOrdenPDF, formatOTNumero } from "@/lib/ot-pdf";
import { abrirWhatsApp } from "@/lib/whatsapp";

export const Route = createFileRoute("/app/ordenes")({
  component: OrdenesPage,
});

const ESTADOS = ["ingresado","en_revision","en_reparacion","listo","entregado","no_reparado"] as const;
const ESTADO_COLOR: Record<string, string> = {
  ingresado: "bg-muted text-foreground",
  en_revision: "bg-warning/20 text-warning-foreground",
  en_reparacion: "bg-accent/20 text-accent-foreground",
  listo: "bg-success/20 text-success",
  entregado: "bg-primary/20 text-primary",
  no_reparado: "bg-destructive/20 text-destructive",
};

function OrdenesPage() {
  const { user, sucursalId, nombre } = useAuth();
  const [items, setItems] = useState<any[]>([]);
  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    cliente: "", telefono: "", marca: "", modelo: "", imei: "",
    falla: "", accesorios: "", clave_desbloqueo: "", tecnico: "",
  });

  const load = async () => {
    setLoading(true);
    let query = supabase.from("ordenes_trabajo")
      .select("*, sucursales(nombre)")
      .order("created_at", { ascending: false })
      .limit(200);
    if (q.trim()) {
      const t = `%${q.trim()}%`;
      query = query.or(`cliente.ilike.${t},telefono.ilike.${t},modelo.ilike.${t},imei.ilike.${t}`);
    }
    const { data, error } = await query;
    setLoading(false);
    if (error) return toast.error(error.message);
    setItems(data || []);
  };
  useEffect(() => { load(); }, []);

  const crear = async () => {
    if (!user) return;
    if (!form.cliente.trim()) return toast.error("Ingresá el cliente");
    const { data, error } = await supabase.from("ordenes_trabajo").insert({
      ...form, user_id: user.id, sucursal_id: sucursalId,
    }).select("numero").single();
    if (error) return toast.error(error.message);
    toast.success(`${formatOTNumero(data.numero)} creada`);
    setForm({ cliente: "", telefono: "", marca: "", modelo: "", imei: "", falla: "", accesorios: "", clave_desbloqueo: "", tecnico: "" });
    setShowForm(false);
    load();
  };

  const cambiarEstado = async (id: string, estado: string) => {
    const { error } = await supabase.from("ordenes_trabajo").update({ estado: estado as any }).eq("id", id);
    if (error) return toast.error(error.message);
    setItems(items.map(it => it.id === id ? { ...it, estado } : it));
  };

  const pdf = (o: any) => descargarOrdenPDF({
    numero: o.numero,
    fecha: new Date(o.created_at).toLocaleString("es-AR"),
    cliente: o.cliente, telefono: o.telefono, marca: o.marca, modelo: o.modelo,
    imei: o.imei, falla: o.falla, accesorios: o.accesorios, clave_desbloqueo: o.clave_desbloqueo,
    tecnico: o.tecnico, estado: o.estado, sucursal: o.sucursales?.nombre, usuario: nombre,
  });

  const wsp = (o: any) => {
    const msg = `Hola ${o.cliente}.\n\nTu orden de trabajo ${formatOTNumero(o.numero)} está en estado: ${o.estado.replace("_", " ")}.\n\nGracias.\nMyPhone Hub`;
    abrirWhatsApp(o.telefono, msg);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Órdenes de Trabajo</h1>
        <Button onClick={() => setShowForm(s => !s)}><Plus className="w-4 h-4 mr-1" />Nueva OT</Button>
      </div>

      {showForm && (
        <Card>
          <CardHeader><CardTitle>Nueva orden</CardTitle></CardHeader>
          <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <F label="Cliente *"><Input value={form.cliente} onChange={e => setForm({ ...form, cliente: e.target.value })} /></F>
            <F label="Teléfono"><Input value={form.telefono} onChange={e => setForm({ ...form, telefono: e.target.value })} /></F>
            <F label="Marca"><Input value={form.marca} onChange={e => setForm({ ...form, marca: e.target.value })} /></F>
            <F label="Modelo"><Input value={form.modelo} onChange={e => setForm({ ...form, modelo: e.target.value })} /></F>
            <F label="IMEI"><Input value={form.imei} onChange={e => setForm({ ...form, imei: e.target.value })} /></F>
            <F label="Técnico"><Input value={form.tecnico} onChange={e => setForm({ ...form, tecnico: e.target.value })} /></F>
            <F label="Clave / Patrón"><Input value={form.clave_desbloqueo} onChange={e => setForm({ ...form, clave_desbloqueo: e.target.value })} /></F>
            <F label="Accesorios"><Input value={form.accesorios} onChange={e => setForm({ ...form, accesorios: e.target.value })} /></F>
            <F label="Falla declarada" full><Textarea rows={3} value={form.falla} onChange={e => setForm({ ...form, falla: e.target.value })} /></F>
            <div className="sm:col-span-2">
              <Button onClick={crear} className="w-full h-11" size="lg">Crear OT</Button>
            </div>
          </CardContent>
        </Card>
      )}

      <form onSubmit={e => { e.preventDefault(); load(); }} className="flex gap-2">
        <Input placeholder="Buscar por cliente, teléfono, modelo o IMEI..." value={q} onChange={e => setQ(e.target.value)} />
        <Button type="submit"><Search className="w-4 h-4" /></Button>
      </form>

      {loading ? <p className="text-muted-foreground">Cargando...</p> :
       items.length === 0 ? <p className="text-muted-foreground text-center py-8">Sin órdenes.</p> :
        <div className="space-y-3">
          {items.map(o => (
            <Card key={o.id}>
              <CardContent className="p-4 space-y-2">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <div className="font-semibold">{formatOTNumero(o.numero)} — {o.cliente}</div>
                    <div className="text-xs text-muted-foreground">
                      {new Date(o.created_at).toLocaleString("es-AR")} • {o.sucursales?.nombre || "—"}
                    </div>
                  </div>
                  <Badge className={ESTADO_COLOR[o.estado]}>{o.estado.replace("_", " ")}</Badge>
                </div>
                <div className="text-sm">
                  {o.marca} {o.modelo} {o.imei && <span className="text-muted-foreground">• IMEI {o.imei}</span>}
                </div>
                {o.falla && <div className="text-sm text-muted-foreground">{o.falla}</div>}
                <div className="flex items-center justify-end flex-wrap gap-2">
                  <Select value={o.estado} onValueChange={v => cambiarEstado(o.id, v)}>
                    <SelectTrigger className="h-9 w-44"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {ESTADOS.map(e => <SelectItem key={e} value={e}>{e.replace("_", " ")}</SelectItem>)}
                    </SelectContent>
                  </Select>
                  <Button size="sm" variant="secondary" onClick={() => pdf(o)}><FileDown className="w-4 h-4" /></Button>
                  <Button size="sm" className="bg-success text-success-foreground hover:opacity-90" onClick={() => wsp(o)}><MessageCircle className="w-4 h-4" /></Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      }
    </div>
  );
}

function F({ label, children, full }: { label: string; children: React.ReactNode; full?: boolean }) {
  return <div className={`space-y-1.5 ${full ? "sm:col-span-2" : ""}`}><Label>{label}</Label>{children}</div>;
}
