import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatARS, calcularManoObra } from "@/lib/calculos";
import { calcularOpcion, OpcionCalculada, ENVIO_PATAGONIA, ENVIO_FV } from "@/lib/proveedores";
import { descargarPDFMultiOpciones } from "@/lib/pdf";
import { buildMensajeWhatsApp, abrirWhatsApp } from "@/lib/whatsapp";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { toast } from "sonner";
import { FileDown, MessageCircle, Save, Search, Check } from "lucide-react";

export const Route = createFileRoute("/app/illia")({
  component: IlliaPage,
});

type TipoReparacion = "Módulo" | "Batería" | "Placa de carga";

function IlliaPage() {
  const { user, sucursalId, nombre } = useAuth();
  const [form, setForm] = useState({
    cliente: "",
    telefono: "",
    marca: "",
    modelo: "",
    precio_venta: "",
    tipo_reparacion: "Módulo" as TipoReparacion,
  });
  const [buscando, setBuscando] = useState(false);
  const [opciones, setOpciones] = useState<OpcionCalculada[]>([]);
  const [seleccionada, setSeleccionada] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState<{ numero: number; id: string } | null>(null);

  const upd = (k: string, v: any) => {
    setForm(f => ({ ...f, [k]: v }));
    setOpciones([]);
    setSeleccionada(null);
    setSaved(null);
  };

  const buscarRepuestos = async () => {
    if (!form.marca.trim() || !form.modelo.trim()) return toast.error("Ingresá marca y modelo");
    if (!form.precio_venta || Number(form.precio_venta) <= 0) return toast.error("Ingresá el precio de venta del celular");

    setBuscando(true);

    const modelo = form.modelo.trim().toUpperCase();
    const marca = form.marca.trim();
    const tipo = form.tipo_reparacion;
    const precioVenta = Number(form.precio_venta);
    const manoObra = calcularManoObra(precioVenta);

    const { data, error } = await supabase.rpc("buscar_modelo_exacto", {
      p_marca: marca,
      p_modelo: modelo,
      p_tipo: tipo,
    });

    setBuscando(false);

    if (error) { toast.error(error.message); return; }

    const resultados = data || [];
    if (resultados.length === 0) {
      toast.error("Sin coincidencias en el catálogo");
      return;
    }

    const ops = resultados.map((r: any) => {
      const precioRepuesto = Number(r.precio_calculado ?? r.precio_proveedor ?? r.precio);
      const envio = r.proveedor === "Patagonia Cell" ? ENVIO_PATAGONIA : ENVIO_FV;
      return calcularOpcion({
        proveedor: r.proveedor,
        calidad: r.calidad,
        precioCalculado: precioRepuesto,
        manoObra,
        envio,
        url_producto: r.url_producto,
        catalogo_id: r.id,
      });
    });

    setOpciones(ops);
    setSeleccionada(null);
    toast.success(`${ops.length} opciones encontradas`);
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
          <Field label="Cliente *">
            <Input value={form.cliente} onChange={e => upd("cliente", e.target.value)} />
          </Field>
          <Field label="Teléfono">
            <Input value={form.telefono} onChange={e => upd("telefono", e.target.value)} />
          </Field>
          <Field label="Marca *">
            <Input value={form.marca} onChange={e => upd("marca", e.target.value)} placeholder="Samsung" />
          </Field>
          <Field label="Modelo *">
            <Input value={form.modelo} onChange={e => upd("modelo", e.target.value)} placeholder="A15" />
          </Field>
          <Field label="Precio de venta del celular *">
            <Input
              type="number"
              value={form.precio_venta}
              onChange={e => upd("precio_venta", e.target.value)}
              placeholder="350000"
            />
          </Field>
          <Field label="Tipo de reparación *">
            <div className="flex gap-2">
              {(["Módulo", "Batería", "Placa de carga"] as TipoReparacion[]).map(t => (
                <button
                  key={t}
                  onClick={() => upd("tipo_reparacion", t)}
                  className={`flex-1 py-2 px-2 rounded-md text-sm font-medium border transition-colors ${
                    form.tipo_reparacion === t
                      ? "bg-primary text-primary-foreground border-primary"
                      : "bg-background border-input hover:bg-accent"
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </Field>
          <div className="sm:col-span-2">
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
                <CardContent className="p-4">
                  <div className="flex justify-between items-center flex-wrap gap-2">
                    <div>
                      <div className="font-semibold text-lg">{op.proveedor}</div>
                      {op.calidad && <Badge className="mt-1">{op.calidad}</Badge>}
                      {op.url_producto && (
                        <a href={op.url_producto} target="_blank" rel="noreferrer"
                          className="block text-xs text-primary underline mt-1">
                          Ver producto
                        </a>
                      )}
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-primary">{formatARS(op.total)}</div>
                      <Button size="sm" variant={elegida ? "default" : "outline"}
                        onClick={() => marcarSeleccion(i)} className="mt-2">
                        {elegida ? <><Check className="w-4 h-4 mr-1" />Elegida</> : "Cliente elige esta"}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-2">
            <Button onClick={guardar} disabled={saving || !!saved} size="lg">
              <Save className="w-4 h-4 mr-2" />{saved ? `Guardado N° ${saved.numero}` : "Guardar"}
            </Button>
            <Button onClick={pdf} variant="secondary" size="lg">
              <FileDown className="w-4 h-4 mr-2" />PDF
            </Button>
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