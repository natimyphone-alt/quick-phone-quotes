import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { PROVEEDORES, calcularPrecioFinal, RECARGO_FV } from "@/lib/proveedores";
import { formatARS } from "@/lib/calculos";
import { toast } from "sonner";
import { Plus, Trash2, ExternalLink, Search, Pencil, Save, X, RefreshCw } from "lucide-react";
import { syncPatagonia, syncFV, syncTodo, getFVStatus, resetFVSync } from "@/lib/sync.functions";

export const Route = createFileRoute("/app/catalogo")({
  component: Catalogo,
});

interface Repuesto {
  id: string;
  proveedor: string;
  marca: string;
  modelo: string;
  tipo_repuesto: string;
  calidad: string | null;
  precio: number;
  precio_proveedor: number | null;
  precio_calculado: number | null;
  url_producto: string | null;
  fecha_actualizacion: string;
  ultima_sincronizacion: string | null;
}

const VACIO = {
  proveedor: "Patagonia Cell", marca: "", modelo: "", tipo_repuesto: "Cambio de módulo",
  calidad: "OLED", precio: 0, url_producto: "",
};

function Catalogo() {
  const { isAdmin } = useAuth();
  const [items, setItems] = useState<Repuesto[]>([]);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [fvLastSync, setFvLastSync] = useState<string | null>(null);
  const [q, setQ] = useState("");
  const [filtroProv, setFiltroProv] = useState<string>("todos");
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState<string | null>(null);
  const [creando, setCreando] = useState(false);
  const [nuevo, setNuevo] = useState<any>(VACIO);
  const [editId, setEditId] = useState<string | null>(null);
  const [edit, setEdit] = useState<any>(VACIO);

  const syncPatagoniaFn = useServerFn(syncPatagonia);
  const syncFVFn = useServerFn(syncFV);
  const syncTodoFn = useServerFn(syncTodo);

  const load = async () => {
    setLoading(true);
    const [{ data, error }, countRes, cfgRes] = await Promise.all([
      supabase.from("catalogo_repuestos").select("*").order("marca").order("modelo").limit(500),
      supabase.from("catalogo_repuestos").select("*", { count: "exact", head: true }),
      supabase.from("proveedores_config").select("ultima_sincronizacion").eq("nombre", "FV Mayorista").maybeSingle(),
    ]);
    setLoading(false);
    if (error) return toast.error(error.message);
    setItems((data as any) || []);
    setTotalCount(countRes.count ?? 0);
    setFvLastSync((cfgRes.data as any)?.ultima_sincronizacion ?? null);
  };
  useEffect(() => { load(); }, []);

  const crear = async () => {
    if (!nuevo.marca.trim() || !nuevo.modelo.trim()) return toast.error("Marca y modelo requeridos");
    const precioProv = Number(nuevo.precio) || 0;
    const precioCalc = calcularPrecioFinal(nuevo.proveedor, precioProv);
    const { error } = await supabase.from("catalogo_repuestos").insert({
      ...nuevo,
      precio: precioProv,
      precio_proveedor: precioProv,
      precio_calculado: precioCalc,
      fecha_actualizacion: new Date().toISOString(),
    });
    if (error) return toast.error(error.message);
    toast.success("Repuesto agregado");
    setNuevo(VACIO); setCreando(false); load();
  };

  const eliminar = async (id: string) => {
    if (!confirm("¿Eliminar repuesto?")) return;
    const { error } = await supabase.from("catalogo_repuestos").delete().eq("id", id);
    if (error) return toast.error(error.message);
    load();
  };

  const startEdit = (r: Repuesto) => {
    setEditId(r.id);
    setEdit({
      proveedor: r.proveedor, marca: r.marca, modelo: r.modelo,
      tipo_repuesto: r.tipo_repuesto, calidad: r.calidad || "",
      precio: r.precio_proveedor ?? r.precio, url_producto: r.url_producto || "",
    });
  };

  const guardarEdit = async () => {
    if (!editId) return;
    const precioProv = Number(edit.precio) || 0;
    const precioCalc = calcularPrecioFinal(edit.proveedor, precioProv);
    const { error } = await supabase.from("catalogo_repuestos").update({
      ...edit,
      precio: precioProv,
      precio_proveedor: precioProv,
      precio_calculado: precioCalc,
      fecha_actualizacion: new Date().toISOString(),
    }).eq("id", editId);
    if (error) return toast.error(error.message);
    toast.success("Actualizado");
    setEditId(null); load();
  };

  const [syncStats, setSyncStats] = useState<{
    total: number; processed: number; imported: number; updated: number; errors: number;
    errorSamples: string[];
  } | null>(null);

  const runSync = async (key: "patagonia" | "fv" | "todo") => {
    setSyncing(key);
    try {
      if (key === "patagonia") {
        const r = await syncPatagoniaFn();
        (r.ok ? toast.success : toast.message)(r.message);
      } else if (key === "fv") {
        setSyncStats({ total: 0, processed: 0, imported: 0, updated: 0, errors: 0, errorSamples: [] });
        let offset = 0;
        let totalImp = 0, totalUpd = 0, totalErr = 0, total = 0;
        const samples: string[] = [];
        for (let i = 0; i < 300; i++) {
          const r = await syncFVFn({ data: { offset } });
          if (!r.ok) { toast.error(r.message); break; }
          totalImp += r.imported; totalUpd += r.updated; totalErr += r.errors;
          total = r.totalDiscovered ?? total;
          if (r.errorSamples) samples.push(...r.errorSamples);
          setSyncStats({
            total, processed: r.processed ?? offset,
            imported: totalImp, updated: totalUpd, errors: totalErr,
            errorSamples: samples.slice(0, 10),
          });
          if (r.done || r.nextOffset == null) {
            toast.success(`FV Mayorista: +${totalImp} nuevos, ~${totalUpd} actualizados, ${totalErr} errores (${total} URLs).`);
            break;
          }
          offset = r.nextOffset;
        }
      } else {
        const rs = await syncTodoFn();
        rs.forEach(r => (r.ok ? toast.success : toast.message)(r.message));
      }
      load();
    } catch (e: any) {
      toast.error(e?.message || "Error de sincronización");
    } finally {
      setSyncing(null);
    }
  };

  const filtrados = items.filter(r => {
    if (filtroProv !== "todos" && r.proveedor !== filtroProv) return false;
    if (!q.trim()) return true;
    const term = q.toLowerCase();
    return [r.marca, r.modelo, r.tipo_repuesto, r.calidad].some(v => (v || "").toLowerCase().includes(term));
  });

  return (
    <div className="space-y-4 max-w-5xl mx-auto">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div>
          <h1 className="text-2xl font-bold">Catálogo de Repuestos</h1>
          <div className="text-sm text-muted-foreground mt-0.5">
            <strong>{totalCount}</strong> productos cargados
            {" • "}
            Última sync FV: {fvLastSync ? new Date(fvLastSync).toLocaleString("es-AR") : "nunca"}
          </div>
        </div>
        {isAdmin && (
          <Button onClick={() => setCreando(c => !c)} size="lg">
            <Plus className="w-4 h-4 mr-1" />{creando ? "Cerrar" : "Nuevo"}
          </Button>
        )}
      </div>

      {isAdmin && (
        <Card>
          <CardContent className="p-3 grid grid-cols-1 sm:grid-cols-3 gap-2">
            <Button variant="outline" onClick={() => runSync("patagonia")} disabled={!!syncing}>
              <RefreshCw className={`w-4 h-4 mr-2 ${syncing === "patagonia" ? "animate-spin" : ""}`} />
              Sincronizar Patagonia Cell
            </Button>
            <Button variant="outline" onClick={() => runSync("fv")} disabled={!!syncing}>
              <RefreshCw className={`w-4 h-4 mr-2 ${syncing === "fv" ? "animate-spin" : ""}`} />
              Sincronizar FV Mayorista
            </Button>
            <Button onClick={() => runSync("todo")} disabled={!!syncing}>
              <RefreshCw className={`w-4 h-4 mr-2 ${syncing === "todo" ? "animate-spin" : ""}`} />
              Sincronizar Todo
            </Button>
          </CardContent>
          {syncStats && (
            <CardContent className="pt-0">
              <div className="text-sm border rounded-md p-3 bg-muted/30 space-y-1">
                <div className="flex justify-between flex-wrap gap-2">
                  <span><strong>Progreso FV:</strong> {syncStats.processed} / {syncStats.total || "…"} URLs</span>
                  <span className="text-success">+{syncStats.imported} nuevos</span>
                  <span className="text-primary">~{syncStats.updated} actualizados</span>
                  <span className={syncStats.errors ? "text-destructive" : "text-muted-foreground"}>
                    {syncStats.errors} errores
                  </span>
                </div>
                {syncStats.total > 0 && (
                  <div className="w-full h-2 bg-muted rounded overflow-hidden">
                    <div className="h-full bg-primary transition-all"
                      style={{ width: `${Math.min(100, (syncStats.processed / syncStats.total) * 100)}%` }} />
                  </div>
                )}
                {syncStats.errorSamples.length > 0 && (
                  <details className="text-xs text-muted-foreground">
                    <summary className="cursor-pointer">Ver muestra de errores</summary>
                    <ul className="list-disc pl-5 mt-1 space-y-0.5">
                      {syncStats.errorSamples.map((e, i) => <li key={i} className="truncate">{e}</li>)}
                    </ul>
                  </details>
                )}
              </div>
            </CardContent>
          )}
        </Card>
      )}

      {isAdmin && creando && (
        <Card>
          <CardHeader><CardTitle>Nuevo repuesto</CardTitle></CardHeader>
          <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Field label="Proveedor">
              <Select value={nuevo.proveedor} onValueChange={v => setNuevo({ ...nuevo, proveedor: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{PROVEEDORES.map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}</SelectContent>
              </Select>
            </Field>
            <Field label="Tipo de repuesto"><Input value={nuevo.tipo_repuesto} onChange={e => setNuevo({ ...nuevo, tipo_repuesto: e.target.value })} /></Field>
            <Field label="Marca"><Input value={nuevo.marca} onChange={e => setNuevo({ ...nuevo, marca: e.target.value })} /></Field>
            <Field label="Modelo"><Input value={nuevo.modelo} onChange={e => setNuevo({ ...nuevo, modelo: e.target.value })} /></Field>
            <Field label="Calidad (OLED, Original, etc.)"><Input value={nuevo.calidad} onChange={e => setNuevo({ ...nuevo, calidad: e.target.value })} /></Field>
            <Field label="Precio proveedor"><Input type="number" min={0} value={nuevo.precio} onChange={e => setNuevo({ ...nuevo, precio: e.target.value })} /></Field>
            <Field label="URL del producto" full><Input value={nuevo.url_producto} onChange={e => setNuevo({ ...nuevo, url_producto: e.target.value })} /></Field>
            <div className="sm:col-span-2"><Button onClick={crear} className="w-full" size="lg">Guardar</Button></div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-[1fr_200px] gap-2">
        <div className="relative">
          <Search className="absolute left-2 top-2.5 w-4 h-4 text-muted-foreground" />
          <Input className="pl-8" placeholder="Buscar marca, modelo, tipo..." value={q} onChange={e => setQ(e.target.value)} />
        </div>
        <Select value={filtroProv} onValueChange={setFiltroProv}>
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todos los proveedores</SelectItem>
            {PROVEEDORES.map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      {loading ? <p className="text-muted-foreground">Cargando...</p> :
       filtrados.length === 0 ? <p className="text-muted-foreground text-center py-8">Sin resultados.</p> :
        <div className="space-y-2">
          {filtrados.map(r => {
            const precioProv = Number(r.precio_proveedor ?? r.precio);
            const final = Number(r.precio_calculado ?? calcularPrecioFinal(r.proveedor, precioProv));
            const enEdit = editId === r.id;
            const fechaSync = r.ultima_sincronizacion || r.fecha_actualizacion;
            return (
              <Card key={r.id}>
                <CardContent className="p-3">
                  {enEdit ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <Select value={edit.proveedor} onValueChange={v => setEdit({ ...edit, proveedor: v })}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>{PROVEEDORES.map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}</SelectContent>
                      </Select>
                      <Input value={edit.tipo_repuesto} onChange={e => setEdit({ ...edit, tipo_repuesto: e.target.value })} placeholder="Tipo" />
                      <Input value={edit.marca} onChange={e => setEdit({ ...edit, marca: e.target.value })} placeholder="Marca" />
                      <Input value={edit.modelo} onChange={e => setEdit({ ...edit, modelo: e.target.value })} placeholder="Modelo" />
                      <Input value={edit.calidad} onChange={e => setEdit({ ...edit, calidad: e.target.value })} placeholder="Calidad" />
                      <Input type="number" value={edit.precio} onChange={e => setEdit({ ...edit, precio: e.target.value })} placeholder="Precio proveedor" />
                      <Input className="sm:col-span-2" value={edit.url_producto} onChange={e => setEdit({ ...edit, url_producto: e.target.value })} placeholder="URL" />
                      <div className="sm:col-span-2 flex gap-2">
                        <Button onClick={guardarEdit} className="flex-1"><Save className="w-4 h-4 mr-1" />Guardar</Button>
                        <Button variant="ghost" onClick={() => setEditId(null)}><X className="w-4 h-4" /></Button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between gap-2 flex-wrap">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-semibold">{r.marca} {r.modelo}</span>
                          <Badge variant="secondary">{r.tipo_repuesto}</Badge>
                          {r.calidad && <Badge>{r.calidad}</Badge>}
                        </div>
                        <div className="text-xs text-muted-foreground mt-0.5">
                          {r.proveedor} • Proveedor {formatARS(precioProv)}
                          {r.proveedor === "FV Mayorista" && <span> (+{formatARS(RECARGO_FV)} recargo)</span>}
                        </div>
                        <div className="text-[11px] text-muted-foreground">
                          Última actualización: {new Date(fechaSync).toLocaleString("es-AR")}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-xs text-muted-foreground">Calculado</div>
                        <div className="font-bold text-primary">{formatARS(final)}</div>
                        <div className="flex gap-1 mt-1 justify-end">
                          {r.url_producto && (
                            <a href={r.url_producto} target="_blank" rel="noreferrer">
                              <Button size="sm" variant="ghost"><ExternalLink className="w-4 h-4" /></Button>
                            </a>
                          )}
                          {isAdmin && <>
                            <Button size="sm" variant="ghost" onClick={() => startEdit(r)}><Pencil className="w-4 h-4" /></Button>
                            <Button size="sm" variant="ghost" onClick={() => eliminar(r.id)}><Trash2 className="w-4 h-4 text-destructive" /></Button>
                          </>}
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      }
    </div>
  );
}

function Field({ label, children, full }: { label: string; children: React.ReactNode; full?: boolean }) {
  return <div className={`space-y-1.5 ${full ? "sm:col-span-2" : ""}`}><Label>{label}</Label>{children}</div>;
}
