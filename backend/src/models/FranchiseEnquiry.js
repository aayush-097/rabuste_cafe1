const mongoose = require('mongoose');

const franchiseEnquirySchema = new mongoose.Schema(
  {
    fullName: { type: String, required: true },
    phone: { type: String, required: true },
    email: { type: String, default: '' },
    city: { type: String, required: true },
    investmentRange: { type: String, default: '' },
    message: { type: String, default: '' },
    status: { 
      type: String, 
      enum: ['NEW', 'CONTACTED'], 
      default: 'NEW' 
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('FranchiseEnquiry', franchiseEnquirySchema);









