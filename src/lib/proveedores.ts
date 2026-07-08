import { calcularGanancia, IVA_RATE } from "./calculos";

export const PROVEEDORES = ["Patagonia Cell", "FV Mayorista"] as const;
export type Proveedor = (typeof PROVEEDORES)[number];

export const RECARGO_FV = 10000;
export const ENVIO_PATAGONIA = 6000;
export const ENVIO_FV = 16000;

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
  ajustado_minimo?: boolean;
  url_producto?: string | null;
  catalogo_id?: string;
}

export function calcularOpcion(input: {
  proveedor: string;
  calidad: string | null;
  precioProveedor?: number;
  precioCalculado?: number;
  precioCatalogo?: number;
  manoObra: number;
  envio?: number;
  minimoFinal?: number | null;
  url_producto?: string | null;
  catalogo_id?: string;
}): OpcionCalculada {
  const precioRepuesto =
    input.precioCalculado ??
    (input.precioProveedor ?? input.precioCatalogo ?? 0);

  const envio = input.envio !== undefined
    ? input.envio
    : input.proveedor === "Patagonia Cell" ? ENVIO_PATAGONIA : ENVIO_FV;

  const ganancia = calcularGanancia(precioRepuesto);
  const subtotal = precioRepuesto + input.manoObra + envio + ganancia;
  const iva = subtotal * IVA_RATE;
  const total = subtotal + iva;

  return {
    proveedor: input.proveedor,
    calidad: input.calidad,
    costo_repuesto: precioRepuesto,
    mano_obra: input.manoObra,
    envio,
    ganancia,
    subtotal,
    iva,
    total,
    url_producto: input.url_producto,
    catalogo_id: input.catalogo_id,
  };
}

export function calcularPrecioFinal(proveedor: string, precioProveedor: number): number {
  if (proveedor === "FV Mayorista") return precioProveedor + RECARGO_FV;
  return precioProveedor;
}

export const aplicarRecargoProveedor = calcularPrecioFinal;