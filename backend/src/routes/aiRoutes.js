const express = require('express');
const { coffeeDiscovery, artDiscovery, workshopDiscovery } = require('../controllers/aiController');

const router = express.Router();

router.post('/coffee', coffeeDiscovery);
router.post('/art', artDiscovery);
router.post('/workshop', workshopDiscovery);

module.exports = router;









