// backend/src/models/MenuSubCategory.js
const mongoose = require('mongoose');
const { getMenuDB } = require('../config/db');

const schema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    categoryId: { type: mongoose.Schema.Types.ObjectId, ref: 'MenuCategory', required: true },
    displayOrder: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

let MenuSubCategoryModel;

function getMenuSubCategoryModel() {
  if (!MenuSubCategoryModel) {
    const db = getMenuDB();
    MenuSubCategoryModel =
      db.models.MenuSubCategory || db.model('MenuSubCategory', schema);
  }
  return MenuSubCategoryModel;
}

module.exports = getMenuSubCategoryModel;
