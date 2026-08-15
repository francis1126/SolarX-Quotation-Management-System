const express = require('express');
const PDFDocument = require('pdfkit');
const Quotation = require('../models/Quotation');
const Settings = require('../models/Settings');
const auth = require('../middleware/auth');

const router = express.Router();

// Generate PDF for quotation
router.get('/quotation/:id', auth, async (req, res) => {
  try {
    const quotation = await Quotation.findById(req.params.id)
      .populate('customerId', 'name companyName contactPerson phone email address')
      .populate('createdBy', 'name');
    
    if (!quotation) {
      return res.status(404).json({ message: 'Quotation not found' });
    }

    const settings = await Settings.findOne();
    const company = settings?.company || {};
    const quotationSettings = settings?.quotation || {};

    // Create PDF
    const doc = new PDFDocument({ margin: 50, size: 'A4' });
    
    // Set response headers
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=quotation-${quotation.quotationNumber}.pdf`);
    
    // Pipe PDF to response
    doc.pipe(res);

    // Helper function for formatting currency
    const formatCurrency = (amount) => {
      return `₱${amount.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    };

    // Helper function for formatting date
    const formatDate = (date) => {
      return new Date(date).toLocaleDateString('en-PH', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    };

    // Header - Company Info
    doc.fontSize(24).font('Helvetica-Bold').fillColor('#1a5f2a').text('SOLARX', 50, 50);
    doc.fontSize(12).font('Helvetica').fillColor('#333').text('Solar Parts & Equipment', 50, 80);
    
    if (company.address) {
      doc.fontSize(10).fillColor('#666').text(company.address, 50, 100);
    }
    if (company.phone) {
      doc.text(`Phone: ${company.phone}`, 50, 115);
    }
    if (company.email) {
      doc.text(`Email: ${company.email}`, 50, 130);
    }
    if (company.website) {
      doc.text(`Website: ${company.website}`, 50, 145);
    }

    // Quotation Title
    doc.fontSize(18).font('Helvetica-Bold').fillColor('#333').text('QUOTATION', 50, 180);

    // Quotation Details
    doc.fontSize(10).font('Helvetica').fillColor('#333');
    doc.text(`Quotation No: ${quotation.quotationNumber}`, 50, 210);
    doc.text(`Date: ${formatDate(quotation.quotationDate)}`, 50, 225);
    doc.text(`Valid Until: ${formatDate(quotation.validUntil)}`, 50, 240);

    // Customer Information
    doc.fontSize(12).font('Helvetica-Bold').fillColor('#333').text('Bill To:', 50, 270);
    doc.fontSize(10).font('Helvetica').fillColor('#333');
    
    const customerName = quotation.customerId.companyName || quotation.customerId.name;
    doc.text(customerName, 50, 290);
    
    if (quotation.customerId.contactPerson) {
      doc.text(`Attn: ${quotation.customerId.contactPerson}`, 50, 305);
    }
    if (quotation.customerId.phone) {
      doc.text(`Phone: ${quotation.customerId.phone}`, 50, 320);
    }
    if (quotation.customerId.email) {
      doc.text(`Email: ${quotation.customerId.email}`, 50, 335);
    }
    if (quotation.customerId.address) {
      doc.text(`Address: ${quotation.customerId.address}`, 50, 350);
    }

    // Items Table
    const tableTop = 400;
    const itemHeight = 25;
    
    // Table Header
    doc.fontSize(10).font('Helvetica-Bold').fillColor('#fff');
    doc.rect(50, tableTop, 495, 20).fill('#1a5f2a');
    doc.text('Item', 55, tableTop + 7);
    doc.text('Description', 150, tableTop + 7);
    doc.text('Qty', 320, tableTop + 7);
    doc.text('Unit', 360, tableTop + 7);
    doc.text('Unit Price', 400, tableTop + 7);
    doc.text('Total', 480, tableTop + 7);

    // Table Rows
    doc.fontSize(9).font('Helvetica').fillColor('#333');
    let y = tableTop + 25;
    
    quotation.items.forEach((item, index) => {
      if (index % 2 === 0) {
        doc.rect(50, y, 495, itemHeight).fill('#f9f9f9');
      }
      
      doc.fillColor('#333');
      doc.text(item.productName, 55, y + 8, { width: 90 });
      doc.text(item.description || '', 150, y + 8, { width: 160 });
      doc.text(item.quantity.toString(), 320, y + 8);
      doc.text(item.unit, 360, y + 8);
      doc.text(formatCurrency(item.unitPrice), 400, y + 8);
      doc.text(formatCurrency(item.total), 480, y + 8);
      
      y += itemHeight;
    });

    // Summary
    const summaryTop = y + 20;
    doc.fontSize(10).font('Helvetica').fillColor('#333');
    doc.text(`Subtotal:`, 400, summaryTop);
    doc.text(formatCurrency(quotation.subtotal), 480, summaryTop);
    
    if (quotation.discount > 0) {
      doc.text(`Discount:`, 400, summaryTop + 15);
      doc.text(`-${formatCurrency(quotation.discount)}`, 480, summaryTop + 15);
    }
    
    if (quotation.vat > 0) {
      doc.text(`VAT (${quotation.vatRate}%):`, 400, summaryTop + 30);
      doc.text(formatCurrency(quotation.vat), 480, summaryTop + 30);
    }
    
    // Grand Total
    doc.fontSize(12).font('Helvetica-Bold').fillColor('#1a5f2a');
    doc.text('GRAND TOTAL:', 400, summaryTop + 50);
    doc.text(formatCurrency(quotation.grandTotal), 480, summaryTop + 50);

    // Terms & Conditions
    if (quotation.termsAndConditions || quotationSettings.defaultTermsAndConditions) {
      const terms = quotation.termsAndConditions || quotationSettings.defaultTermsAndConditions;
      doc.fontSize(10).font('Helvetica-Bold').fillColor('#333').text('Terms & Conditions:', 50, summaryTop + 90);
      doc.fontSize(9).font('Helvetica').fillColor('#666').text(terms, 50, summaryTop + 105, { width: 495 });
    }

    // Notes
    if (quotation.notes) {
      doc.fontSize(10).font('Helvetica-Bold').fillColor('#333').text('Notes:', 50, summaryTop + 150);
      doc.fontSize(9).font('Helvetica').fillColor('#666').text(quotation.notes, 50, summaryTop + 165, { width: 495 });
    }

    // Signatures
    const signatureTop = 650;
    doc.fontSize(10).font('Helvetica').fillColor('#333');
    doc.text('Prepared By:', 50, signatureTop);
    doc.moveTo(50, signatureTop + 30).lineTo(200, signatureTop + 30).stroke();
    doc.text(quotation.createdBy?.name || '', 50, signatureTop + 35);
    
    doc.text('Customer:', 350, signatureTop);
    doc.moveTo(350, signatureTop + 30).lineTo(500, signatureTop + 30).stroke();
    doc.text('____________________', 350, signatureTop + 35);

    // Finalize PDF
    doc.end();
  } catch (error) {
    console.error('PDF generation error:', error);
    res.status(500).json({ message: 'Error generating PDF' });
  }
});

module.exports = router;
