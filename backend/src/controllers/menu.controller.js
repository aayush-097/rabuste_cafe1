const getModels = () => {
  return {
    MenuCategory: require('../models/MenuCategory')(),
    MenuSubCategory: require('../models/MenuSubCategory')(),
    MenuGroup: require('../models/MenuGroup')(),
    MenuItem: require('../models/MenuItem')(),
  };
};

/* ---------------- PUBLIC ---------------- */

exports.getCategories = async (_req, res) => {
  const { MenuCategory } = getModels();
  const data = await MenuCategory.find({ isActive: true }).sort({ displayOrder: 1 });
  res.json(data);
};

exports.getSubCategories = async (req, res) => {
  const { MenuSubCategory } = getModels();
  const data = await MenuSubCategory.find({
    category: req.params.categoryId,
    isActive: true,
  }).sort({ displayOrder: 1 });
  res.json(data);
};

exports.getItems = async (req, res) => {
  const { MenuGroup, MenuItem } = getModels();

  const groups = await MenuGroup.find({
    subCategory: req.params.subcategoryId,
    isActive: true,
  });

  const items = await MenuItem.find({
    group: { $in: groups.map(g => g._id) },
  }).sort({ displayOrder: 1 });

  res.json(items);
};

/* ---------------- ADMIN ---------------- */

exports.createItem = async (req, res) => {
  try {
    const { MenuItem } = getModels();
    
    // Generate string ID if not provided
    const itemId = req.body._id || req.body.id || `itm_${Date.now()}`;
    
    const itemData = {
      _id: itemId,
      name: req.body.name || req.body.category || '',
      category: req.body.category,
      url: req.body.url,
      public_id: req.body.public_id,
      groupId: req.body.groupId,
      displayOrder: req.body.displayOrder || 0,
      isActive: req.body.isActive !== false,
      prices: req.body.prices || []
    };
    
    console.log(`✨ Creating new item with data:`, itemData);
    
    const item = await MenuItem.create(itemData);
    
    console.log(`✅ Item created successfully:`, item);
    res.status(201).json(item);
  } catch (err) {
    console.error('Create item error:', err);
    res.status(500).json({ message: 'Failed to create item', error: err.message });
  }
};

exports.updateItem = async (req, res) => {
  try {
    const { MenuItem } = getModels();
    const itemId = req.params.id;
    
    const updateData = {};
    
    // Handle all possible fields
    if (req.body.name !== undefined) updateData.name = req.body.name;
    if (req.body.category !== undefined) updateData.category = req.body.category;
    if (req.body.url !== undefined) updateData.url = req.body.url;
    if (req.body.public_id !== undefined) updateData.public_id = req.body.public_id;
    if (req.body.isActive !== undefined) updateData.isActive = req.body.isActive;
    if (req.body.displayOrder !== undefined) updateData.displayOrder = req.body.displayOrder;
    if (req.body.prices !== undefined) updateData.prices = req.body.prices;
    if (req.body.groupId !== undefined) updateData.groupId = req.body.groupId;
    
    console.log(`📝 Updating item with id: ${itemId}`, updateData);
    
    // Use updateOne with string _id to avoid ObjectId casting
    const result = await MenuItem.updateOne(
      { _id: itemId },
      { $set: updateData }
    );
    
    if (result.matchedCount === 0) {
      console.error(`Item not found with id: ${itemId}`);
      return res.status(404).json({ message: 'Item not found' });
    }
    
    // Fetch and return updated item
    const item = await MenuItem.findOne({ _id: itemId });
    
    console.log(`✅ Item updated successfully:`, item);
    res.json(item);
  } catch (err) {
    console.error('Update item error:', err);
    res.status(500).json({ message: 'Failed to update item', error: err.message });
  }
};

exports.deleteItem = async (req, res) => {
  try {
    const { MenuItem } = getModels();
    const itemId = req.params.id;
    
    console.log(`🗑️ Deleting item with id: ${itemId}`);
    
    // Use deleteOne with string _id to avoid ObjectId casting
    const result = await MenuItem.deleteOne({ _id: itemId });
    
    if (result.deletedCount === 0) {
      console.error(`Item not found with id: ${itemId}`);
      return res.status(404).json({ message: 'Item not found' });
    }
    
    console.log(`✅ Item deleted successfully`);
    res.json({ message: 'Item deleted successfully' });
  } catch (err) {
    console.error('Delete item error:', err);
    res.status(500).json({ message: 'Failed to delete item', error: err.message });
  }
};

exports.updateStock = async (req, res) => {
  const { MenuItem } = getModels();
  const item = await MenuItem.findByIdAndUpdate(
    req.params.id,
    { isInStock: req.body.isInStock },
    { new: true }
  );
  res.json(item);
};

exports.updateDiscount = async (req, res) => {
  const { MenuItem } = getModels();
  const item = await MenuItem.findByIdAndUpdate(
    req.params.id,
    { discountPct: req.body.discountPct },
    { new: true }
  );
  res.json(item);
};

exports.addPrice = async (req, res) => {
  const { MenuItem } = getModels();
  const item = await MenuItem.findById(req.params.id);
  item.prices.push(req.body);
  await item.save();
  res.json(item);
};

exports.removePrice = async (req, res) => {
  const { MenuItem } = getModels();
  const item = await MenuItem.findById(req.params.id);
  item.prices.id(req.params.priceId).remove();
  await item.save();
  res.json(item);
};

exports.createGroup = async (req, res) => {
  try {
    const { MenuGroup } = getModels();
    const groupData = {
      name: req.body.name,
      subCategoryId: req.body.subCategoryId,
      displayOrder: req.body.displayOrder || 0,
      isActive: req.body.isActive !== false
    };
    const group = await MenuGroup.create(groupData);
    res.status(201).json(group);
  } catch (err) {
    console.error('Create group error:', err);
    res.status(500).json({ message: 'Failed to create group', error: err.message });
  }
};
