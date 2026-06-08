import { createFileRoute, Outlet, useNavigate, Link, useRouterState } from "@tanstack/react-router";
import { useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Smartphone, LogOut, Home, ClipboardList, History, Settings, Package } from "lucide-react";

export const Route = createFileRoute("/app")({
  ssr: false,
  component: AppLayout,
});

function AppLayout() {
  const navigate = useNavigate();
  const { user, loading, isAdmin, nombre } = useAuth();
  const pathname = useRouterState({ select: s => s.location.pathname });

  useEffect(() => {
    if (!loading && !user) navigate({ to: "/auth" });
  }, [loading, user, navigate]);

  if (loading || !user) {
    return <div className="min-h-screen flex items-center justify-center text-muted-foreground">Cargando...</div>;
  }

  const logout = async () => {
    await supabase.auth.signOut();
    navigate({ to: "/auth" });
  };

  const navItems = [
    { to: "/app", label: "Inicio", icon: Home, exact: true },
    { to: "/app/catalogo", label: "Catálogo", icon: Package },
    { to: "/app/historial", label: "Historial", icon: History },
    ...(isAdmin
      ? [{ to: "/app/configuracion", label: "Config", icon: Settings }]
      : [{ to: "/app/ordenes", label: "Órdenes", icon: ClipboardList }]),
  ];

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="bg-primary text-primary-foreground shadow-md sticky top-0 z-30">
        <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
          <Link to="/app" className="flex items-center gap-2 font-semibold">
            <Smartphone className="w-5 h-5" />
            <span>MyPhone Hub</span>
          </Link>
          <div className="flex items-center gap-2">
            <span className="hidden sm:inline text-sm opacity-90">
              {nombre || user.email} {isAdmin && <span className="ml-1 text-xs bg-accent px-2 py-0.5 rounded">Admin</span>}
            </span>
            <Button size="sm" variant="ghost" onClick={logout} className="text-primary-foreground hover:bg-white/10">
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-6xl w-full mx-auto p-4 pb-24 sm:pb-4">
        <Outlet />
      </main>

      <nav className="fixed bottom-0 inset-x-0 bg-card border-t shadow-lg sm:hidden z-30">
        <div className="grid grid-cols-4 max-w-md mx-auto">
          {navItems.slice(0, 4).map(item => {
            const Icon = item.icon;
            const active = item.exact ? pathname === item.to : pathname.startsWith(item.to);
            return (
              <Link key={item.to} to={item.to}
                className={`flex flex-col items-center py-2 text-xs ${active ? "text-primary font-medium" : "text-muted-foreground"}`}>
                <Icon className="w-5 h-5 mb-0.5" />
                {item.label}
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
