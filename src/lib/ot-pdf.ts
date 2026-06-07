import jsPDF from "jspdf";

export interface PdfOrden {
  numero: number;
  fecha: string;
  cliente: string;
  telefono?: string | null;
  marca?: string | null;
  modelo?: string | null;
  imei?: string | null;
  falla?: string | null;
  accesorios?: string | null;
  clave_desbloqueo?: string | null;
  tecnico?: string | null;
  estado: string;
  sucursal?: string | null;
  usuario?: string | null;
}

export function generarOrdenPDF(o: PdfOrden): jsPDF {
  const doc = new jsPDF({ unit: "pt", format: "a4" });
  const W = doc.internal.pageSize.getWidth();
  doc.setFillColor(28, 36, 84);
  doc.rect(0, 0, W, 90, "F");
  doc.setTextColor(255);
  doc.setFont("helvetica", "bold"); doc.setFontSize(24);
  doc.text("MyPhone Hub", 40, 45);
  doc.setFontSize(11); doc.setFont("helvetica", "normal");
  doc.text("Orden de Trabajo", 40, 65);
  doc.setFontSize(10);
  doc.text(`OT-${String(o.numero).padStart(6, "0")}`, W - 40, 40, { align: "right" });
  doc.text(o.fecha, W - 40, 58, { align: "right" });
  if (o.sucursal) doc.text(`Sucursal: ${o.sucursal}`, W - 40, 74, { align: "right" });

  doc.setTextColor(20, 20, 30);
  let y = 130;
  const line = (label: string, value?: string | null) => {
    doc.setFont("helvetica", "bold"); doc.setFontSize(11); doc.text(label, 40, y);
    doc.setFont("helvetica", "normal"); doc.text(value || "-", 160, y);
    y += 18;
  };
  line("Cliente:", o.cliente);
  line("Teléfono:", o.telefono);
  line("Equipo:", [o.marca, o.modelo].filter(Boolean).join(" "));
  line("IMEI:", o.imei);
  line("Técnico:", o.tecnico);
  line("Estado:", o.estado);
  line("Clave/Patrón:", o.clave_desbloqueo);
  line("Accesorios:", o.accesorios);
  y += 6;
  doc.setFont("helvetica", "bold"); doc.text("Falla declarada:", 40, y); y += 16;
  doc.setFont("helvetica", "normal");
  const split = doc.splitTextToSize(o.falla || "-", W - 80);
  doc.text(split, 40, y);

  doc.setTextColor(120); doc.setFontSize(9);
  const fy = doc.internal.pageSize.getHeight() - 40;
  doc.text(`Generado por ${o.usuario || "-"} • ${o.fecha}`, 40, fy);
  doc.text("MyPhone Hub", W - 40, fy, { align: "right" });
  return doc;
}

export function descargarOrdenPDF(o: PdfOrden) {
  generarOrdenPDF(o).save(`OT-${String(o.numero).padStart(6, "0")}.pdf`);
}

export function formatOTNumero(n: number) {
  return `OT-${String(n).padStart(6, "0")}`;
}
export function formatPresupuestoNumero(n: number) {
  return `P-${String(n).padStart(6, "0")}`;
}
