// Reglas de proveedores de repuestos
import { calcularGanancia, IVA_RATE } from "./calculos";

export const PROVEEDORES = ["Patagonia Cell", "FV Mayorista"] as const;
export type Proveedor = (typeof PROVEEDORES)[number];

export const RECARGO_FV = 10000;

/** Calcula el precio que se usa para presupuestar a partir del precio del proveedor. */
export function calcularPrecioFinal(proveedor: string, precioProveedor: number): number {
  if (proveedor === "FV Mayorista") return precioProveedor + RECARGO_FV;
  return precioProveedor;
}

// Compatibilidad hacia atrás
export const aplicarRecargoProveedor = calcularPrecioFinal;

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
  /** Precio del proveedor (precio_proveedor del catálogo). Si no viene, usar precioCatalogo. */
  precioProveedor?: number;
  /** Precio calculado ya con recargos. Si viene, se usa directo. */
  precioCalculado?: number;
  /** Compat: precio plano (se trata como precio_proveedor). */
  precioCatalogo?: number;
  manoObra: number;
  envio: number;
  /** Mínimo final del presupuesto (de mano_obra.minimo_final). */
  minimoFinal?: number | null;
  url_producto?: string | null;
  catalogo_id?: string;
}): OpcionCalculada {
  const precioBase =
    input.precioCalculado ??
    calcularPrecioFinal(input.proveedor, input.precioProveedor ?? input.precioCatalogo ?? 0);

  const costo_repuesto = precioBase;
  const costoBase = costo_repuesto + input.manoObra;
  const ganancia = calcularGanancia(costoBase);
  let subtotal = costoBase + input.envio + ganancia;
  let iva = subtotal * IVA_RATE;
  let total = subtotal + iva;
  let ajustado_minimo = false;

  if (input.minimoFinal && total < input.minimoFinal) {
    total = input.minimoFinal;
    // Ajustamos subtotal e IVA para que se mantenga la coherencia: total = subtotal + iva
    subtotal = total / (1 + IVA_RATE);
    iva = total - subtotal;
    ajustado_minimo = true;
  }

  return {
    proveedor: input.proveedor,
    calidad: input.calidad,
    costo_repuesto,
    mano_obra: input.manoObra,
    envio: input.envio,
    ganancia,
    subtotal,
    iva,
    total,
    ajustado_minimo,
    url_producto: input.url_producto,
    catalogo_id: input.catalogo_id,
  };
}
