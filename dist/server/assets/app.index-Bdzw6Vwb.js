import { jsxs, jsx } from "react/jsx-runtime";
import { Link } from "@tanstack/react-router";
import { C as Card, d as CardContent } from "./card-DQ5v2DYb.js";
import { u as useAuth } from "./use-auth-GpmAL4wB.js";
import { Wrench, ClipboardList, Package, History, Settings } from "lucide-react";
import "react";
import "./utils-H80jjgLf.js";
import "clsx";
import "tailwind-merge";
import "./client-CzxaLLtB.js";
import "@supabase/supabase-js";
function Home() {
  const {
    isAdmin,
    nombre
  } = useAuth();
  const tiles = [{
    to: "/app/illia",
    title: "Presupuestos",
    desc: "Reparaciones con repuestos",
    icon: Wrench,
    color: "from-primary to-accent"
  }, {
    to: "/app/ordenes",
    title: "Ordenes de Trabajo",
    desc: "Ingreso y seguimiento de equipos",
    icon: ClipboardList,
    color: "from-primary to-accent"
  }, {
    to: "/app/catalogo",
    title: "Catalogo de Repuestos",
    desc: "Proveedores, precios, calidad",
    icon: Package,
    color: "from-accent to-primary"
  }, {
    to: "/app/historial",
    title: "Historial",
    desc: "Buscar presupuestos",
    icon: History,
    color: "from-primary to-primary"
  }, ...isAdmin ? [{
    to: "/app/configuracion",
    title: "Configuracion",
    desc: "Usuarios, sucursales, precios, mano de obra",
    icon: Settings,
    color: "from-primary to-accent"
  }] : []];
  return /* @__PURE__ */ jsxs("div", { className: "space-y-6", children: [
    /* @__PURE__ */ jsxs("div", { children: [
      /* @__PURE__ */ jsxs("h1", { className: "text-2xl sm:text-3xl font-bold", children: [
        "Hola, ",
        nombre || "usuario"
      ] }),
      /* @__PURE__ */ jsx("p", { className: "text-muted-foreground mt-1", children: "Que queres hacer hoy?" })
    ] }),
    /* @__PURE__ */ jsx("div", { className: "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4", children: tiles.map((t) => {
      const Icon = t.icon;
      return /* @__PURE__ */ jsx(Link, { to: t.to, children: /* @__PURE__ */ jsx(Card, { className: "hover:shadow-lg transition-all hover:-translate-y-0.5 cursor-pointer h-full overflow-hidden border-2 hover:border-primary/40", children: /* @__PURE__ */ jsxs(CardContent, { className: "p-6", children: [
        /* @__PURE__ */ jsx("div", { className: `w-12 h-12 rounded-xl bg-gradient-to-br ${t.color} text-white flex items-center justify-center mb-4`, children: /* @__PURE__ */ jsx(Icon, { className: "w-6 h-6" }) }),
        /* @__PURE__ */ jsx("h2", { className: "font-semibold text-lg", children: t.title }),
        /* @__PURE__ */ jsx("p", { className: "text-sm text-muted-foreground mt-1", children: t.desc })
      ] }) }) }, t.to);
    }) })
  ] });
}
export {
  Home as component
};
