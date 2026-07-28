import PDFDocument from 'pdfkit';

interface InvoicePdfInput {
  number: string;
  clientName: string;
  projectTitle: string;
  subtotal: number;
  taxAmount: number;
  total: number;
  currency: string;
  paidAt: Date | null;
}

/** Renders a paid invoice/receipt to a PDF buffer. */
export function generateInvoicePdf(input: InvoicePdfInput): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ size: 'A4', margin: 50 });
    const chunks: Buffer[] = [];
    doc.on('data', (chunk) => chunks.push(chunk));
    doc.on('end', () => resolve(Buffer.concat(chunks)));
    doc.on('error', reject);

    doc.fontSize(20).fillColor('#4F46E5').text('Tasork');
    doc.fontSize(10).fillColor('#6B7280').text('Invoice / Receipt');
    doc.moveDown(1);

    doc.fontSize(12).fillColor('#111827').text(`Invoice ${input.number}`);
    doc.fontSize(10).text(`Billed to: ${input.clientName}`);
    doc.text(`Project: ${input.projectTitle}`);
    if (input.paidAt) doc.text(`Paid: ${input.paidAt.toDateString()}`);
    doc.moveDown(1);

    const rowY = doc.y;
    doc.fontSize(10).text('Subtotal', 50, rowY).text(`${input.currency} ${input.subtotal.toFixed(2)}`, 400, rowY);
    doc.moveDown(0.5);
    const taxY = doc.y;
    doc.text('Tax', 50, taxY).text(`${input.currency} ${input.taxAmount.toFixed(2)}`, 400, taxY);
    doc.moveDown(0.5);
    doc.moveTo(50, doc.y).lineTo(550, doc.y).strokeColor('#E5E7EB').stroke();
    doc.moveDown(0.5);
    const totalY = doc.y;
    doc.fontSize(12).fillColor('#111827').text('Total Paid', 50, totalY).text(`${input.currency} ${input.total.toFixed(2)}`, 400, totalY);

    doc.moveDown(3);
    doc.fontSize(8).fillColor('#9CA3AF').text('Thank you for your business — Tasork.');

    doc.end();
  });
}
