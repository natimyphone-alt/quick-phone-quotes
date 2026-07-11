import { jsxs, jsx } from "react/jsx-runtime";
import { useNavigate } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { s as supabase } from "./client-CzxaLLtB.js";
import { u as useAuth } from "./use-auth-GpmAL4wB.js";
import { C as Card, a as CardHeader, b as CardTitle, d as CardContent } from "./card-DQ5v2DYb.js";
import { ResponsiveContainer, BarChart, XAxis, YAxis, Tooltip, Bar, PieChart, Pie, Cell, Legend } from "recharts";
import { f as formatARS } from "./calculos-BajsDPnH.js";
import "@supabase/supabase-js";
import "./utils-H80jjgLf.js";
import "clsx";
import "tailwind-merge";
const COLORS = ["#1c2454", "#4a7ddb", "#9ca3af", "#22c55e", "#ef4444"];
function Stats() {
  const navigate = useNavigate();
  const {
    isAdmin,
    loading
  } = useAuth();
  const [data, setData] = useState([]);
  useEffect(() => {
    if (!loading && !isAdmin) navigate({
      to: "/app"
    });
  }, [loading, isAdmin]);
  useEffect(() => {
    supabase.from("presupuestos").select("*, sucursales(nombre)").then(({
      data: data2
    }) => setData(data2 || []));
  }, []);
  if (!isAdmin) return null;
  const total = data.length;
  const aprobados = data.filter((d) => d.estado === "aprobado").length;
  const rechazados = data.filter((d) => d.estado === "rechazado").length;
  const entregados = data.filter((d) => d.estado === "entregado").length;
  const facturacion = data.reduce((s, d) => s + Number(d.total || 0), 0);
  const porSucursal = Object.values(data.reduce((acc, d) => {
    const k = d.sucursales?.nombre || "Sin asignar";
    acc[k] ||= {
      sucursal: k,
      cantidad: 0,
      total: 0
    };
    acc[k].cantidad++;
    acc[k].total += Number(d.total || 0);
    return acc;
  }, {}));
  const porTrabajo = Object.values(data.reduce((acc, d) => {
    const k = d.reparacion || d.tipo_trabajo || "Otro";
    acc[k] ||= {
      name: k,
      value: 0
    };
    acc[k].value++;
    return acc;
  }, {}));
  return /* @__PURE__ */ jsxs("div", { className: "space-y-4", children: [
    /* @__PURE__ */ jsx("h1", { className: "text-2xl font-bold", children: "Estadísticas" }),
    /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-2 md:grid-cols-4 gap-3", children: [
      /* @__PURE__ */ jsx(Stat, { label: "Total presupuestos", value: total }),
      /* @__PURE__ */ jsx(Stat, { label: "Aprobados", value: aprobados, tone: "success" }),
      /* @__PURE__ */ jsx(Stat, { label: "Entregados", value: entregados, tone: "primary" }),
      /* @__PURE__ */ jsx(Stat, { label: "Rechazados", value: rechazados, tone: "destructive" })
    ] }),
    /* @__PURE__ */ jsxs(Card, { children: [
      /* @__PURE__ */ jsx(CardHeader, { children: /* @__PURE__ */ jsx(CardTitle, { children: "Facturación potencial" }) }),
      /* @__PURE__ */ jsx(CardContent, { children: /* @__PURE__ */ jsx("div", { className: "text-3xl font-bold text-primary", children: formatARS(facturacion) }) })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "grid grid-cols-1 lg:grid-cols-2 gap-4", children: [
      /* @__PURE__ */ jsxs(Card, { children: [
        /* @__PURE__ */ jsx(CardHeader, { children: /* @__PURE__ */ jsx(CardTitle, { children: "Por sucursal" }) }),
        /* @__PURE__ */ jsx(CardContent, { className: "h-72", children: /* @__PURE__ */ jsx(ResponsiveContainer, { children: /* @__PURE__ */ jsxs(BarChart, { data: porSucursal, children: [
          /* @__PURE__ */ jsx(XAxis, { dataKey: "sucursal" }),
          /* @__PURE__ */ jsx(YAxis, {}),
          /* @__PURE__ */ jsx(Tooltip, {}),
          /* @__PURE__ */ jsx(Bar, { dataKey: "cantidad", fill: "#1c2454" })
        ] }) }) })
      ] }),
      /* @__PURE__ */ jsxs(Card, { children: [
        /* @__PURE__ */ jsx(CardHeader, { children: /* @__PURE__ */ jsx(CardTitle, { children: "Trabajos más frecuentes" }) }),
        /* @__PURE__ */ jsx(CardContent, { className: "h-72", children: /* @__PURE__ */ jsx(ResponsiveContainer, { children: /* @__PURE__ */ jsxs(PieChart, { children: [
          /* @__PURE__ */ jsx(Pie, { data: porTrabajo.slice(0, 6), dataKey: "value", nameKey: "name", outerRadius: 80, label: true, children: porTrabajo.slice(0, 6).map((_, i) => /* @__PURE__ */ jsx(Cell, { fill: COLORS[i % COLORS.length] }, i)) }),
          /* @__PURE__ */ jsx(Tooltip, {}),
          /* @__PURE__ */ jsx(Legend, {})
        ] }) }) })
      ] })
    ] })
  ] });
}
function Stat({
  label,
  value,
  tone
}) {
  const color = tone === "success" ? "text-success" : tone === "destructive" ? "text-destructive" : tone === "primary" ? "text-primary" : "";
  return /* @__PURE__ */ jsx(Card, { children: /* @__PURE__ */ jsxs(CardContent, { className: "p-4", children: [
    /* @__PURE__ */ jsx("div", { className: "text-xs text-muted-foreground", children: label }),
    /* @__PURE__ */ jsx("div", { className: `text-2xl font-bold ${color}`, children: value })
  ] }) });
}
export {
  Stats as component
};
