// Reglas de proveedores de repuestos
import { calcularGanancia, IVA_RATE } from "./calculos";

export const PROVEEDORES = ["Patagonia Cell", "FV Mayorista"] as const;
export type Proveedor = (typeof PROVEEDORES)[number];

export const RECARGO_FV = 10000;

export function aplicarRecargoProveedor(proveedor: string, precio: number): number {
  if (proveedor === "FV Mayorista") return precio + RECARGO_FV;
  return precio;
}

export interface OpcionCalculada {
  proveedor: string;
  calidad: string | null;
  costo_repuesto: number;
  mano_obra: number;
  envio: number;
  ganancia: number;
  subtotal: number;
  iva: number;
  total: number;
  url_producto?: string | null;
  catalogo_id?: string;
}

export function calcularOpcion(input: {
  proveedor: string;
  calidad: string | null;
  precioCatalogo: number;
  manoObra: number;
  envio: number;
  url_producto?: string | null;
  catalogo_id?: string;
}): OpcionCalculada {
  const costo_repuesto = aplicarRecargoProveedor(input.proveedor, input.precioCatalogo);
  const costoBase = costo_repuesto + input.manoObra;
  const ganancia = calcularGanancia(costoBase);
  const subtotal = costoBase + input.envio + ganancia;
  const iva = subtotal * IVA_RATE;
  return {
    proveedor: input.proveedor,
    calidad: input.calidad,
    costo_repuesto,
    mano_obra: input.manoObra,
    envio: input.envio,
    ganancia,
    subtotal,
    iva,
    total: subtotal + iva,
    url_producto: input.url_producto,
    catalogo_id: input.catalogo_id,
  };
}
