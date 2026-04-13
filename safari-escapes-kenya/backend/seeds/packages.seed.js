require('dotenv').config({ path: '../../.env' });
const { pool } = require('../src/config/database');

const packages = [
  {
    title: 'Maasai Mara Classic Safari',
    description: 'Experience the iconic Great Migration in the heart of the Maasai Mara. Witness thousands of wildebeest crossing the Mara River in one of nature\'s greatest spectacles.',
    price_cents: 299900,
    duration_days: 5,
    location: 'Maasai Mara, Kenya',
    image_url: '/images/packages/maasai-mara.jpg',
    highlights: ['Great Migration', 'Big Five sightings', 'Maasai village visit', 'Hot air balloon option'],
    included: ['Accommodation', 'All meals', 'Game drives', 'Park fees', 'Airport transfers'],
  },
  {
    title: 'Amboseli & Kilimanjaro Views',
    description: 'Marvel at herds of elephants against the breathtaking backdrop of Mount Kilimanjaro in Amboseli National Park.',
    price_cents: 189900,
    duration_days: 3,
    location: 'Amboseli National Park, Kenya',
    image_url: '/images/packages/amboseli.jpg',
    highlights: ['Elephant herds', 'Kilimanjaro views', 'Bird watching', 'Maasai culture'],
    included: ['Lodge accommodation', 'Full board', 'Game drives', 'Park fees'],
  },
  {
    title: 'Samburu & Lewa Conservancy',
    description: 'Discover unique northern Kenya wildlife in Samburu — home to the rare Grevy\'s zebra, reticulated giraffe, and Somali ostrich.',
    price_cents: 249900,
    duration_days: 4,
    location: 'Samburu, Kenya',
    image_url: '/images/packages/samburu.jpg',
    highlights: ['Rare northern species', 'Ewaso Nyiro River', 'Camel trekking', 'Cultural visits'],
    included: ['Tented camp', 'All meals', 'Game drives', 'Park fees'],
  },
  {
    title: 'Tsavo East & West Explorer',
    description: 'Journey through Kenya\'s largest national park, famous for the red elephants and diverse landscapes from lava flows to swamps.',
    price_cents: 159900,
    duration_days: 3,
    location: 'Tsavo National Park, Kenya',
    image_url: '/images/packages/tsavo.jpg',
    highlights: ['Red elephants', 'Mzima Springs', 'Lugard Falls', 'Diverse birdlife'],
    included: ['Lodge stay', 'Full board', 'Game drives', 'Park fees'],
  },
];

async function seed() {
  for (const pkg of packages) {
    await pool.query(
      `INSERT INTO packages (title, description, price_cents, duration_days, location, image_url, highlights, included)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8)
       ON CONFLICT DO NOTHING`,
      [pkg.title, pkg.description, pkg.price_cents, pkg.duration_days, pkg.location, pkg.image_url, pkg.highlights, pkg.included]
    );
  }
  console.log('Packages seeded successfully.');
  await pool.end();
}

seed().catch((err) => { console.error(err); process.exit(1); });
