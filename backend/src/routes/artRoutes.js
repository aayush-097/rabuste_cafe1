const express = require('express');
const { getArt } = require('../controllers/artController');
const { createBooking } = require('../controllers/bookingController');

const router = express.Router();

router.get('/', getArt);
router.post('/book', createBooking);

module.exports = router;









