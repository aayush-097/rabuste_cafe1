const Coffee = require('../models/Coffee');
const Art = require('../models/Art');
const { suggestCoffee, suggestArt, suggestWorkshop } = require('../utils/aiLogic');

const coffeeDiscovery = async (req, res) => {
  const { mood, timeOfDay, prefersMilk } = req.body || {};
  const aiPick = suggestCoffee({ mood, timeOfDay, prefersMilk });
  try {
    const matches = await Coffee.find({
      $or: [{ strength: aiPick.strength }, { tags: { $in: aiPick.tags } }],
    }).limit(3);
    res.json({ aiPick, matches });
  } catch (err) {
    res.status(500).json({ message: 'Could not generate coffee suggestion' });
  }
};

const artDiscovery = async (req, res) => {
  const { mood } = req.body || {};
  const aiPick = suggestArt({ mood });
  try {
    const pieces = await Art.find({ moodTags: mood }).limit(3);
    res.json({ aiPick, matches: pieces });
  } catch (err) {
    res.status(500).json({ message: 'Could not generate art suggestion' });
  }
};

const workshopDiscovery = (_req, res) => {
  const { mood, timeOfDay } = _req.body || {};
  const aiPick = suggestWorkshop({ vibe: mood, timeOfDay });
  res.json({ aiPick });
};

module.exports = { coffeeDiscovery, artDiscovery, workshopDiscovery };









