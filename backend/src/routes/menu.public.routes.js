const router = require('express').Router();
const ctrl = require('../controllers/menu.controller');

router.get('/categories', ctrl.getCategories);
router.get('/subcategories/:categoryId', ctrl.getSubCategories);
router.get('/items/:subcategoryId', ctrl.getItems);

module.exports = router;
