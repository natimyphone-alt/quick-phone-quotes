import { formatARS } from "./calculos";

export function buildMensajeWhatsApp(p: {
  cliente: string;
  modelo?: string | null;
  marca?: string | null;
  reparacion?: string | null;
  tipo_trabajo?: string | null;
  total: number;
}) {
  const equipo = [p.marca, p.modelo].filter(Boolean).join(" ") || "tu equipo";
  const trabajo = p.reparacion || p.tipo_trabajo || "-";
  return (
    `Hola ${p.cliente}.\n\n` +
    `Te enviamos el presupuesto para tu equipo:\n\n` +
    `Equipo: ${equipo}\n` +
    `Trabajo: ${trabajo}\n` +
    `Total: ${formatARS(p.total)}\n\n` +
    `Muchas gracias.\nMyPhone`
  );
}

export function abrirWhatsApp(telefono: string | null | undefined, mensaje: string) {
  const tel = (telefono || "").replace(/\D/g, "");
  const base = tel ? `https://wa.me/${tel}` : `https://wa.me/`;
  const url = `${base}?text=${encodeURIComponent(mensaje)}`;
  window.open(url, "_blank", "noopener,noreferrer");
}
