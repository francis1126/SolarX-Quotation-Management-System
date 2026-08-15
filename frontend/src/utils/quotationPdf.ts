import { jsPDF } from 'jspdf';
import { Quotation, Settings } from '../types';

export const generateQuotationPDF = (quotation: Quotation, settings?: Settings | null): Blob => {
  const doc = new jsPDF({ unit: 'pt', format: 'a4' });
  const margin = 40;
  let y = margin;

  doc.setFontSize(18);
  doc.setTextColor('#1a5f2a');
  doc.text('SOLARX', margin, y);
  y += 24;

  doc.setFontSize(11);
  doc.setTextColor('#333');
  if (settings?.company?.address) {
    doc.text(String(settings.company.address), margin, y);
    y += 14;
  }
  if (settings?.company?.phone) {
    doc.text(`Phone: ${settings.company.phone}`, margin, y);
    y += 14;
  }
  if (settings?.company?.email) {
    doc.text(`Email: ${settings.company.email}`, margin, y);
    y += 14;
  }
  if (settings?.company?.website) {
    doc.text(String(settings.company.website), margin, y);
    y += 20;
  }

  doc.setFontSize(14);
  doc.text('QUOTATION', margin, y);
  y += 20;

  doc.setFontSize(10);
  doc.text(`Quotation No: ${quotation.quotationNumber}`, margin, y);
  doc.text(`Date: ${new Date(quotation.quotationDate).toLocaleDateString()}`, 350, y);
  y += 14;
  if (quotation.validUntil) {
    doc.text(`Valid Until: ${new Date(quotation.validUntil).toLocaleDateString()}`, 350, y);
    y += 14;
  }

  y += 8;
  doc.setFontSize(12);
  doc.text('Bill To:', margin, y);
  doc.setFontSize(10);
  const customerName = quotation.customerName || quotation.customerCompany || '';
  doc.text(customerName, margin + 50, y);
  y += 18;

  // Items
  y += 8;
  doc.setFontSize(10);
  doc.text('Item', margin, y);
  doc.text('Description', margin + 120, y);
  doc.text('Qty', 350, y);
  doc.text('Unit', 380, y);
  doc.text('Unit Price', 430, y);
  doc.text('Total', 500, y);
  y += 14;

  quotation.items.forEach((item) => {
    if (y > 740) {
      doc.addPage();
      y = margin;
    }
    doc.text(item.productName || item.productCode || '-', margin, y);
    doc.text(item.description || '-', margin + 120, y, { maxWidth: 200 });
    doc.text(String(item.quantity), 350, y);
    doc.text(String(item.unit || '-'), 380, y);
    doc.text(Number(item.unitPrice).toFixed(2), 430, y);
    doc.text(Number(item.total).toFixed(2), 500, y);
    y += 14;
  });

  y += 20;
  doc.text('Subtotal:', 400, y);
  doc.text(Number(quotation.subtotal || 0).toFixed(2), 500, y);
  y += 14;
  if (quotation.discount && quotation.discount > 0) {
    doc.text('Discount:', 400, y);
    doc.text(`-${Number(quotation.discount).toFixed(2)}`, 500, y);
    y += 14;
  }
  if (quotation.vat && quotation.vat > 0) {
    doc.text(`VAT (${quotation.vatRate}%):`, 400, y);
    doc.text(Number(quotation.vat).toFixed(2), 500, y);
    y += 14;
  }

  y += 8;
  doc.setFontSize(12);
  doc.text('GRAND TOTAL:', 400, y);
  doc.text(Number(quotation.grandTotal || 0).toFixed(2), 500, y);

  // Notes
  if (quotation.notes) {
    y += 24;
    doc.setFontSize(10);
    doc.text('Notes:', margin, y);
    y += 14;
    doc.setFontSize(9);
    doc.text(String(quotation.notes), margin, y, { maxWidth: 520 });
  }

  const blob = doc.output('blob');
  return blob;
};
