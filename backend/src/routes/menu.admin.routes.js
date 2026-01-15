const router = require('express').Router();
const ctrl = require('../controllers/menu.controller');
const { authMiddleware, adminMiddleware } = require('../middleware/authMiddleware');

// All admin menu routes require authenticated admin
router.use(authMiddleware, adminMiddleware);

// Root endpoint: GET all menu items
router.get('/', async (req, res) => {
  try {
    const MenuItem = require('../models/MenuItem')();
    const items = await MenuItem.find().sort({ displayOrder: 1 });
    res.json(items);
  } catch (err) {
    console.error('Error fetching menu items:', err);
    res.status(500).json({ message: 'Failed to fetch menu items', error: err.message });
  }
});

// Root endpoint: POST (create menu item)
router.post('/', ctrl.createItem);

// Root endpoint: PUT (update menu item)
router.put('/:id', ctrl.updateItem);

// Root endpoint: DELETE (delete menu item)
router.delete('/:id', ctrl.deleteItem);

// Item subpath endpoints (kept for backward compatibility)
router.post('/item', ctrl.createItem);
router.put('/item/:id', ctrl.updateItem);
router.delete('/item/:id', ctrl.deleteItem);

router.patch('/item/:id/stock', ctrl.updateStock);
router.patch('/item/:id/discount', ctrl.updateDiscount);

router.post('/item/:id/price', ctrl.addPrice);
router.delete('/item/:id/price/:priceId', ctrl.removePrice);

router.post('/group', ctrl.createGroup);

module.exports = router;
