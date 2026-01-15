const mongoose = require('mongoose');

const workshopRegistrationSchema = new mongoose.Schema(
  {
    workshopId: { type: mongoose.Schema.Types.ObjectId, ref: 'Workshop', required: true },
    workshopTitle: { type: String, required: true },
    name: { type: String, required: true },
    phone: { type: String, required: true },
    email: { type: String, default: '' },
    status: { 
      type: String, 
      enum: ['CONFIRMED'], 
      default: 'CONFIRMED' 
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('WorkshopRegistration', workshopRegistrationSchema);
