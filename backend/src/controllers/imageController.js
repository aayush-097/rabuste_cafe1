const Image = require('../models/Image');
const mongoose = require('mongoose');

// GET /api/images - return ALL images as flat array
const getAllImages = async (req, res) => {
  try {
    // Log database and collection info
    const dbName = mongoose.connection.db.databaseName;
    const collectionName = Image.collection.name;
    console.log(`Querying database: ${dbName}, collection: ${collectionName}`);
    
    // Log document count
    const count = await Image.countDocuments();
    console.log(`Image.countDocuments(): ${count}`);
    
    // Log first document if exists
    const firstDoc = await Image.findOne();
    if (firstDoc) {
      console.log('First document found:', { category: firstDoc.category, url: firstDoc.url?.substring(0, 50) + '...' });
    } else {
      console.log('No documents found in collection');
      console.log(`Database: ${dbName}, Collection: ${collectionName}`);
    }
    
    const images = await Image.find().sort({ category: 1, createdAt: 1 });
    console.log(`Returning ${images.length} images`);
    
    // Return flat array: [{ category: "...", url: "..." }, ...]
    res.json(images);
  } catch (err) {
    console.error('Error fetching images:', err);
    res.status(500).json({ message: 'Failed to load images' });
  }
};

// GET /api/images/:category - return images filtered by category
const getImagesByCategory = async (req, res) => {
  try {
    const { category } = req.params;
    const images = await Image.find({ category }).sort({ createdAt: 1 });
    // Return flat array filtered by category
    res.json(images);
  } catch (err) {
    console.error('Error fetching images by category:', err);
    res.status(500).json({ message: 'Failed to load images' });
  }
};

module.exports = { getAllImages, getImagesByCategory };

