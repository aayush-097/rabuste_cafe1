// backend/src/models/MenuGroup.js
const mongoose = require('mongoose');
const { getMenuDB } = require('../config/db');

const schema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    subCategoryId: { type: mongoose.Schema.Types.ObjectId, ref: 'MenuSubCategory' },
    displayOrder: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

schema.index({ subCategoryId: 1 });
schema.index({ isActive: 1 });

schema.statics.findGroupsForChatbot = function (subCategoryId) {
  return this.find({
    subCategoryId,
    isActive: true
  }).sort({ displayOrder: 1 });
};

let MenuGroupModel;

function getMenuGroupModel() {
  if (!MenuGroupModel) {
    const db = getMenuDB();
    MenuGroupModel = db.models.MenuGroup || db.model('MenuGroup', schema);
  }
  return MenuGroupModel;
}

module.exports = getMenuGroupModel;
