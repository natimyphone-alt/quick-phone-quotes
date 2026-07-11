import { jsx, jsxs } from "react/jsx-runtime";
import { useNavigate } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { s as supabase } from "./client-CzxaLLtB.js";
import { B as Button } from "./button-BC9oXVxV.js";
import { I as Input } from "./input-C0QjszdI.js";
import { L as Label } from "./label-JU3yqRBo.js";
import { C as Card, a as CardHeader, b as CardTitle, c as CardDescription, d as CardContent } from "./card-DQ5v2DYb.js";
import { T as Tabs, a as TabsList, b as TabsTrigger, c as TabsContent } from "./tabs-D_u1EXWn.js";
import { toast } from "sonner";
import { Smartphone } from "lucide-react";
import "@supabase/supabase-js";
import "@radix-ui/react-slot";
import "class-variance-authority";
import "./utils-H80jjgLf.js";
import "clsx";
import "tailwind-merge";
import "@radix-ui/react-label";
import "@radix-ui/react-tabs";
function AuthPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [nombre, setNombre] = useState("");
  useEffect(() => {
    supabase.auth.getSession().then(({
      data
    }) => {
      if (data.session) navigate({
        to: "/app"
      });
    });
  }, [navigate]);
  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    const {
      error
    } = await supabase.auth.signInWithPassword({
      email,
      password
    });
    setLoading(false);
    if (error) return toast.error(error.message);
    toast.success("Bienvenido");
    navigate({
      to: "/app"
    });
  };
  const handleSignup = async (e) => {
    e.preventDefault();
    setLoading(true);
    const {
      error
    } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/app`,
        data: {
          nombre
        }
      }
    });
    setLoading(false);
    if (error) return toast.error(error.message);
    toast.success("Cuenta creada. Revisá tu email para confirmar.");
  };
  return /* @__PURE__ */ jsx("div", { className: "min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-primary to-accent", children: /* @__PURE__ */ jsxs(Card, { className: "w-full max-w-md shadow-2xl", children: [
    /* @__PURE__ */ jsxs(CardHeader, { className: "text-center space-y-2", children: [
      /* @__PURE__ */ jsx("div", { className: "mx-auto bg-primary text-primary-foreground rounded-2xl w-14 h-14 flex items-center justify-center", children: /* @__PURE__ */ jsx(Smartphone, { className: "w-7 h-7" }) }),
      /* @__PURE__ */ jsx(CardTitle, { className: "text-2xl", children: "MyPhone Hub" }),
      /* @__PURE__ */ jsx(CardDescription, { children: "Ingresá para gestionar tus presupuestos" })
    ] }),
    /* @__PURE__ */ jsx(CardContent, { children: /* @__PURE__ */ jsxs(Tabs, { defaultValue: "login", children: [
      /* @__PURE__ */ jsxs(TabsList, { className: "grid w-full grid-cols-2", children: [
        /* @__PURE__ */ jsx(TabsTrigger, { value: "login", children: "Ingresar" }),
        /* @__PURE__ */ jsx(TabsTrigger, { value: "signup", children: "Registrarse" })
      ] }),
      /* @__PURE__ */ jsx(TabsContent, { value: "login", children: /* @__PURE__ */ jsxs("form", { onSubmit: handleLogin, className: "space-y-4 mt-4", children: [
        /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
          /* @__PURE__ */ jsx(Label, { children: "Email" }),
          /* @__PURE__ */ jsx(Input, { type: "email", required: true, value: email, onChange: (e) => setEmail(e.target.value) })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
          /* @__PURE__ */ jsx(Label, { children: "Contraseña" }),
          /* @__PURE__ */ jsx(Input, { type: "password", required: true, value: password, onChange: (e) => setPassword(e.target.value) })
        ] }),
        /* @__PURE__ */ jsx(Button, { type: "submit", className: "w-full h-11 text-base", disabled: loading, children: loading ? "Ingresando..." : "Ingresar" })
      ] }) }),
      /* @__PURE__ */ jsx(TabsContent, { value: "signup", children: /* @__PURE__ */ jsxs("form", { onSubmit: handleSignup, className: "space-y-4 mt-4", children: [
        /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
          /* @__PURE__ */ jsx(Label, { children: "Nombre" }),
          /* @__PURE__ */ jsx(Input, { required: true, value: nombre, onChange: (e) => setNombre(e.target.value) })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
          /* @__PURE__ */ jsx(Label, { children: "Email" }),
          /* @__PURE__ */ jsx(Input, { type: "email", required: true, value: email, onChange: (e) => setEmail(e.target.value) })
        ] }),
        /* @__PURE__ */ jsxs("div", { className: "space-y-2", children: [
          /* @__PURE__ */ jsx(Label, { children: "Contraseña" }),
          /* @__PURE__ */ jsx(Input, { type: "password", minLength: 6, required: true, value: password, onChange: (e) => setPassword(e.target.value) })
        ] }),
        /* @__PURE__ */ jsx(Button, { type: "submit", className: "w-full h-11 text-base", disabled: loading, children: loading ? "Creando..." : "Crear cuenta" }),
        /* @__PURE__ */ jsx("p", { className: "text-xs text-muted-foreground text-center", children: "Tu sucursal y rol los asigna un administrador." })
      ] }) })
    ] }) })
  ] }) });
}
export {
  AuthPage as component
};
