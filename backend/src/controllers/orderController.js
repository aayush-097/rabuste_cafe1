// backend/src/controllers/orderController.js
const getOrderModel = require('../models/Order');
const { generateUniqueOrderToken } = require('../utils/tokenGenerator');

// PUBLIC: Create new order
exports.createOrder = async (req, res) => {
  try {
    const Order = getOrderModel();
    const MenuItem = require('../models/MenuItem')();

    const { items, paymentMethod, pickupTime } = req.body;

    // Auth required
    const user = req.user;
    if (!user) return res.status(401).json({ message: 'Authentication required' });

    // Validate required fields
    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ message: 'Cart cannot be empty' });
    }

    if (!pickupTime) {
      return res.status(400).json({ message: 'Pickup time is required' });
    }

    if (!paymentMethod || !['PAY_NOW', 'PAY_AT_COUNTER'].includes(paymentMethod)) {
      return res.status(400).json({ message: 'Invalid payment method' });
    }

    // Validate pickup time is in the future
    const pickupDate = new Date(pickupTime);
    if (pickupDate <= new Date()) {
      return res.status(400).json({ message: 'Pickup time must be in the future' });
    }

    // items expected: [{ itemId, quantity }]
    const populatedItems = [];
    let totalAmount = 0;

    for (const it of items) {
      if (!it.itemId) return res.status(400).json({ message: 'Invalid item in payload' });
      const qty = parseInt(it.quantity, 10) || 0;
      if (qty <= 0) return res.status(400).json({ message: 'Invalid quantity' });

      // Query with explicit _id comparison to handle string IDs
      // Bypass Mongoose casting by using collection.findOne()
      const menuItem = await MenuItem.collection.findOne({ _id: it.itemId });
      if (!menuItem) {
        // skip missing items but continue
        continue;
      }

      // derive price (take first price entry)
      const price = menuItem.prices && menuItem.prices[0] ? menuItem.prices[0].price : 0;
      const name = menuItem.name || 'Unknown Item';

      populatedItems.push({ item: menuItem._id, name, price, quantity: qty });
      totalAmount += price * qty;
    }

    if (populatedItems.length === 0) return res.status(400).json({ message: 'No valid items in cart' });

    // Determine payment status based on payment method
    // PAY_NOW: PAID_UNVERIFIED (placeholder, waiting for verification)
    // PAY_AT_COUNTER: PENDING (waiting for staff to collect cash)
    const paymentStatus = paymentMethod === 'PAY_NOW' ? 'PAID_UNVERIFIED' : 'PENDING';

    // Generate unique order token for payment verification
    const orderToken = await generateUniqueOrderToken(async (token) => {
      return await Order.findOne({ orderToken: token });
    });

    // Create order
    const order = new Order({
      user: user._id,
      items: populatedItems,
      totalAmount,
      paymentMethod,
      paymentStatus,
      orderToken,
      pickupTime: pickupDate,
      status: 'PENDING',
    });

    console.log('📋 Order before save:', {
      hasOrderId: !!order.orderId,
      hasOrderToken: !!order.orderToken,
      itemsCount: order.items.length,
      paymentMethod: order.paymentMethod,
    });

    const savedOrder = await order.save();

    console.log('✅ Order saved successfully:', {
      orderId: savedOrder.orderId,
      orderToken: savedOrder.orderToken,
      _id: savedOrder._id,
    });

    // Refresh the order to ensure all fields including orderId are populated
    const refreshedOrder = await Order.findById(savedOrder._id).lean();
    
    console.log('🔍 Refreshed order from DB:', {
      orderId: refreshedOrder?.orderId,
      orderToken: refreshedOrder?.orderToken,
      _id: refreshedOrder?._id,
    });

    // Validate orderId is present
    if (!refreshedOrder?.orderId) {
      console.error('❌ CRITICAL: orderId missing after refresh!', refreshedOrder);
      // Fallback: ensure at least orderToken is there
      if (!refreshedOrder?.orderToken) {
        throw new Error('Order creation failed: missing both orderId and orderToken');
      }
    }

    // Clear user's cart
    const getCartModel = require('../models/Cart');
    const Cart = getCartModel();
    await Cart.findOneAndUpdate({ user: user._id }, { $set: { items: [] } });

    res.status(201).json({
      message: 'Order created successfully',
      order: refreshedOrder,
    });
  } catch (err) {
    console.error('Create order error:', err);
    if (err.name === 'ValidationError') {
      return res.status(400).json({ message: err.message });
    }
    if (err.code === 11000) {
      return res.status(400).json({ message: 'Order ID conflict. Please try again.' });
    }
    res.status(500).json({ message: 'Failed to create order', error: err.message });
  }
};

