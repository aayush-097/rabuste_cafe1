const express = require('express');
const { authMiddleware } = require('../middleware/authMiddleware');
const { getCart, addToCart, updateCart, removeItem, clearCart } = require('../controllers/cartController');

const router = express.Router();

router.use(authMiddleware);

router.get('/', getCart);
router.post('/add', addToCart);
router.patch('/update', updateCart);
router.delete('/remove/:itemId', removeItem);
router.delete('/clear', clearCart);

module.exports = router;
