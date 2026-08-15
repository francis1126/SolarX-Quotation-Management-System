const express = require('express');
const Quotation = require('../models/Quotation');
const Customer = require('../models/Customer');
const auth = require('../middleware/auth');
const { body, validationResult } = require('express-validator');

const router = express.Router();

// Helper function to generate quotation number
const generateQuotationNumber = async () => {
  const year = new Date().getFullYear();
  const count = await Quotation.countDocuments({
    quotationNumber: new RegExp(`^Q-${year}`)
  });
  const number = String(count + 1).padStart(4, '0');
  return `Q-${year}-${number}`;
};

// Get all quotations
router.get('/', auth, async (req, res) => {
  try {
    const { search, status, startDate, endDate } = req.query;
    let query = {};
    
    if (search) {
      query.$or = [
        { quotationNumber: { $regex: search, $options: 'i' } },
        { customerName: { $regex: search, $options: 'i' } },
        { customerCompany: { $regex: search, $options: 'i' } }
      ];
    }
    
    if (status) {
      query.status = status;
    }
    
    if (startDate || endDate) {
      query.quotationDate = {};
      if (startDate) query.quotationDate.$gte = new Date(startDate);
      if (endDate) query.quotationDate.$lte = new Date(endDate);
    }

    const quotations = await Quotation.find(query)
      .sort({ createdAt: -1 });
    
    res.json(quotations);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Get single quotation
router.get('/:id', auth, async (req, res) => {
  try {
    const quotation = await Quotation.findById(req.params.id)
      .populate('createdBy', 'name email');
    
    if (!quotation) {
      return res.status(404).json({ message: 'Quotation not found' });
    }
    
    res.json(quotation);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Create quotation
router.post('/', auth, [
  body('customerName').notEmpty().withMessage('Customer name is required'),
  body('quotationDate').isISO8601().withMessage('Valid quotation date is required'),
  body('items').isArray({ min: 1 }).withMessage('At least one item is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { customerName, customerCompany, customerPhone, customerEmail, customerAddress, quotationDate, validUntil, items, discount, vatRate, notes, termsAndConditions } = req.body;

    // Calculate totals
    let subtotal = 0;
    const processedItems = items.map(item => {
      const itemTotal = (item.quantity * item.unitPrice) - (item.discount || 0);
      subtotal += itemTotal;
      return {
        ...item,
        total: itemTotal
      };
    });

    const vatAmount = vatRate ? (subtotal * (vatRate / 100)) : 0;
    const grandTotal = subtotal - (discount || 0) + vatAmount;

    const quotationNumber = await generateQuotationNumber();

    const quotation = new Quotation({
      quotationNumber,
      customerName,
      customerCompany,
      customerPhone,
      customerEmail,
      customerAddress,
      quotationDate: new Date(quotationDate),
      validUntil: validUntil ? new Date(validUntil) : null,
      items: processedItems,
      subtotal,
      discount: discount || 0,
      vat: vatAmount,
      vatRate: vatRate || 12,
      grandTotal,
      notes,
      termsAndConditions,
      createdBy: req.user._id
    });

    await quotation.save();
    res.status(201).json(quotation);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Update quotation
router.put('/:id', auth, [
  body('customerName').notEmpty().withMessage('Customer name is required'),
  body('quotationDate').isISO8601().withMessage('Valid quotation date is required'),
  body('items').isArray({ min: 1 }).withMessage('At least one item is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { customerName, customerCompany, customerPhone, customerEmail, customerAddress, quotationDate, validUntil, items, discount, vatRate, notes, termsAndConditions, status } = req.body;

    // Calculate totals
    let subtotal = 0;
    const processedItems = items.map(item => {
      const itemTotal = (item.quantity * item.unitPrice) - (item.discount || 0);
      subtotal += itemTotal;
      return {
        ...item,
        total: itemTotal
      };
    });

    const vatAmount = vatRate ? (subtotal * (vatRate / 100)) : 0;
    const grandTotal = subtotal - (discount || 0) + vatAmount;

    const quotation = await Quotation.findByIdAndUpdate(
      req.params.id,
      {
        customerName,
        customerCompany,
        customerPhone,
        customerEmail,
        customerAddress,
        quotationDate: new Date(quotationDate),
        validUntil: validUntil ? new Date(validUntil) : null,
        items: processedItems,
        subtotal,
        discount: discount || 0,
        vat: vatAmount,
        vatRate: vatRate || 12,
        grandTotal,
        notes,
        termsAndConditions,
        status
      },
      { new: true, runValidators: true }
    );
    
    if (!quotation) {
      return res.status(404).json({ message: 'Quotation not found' });
    }
    
    res.json(quotation);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete quotation
router.delete('/:id', auth, async (req, res) => {
  try {
    const quotation = await Quotation.findByIdAndDelete(req.params.id);
    if (!quotation) {
      return res.status(404).json({ message: 'Quotation not found' });
    }
    res.json({ message: 'Quotation deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Get dashboard stats
router.get('/stats/dashboard', auth, async (req, res) => {
  try {
    const total = await Quotation.countDocuments();
    const pending = await Quotation.countDocuments({ status: 'Sent' });
    const accepted = await Quotation.countDocuments({ status: 'Accepted' });
    const rejected = await Quotation.countDocuments({ status: 'Rejected' });
    
    const totalValueResult = await Quotation.aggregate([
      { $group: { _id: null, total: { $sum: '$grandTotal' } } }
    ]);
    const totalValue = totalValueResult[0]?.total || 0;

    const recentQuotations = await Quotation.find()
      .sort({ createdAt: -1 })
      .limit(10);

    // Monthly quotation summary
    const monthlyStats = await Quotation.aggregate([
      {
        $group: {
          _id: {
            year: { $year: '$quotationDate' },
            month: { $month: '$quotationDate' }
          },
          count: { $sum: 1 },
          total: { $sum: '$grandTotal' }
        }
      },
      { $sort: { '_id.year': -1, '_id.month': -1 } },
      { $limit: 12 }
    ]);

    res.json({
      total,
      pending,
      accepted,
      rejected,
      totalValue,
      recentQuotations,
      monthlyStats
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Update expired quotations
router.patch('/update-expired', auth, async (req, res) => {
  try {
    const result = await Quotation.updateMany(
      {
        validUntil: { $lt: new Date() },
        status: { $in: ['Draft', 'Sent'] }
      },
      { status: 'Expired' }
    );
    res.json({ message: `Updated ${result.modifiedCount} expired quotations` });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
