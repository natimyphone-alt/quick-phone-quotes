import { QueryClientProvider, QueryClient } from "@tanstack/react-query";
import { createRootRouteWithContext, Link, Outlet, HeadContent, Scripts, createFileRoute, lazyRouteComponent, redirect, createRouter } from "@tanstack/react-router";
import { jsx, jsxs } from "react/jsx-runtime";
import { Toaster as Toaster$1 } from "sonner";
const Toaster = ({ ...props }) => {
  return /* @__PURE__ */ jsx(
    Toaster$1,
    {
      className: "toaster group",
      toastOptions: {
        classNames: {
          toast: "group toast group-[.toaster]:bg-background group-[.toaster]:text-foreground group-[.toaster]:border-border group-[.toaster]:shadow-lg",
          description: "group-[.toast]:text-muted-foreground",
          actionButton: "group-[.toast]:bg-primary group-[.toast]:text-primary-foreground",
          cancelButton: "group-[.toast]:bg-muted group-[.toast]:text-muted-foreground"
        }
      },
      ...props
    }
  );
};
const appCss = "/assets/styles-BjSjqoep.css";
function NotFoundComponent() {
  return /* @__PURE__ */ jsx("div", { className: "flex min-h-screen items-center justify-center bg-background px-4", children: /* @__PURE__ */ jsxs("div", { className: "max-w-md text-center", children: [
    /* @__PURE__ */ jsx("h1", { className: "text-7xl font-bold text-primary", children: "404" }),
    /* @__PURE__ */ jsx("h2", { className: "mt-4 text-xl font-semibold", children: "Página no encontrada" }),
    /* @__PURE__ */ jsx("div", { className: "mt-6", children: /* @__PURE__ */ jsx(Link, { to: "/", className: "inline-flex items-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90", children: "Ir al inicio" }) })
  ] }) });
}
function ErrorComponent({ error, reset }) {
  console.error(error);
  return /* @__PURE__ */ jsx("div", { className: "flex min-h-screen items-center justify-center bg-background px-4", children: /* @__PURE__ */ jsxs("div", { className: "max-w-md text-center", children: [
    /* @__PURE__ */ jsx("h1", { className: "text-xl font-semibold", children: "Ocurrió un error" }),
    /* @__PURE__ */ jsx("p", { className: "mt-2 text-sm text-muted-foreground", children: error.message }),
    /* @__PURE__ */ jsx("button", { onClick: reset, className: "mt-6 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground", children: "Reintentar" })
  ] }) });
}
const Route$a = createRootRouteWithContext()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1, viewport-fit=cover" },
      { name: "theme-color", content: "#1c2454" },
      { title: "MyPhone Presupuestos" },
      { name: "description", content: "Gestión de presupuestos para reparación de celulares." },
      { property: "og:title", content: "MyPhone Presupuestos" },
      { name: "twitter:title", content: "MyPhone Presupuestos" },
      { property: "og:description", content: "Gestión de presupuestos para reparación de celulares." },
      { name: "twitter:description", content: "Gestión de presupuestos para reparación de celulares." },
      { property: "og:image", content: "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/c39a8af2-d218-4a3b-aa5f-fe65fc344893/id-preview-53ae8596--84e4c59b-af0d-4578-883a-c7528ce41e9f.lovable.app-1780801322142.png" },
      { name: "twitter:image", content: "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/c39a8af2-d218-4a3b-aa5f-fe65fc344893/id-preview-53ae8596--84e4c59b-af0d-4578-883a-c7528ce41e9f.lovable.app-1780801322142.png" },
      { name: "twitter:card", content: "summary_large_image" },
      { property: "og:type", content: "website" }
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "manifest", href: "/manifest.webmanifest" },
      { rel: "icon", href: "/favicon.ico" }
    ]
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent
});
function RootShell({ children }) {
  return /* @__PURE__ */ jsxs("html", { lang: "es", children: [
    /* @__PURE__ */ jsx("head", { children: /* @__PURE__ */ jsx(HeadContent, {}) }),
    /* @__PURE__ */ jsxs("body", { children: [
      children,
      /* @__PURE__ */ jsx(Scripts, {})
    ] })
  ] });
}
function RootComponent() {
  const { queryClient } = Route$a.useRouteContext();
  return /* @__PURE__ */ jsxs(QueryClientProvider, { client: queryClient, children: [
    /* @__PURE__ */ jsx(Outlet, {}),
    /* @__PURE__ */ jsx(Toaster, { richColors: true, position: "top-center" })
  ] });
}
const $$splitComponentImporter$8 = () => import("./auth-DY2SDViA.js");
const Route$9 = createFileRoute("/auth")({
  ssr: false,
  component: lazyRouteComponent($$splitComponentImporter$8, "component")
});
const $$splitComponentImporter$7 = () => import("./app-D4kxHZkQ.js");
const Route$8 = createFileRoute("/app")({
  ssr: false,
  component: lazyRouteComponent($$splitComponentImporter$7, "component")
});
const Route$7 = createFileRoute("/")({
  beforeLoad: () => {
    throw redirect({ to: "/app" });
  }
});
const $$splitComponentImporter$6 = () => import("./app.index-Bdzw6Vwb.js");
const Route$6 = createFileRoute("/app/")({
  component: lazyRouteComponent($$splitComponentImporter$6, "component")
});
const $$splitComponentImporter$5 = () => import("./app.ordenes-CwzDQxpm.js");
const Route$5 = createFileRoute("/app/ordenes")({
  component: lazyRouteComponent($$splitComponentImporter$5, "component")
});
const $$splitComponentImporter$4 = () => import("./app.illia-C1Y6gsjh.js");
const Route$4 = createFileRoute("/app/illia")({
  component: lazyRouteComponent($$splitComponentImporter$4, "component")
});
const $$splitComponentImporter$3 = () => import("./app.historial-CccWBNXd.js");
const Route$3 = createFileRoute("/app/historial")({
  component: lazyRouteComponent($$splitComponentImporter$3, "component")
});
const $$splitComponentImporter$2 = () => import("./app.estadisticas-N3-D7zVz.js");
const Route$2 = createFileRoute("/app/estadisticas")({
  component: lazyRouteComponent($$splitComponentImporter$2, "component")
});
const $$splitComponentImporter$1 = () => import("./app.configuracion-pbSxqrOy.js");
const Route$1 = createFileRoute("/app/configuracion")({
  component: lazyRouteComponent($$splitComponentImporter$1, "component")
});
const $$splitComponentImporter = () => import("./app.catalogo-CpLOJr9B.js");
const Route = createFileRoute("/app/catalogo")({
  component: lazyRouteComponent($$splitComponentImporter, "component")
});
const AuthRoute = Route$9.update({
  id: "/auth",
  path: "/auth",
  getParentRoute: () => Route$a
});
const AppRoute = Route$8.update({
  id: "/app",
  path: "/app",
  getParentRoute: () => Route$a
});
const IndexRoute = Route$7.update({
  id: "/",
  path: "/",
  getParentRoute: () => Route$a
});
const AppIndexRoute = Route$6.update({
  id: "/",
  path: "/",
  getParentRoute: () => AppRoute
});
const AppOrdenesRoute = Route$5.update({
  id: "/ordenes",
  path: "/ordenes",
  getParentRoute: () => AppRoute
});
const AppIlliaRoute = Route$4.update({
  id: "/illia",
  path: "/illia",
  getParentRoute: () => AppRoute
});
const AppHistorialRoute = Route$3.update({
  id: "/historial",
  path: "/historial",
  getParentRoute: () => AppRoute
});
const AppEstadisticasRoute = Route$2.update({
  id: "/estadisticas",
  path: "/estadisticas",
  getParentRoute: () => AppRoute
});
const AppConfiguracionRoute = Route$1.update({
  id: "/configuracion",
  path: "/configuracion",
  getParentRoute: () => AppRoute
});
const AppCatalogoRoute = Route.update({
  id: "/catalogo",
  path: "/catalogo",
  getParentRoute: () => AppRoute
});
const AppRouteChildren = {
  AppCatalogoRoute,
  AppConfiguracionRoute,
  AppEstadisticasRoute,
  AppHistorialRoute,
  AppIlliaRoute,
  AppOrdenesRoute,
  AppIndexRoute
};
const AppRouteWithChildren = AppRoute._addFileChildren(AppRouteChildren);
const rootRouteChildren = {
  IndexRoute,
  AppRoute: AppRouteWithChildren,
  AuthRoute
};
const routeTree = Route$a._addFileChildren(rootRouteChildren)._addFileTypes();
const getRouter = () => {
  const queryClient = new QueryClient();
  const router = createRouter({
    routeTree,
    context: { queryClient },
    scrollRestoration: true,
    defaultPreloadStaleTime: 0
  });
  return router;
};
export {
  getRouter
};
