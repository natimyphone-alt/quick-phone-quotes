
-- Sequence + table for ordenes_trabajo
CREATE SEQUENCE IF NOT EXISTS public.orden_trabajo_numero_seq START 1;

DO $$ BEGIN
  CREATE TYPE public.orden_estado AS ENUM ('ingresado','en_revision','en_reparacion','listo','entregado','no_reparado');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

CREATE TABLE IF NOT EXISTS public.ordenes_trabajo (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  numero integer NOT NULL DEFAULT nextval('public.orden_trabajo_numero_seq'),
  cliente text NOT NULL,
  telefono text,
  marca text,
  modelo text,
  imei text,
  falla text,
  accesorios text,
  clave_desbloqueo text,
  tecnico text,
  estado public.orden_estado NOT NULL DEFAULT 'ingresado',
  notas text,
  sucursal_id uuid,
  user_id uuid NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.ordenes_trabajo TO authenticated;
GRANT ALL ON public.ordenes_trabajo TO service_role;
GRANT USAGE ON SEQUENCE public.orden_trabajo_numero_seq TO authenticated, service_role;

ALTER TABLE public.ordenes_trabajo ENABLE ROW LEVEL SECURITY;

CREATE POLICY ot_select_scope ON public.ordenes_trabajo FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(),'admin') OR sucursal_id = public.user_sucursal(auth.uid()));
CREATE POLICY ot_insert_self ON public.ordenes_trabajo FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid() AND (public.has_role(auth.uid(),'admin') OR sucursal_id = public.user_sucursal(auth.uid())));
CREATE POLICY ot_update_scope ON public.ordenes_trabajo FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(),'admin') OR sucursal_id = public.user_sucursal(auth.uid()));
CREATE POLICY ot_delete_admin ON public.ordenes_trabajo FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(),'admin'));

CREATE TRIGGER trg_ot_updated BEFORE UPDATE ON public.ordenes_trabajo
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

-- Sucursales iniciales
INSERT INTO public.sucursales (nombre) VALUES ('Perito'),('Paseo'),('Avenida'),('Roca')
ON CONFLICT DO NOTHING;