// ADMIN: Get all orders
exports.getOrders = async (req, res) => {
  try {
    const Order = getOrderModel();
    const { status, filter } = req.query;

    console.log('📋 Get orders request:', { filter, status, user: req.user?.email });

    let query = {};

    // Filter by status - prioritize filter parameter
    if (filter === 'pending') {
      query.status = 'PENDING';
    } else if (filter === 'completed') {
      query.status = 'COMPLETED';
    } else if (status && ['PENDING', 'COMPLETED'].includes(status.toUpperCase())) {
      query.status = status.toUpperCase();
    }

    console.log('🔍 Query:', query);

    const orders = await Order.find(query)
      .sort({ createdAt: -1 })
      .lean();

    // Map orders to include user info from the user field
    const ordersWithUserInfo = orders.map(order => ({
      ...order,
      userName: order.user?._id?.toString() || 'Unknown User'
    }));

    console.log(`✅ Found ${orders.length} orders`);

    res.json({ data: ordersWithUserInfo });
  } catch (err) {
    console.error('❌ Get orders error:', err);
    res.status(500).json({ message: 'Failed to fetch orders', error: err.message });
  }
};

// ADMIN: Complete order
exports.completeOrder = async (req, res) => {
  try {
    const Order = getOrderModel();
    const { id } = req.params;

    const order = await Order.findById(id);

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    if (order.status === 'COMPLETED') {
      return res.status(400).json({ message: 'Order is already completed' });
    }

    order.status = 'COMPLETED';
    await order.save();

    res.json({
      message: 'Order completed successfully',
      order,
    });
  } catch (err) {
    console.error('Complete order error:', err);
    res.status(500).json({ message: 'Failed to complete order', error: err.message });
  }
};

// ADMIN: Mark PAY_AT_COUNTER order as paid (staff collected cash)
exports.markAsPaid = async (req, res) => {
  try {
    const Order = getOrderModel();
    const { id } = req.params;

    const order = await Order.findById(id);

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    if (order.paymentMethod !== 'PAY_AT_COUNTER') {
      return res.status(400).json({ message: 'This action is only for PAY_AT_COUNTER orders' });
    }

    if (order.paymentStatus === 'PAID') {
      return res.status(400).json({ message: 'Order payment is already verified' });
    }

    // Update payment status to PAID
    order.paymentStatus = 'PAID';
    await order.save();

    res.json({
      message: 'Order marked as paid successfully',
      order,
    });
  } catch (err) {
    console.error('Mark as paid error:', err);
    res.status(500).json({ message: 'Failed to mark order as paid', error: err.message });
  }
};

// ADMIN: Verify PAY_NOW order and complete it
exports.verifyAndComplete = async (req, res) => {
  try {
    const Order = getOrderModel();
    const { id } = req.params;

    const order = await Order.findById(id);

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    if (order.paymentMethod !== 'PAY_NOW') {
      return res.status(400).json({ message: 'This action is only for PAY_NOW orders' });
    }

    if (order.status === 'COMPLETED') {
      return res.status(400).json({ message: 'Order is already completed' });
    }

    // Update payment status to PAID and order status to COMPLETED
    order.paymentStatus = 'PAID';
    order.status = 'COMPLETED';
    await order.save();

    res.json({
      message: 'Order verified and completed successfully',
      order,
    });
  } catch (err) {
    console.error('Verify and complete error:', err);
    res.status(500).json({ message: 'Failed to verify and complete order', error: err.message });
  }
};

// ADMIN: Delete order
exports.deleteOrder = async (req, res) => {
  try {
    const Order = getOrderModel();
    const { id } = req.params;

    const order = await Order.findById(id);
    if (!order) return res.status(404).json({ message: 'Order not found' });

    await Order.deleteOne({ _id: id });

    res.json({ message: 'Order deleted successfully' });
  } catch (err) {
    console.error('Delete order error:', err);
    res.status(500).json({ message: 'Failed to delete order', error: err.message });
  }
};
