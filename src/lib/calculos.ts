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

// Mano de obra calculada sobre precio de venta del celular en el mercado
// Gama baja: A15/A16/G15/G35 = $255.000-$420.000 → $15.000
// Gama media: A26/G45/A36 = $465.000-$999.999 → $20.000
// Gama media-alta: A56/G85/Edge 40 = $600.000-$1.200.000 → $35.000
// Gama alta: S24/Edge 50 = $1.200.000-$1.800.000 → $45.000
// Premium: S25/S25+ = $1.800.000-$2.500.000 → $60.000
// Ultra premium: S25 Ultra/S26 Ultra = +$2.500.000 → $80.000
export function calcularManoObra(precioVentaCelular: number): number {
  if (precioVentaCelular <= 420000) return 15000;
  if (precioVentaCelular <= 650000) return 20000;
  if (precioVentaCelular <= 1200000) return 35000;
  if (precioVentaCelular <= 1800000) return 45000;
  if (precioVentaCelular <= 2500000) return 60000;
  return 80000;
}

export function formatARS(n: number): string {
  return new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(n || 0);
}