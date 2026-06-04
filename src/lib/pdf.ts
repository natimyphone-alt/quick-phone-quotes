import jsPDF from "jspdf";
import { formatARS } from "./calculos";

export interface PdfPresupuesto {
  numero: number;
  fecha: string;
  cliente: string;
  telefono?: string | null;
  marca?: string | null;
  modelo?: string | null;
  reparacion?: string | null;
  tipo_trabajo?: string | null;
  tipo: "illia" | "soft";
  costo?: number;
  ganancia?: number;
  envio?: number;
  precio_base?: number;
  subtotal: number;
  iva: number;
  total: number;
  sucursal?: string | null;
  usuario?: string | null;
}

export function generarPresupuestoPDF(p: PdfPresupuesto): jsPDF {
  const doc = new jsPDF({ unit: "pt", format: "a4" });
  const W = doc.internal.pageSize.getWidth();

  // Header
  doc.setFillColor(28, 36, 84);
  doc.rect(0, 0, W, 90, "F");
  doc.setTextColor(255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(24);
  doc.text("MyPhone", 40, 45);
  doc.setFontSize(11);
  doc.setFont("helvetica", "normal");
  doc.text("Presupuesto de Reparación", 40, 65);
  doc.setFontSize(10);
  doc.text(`N° ${p.numero}`, W - 40, 40, { align: "right" });
  doc.text(p.fecha, W - 40, 58, { align: "right" });
  if (p.sucursal) doc.text(`Sucursal: ${p.sucursal}`, W - 40, 74, { align: "right" });

  doc.setTextColor(20, 20, 30);
  let y = 130;

  // Cliente
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.text("Cliente", 40, y);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(11);
  y += 18;
  doc.text(`Nombre: ${p.cliente}`, 40, y);
  if (p.telefono) { y += 16; doc.text(`Teléfono: ${p.telefono}`, 40, y); }

  // Equipo
  y += 28;
  doc.setFont("helvetica", "bold"); doc.setFontSize(12);
  doc.text("Equipo", 40, y);
  doc.setFont("helvetica", "normal"); doc.setFontSize(11);
  y += 18;
  doc.text(`Marca: ${p.marca || "-"}    Modelo: ${p.modelo || "-"}`, 40, y);
  y += 16;
  const trabajo = p.tipo === "illia" ? p.reparacion : p.tipo_trabajo;
  doc.text(`Trabajo: ${trabajo || "-"}`, 40, y);

  // Detalle
  y += 32;
  doc.setFont("helvetica", "bold"); doc.setFontSize(12);
  doc.text("Detalle", 40, y);
  y += 8;
  doc.setDrawColor(180, 180, 200);
  doc.line(40, y, W - 40, y);
  y += 18;
  doc.setFont("helvetica", "normal"); doc.setFontSize(11);

  const row = (label: string, value: string, bold = false) => {
    if (bold) doc.setFont("helvetica", "bold"); else doc.setFont("helvetica", "normal");
    doc.text(label, 40, y);
    doc.text(value, W - 40, y, { align: "right" });
    y += 18;
  };

  if (p.tipo === "illia") {
    row("Costo repuesto + mano de obra", formatARS(p.costo || 0));
    row("Ganancia", formatARS(p.ganancia || 0));
    row("Envío", formatARS(p.envio || 0));
  } else {
    row("Precio base", formatARS(p.precio_base || 0));
  }
  doc.setDrawColor(220, 220, 230);
  doc.line(40, y - 6, W - 40, y - 6);
  row("Subtotal", formatARS(p.subtotal));
  row("IVA 21%", formatARS(p.iva));

  // Total
  y += 8;
  doc.setFillColor(28, 36, 84);
  doc.rect(40, y - 14, W - 80, 32, "F");
  doc.setTextColor(255);
  doc.setFont("helvetica", "bold"); doc.setFontSize(14);
  doc.text("TOTAL", 56, y + 6);
  doc.text(formatARS(p.total), W - 56, y + 6, { align: "right" });

  // Footer
  doc.setTextColor(120);
  doc.setFont("helvetica", "normal"); doc.setFontSize(9);
  const fy = doc.internal.pageSize.getHeight() - 40;
  doc.text(
    `Generado por ${p.usuario || "-"} • ${p.fecha}`,
    40, fy,
  );
  doc.text("Gracias por confiar en MyPhone", W - 40, fy, { align: "right" });

  return doc;
}

export function descargarPDF(p: PdfPresupuesto) {
  const doc = generarPresupuestoPDF(p);
  doc.save(`Presupuesto-${p.numero}.pdf`);
}
