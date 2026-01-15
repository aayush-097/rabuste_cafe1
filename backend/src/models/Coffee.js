const mongoose = require('mongoose');

const coffeeSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    description: { type: String, required: true },
    strength: { type: String, required: true },
    tags: [{ type: String }],
    isSignature: { type: Boolean, default: false },
    popularity: { type: Number, default: 0 },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Coffee', coffeeSchema);









