import { f as formatARS } from "./calculos-BajsDPnH.js";
function buildMensajeWhatsApp(p) {
  const equipo = [p.marca, p.modelo].filter(Boolean).join(" ") || "tu equipo";
  const trabajo = p.reparacion || p.tipo_trabajo || "-";
  return `Hola ${p.cliente}.

Te enviamos el presupuesto para tu equipo:

Equipo: ${equipo}
Trabajo: ${trabajo}
Total: ${formatARS(p.total)}

Muchas gracias.
MyPhone`;
}
function abrirWhatsApp(telefono, mensaje) {
  const tel = (telefono || "").replace(/\D/g, "");
  const base = tel ? `https://wa.me/${tel}` : `https://wa.me/`;
  const url = `${base}?text=${encodeURIComponent(mensaje)}`;
  window.open(url, "_blank", "noopener,noreferrer");
}
export {
  abrirWhatsApp as a,
  buildMensajeWhatsApp as b
};
