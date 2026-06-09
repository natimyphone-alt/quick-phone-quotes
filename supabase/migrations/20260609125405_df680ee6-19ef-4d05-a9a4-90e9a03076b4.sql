
-- 1. catalogo_repuestos: nuevos campos
ALTER TABLE public.catalogo_repuestos
  ADD COLUMN IF NOT EXISTS precio_proveedor numeric(12,2),
  ADD COLUMN IF NOT EXISTS precio_calculado numeric(12,2),
  ADD COLUMN IF NOT EXISTS ultima_sincronizacion timestamptz;

-- Backfill desde precio existente
UPDATE public.catalogo_repuestos
SET precio_proveedor = precio,
    precio_calculado = CASE WHEN proveedor = 'FV Mayorista' THEN precio + 10000 ELSE precio END
WHERE precio_proveedor IS NULL;

-- 2. mano_obra: mínimo final
ALTER TABLE public.mano_obra
  ADD COLUMN IF NOT EXISTS minimo_final numeric(12,2);

-- Upsert tipos de reparación nuevos (sin borrar los existentes)
INSERT INTO public.mano_obra (tipo_reparacion, precio, minimo_final) VALUES
  ('Módulo básico', 15000, 45000),
  ('Módulo gama media', 25000, NULL),
  ('Módulo gama alta', 35000, 80000),
  ('Pin de carga básico', 15000, 45000),
  ('Pin de carga gama alta', 15000, 80000)
ON CONFLICT (tipo_reparacion) DO UPDATE SET
  precio = EXCLUDED.precio,
  minimo_final = EXCLUDED.minimo_final;

-- 3. proveedores_config
CREATE TABLE IF NOT EXISTS public.proveedores_config (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre text NOT NULL UNIQUE,
  url text,
  usuario text,
  password_encrypted text,
  estado text NOT NULL DEFAULT 'no_configurado',
  ultima_sincronizacion timestamptz,
  notas text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.proveedores_config TO authenticated;
GRANT ALL ON public.proveedores_config TO service_role;

ALTER TABLE public.proveedores_config ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "prov_select_admin" ON public.proveedores_config;
DROP POLICY IF EXISTS "prov_insert_admin" ON public.proveedores_config;
DROP POLICY IF EXISTS "prov_update_admin" ON public.proveedores_config;
DROP POLICY IF EXISTS "prov_delete_admin" ON public.proveedores_config;

CREATE POLICY "prov_select_admin" ON public.proveedores_config FOR SELECT
  TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "prov_insert_admin" ON public.proveedores_config FOR INSERT
  TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "prov_update_admin" ON public.proveedores_config FOR UPDATE
  TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "prov_delete_admin" ON public.proveedores_config FOR DELETE
  TO authenticated USING (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER proveedores_config_touch
  BEFORE UPDATE ON public.proveedores_config
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

-- Seeds
INSERT INTO public.proveedores_config (nombre, url, estado) VALUES
  ('Patagonia Cell', 'https://www.patagoniacell.com', 'no_configurado'),
  ('FV Mayorista', 'https://www.fvmayorista.com.ar', 'no_configurado')
ON CONFLICT (nombre) DO NOTHING;
