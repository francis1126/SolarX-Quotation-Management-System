const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  productCode: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  category: {
    type: String,
    required: true,
    trim: true,
    enum: ['Solar Panel', 'Inverter', 'Battery', 'Solar Charge Controller', 'Mounting', 'Solar Cable', 'MC4 Connector', 'Breaker', 'Combiner Box', 'Accessories', 'Other']
  },
  description: {
    type: String,
    trim: true
  },
  unit: {
    type: String,
    required: true,
    trim: true
  },
  sellingPrice: {
    type: Number,
    required: true,
    min: 0
  },
  status: {
    type: String,
    enum: ['active', 'inactive'],
    default: 'active'
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Product', productSchema);
