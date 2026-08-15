const express = require('express');
const Settings = require('../models/Settings');
const auth = require('../middleware/auth');

const router = express.Router();

// Get settings
router.get('/', auth, async (req, res) => {
  try {
    let settings = await Settings.findOne();
    
    if (!settings) {
      // Create default settings
      settings = new Settings();
      await settings.save();
    }
    
    res.json(settings);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Update settings
router.put('/', auth, async (req, res) => {
  try {
    let settings = await Settings.findOne();
    
    if (!settings) {
      settings = new Settings(req.body);
    } else {
      Object.assign(settings, req.body);
    }
    
    await settings.save();
    res.json(settings);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
