const express = require('express');
const { getAllImages, getImagesByCategory } = require('../controllers/imageController');

const router = express.Router();

// GET /api/images - return all images
router.get('/', getAllImages);

// GET /api/images/:category - return images by category
router.get('/:category', getImagesByCategory);

module.exports = router;








