const express = require('express');
const { getMenuImages } = require('../controllers/menuImageController');

const router = express.Router();

router.get('/', getMenuImages);

module.exports = router;








