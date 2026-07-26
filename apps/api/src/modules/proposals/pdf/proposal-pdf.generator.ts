import PDFDocument from 'pdfkit';

interface ProposalPdfInput {
  proposalId: string;
  version: number;
  clientName: string;
  requestTitle: string;
  price: number;
  currency: string;
  timelineDays: number;
  scope: string;
  revisionPolicy: string;
  expiresAt: Date | null;
  deliverables: { title: string; description: string | null }[];
  milestones: { title: string; description: string | null; amount: number }[];
}

/** Renders a proposal to a PDF buffer — no external service required. */
export function generateProposalPdf(input: ProposalPdfInput): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ size: 'A4', margin: 50 });
    const chunks: Buffer[] = [];
    doc.on('data', (chunk) => chunks.push(chunk));
    doc.on('end', () => resolve(Buffer.concat(chunks)));
    doc.on('error', reject);

    doc
      .fontSize(20)
      .fillColor('#4F46E5')
      .text('Tasork', { continued: true })
      .fillColor('#111827')
      .fontSize(12)
      .text(`   Proposal v${input.version}`, { align: 'left' });

    doc.moveDown(0.5);
    doc.fontSize(16).fillColor('#111827').text(input.requestTitle);
    doc.fontSize(10).fillColor('#6B7280').text(`Prepared for ${input.clientName}`);
    doc.moveDown(1);

    doc.fontSize(12).fillColor('#111827').text('Investment', { underline: true });
    doc.fontSize(11).text(`${input.currency} ${input.price.toFixed(2)}`);
    doc.text(`Estimated timeline: ${input.timelineDays} day${input.timelineDays === 1 ? '' : 's'}`);
    if (input.expiresAt) {
      doc.text(`Valid until: ${input.expiresAt.toDateString()}`);
    }
    doc.moveDown(1);

    doc.fontSize(12).text('Scope of Work', { underline: true });
    doc.fontSize(10).text(input.scope, { align: 'left' });
    doc.moveDown(1);

    doc.fontSize(12).text('Deliverables', { underline: true });
    input.deliverables.forEach((d, i) => {
      doc.fontSize(10).text(`${i + 1}. ${d.title}`);
      if (d.description) doc.fontSize(9).fillColor('#6B7280').text(d.description, { indent: 14 }).fillColor('#111827');
    });
    doc.moveDown(1);

    doc.fontSize(12).text('Payment Milestones', { underline: true });
    input.milestones.forEach((m, i) => {
      doc.fontSize(10).text(`${i + 1}. ${m.title} — ${input.currency} ${m.amount.toFixed(2)}`);
      if (m.description) doc.fontSize(9).fillColor('#6B7280').text(m.description, { indent: 14 }).fillColor('#111827');
    });
    doc.moveDown(1);

    doc.fontSize(12).text('Revision Policy', { underline: true });
    doc.fontSize(10).text(input.revisionPolicy);

    doc.moveDown(2);
    doc.fontSize(8).fillColor('#9CA3AF').text(`Proposal ID: ${input.proposalId}`, { align: 'left' });

    doc.end();
  });
}
