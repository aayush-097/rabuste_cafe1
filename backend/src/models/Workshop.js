const mongoose = require('mongoose');

const workshopSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    date: { type: Date, required: true },
    totalSeats: { type: Number, required: true },
    registeredCount: { type: Number, default: 0 },
    tags: [{ type: String }],
  },
  { timestamps: true }
);

module.exports = mongoose.model('Workshop', workshopSchema);









