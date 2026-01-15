const mongoose = require('mongoose');

let mainConnection; // galleryDB
let menuConnection; // rabusteCafe

// Connect gallery DB
const connectDB = async () => {
  mainConnection = await mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
  console.log('✅ MongoDB connected to galleryDB:', mainConnection.connection.db.databaseName);
};

// Connect menu DB
const connectMenuDB = async () => {
  menuConnection = await mongoose.createConnection(process.env.MONGO_URI_MENU, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });

  menuConnection.once('open', () => {
    console.log('✅ MongoDB connected to rabusteCafe DB:', menuConnection.name);
  });

  menuConnection.on('error', (err) => {
    console.error('❌ Menu DB connection error:', err);
  });
};

const getMenuDB = () => {
  if (!menuConnection) {
    throw new Error('❌ Menu DB not initialized. Call connectMenuDB first.');
  }
  return menuConnection;
};

module.exports = { connectDB, connectMenuDB, getMenuDB };
