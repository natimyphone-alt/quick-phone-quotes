import { I as IVA_RATE, e as calcularGanancia } from "./calculos-BajsDPnH.js";
const PROVEEDORES = ["Patagonia Cell", "FV Mayorista"];
const RECARGO_FV = 1e4;
const ENVIO_PATAGONIA = 6e3;
const ENVIO_FV = 16e3;
function calcularOpcion(input) {
  const precioRepuesto = input.precioCalculado ?? (input.precioProveedor ?? input.precioCatalogo ?? 0);
  const envio = input.envio !== void 0 ? input.envio : input.proveedor === "Patagonia Cell" ? ENVIO_PATAGONIA : ENVIO_FV;
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
    catalogo_id: input.catalogo_id
  };
}
function calcularPrecioFinal(proveedor, precioProveedor) {
  if (proveedor === "FV Mayorista") return precioProveedor + RECARGO_FV;
  return precioProveedor;
}
export {
  ENVIO_PATAGONIA as E,
  PROVEEDORES as P,
  RECARGO_FV as R,
  ENVIO_FV as a,
  calcularPrecioFinal as b,
  calcularOpcion as c
};
