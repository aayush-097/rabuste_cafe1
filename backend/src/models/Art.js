const mongoose = require('mongoose');

const artSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    artistName: { type: String, required: true },
    description: { type: String, required: true },
    price: { type: Number, required: true },
    imageUrl: { type: String, required: true },
    availability: { type: String, enum: ['available', 'reserved', 'sold'], default: 'available' },
    moodTags: [{ type: String }],
  },
  { timestamps: true }
);

module.exports = mongoose.model('Art', artSchema);









