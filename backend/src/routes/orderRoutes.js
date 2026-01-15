// backend/src/routes/orderRoutes.js (PUBLIC)
const express = require('express');
const { createOrder } = require('../controllers/orderController');
const { authMiddleware } = require('../middleware/authMiddleware');

const router = express.Router();

// POST /api/orders - create new order (requires auth)
router.post('/', authMiddleware, createOrder);

module.exports = router;
