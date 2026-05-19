"use client";

import jsPDF from "jspdf";

export function downloadAsPDF(text: string, filename: string): void {
  const doc = new jsPDF();
  doc.setFontSize(11);
  doc.setFont("helvetica", "normal");
  const lines = doc.splitTextToSize(text, 180);
  let y = 20;
  lines.forEach((line: string) => {
    if (y > 270) {
      doc.addPage();
      y = 20;
    }
    doc.text(line, 15, y);
    y += 7;
  });
  doc.save(filename);
}
