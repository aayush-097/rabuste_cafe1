const express = require('express');
const { getWorkshops, registerWorkshop } = require('../controllers/workshopController');

const router = express.Router();

router.get('/', getWorkshops);
router.post('/register', registerWorkshop);

module.exports = router;








