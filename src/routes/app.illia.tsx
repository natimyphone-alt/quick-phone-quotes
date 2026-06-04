import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { calcularIllia, formatARS } from "@/lib/calculos";
import { descargarPDF } from "@/lib/pdf";
import { buildMensajeWhatsApp, abrirWhatsApp } from "@/lib/whatsapp";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { toast } from "sonner";
import { FileDown, MessageCircle, Save, Calculator } from "lucide-react";

export const Route = createFileRoute("/app/illia")({
  component: IlliaPage,
});

function IlliaPage() {
  const { user, sucursalId, nombre } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    cliente: "", telefono: "", marca: "", modelo: "", reparacion: "",
    costo: 0, envio: 0,
  });
  const [calc, setCalc] = useState<ReturnType<typeof calcularIllia> | null>(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState<{ numero: number; id: string } | null>(null);

  const upd = (k: string, v: any) => { setForm(f => ({ ...f, [k]: v })); setCalc(null); setSaved(null); };

  const calcular = () => {
    if (!form.cliente.trim()) return toast.error("Ingresá el cliente");
    setCalc(calcularIllia(Number(form.costo) || 0, Number(form.envio) || 0));
  };

  const guardar = async () => {
    if (!calc || !user) return;
    setSaving(true);
    const { data, error } = await supabase.from("presupuestos").insert({
      tipo: "illia",
      cliente: form.cliente, telefono: form.telefono,
      marca: form.marca, modelo: form.modelo, reparacion: form.reparacion,
      costo: calc.costo, ganancia: calc.ganancia, envio: calc.envio,
      subtotal: calc.subtotal, iva: calc.iva, total: calc.total,
      sucursal_id: sucursalId, user_id: user.id,
    }).select("id, numero").single();
    setSaving(false);
    if (error) return toast.error(error.message);
    setSaved({ numero: data.numero, id: data.id });
    toast.success(`Presupuesto N° ${data.numero} guardado`);
  };

  const pdf = () => {
    if (!calc) return;
    descargarPDF({
      numero: saved?.numero ?? 0,
      fecha: new Date().toLocaleString("es-AR"),
      cliente: form.cliente, telefono: form.telefono,
      marca: form.marca, modelo: form.modelo, reparacion: form.reparacion,
      tipo: "illia",
      costo: calc.costo, ganancia: calc.ganancia, envio: calc.envio,
      subtotal: calc.subtotal, iva: calc.iva, total: calc.total,
      usuario: nombre,
    });
  };

  const whatsapp = () => {
    if (!calc) return;
    abrirWhatsApp(form.telefono, buildMensajeWhatsApp({
      cliente: form.cliente, marca: form.marca, modelo: form.modelo,
      reparacion: form.reparacion, total: calc.total,
    }));
  };

  return (
    <div className="space-y-4 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold">Presupuesto Illia</h1>
      <Card>
        <CardHeader><CardTitle>Datos</CardTitle></CardHeader>
        <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Field label="Cliente *"><Input value={form.cliente} onChange={e => upd("cliente", e.target.value)} /></Field>
          <Field label="Teléfono"><Input value={form.telefono} onChange={e => upd("telefono", e.target.value)} /></Field>
          <Field label="Marca"><Input value={form.marca} onChange={e => upd("marca", e.target.value)} /></Field>
          <Field label="Modelo"><Input value={form.modelo} onChange={e => upd("modelo", e.target.value)} /></Field>
          <Field label="Reparación" full><Input value={form.reparacion} onChange={e => upd("reparacion", e.target.value)} /></Field>
          <Field label="Costo (repuesto + mano de obra)"><Input type="number" min={0} value={form.costo} onChange={e => upd("costo", e.target.value)} /></Field>
          <Field label="Envío"><Input type="number" min={0} value={form.envio} onChange={e => upd("envio", e.target.value)} /></Field>
          <div className="sm:col-span-2">
            <Button onClick={calcular} className="w-full h-11" size="lg"><Calculator className="w-4 h-4 mr-2" />Calcular</Button>
          </div>
        </CardContent>
      </Card>

      {calc && (
        <Card>
          <CardHeader><CardTitle>Resultado</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            <Row k="Costo" v={formatARS(calc.costo)} />
            <Row k="Ganancia" v={formatARS(calc.ganancia)} />
            <Row k="Envío" v={formatARS(calc.envio)} />
            <Row k="Subtotal" v={formatARS(calc.subtotal)} />
            <Row k="IVA 21%" v={formatARS(calc.iva)} />
            <div className="flex justify-between bg-primary text-primary-foreground rounded-lg p-4 text-lg font-bold mt-3">
              <span>TOTAL</span><span>{formatARS(calc.total)}</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-2">
              <Button onClick={guardar} disabled={saving || !!saved} size="lg"><Save className="w-4 h-4 mr-2" />{saved ? "Guardado" : "Guardar"}</Button>
              <Button onClick={pdf} variant="secondary" size="lg"><FileDown className="w-4 h-4 mr-2" />PDF</Button>
              <Button onClick={whatsapp} size="lg" className="bg-success text-success-foreground hover:opacity-90"><MessageCircle className="w-4 h-4 mr-2" />WhatsApp</Button>
            </div>
          </CardContent>
        </Card>
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
