const mongoose = require('mongoose');

const artBookingSchema = new mongoose.Schema(
  {
    artId: { type: mongoose.Schema.Types.ObjectId, ref: 'Art', required: true },
    artName: { type: String, required: true },
    userName: { type: String, required: true },
    phone: { type: String, required: true },
    email: { type: String, default: '' },
    message: { type: String, default: '' },
    status: { 
      type: String, 
      enum: ['PENDING', 'ACCEPTED', 'REJECTED'], 
      default: 'PENDING' 
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('ArtBooking', artBookingSchema);
