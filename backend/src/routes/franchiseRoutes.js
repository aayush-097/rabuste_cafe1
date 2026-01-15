const express = require('express');
const { submitEnquiry } = require('../controllers/franchiseController');

const router = express.Router();

router.post('/enquiry', submitEnquiry);

module.exports = router;









