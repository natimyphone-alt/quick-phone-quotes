
-- catalogo_repuestos
CREATE TABLE public.catalogo_repuestos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  proveedor TEXT NOT NULL,
  marca TEXT NOT NULL,
  modelo TEXT NOT NULL,
  tipo_repuesto TEXT NOT NULL,
  calidad TEXT,
  precio NUMERIC(12,2) NOT NULL DEFAULT 0,
  url_producto TEXT,
  fecha_actualizacion TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.catalogo_repuestos TO authenticated;
GRANT ALL ON public.catalogo_repuestos TO service_role;
ALTER TABLE public.catalogo_repuestos ENABLE ROW LEVEL SECURITY;
CREATE POLICY "catalogo_select_all" ON public.catalogo_repuestos FOR SELECT TO authenticated USING (true);
CREATE POLICY "catalogo_insert_admin" ON public.catalogo_repuestos FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "catalogo_update_admin" ON public.catalogo_repuestos FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "catalogo_delete_admin" ON public.catalogo_repuestos FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE INDEX catalogo_busqueda_idx ON public.catalogo_repuestos (marca, modelo, tipo_repuesto);
CREATE TRIGGER catalogo_touch BEFORE UPDATE ON public.catalogo_repuestos FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

-- mano_obra
CREATE TABLE public.mano_obra (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tipo_reparacion TEXT NOT NULL UNIQUE,
  precio NUMERIC(12,2) NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.mano_obra TO authenticated;
GRANT ALL ON public.mano_obra TO service_role;
ALTER TABLE public.mano_obra ENABLE ROW LEVEL SECURITY;
CREATE POLICY "mano_obra_select_all" ON public.mano_obra FOR SELECT TO authenticated USING (true);
CREATE POLICY "mano_obra_insert_admin" ON public.mano_obra FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "mano_obra_update_admin" ON public.mano_obra FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "mano_obra_delete_admin" ON public.mano_obra FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE TRIGGER mano_obra_touch BEFORE UPDATE ON public.mano_obra FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

INSERT INTO public.mano_obra (tipo_reparacion, precio) VALUES
  ('Cambio de módulo', 30000),
  ('Cambio de batería', 15000),
  ('Pin de carga', 25000),
  ('Cambio de tapa', 12000);

-- opciones_presupuesto
CREATE TABLE public.opciones_presupuesto (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  presupuesto_id UUID NOT NULL REFERENCES public.presupuestos(id) ON DELETE CASCADE,
  proveedor TEXT NOT NULL,
  calidad TEXT,
  costo_repuesto NUMERIC(12,2) NOT NULL DEFAULT 0,
  mano_obra NUMERIC(12,2) NOT NULL DEFAULT 0,
  envio NUMERIC(12,2) NOT NULL DEFAULT 0,
  ganancia NUMERIC(12,2) NOT NULL DEFAULT 0,
  iva NUMERIC(12,2) NOT NULL DEFAULT 0,
  total NUMERIC(12,2) NOT NULL DEFAULT 0,
  seleccionada BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.opciones_presupuesto TO authenticated;
GRANT ALL ON public.opciones_presupuesto TO service_role;
ALTER TABLE public.opciones_presupuesto ENABLE ROW LEVEL SECURITY;
CREATE INDEX opciones_presupuesto_idx ON public.opciones_presupuesto (presupuesto_id);
CREATE POLICY "opciones_select_scope" ON public.opciones_presupuesto FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM public.presupuestos p WHERE p.id = presupuesto_id
    AND (public.has_role(auth.uid(), 'admin') OR p.sucursal_id = public.user_sucursal(auth.uid()))));
CREATE POLICY "opciones_insert_scope" ON public.opciones_presupuesto FOR INSERT TO authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM public.presupuestos p WHERE p.id = presupuesto_id
    AND (public.has_role(auth.uid(), 'admin') OR p.sucursal_id = public.user_sucursal(auth.uid()))));
CREATE POLICY "opciones_update_scope" ON public.opciones_presupuesto FOR UPDATE TO authenticated
  USING (EXISTS (SELECT 1 FROM public.presupuestos p WHERE p.id = presupuesto_id
    AND (public.has_role(auth.uid(), 'admin') OR p.sucursal_id = public.user_sucursal(auth.uid()))));
CREATE POLICY "opciones_delete_scope" ON public.opciones_presupuesto FOR DELETE TO authenticated
  USING (EXISTS (SELECT 1 FROM public.presupuestos p WHERE p.id = presupuesto_id
    AND (public.has_role(auth.uid(), 'admin') OR p.sucursal_id = public.user_sucursal(auth.uid()))));
CREATE TRIGGER opciones_touch BEFORE UPDATE ON public.opciones_presupuesto FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();
