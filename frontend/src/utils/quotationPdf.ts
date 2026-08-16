import { jsPDF } from 'jspdf';
import { Quotation, Settings } from '../types';

export const generateQuotationPDF = (quotation: Quotation, settings?: Settings | null): Blob => {
  const doc = new jsPDF({ unit: 'pt', format: 'a4' });
  const margin = 40;
  const contentWidth = 515;
  let y = margin;

  // Header
  doc.setFontSize(20);
  doc.setTextColor('#1a5f2a');
  doc.text('SOLARX', margin, y);
  y += 26;

  doc.setFontSize(10);
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
    y += 18;
  }

  doc.setFontSize(16);
  doc.text('QUOTATION', margin, y);
  y += 22;

  doc.setFontSize(10);
  doc.text(`Quotation No: ${quotation.quotationNumber}`, margin, y);
  doc.text(`Date: ${new Date(quotation.quotationDate).toLocaleDateString()}`, 350, y);
  y += 16;
  if (quotation.validUntil) {
    doc.text(`Valid Until: ${new Date(quotation.validUntil).toLocaleDateString()}`, 350, y);
    y += 16;
  }

  y += 10;
  doc.setFontSize(12);
  doc.text('Bill To:', margin, y);
  doc.setFontSize(10);
  const customerName = quotation.customerName || quotation.customerCompany || '';
  doc.text(customerName, margin + 52, y);
  y += 18;

  // Customer info spacing
  y += 8;

  // Items table - only show item and quantity
  const itemColX = margin;
  const qtyColX = margin + 380;

  doc.setFontSize(10);
  doc.setFillColor(26, 95, 42);
  doc.rect(margin, y, contentWidth, 18, 'F');
  doc.setTextColor(255, 255, 255);
  doc.text('Item', itemColX + 6, y + 12);
  doc.text('Qty', qtyColX + 6, y + 12);
  y += 18;

  doc.setTextColor('#333');
  quotation.items.forEach((item) => {
    if (y > 730) {
      doc.addPage();
      y = margin;
    }

    const itemName = item.productName || item.productCode || '-';
    doc.setFillColor(245, 245, 245);
    doc.rect(margin, y, contentWidth, 22, 'F');
    doc.setTextColor('#333');
    doc.text(itemName, itemColX + 6, y + 14, { maxWidth: 340 });
    doc.text(String(item.quantity), qtyColX + 6, y + 14);
    y += 22;
  });

  // Final total only
  y += 22;
  doc.setDrawColor(200, 200, 200);
  doc.line(margin, y, margin + contentWidth, y);
  y += 16;

  doc.setFontSize(12);
  doc.setTextColor('#1a5f2a');
  doc.text('GRAND TOTAL:', margin + 330, y);
  doc.text(`₱${Number(quotation.grandTotal || 0).toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, margin + 430, y);

  if (quotation.notes) {
    y += 30;
    doc.setFontSize(10);
    doc.setTextColor('#333');
    doc.text('Notes:', margin, y);
    y += 16;
    doc.setFontSize(9);
    doc.text(String(quotation.notes), margin, y, { maxWidth: contentWidth });
  }

  if (quotation.termsAndConditions) {
    y += 30;
    doc.setFontSize(10);
    doc.text('Terms & Conditions:', margin, y);
    y += 16;
    doc.setFontSize(9);
    doc.text(String(quotation.termsAndConditions), margin, y, { maxWidth: contentWidth });
  }

  const blob = doc.output('blob');
  return blob;
};
