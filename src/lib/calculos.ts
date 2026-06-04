// Reglas de negocio MyPhone Presupuestos

export const IVA_RATE = 0.21;

// Tramos de ganancia para módulo Illia
export function calcularGanancia(costo: number): number {
  if (costo <= 40000) return 40000;
  if (costo <= 50000) return 50000;
  if (costo <= 60000) return 60000;
  if (costo <= 70000) return 70000;
  if (costo <= 80000) return 80000;
  if (costo <= 90000) return 90000;
  if (costo <= 100000) return 100000;
  if (costo <= 200000) return 150000;
  if (costo <= 400000) return 150000;
  return 180000;
}

export interface CalculoIllia {
  costo: number;
  ganancia: number;
  envio: number;
  subtotal: number;
  iva: number;
  total: number;
}

export function calcularIllia(costo: number, envio: number): CalculoIllia {
  const ganancia = calcularGanancia(costo);
  const subtotal = costo + ganancia + envio;
  const iva = subtotal * IVA_RATE;
  const total = subtotal + iva;
  return { costo, ganancia, envio, subtotal, iva, total };
}

// Detección Samsung Serie S
const SERIE_S_REGEX = /\bS(2[3-9]|[3-9]\d)(\s*(\+|plus|ultra))?\b/i;

export function esSamsungSerieS(marca: string, modelo: string): boolean {
  if (!marca || !/samsung/i.test(marca)) return false;
  return SERIE_S_REGEX.test(modelo || "");
}

export const PRECIO_MINIMO_SERIE_S = 80000;

export interface CalculoSoft {
  precioBaseOriginal: number;
  precioBase: number;
  iva: number;
  total: number;
  ajustadoSerieS: boolean;
}

export function calcularSoft(
  precioBase: number,
  marca: string,
  modelo: string,
): CalculoSoft {
  const original = precioBase;
  let base = precioBase;
  let ajustado = false;
  if (esSamsungSerieS(marca, modelo) && base < PRECIO_MINIMO_SERIE_S) {
    base = PRECIO_MINIMO_SERIE_S;
    ajustado = true;
  }
  const iva = base * IVA_RATE;
  return {
    precioBaseOriginal: original,
    precioBase: base,
    iva,
    total: base + iva,
    ajustadoSerieS: ajustado,
  };
}

export function formatARS(n: number): string {
  return new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(n || 0);
}
