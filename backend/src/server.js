require('dotenv').config();

const express = require('express');
const cors = require('cors');
const { connectDB, connectMenuDB } = require('./config/db');


// Log MONGO_URI on startup (mask password for security)
const mongoUri = process.env.MONGO_URI;
if (mongoUri) {
  const maskedUri = mongoUri.replace(/:([^:@]+)@/, ':****@');
  console.log('MONGO_URI:', maskedUri);
} else {
  console.error('MONGO_URI is not set in environment');
}

// Create app
const app = express();
app.use(cors());
app.use(express.json());
require("dotenv").config();

app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "http://localhost:3000",
      "https://rabustecafe1-cvoionyyj-aayush-097s-projects.vercel.app"
    ],
    credentials: true
  })
);

app.use(express.json());

app.get("/test", (req, res) => {
  res.send("SERVER IS RUNNING");
});

// 🔥 CHATBOT ROUTE
app.use("/api/chat", require("./routes/Chat"));
// ---------- ROUTES ----------
const coffeeRoutes = require('./routes/coffeeRoutes');
const artRoutes = require('./routes/artRoutes');
const workshopRoutes = require('./routes/workshopRoutes');
const franchiseRoutes = require('./routes/franchiseRoutes');
const insightsRoutes = require('./routes/insightsRoutes');
const aiRoutes = require('./routes/aiRoutes');
const menuImageRoutes = require('./routes/menuImageRoutes');
const imageRoutes = require('./routes/imageRoutes');
const authRoutes = require('./routes/authRoutes');
const adminRoutes = require('./routes/adminRoutes');

const menuPublicRoutes = require('./routes/menu.public.routes');
const menuAdminRoutes = require('./routes/menu.admin.routes');
const orderRoutes = require('./routes/orderRoutes');
const orderAdminRoutes = require('./routes/order.admin.routes');
const cartRoutes = require('./routes/cart.routes');

// ---------- BASE ----------
app.get('/', (_req, res) => res.send('Rabuste Coffee API is alive'));

// ---------- API ----------
app.use('/api/coffee', coffeeRoutes);
app.use('/api/art', artRoutes);
app.use('/api/workshops', workshopRoutes);
app.use('/api/franchise', franchiseRoutes);
app.use('/api/insights', insightsRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/menu-images', menuImageRoutes);
app.use('/api/images', imageRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);

// ---------- MENU ----------
app.use('/api/menu', menuPublicRoutes);
app.use('/api/admin/menu', menuAdminRoutes);

// ---------- ORDERS ----------
app.use('/api/orders', orderRoutes);
app.use('/api/admin/orders', orderAdminRoutes);
app.use('/api/cart', cartRoutes);

// ---------- ERROR HANDLER ----------
app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(500).json({ message: 'Unexpected error' });
});

// ---------- DEBUG ROUTES (IMPROVED) ----------
const getMenuCategoryModel = require('./models/MenuCategory');
const getMenuSubCategoryModel = require('./models/MenuSubCategory');
const getMenuGroupModel = require('./models/MenuGroup');
const getMenuItemModel = require('./models/MenuItem');

// Fetch all categories
app.get('/debug/categories', async (req, res) => {
  try {
    const MenuCategory = getMenuCategoryModel(); // call function to get model
    const cats = await MenuCategory.find({});
    console.log('CATEGORIES FROM DB:', cats);
    res.json(cats);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// Fetch full menu data
app.get('/debug/menu-full', async (req, res) => {
  try {
    const MenuCategory = getMenuCategoryModel();
    const MenuSubCategory = getMenuSubCategoryModel();
    const MenuGroup = getMenuGroupModel();
    const MenuItem = getMenuItemModel();

    const categories = await MenuCategory.find({});
    const subCategories = await MenuSubCategory.find({});
    const groups = await MenuGroup.find({});
    const items = await MenuItem.find({}).select('_id name groupId displayOrder isActive prices categoryId subCategoryId section').lean();

    console.log('📊 DEBUG MENU-FULL:');
    console.log(`  - Categories: ${categories.length}`);
    console.log(`  - SubCategories: ${subCategories.length}`);
    console.log(`  - Groups: ${groups.length}`);
    console.log(`  - Items: ${items.length}`);
    if (items.length > 0) {
      console.log(`  - First item:`, items[0]);
      console.log(`  - First item keys:`, Object.keys(items[0]));
    }

    // Ensure all items have _id (fallback to name-based ID if missing)
    const itemsWithIds = items.map((item, idx) => {
      if (!item._id && !item.id) {
        console.warn(`⚠️ Item ${idx} missing ID:`, item.name);
        return {
          ...item,
          _id: item._id || `item_${idx}`,
          id: item._id || `item_${idx}`,
        };
      }
      return item;
    });

    const data = {
      categories,
      subCategories,
      groups,
      items: itemsWithIds,
    };

    res.json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// ---------- START SERVER ----------
const PORT = process.env.PORT || 5000;

(async () => {
  try {
    await connectDB();        // galleryDB
    await connectMenuDB();    // rabusteCafe

    app.listen(PORT, () => {
      console.log(`✅ Rabuste Coffee backend running on port ${PORT}`);
    });
  } catch (err) {
    console.error('❌ Server startup failed:', err);
    process.exit(1);
  }
})();
