// Reglas de negocio MyPhone Presupuestos
export const IVA_RATE = 0.21;

export function calcularGanancia(costo: number): number {
  if (costo <= 39999) return 30000;
  if (costo <= 49999) return 40000;
  if (costo <= 59999) return 50000;
  if (costo <= 69999) return 60000;
  if (costo <= 79999) return 70000;
  if (costo <= 89999) return 80000;
  if (costo <= 99999) return 90000;
  if (costo <= 199999) return 100000;
  return 150000;
}

export function formatARS(n: number): string {
  return new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(n || 0);
}