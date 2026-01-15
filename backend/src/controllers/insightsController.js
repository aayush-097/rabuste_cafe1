const Coffee = require('../models/Coffee');
const Art = require('../models/Art');
const Workshop = require('../models/Workshop');

const getPopular = async (_req, res) => {
  try {
    const signatureCoffees = await Coffee.find({ isSignature: true }).sort({ popularity: -1 }).limit(3);
    const boldCoffees = await Coffee.find({ tags: 'bold' }).limit(3);
    const availableArt = await Art.find({ availability: { $ne: 'sold' } }).sort({ price: -1 }).limit(3);
    const fillingWorkshops = await Workshop.find()
      .sort({ registeredCount: -1 })
      .limit(3)
      .lean()
      .exec();

    res.json({
      popularSignature: signatureCoffees,
      boldFavorites: boldCoffees,
      premiumArt: availableArt,
      fillingWorkshops,
    });
  } catch (err) {
    res.status(500).json({ message: 'Failed to load insights' });
  }
};

module.exports = { getPopular };









