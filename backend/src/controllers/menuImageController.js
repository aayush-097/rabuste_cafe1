const MenuImage = require('../models/MenuImage');

const getMenuImages = async (req, res) => {
  try {
    const images = await MenuImage.find().sort({ category: 1, createdAt: 1 });
    
    // Group images by category
    const grouped = {};
    images.forEach((image) => {
      if (!grouped[image.category]) {
        grouped[image.category] = [];
      }
      grouped[image.category].push({ url: image.url });
    });

    res.json(grouped);
  } catch (err) {
    console.error('Error fetching menu images:', err);
    res.status(500).json({ message: 'Failed to load menu images' });
  }
};

module.exports = { getMenuImages };








