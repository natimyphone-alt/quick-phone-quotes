import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { calcularSoft, formatARS, esSamsungSerieS, PRECIO_MINIMO_SERIE_S } from "@/lib/calculos";
import { descargarPDF } from "@/lib/pdf";
import { buildMensajeWhatsApp, abrirWhatsApp } from "@/lib/whatsapp";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/scripts/sync-patagonia.mjs";
import { toast } from "sonner";
import { FileDown, MessageCircle, Save, Calculator, AlertCircle } from "lucide-react";

export const Route = createFileRoute("/app/soft")({
  component: SoftPage,
});

interface Precio { id: string; clave: string; etiqueta: string; precio: number; orden: number }

function SoftPage() {
  const { user, sucursalId, nombre } = useAuth();
  const [precios, setPrecios] = useState<Precio[]>([]);
  const [form, setForm] = useState({
    cliente: "", telefono: "", marca: "", modelo: "",
    clave: "", precioOtro: 0,
  });
  const [calc, setCalc] = useState<ReturnType<typeof calcularSoft> | null>(null);
  const [saved, setSaved] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    supabase.from("precios_referencia").select("*").order("orden").then(({ data }) => {
      if (data) setPrecios(data as Precio[]);
    });
  }, []);

  const seleccionado = precios.find(p => p.clave === form.clave);
  const tipoTrabajoLabel = seleccionado?.etiqueta || "";

  const upd = (k: string, v: any) => { setForm(f => ({ ...f, [k]: v })); setCalc(null); setSaved(null); };

  const calcular = () => {
    if (!form.cliente.trim()) return toast.error("Ingresá el cliente");
    if (!seleccionado) return toast.error("Elegí un tipo de trabajo");
    const base = seleccionado.clave === "otro" ? Number(form.precioOtro) || 0 : seleccionado.precio;
    if (base <= 0) return toast.error("Precio inválido");
    const r = calcularSoft(base, form.marca, form.modelo);
    setCalc(r);
    if (r.ajustadoSerieS) toast.info(`Precio mínimo aplicado para Serie S Samsung (${formatARS(PRECIO_MINIMO_SERIE_S)})`);
  };

  const guardar = async () => {
    if (!calc || !user) return;
    setSaving(true);
    const { data, error } = await supabase.from("presupuestos").insert({
      tipo: "soft",
      cliente: form.cliente, telefono: form.telefono,
      marca: form.marca, modelo: form.modelo,
      tipo_trabajo: tipoTrabajoLabel,
      precio_base: calc.precioBase, subtotal: calc.precioBase,
      iva: calc.iva, total: calc.total,
      sucursal_id: sucursalId, user_id: user.id,
    }).select("numero").single();
    setSaving(false);
    if (error) return toast.error(error.message);
    setSaved(data.numero);
    toast.success(`Presupuesto N° ${data.numero} guardado`);
  };

  const pdf = () => {
    if (!calc) return;
    descargarPDF({
      numero: saved ?? 0,
      fecha: new Date().toLocaleString("es-AR"),
      cliente: form.cliente, telefono: form.telefono,
      marca: form.marca, modelo: form.modelo, tipo_trabajo: tipoTrabajoLabel,
      tipo: "soft",
      precio_base: calc.precioBase, subtotal: calc.precioBase, iva: calc.iva, total: calc.total,
      usuario: nombre,
    });
  };

  const whatsapp = () => {
    if (!calc) return;
    abrirWhatsApp(form.telefono, buildMensajeWhatsApp({
      cliente: form.cliente, marca: form.marca, modelo: form.modelo,
      tipo_trabajo: tipoTrabajoLabel, total: calc.total,
    }));
  };

  return (
    <div className="space-y-4 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold">Presupuesto Soft</h1>
      <Card>
        <CardHeader><CardTitle>Datos</CardTitle></CardHeader>
        <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Field label="Cliente *"><Input value={form.cliente} onChange={e => upd("cliente", e.target.value)} /></Field>
          <Field label="Teléfono"><Input value={form.telefono} onChange={e => upd("telefono", e.target.value)} /></Field>
          <Field label="Marca"><Input placeholder="Ej. Samsung" value={form.marca} onChange={e => upd("marca", e.target.value)} /></Field>
          <Field label="Modelo"><Input placeholder="Ej. S24 Ultra" value={form.modelo} onChange={e => upd("modelo", e.target.value)} /></Field>
          <Field label="Tipo de trabajo *" full>
            <Select value={form.clave} onValueChange={v => upd("clave", v)}>
              <SelectTrigger><SelectValue placeholder="Seleccionar..." /></SelectTrigger>
              <SelectContent>
                {precios.map(p => (
                  <SelectItem key={p.id} value={p.clave}>
                    {p.etiqueta} {p.precio > 0 && `— ${formatARS(p.precio)}`}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
          {form.clave === "otro" && (
            <Field label="Precio base (Otro)" full>
              <Input type="number" min={0} value={form.precioOtro} onChange={e => upd("precioOtro", e.target.value)} />
            </Field>
          )}
          {esSamsungSerieS(form.marca, form.modelo) && (
            <div className="sm:col-span-2 flex items-center gap-2 text-sm bg-warning/20 text-warning-foreground p-3 rounded-md">
              <AlertCircle className="w-4 h-4" /> Samsung Serie S detectado — mínimo {formatARS(PRECIO_MINIMO_SERIE_S)}
            </div>
          )}
          <div className="sm:col-span-2">
            <Button onClick={calcular} className="w-full h-11" size="lg"><Calculator className="w-4 h-4 mr-2" />Calcular</Button>
          </div>
        </CardContent>
      </Card>

      {calc && (
        <Card>
          <CardHeader><CardTitle>Resultado</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            {calc.ajustadoSerieS && (
              <div className="text-xs text-muted-foreground">
                Precio original: {formatARS(calc.precioBaseOriginal)} → ajustado a mínimo Serie S
              </div>
            )}
            <Row k="Precio base" v={formatARS(calc.precioBase)} />
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
