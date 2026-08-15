const mongoose = require('mongoose');

const settingsSchema = new mongoose.Schema({
  company: {
    name: {
      type: String,
      default: 'SolarX'
    },
    logo: {
      type: String
    },
    address: {
      type: String,
      default: ''
    },
    phone: {
      type: String,
      default: ''
    },
    email: {
      type: String,
      default: ''
    },
    website: {
      type: String,
      default: ''
    },
    tin: {
      type: String
    }
  },
  quotation: {
    defaultValidityDays: {
      type: Number,
      default: 30
    },
    vatEnabled: {
      type: Boolean,
      default: true
    },
    vatPercentage: {
      type: Number,
      default: 12
    },
    prefix: {
      type: String,
      default: 'QT'
    },
    defaultTermsAndConditions: {
      type: String,
      default: '1. Quotation is valid for 30 days from the date of issue.\n2. Prices are subject to change without prior notice.\n3. 50% down payment required upon order confirmation.\n4. Balance due upon delivery.\n5. Warranty as per manufacturer specifications.'
    }
  },
  currency: {
    code: {
      type: String,
      default: 'PHP'
    },
    symbol: {
      type: String,
      default: '₱'
    }
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Settings', settingsSchema);
