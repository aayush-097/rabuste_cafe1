const Coffee = require('../models/Coffee');

const getCoffees = async (req, res) => {
  try {
    const coffees = await Coffee.find().sort({ isSignature: -1, createdAt: -1 });
    res.json(coffees);
  } catch (err) {
    res.status(500).json({ message: 'Failed to load coffee menu' });
  }
};

module.exports = { getCoffees };









