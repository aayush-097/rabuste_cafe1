// utils/aiLogic.js

const moodToProfile = {
  calm: {
    strength: 'medium',
    tags: ['smooth', 'balanced', 'latte'],
  },
  cozy: {
    strength: 'medium',
    tags: ['chocolate', 'caramel', 'comfort'],
  },
  bold: {
    strength: 'strong',
    tags: ['robusta', 'intense', 'espresso'],
  },
  focused: {
    strength: 'strong',
    tags: ['pure', 'manual', 'clean'],
  },
  energetic: {
    strength: 'strong',
    tags: ['iced', 'bright', 'cold'],
  },
  mellow: {
    strength: 'light',
    tags: ['milk', 'soft', 'low'],
  },
};

const timeToTags = {
  morning: ['bright', 'clean'],
  afternoon: ['balanced', 'smooth'],
  evening: ['comfort', 'chocolate'],
  night: ['milk', 'soft'],
};

const suggestCoffee = ({ mood = 'calm', timeOfDay = 'morning', prefersMilk = false }) => {
  const moodProfile = moodToProfile[mood] || moodToProfile.calm;
  const timeTags = timeToTags[timeOfDay] || [];

  const tags = [...moodProfile.tags, ...timeTags];

  if (prefersMilk) tags.push('milk');
  else tags.push('black');

  return {
    strength: moodProfile.strength,
    tags,
    reasoning: `You’re feeling ${mood}. A ${moodProfile.strength} coffee suits this ${timeOfDay} moment best.`,
  };
};

const suggestArt = ({ mood = 'calm' }) => ({
  theme:
    mood === 'bold'
      ? 'high contrast modern'
      : mood === 'cozy'
      ? 'warm textured'
      : 'earthy minimal',
});

const suggestWorkshop = ({ vibe = 'creative', timeOfDay = 'afternoon' }) => ({
  recommendation:
    vibe === 'focused'
      ? 'Precision Brew Lab'
      : timeOfDay === 'evening'
      ? 'Coffee Tasting Stories'
      : 'Latte Art Experience',
});

module.exports = { suggestCoffee, suggestArt, suggestWorkshop };


