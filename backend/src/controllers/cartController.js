const getCartModel = require('../models/Cart');
const getMenuItemModel = require('../models/MenuItem');

// Helper to populate cart items with MenuItem data
async function populateCartItems(cart) {
  if (!cart || !cart.items || cart.items.length === 0) {
    return cart;
  }
  
  const MenuItem = getMenuItemModel();
  const itemIds = cart.items.map(i => i.item);
  const menuItems = {};
  
  // Fetch all menu items at once
  for (const itemId of itemIds) {
    const menuItem = await MenuItem.collection.findOne({ _id: itemId });
    if (menuItem) {
      menuItems[itemId] = menuItem;
    }
  }
  
  // Attach MenuItem data to cart items
  cart.items = cart.items.map(ci => ({
    ...ci,
    item: menuItems[ci.item] || { _id: ci.item, name: 'Unknown' }
  }));
  
  return cart;
}

exports.getCart = async (req, res) => {
  try {
    const Cart = getCartModel();
    const cart = await Cart.findOne({ user: req.user._id }).lean();
    if (!cart) return res.json({ data: { items: [] } });
    const populated = await populateCartItems(cart);
    res.json({ data: populated });
  } catch (err) {
    console.error('Get cart error:', err);
    res.status(500).json({ message: 'Failed to fetch cart', error: err.message });
  }
};

exports.addToCart = async (req, res) => {
  try {
    const Cart = getCartModel();
    const MenuItem = getMenuItemModel();
    const userId = req.user._id;
    const { itemId, quantity } = req.body;
    
    console.log('📦 ADD TO CART:', { userId, itemId, quantity });
    
    if (!itemId) return res.status(400).json({ message: 'ItemId required' });
    const qty = parseInt(quantity, 10) || 1;

    // Query with explicit _id comparison to handle string IDs
    // Bypass Mongoose casting by using collection.findOne()
    const menuItem = await MenuItem.collection.findOne({ _id: itemId });
    console.log('🔍 MenuItem found:', menuItem ? menuItem._id : 'NOT FOUND');
    if (!menuItem) return res.status(404).json({ message: 'Menu item not found' });

    let cart = await Cart.findOne({ user: userId });
    console.log('🛒 Existing cart:', cart ? 'YES' : 'NO');
    
    if (!cart) {
      cart = await Cart.create({ user: userId, items: [{ item: menuItem._id, quantity: qty }] });
      console.log('✅ New cart created');
    } else {
      const existing = cart.items.find(i => String(i.item) === String(itemId));
      console.log('🔎 Item already in cart:', existing ? 'YES' : 'NO');
      if (existing) {
        existing.quantity += qty;
      } else {
        cart.items.push({ item: menuItem._id, quantity: qty });
      }
      await cart.save();
      console.log('💾 Cart saved');
    }
    
    const populated = await populateCartItems(cart);
    console.log('📤 Returning populated cart with', populated?.items?.length || 0, 'items');
    res.json({ data: populated });
  } catch (err) {
    console.error('Add to cart error:', err);
    res.status(500).json({ message: 'Failed to add to cart', error: err.message });
  }
};

exports.updateCart = async (req, res) => {
  try {
    const Cart = getCartModel();
    const userId = req.user._id;
    const { itemId, quantity } = req.body;
    if (!itemId) return res.status(400).json({ message: 'ItemId required' });
    const qty = parseInt(quantity, 10);
    if (isNaN(qty) || qty < 0) return res.status(400).json({ message: 'Invalid quantity' });

    const cart = await Cart.findOne({ user: userId });
    if (!cart) return res.status(404).json({ message: 'Cart not found' });

    const idx = cart.items.findIndex(i => String(i.item) === String(itemId));
    if (idx === -1) return res.status(404).json({ message: 'Item not in cart' });

    if (qty === 0) {
      cart.items.splice(idx, 1);
    } else {
      cart.items[idx].quantity = qty;
    }

    await cart.save();
    const populated = await populateCartItems(cart);
    res.json({ data: populated });
  } catch (err) {
    console.error('Update cart error:', err);
    res.status(500).json({ message: 'Failed to update cart', error: err.message });
  }
};

exports.removeItem = async (req, res) => {
  try {
    const Cart = getCartModel();
    const userId = req.user._id;
    const { itemId } = req.params;
    if (!itemId) return res.status(400).json({ message: 'ItemId required' });

    const cart = await Cart.findOne({ user: userId });
    if (!cart) return res.status(404).json({ message: 'Cart not found' });

    cart.items = cart.items.filter(i => String(i.item) !== String(itemId));
    await cart.save();
    const populated = await populateCartItems(cart);
    res.json({ data: populated });
  } catch (err) {
    console.error('Remove cart item error:', err);
    res.status(500).json({ message: 'Failed to remove item', error: err.message });
  }
};

exports.clearCart = async (req, res) => {
  try {
    const Cart = getCartModel();
    const userId = req.user._id;
    const cart = await Cart.findOneAndUpdate({ user: userId }, { $set: { items: [] } }, { new: true }).lean();
    const populated = await populateCartItems(cart || { items: [] });
    res.json({ data: populated });
  } catch (err) {
    console.error('Clear cart error:', err);
    res.status(500).json({ message: 'Failed to clear cart', error: err.message });
  }
};
