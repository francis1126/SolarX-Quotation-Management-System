import { jsPDF } from 'jspdf';
import { Customer, Quotation, Settings } from '../types';

const PAGE_MARGIN = 50;
const CONTENT_WIDTH = 495;
const BRAND_COLOR = '#1a5f2a';
const TEXT_COLOR = '#333333';
const MUTED_COLOR = '#666666';

// jsPDF's built-in fonts do not include the peso glyph, so the currency code is used instead.
const formatAmount = (amount: number): string =>
  `PHP ${(amount || 0).toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

const formatDate = (date?: string): string =>
  date
    ? new Date(date).toLocaleDateString('en-PH', { year: 'numeric', month: 'long', day: 'numeric' })
    : '-';

const getCustomer = (quotation: Quotation) => {
  const populated =
    quotation.customerId && typeof quotation.customerId === 'object'
      ? (quotation.customerId as Customer)
      : null;

  return {
    name: populated?.companyName || populated?.name || quotation.customerCompany || quotation.customerName || 'Unknown',
    contactPerson: populated?.contactPerson,
    phone: populated?.phone || quotation.customerPhone,
    email: populated?.email || quotation.customerEmail,
    address: populated?.address || quotation.customerAddress,
  };
};

export const generateQuotationPDF = (quotation: Quotation, settings?: Settings | null): Blob => {
  const doc = new jsPDF({ unit: 'pt', format: 'a4' });
  const company = settings?.company;
  const customer = getCustomer(quotation);
  const rightEdge = PAGE_MARGIN + CONTENT_WIDTH;

  let y = PAGE_MARGIN;

  doc.setFont('helvetica', 'bold').setFontSize(24).setTextColor(BRAND_COLOR);
  doc.text((company?.name || 'SolarX').toUpperCase(), PAGE_MARGIN, y);

  y += 20;
  doc.setFont('helvetica', 'normal').setFontSize(11).setTextColor(TEXT_COLOR);
  doc.text('Solar Parts & Equipment', PAGE_MARGIN, y);

  doc.setFontSize(9).setTextColor(MUTED_COLOR);
  [company?.address, company?.phone && `Phone: ${company.phone}`, company?.email && `Email: ${company.email}`, company?.website]
    .filter((line): line is string => Boolean(line))
    .forEach((line) => {
      y += 13;
      doc.text(line, PAGE_MARGIN, y);
    });

  y += 34;
  doc.setFont('helvetica', 'bold').setFontSize(16).setTextColor(TEXT_COLOR);
  doc.text('QUOTATION', PAGE_MARGIN, y);

  y += 20;
  doc.setFont('helvetica', 'normal').setFontSize(10);
  doc.text(`Quotation No: ${quotation.quotationNumber}`, PAGE_MARGIN, y);
  doc.text(`Status: ${quotation.status}`, rightEdge, y, { align: 'right' });
  y += 14;
  doc.text(`Date: ${formatDate(quotation.quotationDate)}`, PAGE_MARGIN, y);
  y += 14;
  doc.text(`Valid Until: ${formatDate(quotation.validUntil)}`, PAGE_MARGIN, y);

  y += 28;
  doc.setFont('helvetica', 'bold').setFontSize(11);
  doc.text('Bill To:', PAGE_MARGIN, y);
  doc.setFont('helvetica', 'normal').setFontSize(10);
  [
    customer.name,
    customer.contactPerson && `Attn: ${customer.contactPerson}`,
    customer.phone && `Phone: ${customer.phone}`,
    customer.email && `Email: ${customer.email}`,
    customer.address,
  ]
    .filter((line): line is string => Boolean(line))
    .forEach((line) => {
      y += 14;
      doc.text(line, PAGE_MARGIN, y);
    });

  y += 28;
  const columns = [
    { label: 'Item', x: PAGE_MARGIN + 5, width: 90, align: 'left' as const },
    { label: 'Description', x: PAGE_MARGIN + 100, width: 160, align: 'left' as const },
    { label: 'Qty', x: PAGE_MARGIN + 285, width: 30, align: 'right' as const },
    { label: 'Unit', x: PAGE_MARGIN + 330, width: 40, align: 'left' as const },
    { label: 'Unit Price', x: PAGE_MARGIN + 425, width: 70, align: 'right' as const },
    { label: 'Total', x: rightEdge, width: 70, align: 'right' as const },
  ];

  const drawTableHeader = (top: number) => {
    doc.setFillColor(BRAND_COLOR);
    doc.rect(PAGE_MARGIN, top, CONTENT_WIDTH, 20, 'F');
    doc.setFont('helvetica', 'bold').setFontSize(9).setTextColor('#ffffff');
    columns.forEach((column) => doc.text(column.label, column.x, top + 14, { align: column.align }));
    doc.setFont('helvetica', 'normal').setTextColor(TEXT_COLOR);
    return top + 20;
  };

  const pageBottom = doc.internal.pageSize.getHeight() - PAGE_MARGIN;

  y = drawTableHeader(y);

  quotation.items.forEach((item, index) => {
    const description = doc.splitTextToSize(item.description || '', columns[1].width) as string[];
    const productName = doc.splitTextToSize(item.productName || item.productCode || '', columns[0].width) as string[];
    const rowHeight = Math.max(24, 12 * Math.max(description.length, productName.length) + 10);

    if (y + rowHeight > pageBottom) {
      doc.addPage();
      y = drawTableHeader(PAGE_MARGIN);
    }

    if (index % 2 === 0) {
      doc.setFillColor('#f5f5f5');
      doc.rect(PAGE_MARGIN, y, CONTENT_WIDTH, rowHeight, 'F');
    }

    doc.setFontSize(9).setTextColor(TEXT_COLOR);
    doc.text(productName, columns[0].x, y + 14);
    doc.text(description, columns[1].x, y + 14);
    doc.text(String(item.quantity), columns[2].x, y + 14, { align: 'right' });
    doc.text(item.unit || '', columns[3].x, y + 14);
    doc.text(formatAmount(item.unitPrice), columns[4].x, y + 14, { align: 'right' });
    doc.text(formatAmount(item.total), columns[5].x, y + 14, { align: 'right' });

    y += rowHeight;
  });

  const summaryRows: Array<[string, string]> = [['Subtotal:', formatAmount(quotation.subtotal)]];
  if (quotation.discount > 0) summaryRows.push(['Discount:', `-${formatAmount(quotation.discount)}`]);
  if (quotation.vat > 0) summaryRows.push([`VAT (${quotation.vatRate}%):`, formatAmount(quotation.vat)]);

  y += 20;
  doc.setFontSize(10);
  summaryRows.forEach(([label, value]) => {
    doc.text(label, rightEdge - 150, y);
    doc.text(value, rightEdge, y, { align: 'right' });
    y += 15;
  });

  y += 5;
  doc.setFont('helvetica', 'bold').setFontSize(12).setTextColor(BRAND_COLOR);
  doc.text('GRAND TOTAL:', rightEdge - 240, y);
  doc.text(formatAmount(quotation.grandTotal), rightEdge, y, { align: 'right' });
  doc.setFont('helvetica', 'normal').setTextColor(TEXT_COLOR);

  const paragraph = (title: string, body: string) => {
    const lines = doc.splitTextToSize(body, CONTENT_WIDTH) as string[];
    if (y + 30 + lines.length * 11 > pageBottom) {
      doc.addPage();
      y = PAGE_MARGIN;
    }
    y += 30;
    doc.setFont('helvetica', 'bold').setFontSize(10).setTextColor(TEXT_COLOR);
    doc.text(title, PAGE_MARGIN, y);
    y += 14;
    doc.setFont('helvetica', 'normal').setFontSize(9).setTextColor(MUTED_COLOR);
    doc.text(lines, PAGE_MARGIN, y);
    y += lines.length * 11;
    doc.setTextColor(TEXT_COLOR);
  };

  const terms = quotation.termsAndConditions || settings?.quotation?.defaultTermsAndConditions;
  if (terms) paragraph('Terms & Conditions:', terms);
  if (quotation.notes) paragraph('Notes:', quotation.notes);

  if (y + 90 > pageBottom) {
    doc.addPage();
    y = PAGE_MARGIN;
  }
  y += 60;
  doc.setFontSize(10).setTextColor(TEXT_COLOR);
  doc.text('Prepared By:', PAGE_MARGIN, y);
  doc.text('Customer:', rightEdge - 195, y);
  doc.line(PAGE_MARGIN, y + 30, PAGE_MARGIN + 150, y + 30);
  doc.line(rightEdge - 195, y + 30, rightEdge - 45, y + 30);
  const preparedBy =
    quotation.createdBy && typeof quotation.createdBy === 'object' ? quotation.createdBy.name : '';
  doc.text(preparedBy || '', PAGE_MARGIN, y + 44);

  return doc.output('blob');
};
