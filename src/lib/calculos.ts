export const IVA_RATE = 0.21;

// Ganancia calculada sobre el precio del repuesto solo
export function calcularGanancia(precioRepuesto: number): number {
  if (precioRepuesto <= 39999) return 30000;
  if (precioRepuesto <= 49999) return 40000;
  if (precioRepuesto <= 59999) return 50000;
  if (precioRepuesto <= 69999) return 60000;
  if (precioRepuesto <= 79999) return 70000;
  if (precioRepuesto <= 89999) return 80000;
  if (precioRepuesto <= 99999) return 90000;
  if (precioRepuesto <= 199999) return 100000;
  return 150000;
}

// Mano de obra Android según precio de venta del celular en el mercado
export function calcularManoObraAndroid(precioVenta: number): number {
  if (precioVenta <= 420000) return 15000;
  if (precioVenta <= 650000) return 20000;
  if (precioVenta <= 1200000) return 35000;
  if (precioVenta <= 1800000) return 45000;
  if (precioVenta <= 2500000) return 60000;
  return 80000;
}

// Mano de obra módulo iPhone según generación y si tiene IC
export function calcularManoObraModuloIphone(modelo: string, conIC: boolean): number {
  const m = modelo.toUpperCase();
  const num = parseInt(m.replace(/[^0-9]/g, ""), 10);
  if (num >= 17) return conIC ? 150000 : 50000;
  if (num >= 15) return conIC ? 90000 : 50000;
  // 11 al 14
  return conIC ? 80000 : 50000;
}

// Mano de obra batería iPhone según generación y condición
export function calcularManoObraBateriaIphone(modelo: string, conCondicion: boolean): number {
  const m = modelo.toUpperCase();
  const num = parseInt(m.replace(/[^0-9]/g, ""), 10);
  if (num >= 16) return conCondicion ? 95000 : 70000;
  // hasta iPhone 15
  return conCondicion ? 60000 : 40000;
}

// Mano de obra batería Android
export function calcularManoObraBateriaAndroid(precioVenta: number): number {
  if (precioVenta <= 650000) return 15000;
  return 25000;
}

// Mano de obra placa de carga Android
export function calcularManoObraPlacaAndroid(precioVenta: number): number {
  if (precioVenta <= 650000) return 25000;
  return 45000;
}

export function formatARS(n: number): string {
  return new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(n || 0);
}