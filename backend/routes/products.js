const express = require('express');
const Product = require('../models/Product');
const auth = require('../middleware/auth');
const { body, validationResult } = require('express-validator');

const router = express.Router();

// Get all products
router.get('/', auth, async (req, res) => {
  try {
    const { search, category, status } = req.query;
    let query = {};
    
    if (search) {
      query = {
        $or: [
          { name: { $regex: search, $options: 'i' } },
          { productCode: { $regex: search, $options: 'i' } }
        ]
      };
    }
    
    if (category) {
      query.category = category;
    }
    
    if (status) {
      query.status = status;
    }

    const products = await Product.find(query).sort({ createdAt: -1 });
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Get single product
router.get('/:id', auth, async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    res.json(product);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Create product
router.post('/', auth, [
  body('productCode').trim().notEmpty().withMessage('Product code is required'),
  body('name').trim().notEmpty().withMessage('Product name is required'),
  body('category').trim().notEmpty().withMessage('Category is required'),
  body('unit').trim().notEmpty().withMessage('Unit is required'),
  body('sellingPrice').isNumeric().withMessage('Selling price must be a number')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const product = new Product(req.body);
    await product.save();
    res.status(201).json(product);
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ message: 'Product code already exists' });
    }
    res.status(500).json({ message: 'Server error' });
  }
});

// Update product
router.put('/:id', auth, [
  body('productCode').trim().notEmpty().withMessage('Product code is required'),
  body('name').trim().notEmpty().withMessage('Product name is required'),
  body('category').trim().notEmpty().withMessage('Category is required'),
  body('unit').trim().notEmpty().withMessage('Unit is required'),
  body('sellingPrice').isNumeric().withMessage('Selling price must be a number')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const product = await Product.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    
    res.json(product);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete product
router.delete('/:id', auth, async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    res.json({ message: 'Product deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
