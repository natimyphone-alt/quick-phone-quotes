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
  return 15e4;
}
function calcularManoObraAndroid(precioVenta) {
  if (precioVenta <= 42e4) return 15e3;
  if (precioVenta <= 65e4) return 2e4;
  if (precioVenta <= 12e5) return 35e3;
  if (precioVenta <= 18e5) return 45e3;
  if (precioVenta <= 25e5) return 6e4;
  return 8e4;
}
function calcularManoObraModuloIphone(modelo, conIC) {
  const m = modelo.toUpperCase();
  const num = parseInt(m.replace(/[^0-9]/g, ""), 10);
  if (num >= 17) return conIC ? 15e4 : 5e4;
  if (num >= 15) return conIC ? 9e4 : 5e4;
  return conIC ? 8e4 : 5e4;
}
function calcularManoObraBateriaIphone(modelo, conCondicion) {
  const m = modelo.toUpperCase();
  const num = parseInt(m.replace(/[^0-9]/g, ""), 10);
  if (num >= 16) return conCondicion ? 95e3 : 7e4;
  return conCondicion ? 6e4 : 4e4;
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
  calcularManoObraBateriaIphone as a,
  calcularManoObraAndroid as b,
  calcularManoObraModuloIphone as c,
  calcularManoObraBateriaAndroid as d,
  calcularGanancia as e,
  formatARS as f
};
