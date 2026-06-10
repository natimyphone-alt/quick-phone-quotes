-- Allow upsert por URL en catalogo_repuestos (clave natural por proveedor)
CREATE UNIQUE INDEX IF NOT EXISTS catalogo_repuestos_prov_url_uidx
  ON public.catalogo_repuestos (proveedor, url_producto)
  WHERE url_producto IS NOT NULL;