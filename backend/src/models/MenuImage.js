const mongoose = require('mongoose');

const menuImageSchema = new mongoose.Schema(
  {
    category: { type: String, required: true },
    url: { type: String, required: true },
    public_id: { type: String, required: true },
  },
  { timestamps: true }
);

menuImageSchema.index({ category: 1 });

module.exports = mongoose.model('MenuImage', menuImageSchema);








