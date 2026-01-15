// backend/src/models/Order.js
const mongoose = require('mongoose');
const { getMenuDB } = require('../config/db');

const itemSchema = new mongoose.Schema({
  item: { type: String, required: true }, // String to handle custom string IDs like 'itm_robusta_iced_americano'
  name: { type: String, required: true },
  price: { type: Number, required: true },
  quantity: { type: Number, required: true, min: 1 },
}, { _id: false });

const schema = new mongoose.Schema(
  {
    orderId: { 
      type: String,
      // Don't require upfront - pre-save hook will set it
      // required: true,
      sparse: true,
      unique: true,
      index: true 
    },
    orderToken: {
      type: String,
      required: true,
      unique: true,
      index: true,
      sparse: true
    },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    items: [itemSchema],
    totalAmount: { type: Number, required: true, min: 0 },
    paymentMethod: { 
      type: String, 
      enum: ['PAY_NOW', 'PAY_AT_COUNTER'], 
      required: true 
    },
    paymentStatus: { 
      type: String, 
      enum: ['PENDING', 'PAID_UNVERIFIED', 'PAID'],
      required: true,
      default: 'PENDING'
    },
    pickupTime: { type: Date, required: true },
    status: { 
      type: String, 
      enum: ['PENDING', 'COMPLETED'], 
      default: 'PENDING',
      index: true
    },
  },
  { timestamps: true }
);

// Generate readable order ID (e.g., ORD-20240115-001)
schema.pre('save', async function(next) {
  try {
    if (!this.orderId) {
      console.log('📝 Generating orderId...');
      const date = new Date().toISOString().split('T')[0].replace(/-/g, '');
      const startOfDay = new Date();
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date();
      endOfDay.setHours(23, 59, 59, 999);
      
      let count = 0;
      try {
        count = await this.constructor.countDocuments({
          createdAt: {
            $gte: startOfDay,
            $lt: endOfDay
          }
        });
        console.log(`📊 Orders today: ${count}`);
      } catch (countErr) {
        console.error('❌ Count error:', countErr.message);
        count = 0;
      }
      
      this.orderId = `ORD-${date}-${String(count + 1).padStart(3, '0')}`;
      console.log(`✅ Generated orderId: ${this.orderId}`);
    }
    
    // Validate orderId is set before proceeding
    if (!this.orderId) {
      throw new Error('Failed to generate orderId');
    }
    
    next();
  } catch (err) {
    console.error('❌ Pre-save error:', err.message);
    // Try fallback
    try {
      this.orderId = `ORD-${Date.now()}`;
      console.log(`⚠️ Using fallback orderId: ${this.orderId}`);
      next();
    } catch (fallbackErr) {
      next(fallbackErr);
    }
  }
});

schema.index({ status: 1, createdAt: -1 });
schema.index({ orderId: 1 });


let OrderModel;

function getOrderModel() {
  if (!OrderModel) {
    const db = getMenuDB();
    OrderModel = db.models.Order || db.model('Order', schema);
  }
  return OrderModel;
}

module.exports = getOrderModel;
