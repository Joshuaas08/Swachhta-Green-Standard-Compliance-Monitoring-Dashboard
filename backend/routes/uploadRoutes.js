const express = require('express');
const upload = require('../middleware/upload');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.use(protect);

router.post('/', upload.single('photo'), (req, res) => {
  try {
    if (!req.file) {
      // Check if photo is sent as a base64 string or url in body
      if (req.body.photoUrl) {
        return res.status(200).json({
          success: true,
          photoUrl: req.body.photoUrl,
        });
      }
      return res.status(400).json({ success: false, message: 'Please provide an image file' });
    }

    const photoUrl = `/uploads/${req.file.filename}`;
    res.status(200).json({
      success: true,
      filename: req.file.filename,
      photoUrl,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
