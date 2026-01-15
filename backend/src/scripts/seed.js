require('dotenv').config();
const mongoose = require('mongoose');
const { connectDB } = require('../config/db');
const Coffee = require('../models/Coffee');
const Art = require('../models/Art');
const Workshop = require('../models/Workshop');
const { coffee, art, workshops } = require('../data/seedData');

const seed = async () => {
  await connectDB();
  try {
    await Promise.all([Coffee.deleteMany(), Art.deleteMany(), Workshop.deleteMany()]);
    await Coffee.insertMany(coffee);
    await Art.insertMany(art);
    await Workshop.insertMany(workshops);
    console.log('Seeded coffee, art, workshops');
  } catch (err) {
    console.error('Seeding failed', err);
  } finally {
    mongoose.connection.close();
  }
};

seed();









