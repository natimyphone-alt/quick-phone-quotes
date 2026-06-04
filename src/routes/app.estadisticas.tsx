import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, PieChart, Pie, Cell, Legend } from "recharts";
import { formatARS } from "@/lib/calculos";

export const Route = createFileRoute("/app/estadisticas")({
  component: Stats,
});

const COLORS = ["#1c2454", "#4a7ddb", "#9ca3af", "#22c55e", "#ef4444"];

function Stats() {
  const navigate = useNavigate();
  const { isAdmin, loading } = useAuth();
  const [data, setData] = useState<any[]>([]);

  useEffect(() => { if (!loading && !isAdmin) navigate({ to: "/app" }); }, [loading, isAdmin]);

  useEffect(() => {
    supabase.from("presupuestos").select("*, sucursales(nombre)").then(({ data }) => setData(data || []));
  }, []);

  if (!isAdmin) return null;

  const total = data.length;
  const aprobados = data.filter(d => d.estado === "aprobado").length;
  const rechazados = data.filter(d => d.estado === "rechazado").length;
  const entregados = data.filter(d => d.estado === "entregado").length;
  const facturacion = data.reduce((s, d) => s + Number(d.total || 0), 0);

  const porSucursal = Object.values(data.reduce((acc: any, d: any) => {
    const k = d.sucursales?.nombre || "Sin asignar";
    acc[k] ||= { sucursal: k, cantidad: 0, total: 0 };
    acc[k].cantidad++; acc[k].total += Number(d.total || 0);
    return acc;
  }, {})) as any[];

  const porTrabajo = Object.values(data.reduce((acc: any, d: any) => {
    const k = d.reparacion || d.tipo_trabajo || "Otro";
    acc[k] ||= { name: k, value: 0 }; acc[k].value++;
    return acc;
  }, {})) as any[];

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Estadísticas</h1>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Stat label="Total presupuestos" value={total} />
        <Stat label="Aprobados" value={aprobados} tone="success" />
        <Stat label="Entregados" value={entregados} tone="primary" />
        <Stat label="Rechazados" value={rechazados} tone="destructive" />
      </div>
      <Card>
        <CardHeader><CardTitle>Facturación potencial</CardTitle></CardHeader>
        <CardContent><div className="text-3xl font-bold text-primary">{formatARS(facturacion)}</div></CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <CardHeader><CardTitle>Por sucursal</CardTitle></CardHeader>
          <CardContent className="h-72">
            <ResponsiveContainer>
              <BarChart data={porSucursal}>
                <XAxis dataKey="sucursal" /><YAxis /><Tooltip />
                <Bar dataKey="cantidad" fill="#1c2454" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Trabajos más frecuentes</CardTitle></CardHeader>
          <CardContent className="h-72">
            <ResponsiveContainer>
              <PieChart>
                <Pie data={porTrabajo.slice(0, 6)} dataKey="value" nameKey="name" outerRadius={80} label>
                  {porTrabajo.slice(0, 6).map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip /><Legend />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function Stat({ label, value, tone }: { label: string; value: number; tone?: string }) {
  const color = tone === "success" ? "text-success" : tone === "destructive" ? "text-destructive" : tone === "primary" ? "text-primary" : "";
  return (
    <Card><CardContent className="p-4">
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className={`text-2xl font-bold ${color}`}>{value}</div>
    </CardContent></Card>
  );
}
