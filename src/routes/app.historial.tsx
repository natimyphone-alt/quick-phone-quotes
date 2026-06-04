import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { formatARS } from "@/lib/calculos";
import { descargarPDF } from "@/lib/pdf";
import { buildMensajeWhatsApp, abrirWhatsApp } from "@/lib/whatsapp";
import { useAuth } from "@/hooks/use-auth";
import { toast } from "sonner";
import { FileDown, MessageCircle, Search } from "lucide-react";

export const Route = createFileRoute("/app/historial")({
  component: Historial,
});

const ESTADOS = ["pendiente", "aprobado", "rechazado", "entregado"] as const;
const ESTADO_COLORS: Record<string, string> = {
  pendiente: "bg-warning/20 text-warning-foreground",
  aprobado: "bg-success/20 text-success",
  rechazado: "bg-destructive/20 text-destructive",
  entregado: "bg-primary/20 text-primary",
};

function Historial() {
  const { nombre, isAdmin } = useAuth();
  const [items, setItems] = useState<any[]>([]);
  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    let query = supabase.from("presupuestos")
      .select("*, sucursales(nombre)")
      .order("created_at", { ascending: false })
      .limit(200);
    if (q.trim()) {
      const term = `%${q.trim()}%`;
      query = query.or(`cliente.ilike.${term},telefono.ilike.${term},modelo.ilike.${term}`);
    }
    const { data, error } = await query;
    setLoading(false);
    if (error) return toast.error(error.message);
    setItems(data || []);
  };

  useEffect(() => { load(); }, []);

  const cambiarEstado = async (id: string, estado: string) => {
    const { error } = await supabase.from("presupuestos").update({ estado }).eq("id", id);
    if (error) return toast.error(error.message);
    setItems(items.map(it => it.id === id ? { ...it, estado } : it));
  };

  const pdf = (p: any) => descargarPDF({
    numero: p.numero,
    fecha: new Date(p.created_at).toLocaleString("es-AR"),
    cliente: p.cliente, telefono: p.telefono, marca: p.marca, modelo: p.modelo,
    reparacion: p.reparacion, tipo_trabajo: p.tipo_trabajo, tipo: p.tipo,
    costo: p.costo, ganancia: p.ganancia, envio: p.envio, precio_base: p.precio_base,
    subtotal: p.subtotal, iva: p.iva, total: p.total,
    sucursal: p.sucursales?.nombre, usuario: nombre,
  });

  const wsp = (p: any) => abrirWhatsApp(p.telefono, buildMensajeWhatsApp({
    cliente: p.cliente, marca: p.marca, modelo: p.modelo,
    reparacion: p.reparacion, tipo_trabajo: p.tipo_trabajo, total: Number(p.total),
  }));

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Historial</h1>
      <form onSubmit={e => { e.preventDefault(); load(); }} className="flex gap-2">
        <Input placeholder="Buscar por cliente, teléfono o modelo..." value={q} onChange={e => setQ(e.target.value)} />
        <Button type="submit"><Search className="w-4 h-4" /></Button>
      </form>

      {loading ? <p className="text-muted-foreground">Cargando...</p> :
       items.length === 0 ? <p className="text-muted-foreground text-center py-8">Sin presupuestos.</p> :
        <div className="space-y-3">
          {items.map(p => (
            <Card key={p.id}>
              <CardContent className="p-4 space-y-2">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <div className="font-semibold">N° {p.numero} — {p.cliente}</div>
                    <div className="text-xs text-muted-foreground">
                      {new Date(p.created_at).toLocaleString("es-AR")} • {p.sucursales?.nombre || "—"} • {p.tipo.toUpperCase()}
                    </div>
                  </div>
                  <Badge className={ESTADO_COLORS[p.estado]}>{p.estado}</Badge>
                </div>
                <div className="text-sm">
                  {p.marca} {p.modelo} — <span className="text-muted-foreground">{p.reparacion || p.tipo_trabajo}</span>
                </div>
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div className="font-bold text-primary text-lg">{formatARS(Number(p.total))}</div>
                  <div className="flex gap-2 flex-wrap">
                    <Select value={p.estado} onValueChange={v => cambiarEstado(p.id, v)}>
                      <SelectTrigger className="h-9 w-36"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {ESTADOS.map(e => <SelectItem key={e} value={e}>{e}</SelectItem>)}
                      </SelectContent>
                    </Select>
                    <Button size="sm" variant="secondary" onClick={() => pdf(p)}><FileDown className="w-4 h-4" /></Button>
                    <Button size="sm" className="bg-success text-success-foreground hover:opacity-90" onClick={() => wsp(p)}><MessageCircle className="w-4 h-4" /></Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      }
    </div>
  );
}
