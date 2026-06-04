
-- ENUMS
CREATE TYPE public.app_role AS ENUM ('admin', 'usuario');
CREATE TYPE public.presupuesto_tipo AS ENUM ('illia', 'soft');
CREATE TYPE public.presupuesto_estado AS ENUM ('pendiente', 'aprobado', 'rechazado', 'entregado');

-- SUCURSALES
CREATE TABLE public.sucursales (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre TEXT NOT NULL UNIQUE,
  direccion TEXT,
  telefono TEXT,
  activo BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.sucursales TO authenticated;
GRANT ALL ON public.sucursales TO service_role;
ALTER TABLE public.sucursales ENABLE ROW LEVEL SECURITY;

-- PROFILES
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  nombre TEXT,
  sucursal_id UUID REFERENCES public.sucursales(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- USER ROLES
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role app_role NOT NULL DEFAULT 'usuario',
  UNIQUE(user_id, role)
);
GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- HAS_ROLE FUNCTION
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$ SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role) $$;

-- USER SUCURSAL HELPER
CREATE OR REPLACE FUNCTION public.user_sucursal(_user_id UUID)
RETURNS UUID
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$ SELECT sucursal_id FROM public.profiles WHERE id = _user_id $$;

-- PRECIOS REFERENCIA (Soft)
CREATE TABLE public.precios_referencia (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clave TEXT NOT NULL UNIQUE,
  etiqueta TEXT NOT NULL,
  precio NUMERIC(12,2) NOT NULL,
  orden INTEGER NOT NULL DEFAULT 0,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.precios_referencia TO authenticated;
GRANT ALL ON public.precios_referencia TO service_role;
ALTER TABLE public.precios_referencia ENABLE ROW LEVEL SECURITY;

INSERT INTO public.precios_referencia (clave, etiqueta, precio, orden) VALUES
  ('soft_altas_cuentas_parches', 'Soft / Altas / Cuentas / Parches comunes', 38000, 1),
  ('servidor_motorola_cuentas', 'Servidor Motorola para cuentas', 139000, 2),
  ('xiaomi_cuenta_google', 'Xiaomi Cuenta Google', 89900, 3),
  ('xiaomi_root', 'Xiaomi Root', 150000, 4),
  ('samsung_cuenta_google_seguridad_nueva', 'Samsung Cuenta Google Seguridad Nueva', 179900, 5),
  ('otro', 'Otro', 0, 99);

-- PRESUPUESTOS
CREATE SEQUENCE public.presupuesto_numero_seq START 1000;

CREATE TABLE public.presupuestos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  numero INTEGER NOT NULL DEFAULT nextval('public.presupuesto_numero_seq') UNIQUE,
  tipo presupuesto_tipo NOT NULL,
  cliente TEXT NOT NULL,
  telefono TEXT,
  marca TEXT,
  modelo TEXT,
  reparacion TEXT,
  tipo_trabajo TEXT,
  costo NUMERIC(12,2) NOT NULL DEFAULT 0,
  ganancia NUMERIC(12,2) NOT NULL DEFAULT 0,
  envio NUMERIC(12,2) NOT NULL DEFAULT 0,
  precio_base NUMERIC(12,2) NOT NULL DEFAULT 0,
  subtotal NUMERIC(12,2) NOT NULL DEFAULT 0,
  iva NUMERIC(12,2) NOT NULL DEFAULT 0,
  total NUMERIC(12,2) NOT NULL DEFAULT 0,
  estado presupuesto_estado NOT NULL DEFAULT 'pendiente',
  sucursal_id UUID REFERENCES public.sucursales(id) ON DELETE SET NULL,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE SET NULL,
  notas TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.presupuestos TO authenticated;
GRANT ALL ON public.presupuestos TO service_role;
GRANT USAGE ON SEQUENCE public.presupuesto_numero_seq TO authenticated;
ALTER TABLE public.presupuestos ENABLE ROW LEVEL SECURITY;

-- TRIGGERS updated_at
CREATE OR REPLACE FUNCTION public.touch_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql SET search_path = public AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END $$;

CREATE TRIGGER trg_profiles_updated BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();
CREATE TRIGGER trg_presupuestos_updated BEFORE UPDATE ON public.presupuestos
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

-- AUTO PROFILE ON SIGNUP
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (id, email, nombre)
  VALUES (NEW.id, NEW.email, COALESCE(NEW.raw_user_meta_data->>'nombre', NEW.email));
  INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'usuario');
  RETURN NEW;
END $$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- RLS POLICIES

-- sucursales: todos los autenticados leen; solo admin escribe
CREATE POLICY "sucursales_select_all" ON public.sucursales FOR SELECT TO authenticated USING (true);
CREATE POLICY "sucursales_admin_insert" ON public.sucursales FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "sucursales_admin_update" ON public.sucursales FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "sucursales_admin_delete" ON public.sucursales FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- profiles: cada uno ve el suyo; admin ve y edita todo
CREATE POLICY "profiles_self_or_admin_select" ON public.profiles FOR SELECT TO authenticated
  USING (id = auth.uid() OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "profiles_self_update" ON public.profiles FOR UPDATE TO authenticated
  USING (id = auth.uid() OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "profiles_admin_insert" ON public.profiles FOR INSERT TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin') OR id = auth.uid());
CREATE POLICY "profiles_admin_delete" ON public.profiles FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- user_roles: cada uno ve los suyos; admin gestiona
CREATE POLICY "roles_self_or_admin_select" ON public.user_roles FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "roles_admin_insert" ON public.user_roles FOR INSERT TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "roles_admin_update" ON public.user_roles FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "roles_admin_delete" ON public.user_roles FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- precios_referencia: todos leen, admin escribe
CREATE POLICY "precios_select_all" ON public.precios_referencia FOR SELECT TO authenticated USING (true);
CREATE POLICY "precios_admin_insert" ON public.precios_referencia FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "precios_admin_update" ON public.precios_referencia FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "precios_admin_delete" ON public.precios_referencia FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- presupuestos: admin ve todo; usuario solo los de su sucursal
CREATE POLICY "presupuestos_select_scope" ON public.presupuestos FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin') OR sucursal_id = public.user_sucursal(auth.uid()));
CREATE POLICY "presupuestos_insert_self" ON public.presupuestos FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid() AND (public.has_role(auth.uid(), 'admin') OR sucursal_id = public.user_sucursal(auth.uid())));
CREATE POLICY "presupuestos_update_scope" ON public.presupuestos FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'admin') OR sucursal_id = public.user_sucursal(auth.uid()));
CREATE POLICY "presupuestos_delete_admin" ON public.presupuestos FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));
