export const IVA_RATE = 0.21;

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

export function calcularManoObraAndroid(precioVenta: number): number {
  if (precioVenta <= 420000) return 15000;
  if (precioVenta <= 650000) return 20000;
  if (precioVenta <= 1200000) return 35000;
  if (precioVenta <= 1800000) return 45000;
  if (precioVenta <= 2500000) return 60000;
  return 80000;
}

export function calcularManoObraIphone(modelo: string, conIC: boolean): number {
  const m = modelo.toUpperCase();
  const es15a17 = /1[567]/.test(m) || m.includes("15") || m.includes("16") || m.includes("17");
  if (es15a17) return conIC ? 90000 : 50000;
  return conIC ? 80000 : 50000;
}

export function formatARS(n: number): string {
  return new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(n || 0);
}