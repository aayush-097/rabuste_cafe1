const coffee = [
  {
    name: 'Thunderbolt Robusta',
    description: 'Pressure-infused robusta with cacao nib aromatics and dark honey finish.',
    strength: 'strong',
    tags: ['bold', 'dense', 'signature'],
    isSignature: true,
    popularity: 90,
  },
  {
    name: 'Amber Bloom',
    description: 'Slow-drip robusta over orange peel for bright, syrupy balance.',
    strength: 'medium',
    tags: ['citrus', 'balanced'],
    isSignature: true,
    popularity: 70,
  },
  {
    name: 'Silk Drift',
    description: 'Coconut cream shaken with chilled robusta, silky and light.',
    strength: 'light',
    tags: ['creamy', 'iced'],
    isSignature: false,
    popularity: 55,
  },
  {
    name: 'Midnight Cinder',
    description: 'Charcoal-kissed robusta tonic with black cherry bitters.',
    strength: 'strong',
    tags: ['sparkling', 'bold'],
    isSignature: false,
    popularity: 60,
  },
];

const art = [
  {
    title: 'Vermilion Pulse',
    artistName: 'Aisha Kaur',
    description: 'Charcoal base with vermilion gradients echoing espresso crema.',
    price: 950,
    imageUrl: 'https://images.unsplash.com/photo-1523419400524-13de4fa1b49a?auto=format&fit=crop&w=1200&q=80',
    availability: 'available',
    moodTags: ['bold', 'energetic'],
  },
  {
    title: 'Sepia Hymn',
    artistName: 'Leo Martins',
    description: 'Warm ink on fiber paper, soft like a long pour-over finish.',
    price: 620,
    imageUrl: 'https://images.unsplash.com/photo-1513364776144-60967b0f800f?auto=format&fit=crop&w=1200&q=80',
    availability: 'reserved',
    moodTags: ['calm', 'cozy'],
  },
  {
    title: 'Copper Bloom',
    artistName: 'Mira Sol',
    description: 'Mixed media with copper leaf, mirroring a crema’s shimmer.',
    price: 780,
    imageUrl: 'https://images.unsplash.com/photo-1501004318641-b39e6451bec6?auto=format&fit=crop&w=1200&q=80',
    availability: 'available',
    moodTags: ['creative'],
  },
];

const workshops = [
  {
    title: 'Latte Art x Ink',
    description: 'Steam, pour, then sketch with ink over latte art photographs.',
    date: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7),
    totalSeats: 12,
    registeredCount: 4,
    tags: ['creative', 'art'],
  },
  {
    title: 'Precision Brew Lab',
    description: 'Dial-in robusta with refractometers and sensory mapping.',
    date: new Date(Date.now() + 1000 * 60 * 60 * 24 * 14),
    totalSeats: 10,
    registeredCount: 9,
    tags: ['focused', 'science'],
  },
  {
    title: 'Origin Stories & Cupping',
    description: 'Taste through single-origin robusta and learn harvest narratives.',
    date: new Date(Date.now() + 1000 * 60 * 60 * 24 * 21),
    totalSeats: 20,
    registeredCount: 7,
    tags: ['cozy', 'story'],
  },
];

module.exports = { coffee, art, workshops };









