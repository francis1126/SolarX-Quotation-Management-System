const mongoose = require('mongoose');

const quotationItemSchema = new mongoose.Schema({
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product'
  },
  productCode: {
    type: String,
    required: true
  },
  productName: {
    type: String,
    required: true
  },
  description: {
    type: String
  },
  quantity: {
    type: Number,
    required: true,
    min: 1
  },
  unit: {
    type: String,
    required: true
  },
  unitPrice: {
    type: Number,
    required: true,
    min: 0
  },
  discount: {
    type: Number,
    default: 0,
    min: 0
  },
  total: {
    type: Number,
    required: true
  }
});

const quotationSchema = new mongoose.Schema({
  quotationNumber: {
    type: String,
    required: true,
    unique: true
  },
  customerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Customer'
  },
  customerName: {
    type: String
  },
  customerCompany: {
    type: String
  },
  customerPhone: {
    type: String
  },
  customerEmail: {
    type: String
  },
  customerAddress: {
    type: String
  },
  quotationDate: {
    type: Date,
    required: true
  },
  validUntil: {
    type: Date
  },
  items: [quotationItemSchema],
  subtotal: {
    type: Number,
    required: true,
    min: 0
  },
  discount: {
    type: Number,
    default: 0,
    min: 0
  },
  vat: {
    type: Number,
    default: 0,
    min: 0
  },
  vatRate: {
    type: Number,
    default: 12
  },
  grandTotal: {
    type: Number,
    required: true,
    min: 0
  },
  status: {
    type: String,
    enum: ['Draft', 'Sent', 'Accepted', 'Rejected', 'Expired'],
    default: 'Draft'
  },
  notes: {
    type: String,
    trim: true
  },
  termsAndConditions: {
    type: String,
    trim: true
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Quotation', quotationSchema);
