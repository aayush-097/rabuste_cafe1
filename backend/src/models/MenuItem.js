// backend/src/models/MenuItem.js
const mongoose = require('mongoose');
const { getMenuDB } = require('../config/db');

const priceSchema = new mongoose.Schema({
  size: { type: String, required: true },
  price: { type: Number, required: true },
  isDiscount: { type: Number, default: 0 }, // 0 = no discount, otherwise % discount
  inStock: { type: Boolean, default: true },
});

const schema = new mongoose.Schema(
  {
    _id: { type: String, required: true }, // Allow string IDs like "itm_robusta_iced_americano"
    name: { type: String, required: true },
    category: { type: String },
    url: { type: String },
    public_id: { type: String },
    groupId: { type: String }, // Changed to String to match existing data
    displayOrder: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
    prices: [priceSchema],
  },
  { timestamps: true, _id: true }
);

schema.index({ name: 1 });
schema.index({ groupId: 1, isActive: 1 });
schema.index({ 'prices.inStock': 1 });

schema.virtual('hasStock').get(function () {
  return this.prices.some(p => p.inStock);
});

schema.statics.findItemsForChatbot = function (groupIds) {
  return this.find({
    groupId: { $in: groupIds },
    isActive: true
  }).sort({ displayOrder: 1 });
};

let MenuItemModel;

function getMenuItemModel() {
  if (!MenuItemModel) {
    const db = getMenuDB();
    MenuItemModel = db.models.MenuItem || db.model('MenuItem', schema);
  }
  return MenuItemModel;
}

module.exports = getMenuItemModel;
