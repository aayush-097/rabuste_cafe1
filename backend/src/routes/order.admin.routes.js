// backend/src/routes/order.admin.routes.js (ADMIN)
const express = require('express');
const { authMiddleware, adminMiddleware } = require('../middleware/authMiddleware');
const { getOrders, completeOrder, markAsPaid, verifyAndComplete } = require('../controllers/orderController');

const router = express.Router();

// All admin routes require authenticated admin
router.use(authMiddleware, adminMiddleware);

// GET /api/admin/orders - get all orders
router.get('/', getOrders);

// PUT /api/admin/orders/:id/complete - complete order
router.put('/:id/complete', completeOrder);

// PUT /api/admin/orders/:id/mark-paid - mark PAY_AT_COUNTER order as paid
router.put('/:id/mark-paid', markAsPaid);

// PUT /api/admin/orders/:id/verify-complete - verify PAY_NOW order and complete it
router.put('/:id/verify-complete', verifyAndComplete);

// DELETE /api/admin/orders/:id - delete order
router.delete('/:id', require('../controllers/orderController').deleteOrder);

module.exports = router;
