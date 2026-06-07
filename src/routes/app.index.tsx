import { createFileRoute, Link } from "@tanstack/react-router";
import { Card, CardContent } from "@/components/ui/card";
import { useAuth } from "@/hooks/use-auth";
import { Wrench, Cpu, History, Settings, BarChart3, ClipboardList } from "lucide-react";

export const Route = createFileRoute("/app/")({
  component: Home,
});

function Home() {
  const { isAdmin, nombre } = useAuth();

  const tiles = [
    { to: "/app/illia", title: "Presupuestos Illia", desc: "Reparaciones con repuestos", icon: Wrench, color: "from-primary to-accent" },
    { to: "/app/soft", title: "Presupuestos Soft", desc: "Soft, cuentas, root, parches", icon: Cpu, color: "from-accent to-primary" },
    { to: "/app/ordenes", title: "Órdenes de Trabajo", desc: "Ingreso y seguimiento de equipos", icon: ClipboardList, color: "from-primary to-accent" },
    { to: "/app/historial", title: "Historial", desc: "Buscar presupuestos", icon: History, color: "from-primary to-primary" },
    ...(isAdmin ? [
      { to: "/app/estadisticas", title: "Estadísticas", desc: "Métricas globales", icon: BarChart3, color: "from-accent to-accent" },
      { to: "/app/configuracion", title: "Configuración", desc: "Usuarios, sucursales, precios", icon: Settings, color: "from-primary to-accent" },
    ] : []),
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold">Hola, {nombre || "usuario"} 👋</h1>
        <p className="text-muted-foreground mt-1">¿Qué querés hacer hoy?</p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {tiles.map(t => {
          const Icon = t.icon;
          return (
            <Link key={t.to} to={t.to}>
              <Card className="hover:shadow-lg transition-all hover:-translate-y-0.5 cursor-pointer h-full overflow-hidden border-2 hover:border-primary/40">
                <CardContent className="p-6">
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${t.color} text-white flex items-center justify-center mb-4`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <h2 className="font-semibold text-lg">{t.title}</h2>
                  <p className="text-sm text-muted-foreground mt-1">{t.desc}</p>
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
