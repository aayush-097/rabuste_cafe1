const express = require('express');
const { getCoffees } = require('../controllers/coffeeController');

const router = express.Router();

router.get('/', getCoffees);

module.exports = router;









