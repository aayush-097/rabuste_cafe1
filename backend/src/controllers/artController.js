const Art = require('../models/Art');

const getArt = async (_req, res) => {
  try {
    const pieces = await Art.find().sort({ availability: 1, createdAt: -1 });
    res.json(pieces);
  } catch (err) {
    res.status(500).json({ message: 'Failed to load art gallery' });
  }
};

module.exports = { getArt };









