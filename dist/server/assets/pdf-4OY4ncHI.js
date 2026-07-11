import jsPDF from "jspdf";
import { f as formatARS } from "./calculos-BajsDPnH.js";
function headerPDF(doc, numero, fecha, sucursal, subtitle = "Presupuesto de Reparación") {
  const W = doc.internal.pageSize.getWidth();
  doc.setFillColor(28, 36, 84);
  doc.rect(0, 0, W, 90, "F");
  doc.setTextColor(255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(24);
  doc.text("MyPhone Hub", 40, 45);
  doc.setFontSize(11);
  doc.setFont("helvetica", "normal");
  doc.text(subtitle, 40, 65);
  doc.setFontSize(10);
  doc.text(`P-${String(numero).padStart(6, "0")}`, W - 40, 40, { align: "right" });
  doc.text(fecha, W - 40, 58, { align: "right" });
  if (sucursal) doc.text(`Sucursal: ${sucursal}`, W - 40, 74, { align: "right" });
  doc.setTextColor(20, 20, 30);
}
function footerPDF(doc, usuario, fecha) {
  const W = doc.internal.pageSize.getWidth();
  const fy = doc.internal.pageSize.getHeight() - 40;
  doc.setTextColor(120);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.text(`Generado por ${usuario || "-"} • ${fecha || ""}`, 40, fy);
  doc.text("Gracias por confiar en MyPhone Hub", W - 40, fy, { align: "right" });
}
function generarPresupuestoPDF(p) {
  const doc = new jsPDF({ unit: "pt", format: "a4" });
  const W = doc.internal.pageSize.getWidth();
  headerPDF(doc, p.numero, p.fecha, p.sucursal);
  let y = 130;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.text("Cliente", 40, y);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(11);
  y += 18;
  doc.text(`Nombre: ${p.cliente}`, 40, y);
  if (p.telefono) {
    y += 16;
    doc.text(`Teléfono: ${p.telefono}`, 40, y);
  }
  y += 28;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.text("Equipo", 40, y);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(11);
  y += 18;
  doc.text(`Marca: ${p.marca || "-"}    Modelo: ${p.modelo || "-"}`, 40, y);
  y += 16;
  doc.text(`Trabajo: ${(p.tipo === "illia" ? p.reparacion : p.tipo_trabajo) || "-"}`, 40, y);
  y += 32;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.text("Detalle", 40, y);
  y += 8;
  doc.setDrawColor(180, 180, 200);
  doc.line(40, y, W - 40, y);
  y += 18;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(11);
  const row = (label, value) => {
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
  y += 8;
  doc.setFillColor(28, 36, 84);
  doc.rect(40, y - 14, W - 80, 32, "F");
  doc.setTextColor(255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  doc.text("TOTAL", 56, y + 6);
  doc.text(formatARS(p.total), W - 56, y + 6, { align: "right" });
  footerPDF(doc, p.usuario, p.fecha);
  return doc;
}
function descargarPDF(p) {
  const doc = generarPresupuestoPDF(p);
  doc.save(`P-${String(p.numero).padStart(6, "0")}.pdf`);
}
function generarPDFMultiOpciones(p) {
  const doc = new jsPDF({ unit: "pt", format: "a4" });
  const W = doc.internal.pageSize.getWidth();
  headerPDF(doc, p.numero, p.fecha, p.sucursal, "PRESUPUESTO MYPHONE");
  let y = 120;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.text("Cliente", 40, y);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(11);
  y += 18;
  doc.text(`${p.cliente}${"  •  " + p.telefono}`, 40, y);
  y += 24;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.text("Equipo", 40, y);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(11);
  y += 18;
  doc.text(`Marca: ${p.marca || "-"}`, 40, y);
  y += 16;
  doc.text(`Modelo: ${p.modelo || "-"}`, 40, y);
  y += 16;
  doc.text(`Reparación: ${p.reparacion || "-"}`, 40, y);
  y += 20;
  p.opciones.forEach((op, i) => {
    if (y > 680) {
      doc.addPage();
      y = 60;
    }
    doc.setFillColor(240, 243, 250);
    doc.rect(40, y, W - 80, 24, "F");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.setTextColor(28, 36, 84);
    doc.text(`OPCIÓN ${i + 1}`, 50, y + 16);
    doc.setTextColor(20, 20, 30);
    y += 34;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(11);
    doc.text(`Proveedor: ${op.proveedor}`, 50, y);
    y += 16;
    doc.text(`Calidad: ${op.calidad || "-"}`, 50, y);
    y += 16;
    doc.text(`Precio final: ${formatARS(op.total)}`, 50, y);
    y += 22;
  });
  if (p.seleccionadaIdx !== null && p.opciones[p.seleccionadaIdx]) {
    if (y > 680) {
      doc.addPage();
      y = 60;
    }
    const op = p.opciones[p.seleccionadaIdx];
    doc.setFillColor(28, 36, 84);
    doc.rect(40, y, W - 80, 44, "F");
    doc.setTextColor(255);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.text("OPCIÓN SELECCIONADA:", 56, y + 18);
    doc.setFontSize(14);
    doc.text(`${op.proveedor} ${op.calidad || ""}`.trim(), 56, y + 36);
    doc.text(formatARS(op.total), W - 56, y + 36, { align: "right" });
    doc.setTextColor(20, 20, 30);
  }
  footerPDF(doc, p.usuario, p.fecha);
  return doc;
}
function descargarPDFMultiOpciones(p) {
  const doc = generarPDFMultiOpciones(p);
  doc.save(`P-${String(p.numero).padStart(6, "0")}.pdf`);
}
export {
  descargarPDF as a,
  descargarPDFMultiOpciones as d
};
