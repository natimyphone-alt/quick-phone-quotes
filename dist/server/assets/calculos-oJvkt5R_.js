const IVA_RATE = 0.21;
function calcularGanancia(precioRepuesto) {
  if (precioRepuesto <= 39999) return 3e4;
  if (precioRepuesto <= 49999) return 4e4;
  if (precioRepuesto <= 59999) return 5e4;
  if (precioRepuesto <= 69999) return 6e4;
  if (precioRepuesto <= 79999) return 7e4;
  if (precioRepuesto <= 89999) return 8e4;
  if (precioRepuesto <= 99999) return 9e4;
  if (precioRepuesto <= 199999) return 1e5;
  if (precioRepuesto <= 299999) return 15e4;
  return 2e5;
}
function calcularManoObraAndroid(precioVenta, marca, modelo) {
  const m = (modelo || "").toLowerCase();
  const mk = (marca || "").toLowerCase();
  if (mk === "motorola" && m.includes("razr")) return 55e3;
  if (mk === "samsung" && (m.includes("fold") || m.includes("flip"))) return 65e3;
  if (precioVenta <= 42e4) return 15e3;
  if (precioVenta <= 65e4) return 2e4;
  if (precioVenta <= 12e5) return 35e3;
  if (precioVenta <= 18e5) return 45e3;
  if (precioVenta <= 25e5) return 6e4;
  return 8e4;
}
function calcularManoObraBateriaAndroid(precioVenta) {
  if (precioVenta <= 65e4) return 15e3;
  return 25e3;
}
function formatARS(n) {
  return new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(n || 0);
}
export {
  IVA_RATE as I,
  calcularManoObraBateriaAndroid as a,
  calcularGanancia as b,
  calcularManoObraAndroid as c,
  formatARS as f
};
