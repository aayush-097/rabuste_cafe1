// MenuCategory.js
const mongoose = require('mongoose');
const { getMenuDB } = require('../config/db');

const schema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    displayOrder: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

// Indexes
schema.index({ name: 1 });
schema.index({ isActive: 1 });

// Chatbot helper
schema.statics.findByNameForChatbot = function (name) {
  return this.findOne({
    name: new RegExp(`^${name}$`, 'i'),
    isActive: true
  });
};

let MenuCategoryModel;

function getMenuCategoryModel() {
  if (!MenuCategoryModel) {
    const db = getMenuDB(); // only call after connectMenuDB
    MenuCategoryModel = db.models.MenuCategory || db.model('MenuCategory', schema);
  }
  return MenuCategoryModel;
}

module.exports = getMenuCategoryModel;
