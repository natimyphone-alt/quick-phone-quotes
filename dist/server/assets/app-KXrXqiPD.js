import { jsx, jsxs } from "react/jsx-runtime";
import { useNavigate, useRouterState, Link, Outlet } from "@tanstack/react-router";
import { useEffect } from "react";
import { u as useAuth } from "./use-auth-GpmAL4wB.js";
import { s as supabase } from "./client-CzxaLLtB.js";
import { B as Button } from "./button-BC9oXVxV.js";
import { Smartphone, LogOut, Home, Package, History, Settings, ClipboardList } from "lucide-react";
import "@supabase/supabase-js";
import "@radix-ui/react-slot";
import "class-variance-authority";
import "./utils-H80jjgLf.js";
import "clsx";
import "tailwind-merge";
function AppLayout() {
  const navigate = useNavigate();
  const {
    user,
    loading,
    isAdmin,
    nombre
  } = useAuth();
  const pathname = useRouterState({
    select: (s) => s.location.pathname
  });
  useEffect(() => {
    if (!loading && !user) navigate({
      to: "/auth"
    });
  }, [loading, user, navigate]);
  if (loading || !user) {
    return /* @__PURE__ */ jsx("div", { className: "min-h-screen flex items-center justify-center text-muted-foreground", children: "Cargando..." });
  }
  const logout = async () => {
    await supabase.auth.signOut();
    navigate({
      to: "/auth"
    });
  };
  const navItems = [{
    to: "/app",
    label: "Inicio",
    icon: Home,
    exact: true
  }, {
    to: "/app/catalogo",
    label: "Catálogo",
    icon: Package
  }, {
    to: "/app/historial",
    label: "Historial",
    icon: History
  }, ...isAdmin ? [{
    to: "/app/configuracion",
    label: "Config",
    icon: Settings
  }] : [{
    to: "/app/ordenes",
    label: "Órdenes",
    icon: ClipboardList
  }]];
  return /* @__PURE__ */ jsxs("div", { className: "min-h-screen bg-background flex flex-col", children: [
    /* @__PURE__ */ jsx("header", { className: "bg-primary text-primary-foreground shadow-md sticky top-0 z-30", children: /* @__PURE__ */ jsxs("div", { className: "max-w-6xl mx-auto px-4 h-14 flex items-center justify-between", children: [
      /* @__PURE__ */ jsxs(Link, { to: "/app", className: "flex items-center gap-2 font-semibold", children: [
        /* @__PURE__ */ jsx(Smartphone, { className: "w-5 h-5" }),
        /* @__PURE__ */ jsx("span", { children: "MyPhone Hub" })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
        /* @__PURE__ */ jsxs("span", { className: "hidden sm:inline text-sm opacity-90", children: [
          nombre || user.email,
          " ",
          isAdmin && /* @__PURE__ */ jsx("span", { className: "ml-1 text-xs bg-accent px-2 py-0.5 rounded", children: "Admin" })
        ] }),
        /* @__PURE__ */ jsx(Button, { size: "sm", variant: "ghost", onClick: logout, className: "text-primary-foreground hover:bg-white/10", children: /* @__PURE__ */ jsx(LogOut, { className: "w-4 h-4" }) })
      ] })
    ] }) }),
    /* @__PURE__ */ jsx("main", { className: "flex-1 max-w-6xl w-full mx-auto p-4 pb-24 sm:pb-4", children: /* @__PURE__ */ jsx(Outlet, {}) }),
    /* @__PURE__ */ jsx("nav", { className: "fixed bottom-0 inset-x-0 bg-card border-t shadow-lg sm:hidden z-30", children: /* @__PURE__ */ jsx("div", { className: "grid grid-cols-4 max-w-md mx-auto", children: navItems.slice(0, 4).map((item) => {
      const Icon = item.icon;
      const active = item.exact ? pathname === item.to : pathname.startsWith(item.to);
      return /* @__PURE__ */ jsxs(Link, { to: item.to, className: `flex flex-col items-center py-2 text-xs ${active ? "text-primary font-medium" : "text-muted-foreground"}`, children: [
        /* @__PURE__ */ jsx(Icon, { className: "w-5 h-5 mb-0.5" }),
        item.label
      ] }, item.to);
    }) }) })
  ] });
}
export {
  AppLayout as component
};
