import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { formatARS } from "@/lib/calculos";
import { toast } from "sonner";

export const Route = createFileRoute("/app/configuracion")({
  component: Configuracion,
});

function Configuracion() {
  const navigate = useNavigate();
  const { isAdmin, loading } = useAuth();
  useEffect(() => { if (!loading && !isAdmin) navigate({ to: "/app" }); }, [loading, isAdmin]);
  if (!isAdmin) return null;

  return (
    <div className="space-y-4 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold">Configuración</h1>
      <Tabs defaultValue="sucursales">
        <TabsList>
          <TabsTrigger value="sucursales">Sucursales</TabsTrigger>
          <TabsTrigger value="usuarios">Usuarios</TabsTrigger>
          <TabsTrigger value="precios">Precios Soft</TabsTrigger>
        </TabsList>
        <TabsContent value="sucursales"><SucursalesTab /></TabsContent>
        <TabsContent value="usuarios"><UsuariosTab /></TabsContent>
        <TabsContent value="precios"><PreciosTab /></TabsContent>
      </Tabs>
    </div>
  );
}

function SucursalesTab() {
  const [items, setItems] = useState<any[]>([]);
  const [nuevo, setNuevo] = useState({ nombre: "", direccion: "", telefono: "" });

  const load = () => supabase.from("sucursales").select("*").order("nombre").then(({ data }) => setItems(data || []));
  useEffect(() => { load(); }, []);

  const crear = async () => {
    if (!nuevo.nombre.trim()) return;
    const { error } = await supabase.from("sucursales").insert(nuevo);
    if (error) return toast.error(error.message);
    toast.success("Sucursal creada");
    setNuevo({ nombre: "", direccion: "", telefono: "" }); load();
  };

  const eliminar = async (id: string) => {
    if (!confirm("¿Eliminar sucursal?")) return;
    const { error } = await supabase.from("sucursales").delete().eq("id", id);
    if (error) return toast.error(error.message);
    load();
  };

  return (
    <Card>
      <CardHeader><CardTitle>Sucursales</CardTitle></CardHeader>
      <CardContent className="space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-2">
          <Input placeholder="Nombre" value={nuevo.nombre} onChange={e => setNuevo({ ...nuevo, nombre: e.target.value })} />
          <Input placeholder="Dirección" value={nuevo.direccion} onChange={e => setNuevo({ ...nuevo, direccion: e.target.value })} />
          <Input placeholder="Teléfono" value={nuevo.telefono} onChange={e => setNuevo({ ...nuevo, telefono: e.target.value })} />
          <Button onClick={crear}>Crear</Button>
        </div>
        <div className="divide-y border rounded-md">
          {items.map(s => (
            <div key={s.id} className="p-3 flex justify-between items-center">
              <div>
                <div className="font-medium">{s.nombre}</div>
                <div className="text-xs text-muted-foreground">{s.direccion} • {s.telefono}</div>
              </div>
              <Button size="sm" variant="destructive" onClick={() => eliminar(s.id)}>Eliminar</Button>
            </div>
          ))}
          {items.length === 0 && <div className="p-4 text-sm text-muted-foreground text-center">Sin sucursales</div>}
        </div>
      </CardContent>
    </Card>
  );
}

function UsuariosTab() {
  const [items, setItems] = useState<any[]>([]);
  const [sucursales, setSucursales] = useState<any[]>([]);
  const [roles, setRoles] = useState<Record<string, string[]>>({});

  const load = async () => {
    const [{ data: profs }, { data: sucs }, { data: rs }] = await Promise.all([
      supabase.from("profiles").select("*"),
      supabase.from("sucursales").select("*").order("nombre"),
      supabase.from("user_roles").select("*"),
    ]);
    setItems(profs || []); setSucursales(sucs || []);
    const map: Record<string, string[]> = {};
    (rs || []).forEach((r: any) => { (map[r.user_id] ||= []).push(r.role); });
    setRoles(map);
  };
  useEffect(() => { load(); }, []);

  const setSucursal = async (uid: string, sucursal_id: string) => {
    const v = sucursal_id === "_none" ? null : sucursal_id;
    const { error } = await supabase.from("profiles").update({ sucursal_id: v }).eq("id", uid);
    if (error) return toast.error(error.message);
    toast.success("Sucursal asignada"); load();
  };

  const toggleAdmin = async (uid: string, esAdmin: boolean) => {
    if (esAdmin) {
      await supabase.from("user_roles").delete().eq("user_id", uid).eq("role", "admin");
    } else {
      await supabase.from("user_roles").insert({ user_id: uid, role: "admin" });
    }
    load();
  };

  return (
    <Card>
      <CardHeader><CardTitle>Usuarios</CardTitle></CardHeader>
      <CardContent>
        <div className="divide-y border rounded-md">
          {items.map(u => {
            const esAdmin = (roles[u.id] || []).includes("admin");
            return (
              <div key={u.id} className="p-3 grid grid-cols-1 sm:grid-cols-3 gap-2 items-center">
                <div>
                  <div className="font-medium">{u.nombre || "—"}</div>
                  <div className="text-xs text-muted-foreground">{u.email}</div>
                </div>
                <Select value={u.sucursal_id || "_none"} onValueChange={v => setSucursal(u.id, v)}>
                  <SelectTrigger><SelectValue placeholder="Sucursal..." /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="_none">Sin asignar</SelectItem>
                    {sucursales.map(s => <SelectItem key={s.id} value={s.id}>{s.nombre}</SelectItem>)}
                  </SelectContent>
                </Select>
                <Button size="sm" variant={esAdmin ? "destructive" : "default"} onClick={() => toggleAdmin(u.id, esAdmin)}>
                  {esAdmin ? "Quitar admin" : "Hacer admin"}
                </Button>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}

function PreciosTab() {
  const [items, setItems] = useState<any[]>([]);
  const load = () => supabase.from("precios_referencia").select("*").order("orden").then(({ data }) => setItems(data || []));
  useEffect(() => { load(); }, []);

  const guardar = async (id: string, precio: number) => {
    const { error } = await supabase.from("precios_referencia").update({ precio }).eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("Precio actualizado");
  };

  return (
    <Card>
      <CardHeader><CardTitle>Precios de referencia (Soft)</CardTitle></CardHeader>
      <CardContent className="space-y-2">
        {items.map(p => (
          <div key={p.id} className="grid grid-cols-1 sm:grid-cols-3 gap-2 items-center border-b pb-2">
            <Label>{p.etiqueta}</Label>
            <Input type="number" defaultValue={p.precio} onBlur={e => guardar(p.id, Number(e.target.value))} />
            <span className="text-sm text-muted-foreground">Actual: {formatARS(Number(p.precio))}</span>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
