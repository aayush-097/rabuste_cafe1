const mongoose = require('mongoose');

const imageSchema = new mongoose.Schema(
  {
    category: { type: String, required: true },
    url: { type: String, required: true },
    public_id: { type: String, required: true },
  },
  { 
    timestamps: true,
    collection: 'images'
  }
);

module.exports = mongoose.model('Image', imageSchema);

