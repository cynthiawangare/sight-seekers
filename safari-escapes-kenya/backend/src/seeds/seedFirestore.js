require('dotenv').config({ path: require('path').join(__dirname, '../../.env') });
const admin = require('firebase-admin');

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      privateKey: process.env.FIREBASE_PRIVATE_KEY
        ? process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n')
        : undefined,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    }),
  });
}

const db = admin.firestore();
const auth = admin.auth();
const FieldValue = admin.firestore.FieldValue;

const packages = [
  {
    name: 'Samburu Safari',
    slug: 'samburu-safari',
    country: 'Kenya',
    tour_type: 'Wildlife Safari',
    description: 'Explore the rugged beauty of Samburu National Reserve, home to rare northern species found nowhere else in Kenya. Witness the endangered Grevy\'s zebra, reticulated giraffe, and Somali ostrich in their natural habitat. Experience authentic Samburu culture with visits to traditional manyatta homesteads.',
    short_description: 'Discover rare northern wildlife in Kenya\'s stunning Samburu Reserve.',
    price_per_person: 850,
    duration_days: 5,
    max_travelers: 12,
    includes: ['Airport transfers', '4WD safari vehicle', 'Professional guide', 'All park fees', 'Full board accommodation', 'Water & soft drinks'],
    excludes: ['International flights', 'Travel insurance', 'Alcoholic drinks', 'Personal items', 'Tips & gratuities'],
    highlights: ['Rare northern species', 'Samburu cultural village visit', 'Ewaso Ng\'iro River sundowners', 'Night game drives'],
    images: ['/images/packages/samburu-1.jpg', '/images/packages/samburu-2.jpg', '/images/packages/samburu-3.jpg'],
    is_featured: true,
    discount_percent: 15,
    is_active: true,
    itinerary: [
      { day_number: 1, title: 'Arrival in Nairobi', description: 'Arrive at JKIA airport, meet your guide, transfer to Nairobi hotel for overnight rest and trip briefing.', activities: ['Airport pickup', 'Hotel check-in', 'Trip briefing'], accommodation: 'Nairobi Serena Hotel', meals_included: ['Dinner'] },
      { day_number: 2, title: 'Nairobi to Samburu', description: 'Fly to Samburu airstrip, afternoon game drive spotting the Samburu Special Five.', activities: ['Morning flight', 'Afternoon game drive', 'Sundowner'], accommodation: 'Samburu Intrepids Camp', meals_included: ['Breakfast', 'Lunch', 'Dinner'] },
      { day_number: 3, title: 'Full Day Samburu', description: 'Full day of game drives. Visit a Samburu cultural village in the afternoon.', activities: ['Morning game drive', 'Cultural village visit', 'Evening river walk'], accommodation: 'Samburu Intrepids Camp', meals_included: ['Breakfast', 'Lunch', 'Dinner'] },
      { day_number: 4, title: 'Ewaso River & Bush Walks', description: 'Guided bush walk along the Ewaso Ng\'iro River followed by a night game drive.', activities: ['Guided bush walk', 'Night game drive', 'Campfire dinner'], accommodation: 'Samburu Intrepids Camp', meals_included: ['Breakfast', 'Lunch', 'Dinner'] },
      { day_number: 5, title: 'Departure', description: 'Final morning game drive, fly back to Nairobi and transfer to airport for departure.', activities: ['Morning game drive', 'Flight back', 'Airport transfer'], accommodation: 'N/A', meals_included: ['Breakfast'] },
    ],
  },
  {
    name: 'Masai Mara Adventure',
    slug: 'masai-mara-adventure',
    country: 'Kenya',
    tour_type: 'Wildlife Safari',
    description: 'The Masai Mara is Kenya\'s most iconic wildlife reserve, renowned for the annual Great Migration of over 1.5 million wildebeest. Experience thrilling big cat sightings, hot air balloon safaris at sunrise, and authentic Maasai cultural encounters.',
    short_description: 'Witness the world-famous Great Migration in the Masai Mara ecosystem.',
    price_per_person: 1100,
    duration_days: 7,
    max_travelers: 10,
    includes: ['Flights Nairobi–Mara', 'All game drives', 'Professional naturalist guide', 'Hot air balloon safari', 'Maasai village visit', 'Full board luxury tented camp', 'Park fees'],
    excludes: ['International flights', 'Visa fees', 'Travel insurance', 'Personal shopping', 'Tips'],
    highlights: ['Great Migration river crossings', 'Hot air balloon at dawn', 'Big Five sightings', 'Maasai boma cultural visit', 'Mara River hippo pools'],
    images: ['/images/packages/mara-1.jpg', '/images/packages/mara-2.jpg', '/images/packages/mara-3.jpg'],
    is_featured: true,
    discount_percent: 0,
    is_active: true,
    itinerary: [
      { day_number: 1, title: 'Arrival in Nairobi', description: 'Arrive at JKIA, meet your guide and transfer to your Nairobi hotel for overnight rest.', activities: ['Airport pickup', 'Hotel check-in', 'Welcome briefing'], accommodation: 'Nairobi Serena Hotel', meals_included: ['Dinner'] },
      { day_number: 2, title: 'Fly to Mara', description: 'Morning flight to Masai Mara airstrip, afternoon game drive focusing on big cats.', activities: ['Morning flight to Mara', 'Afternoon game drive (big cats focus)', 'Sundowner'], accommodation: 'Mara Serena Safari Lodge', meals_included: ['Breakfast', 'Lunch', 'Dinner'] },
      { day_number: 3, title: 'Full Day Game Drives', description: 'Full day of morning and afternoon game drives across the Mara ecosystem.', activities: ['Morning game drive', 'Afternoon game drive', 'Campfire stories'], accommodation: 'Mara Serena Safari Lodge', meals_included: ['Breakfast', 'Lunch', 'Dinner'] },
      { day_number: 4, title: 'Hot Air Balloon Sunrise', description: 'Pre-dawn balloon launch over the Mara, champagne bush breakfast, afternoon game drive.', activities: ['Hot air balloon sunrise', 'Bush breakfast', 'Afternoon game drive'], accommodation: 'Mara Serena Safari Lodge', meals_included: ['Breakfast', 'Lunch', 'Dinner'] },
      { day_number: 5, title: 'Mara River Crossings', description: 'Spend the day at the Mara River watching wildebeest migration crossings.', activities: ['Full-day Mara River crossing watch', 'Picnic lunch by the river'], accommodation: 'Mara Serena Safari Lodge', meals_included: ['Breakfast', 'Lunch', 'Dinner'] },
      { day_number: 6, title: 'Maasai Village & Sundowner', description: 'Morning game drive, afternoon Maasai village cultural visit and evening sundowner.', activities: ['Morning game drive', 'Maasai boma visit', 'Evening sundowner'], accommodation: 'Mara Serena Safari Lodge', meals_included: ['Breakfast', 'Lunch', 'Dinner'] },
      { day_number: 7, title: 'Departure', description: 'Final morning game drive, fly back to Nairobi and transfer to the airport.', activities: ['Final morning game drive', 'Flight back to Nairobi', 'Airport transfer'], accommodation: 'N/A', meals_included: ['Breakfast'] },
    ],
  },
  {
    name: 'Cultural Immersion Tour',
    slug: 'cultural-immersion-tour',
    country: 'Kenya',
    tour_type: 'Cultural',
    description: 'Go beyond wildlife and discover Kenya\'s extraordinary human story. Visit Maasai, Kikuyu, and Luo communities, participate in traditional ceremonies, learn to cook local dishes, and explore Nairobi\'s vibrant arts scene. Perfect for travelers seeking authentic cultural connection.',
    short_description: 'Dive deep into Kenya\'s rich tribal cultures and traditions.',
    price_per_person: 750,
    duration_days: 4,
    max_travelers: 15,
    includes: ['Ground transport', 'Cultural guide', 'Community visits', 'Cooking class', 'Traditional meals', 'Craft market visits', 'Nairobi city tour'],
    excludes: ['Flights', 'Accommodation (3 hotel nights extra)', 'Personal purchases', 'Tips'],
    highlights: ['Maasai warrior ceremony', 'Kikuyu cooking class', 'Lamu Old Town walk', 'Nairobi National Museum', 'Community craft shopping'],
    images: ['/images/packages/cultural-1.jpg', '/images/packages/cultural-2.jpg', '/images/packages/cultural-3.jpg'],
    is_featured: false,
    discount_percent: 10,
    is_active: true,
    itinerary: [
      { day_number: 1, title: 'Nairobi City Tour', description: 'Explore Nairobi\'s cultural highlights: the National Museum, Karen Blixen Museum and Giraffe Centre.', activities: ['Nairobi National Museum', 'Karen Blixen Museum', 'Giraffe Centre visit'], accommodation: 'Nairobi Serena Hotel', meals_included: ['Lunch', 'Dinner'] },
      { day_number: 2, title: 'Maasai Village Experience', description: 'Drive to a Maasai village (not the reserve), experience traditional warrior ceremonies and stay overnight.', activities: ['Maasai warrior ceremony', 'Traditional dance', 'Craft demonstration'], accommodation: 'Maasai Eco Lodge', meals_included: ['Breakfast', 'Lunch', 'Dinner'] },
      { day_number: 3, title: 'Kikuyu Community & Naivasha', description: 'Morning Kikuyu cooking class, drive to Lake Naivasha via Naivasha town.', activities: ['Kikuyu community visit', 'Traditional cooking class', 'Drive to Naivasha'], accommodation: 'Lake Naivasha Country Club', meals_included: ['Breakfast', 'Lunch', 'Dinner'] },
      { day_number: 4, title: 'Luo Community & Departure', description: 'Visit Luo fishing community at the lake, traditional fish lunch, return to Nairobi and depart.', activities: ['Luo fishing community visit', 'Traditional lunch', 'Return to Nairobi', 'Airport transfer'], accommodation: 'N/A', meals_included: ['Breakfast', 'Lunch'] },
    ],
  },
  {
    name: 'Photography Safari',
    slug: 'photography-safari',
    country: 'Kenya',
    tour_type: 'Photography',
    description: 'Designed for serious photographers, this safari combines the best light, the best locations, and expert guidance. Visit Amboseli for iconic Kilimanjaro backdrops, Lake Nakuru for flamingos, and the Mara for predator action. Includes a dedicated photography vehicle with beanbags and charging stations.',
    short_description: 'Capture Africa\'s wildlife in perfect light with expert photography guidance.',
    price_per_person: 1300,
    duration_days: 8,
    max_travelers: 8,
    includes: ['Dedicated photography vehicle', 'Expert photo guide', 'All park fees', 'Amboseli + Nakuru + Mara', 'Full board', 'Airport transfers', 'Photo review sessions each evening'],
    excludes: ['Camera equipment', 'International flights', 'Insurance', 'Alcohol', 'Tips'],
    highlights: ['Amboseli elephants with Kilimanjaro', 'Nakuru flamingo lake', 'Golden hour predator drives', 'Exclusive photography vehicle', 'Evening image review with guide'],
    images: ['/images/packages/photography-1.jpg', '/images/packages/photography-2.jpg', '/images/packages/photography-3.jpg'],
    is_featured: true,
    discount_percent: 0,
    is_active: true,
    itinerary: [
      { day_number: 1, title: 'Arrive Nairobi', description: 'Arrive in Nairobi, equipment check with photo guide, evening briefing and route planning.', activities: ['Airport pickup', 'Equipment check', 'Evening briefing session'], accommodation: 'Nairobi Serena Hotel', meals_included: ['Dinner'] },
      { day_number: 2, title: 'Nairobi to Amboseli', description: 'Drive to Amboseli. Afternoon elephant photography session with Kilimanjaro as backdrop.', activities: ['Drive to Amboseli', 'Afternoon elephant photography', 'Golden hour shoot'], accommodation: 'Amboseli Serena Safari Lodge', meals_included: ['Breakfast', 'Lunch', 'Dinner'] },
      { day_number: 3, title: 'Full Day Amboseli', description: 'Pre-dawn Kilimanjaro sunrise shoot. Full day photography focusing on elephants and savanna birds.', activities: ['Pre-dawn Kilimanjaro sunrise', 'Morning golden hour drive', 'Afternoon game drive', 'Evening image review'], accommodation: 'Amboseli Serena Safari Lodge', meals_included: ['Breakfast', 'Lunch', 'Dinner'] },
      { day_number: 4, title: 'Amboseli to Lake Nakuru', description: 'Drive to Lake Nakuru. Afternoon flamingo and rhino photography session.', activities: ['Drive to Nakuru', 'Flamingo photography', 'Rhino tracking', 'Leopard in trees'], accommodation: 'Lake Nakuru Lodge', meals_included: ['Breakfast', 'Lunch', 'Dinner'] },
      { day_number: 5, title: 'Full Day Nakuru', description: 'Full day at Lake Nakuru. Evening image review and editing session with guide.', activities: ['Full day Nakuru photography', 'Waterfall location shoot', 'Evening image review'], accommodation: 'Lake Nakuru Lodge', meals_included: ['Breakfast', 'Lunch', 'Dinner'] },
      { day_number: 6, title: 'Nakuru to Masai Mara', description: 'Drive to Masai Mara. Afternoon game drive focusing on predators.', activities: ['Drive to Masai Mara', 'Afternoon predator drive', 'Sunset photography'], accommodation: 'Mara Serena Safari Lodge', meals_included: ['Breakfast', 'Lunch', 'Dinner'] },
      { day_number: 7, title: 'Full Day Mara Photography', description: 'Full day Mara photography focusing on predators and migration action.', activities: ['Pre-dawn cheetah tracking', 'Migration photography', 'Predator action shots', 'Evening image review'], accommodation: 'Mara Serena Safari Lodge', meals_included: ['Breakfast', 'Lunch', 'Dinner'] },
      { day_number: 8, title: 'Final Morning & Departure', description: 'Final golden hour game drive, drive back to Nairobi, airport transfer for departure.', activities: ['Final morning game drive', 'Drive to Nairobi', 'Airport transfer'], accommodation: 'N/A', meals_included: ['Breakfast'] },
    ],
  },
];

const reviews = [
  { user_id: 'sample_uid_1', user_name: 'Li Wei', nationality: '🇨🇳', package_slug: 'masai-mara-adventure', package_name: 'Masai Mara Adventure', rating: 5, title: 'Life-changing experience!', body: 'We witnessed three river crossings in one day. The guide knew exactly where to position us. Absolutely unforgettable. The balloon ride at sunrise was magical.', is_verified: true, is_visible: true, travel_date: '2024-08-15' },
  { user_id: 'sample_uid_2', user_name: 'Amina Wanjiku', nationality: '🇰🇪', package_slug: 'samburu-safari', package_name: 'Samburu Safari', rating: 5, title: 'Hidden gem of Kenya!', body: 'Samburu is underrated compared to the Mara, but it\'s absolutely stunning. Saw the Grevy\'s zebra on day one. The camp was luxurious and the guides were incredible.', is_verified: true, is_visible: true, travel_date: '2024-09-10' },
  { user_id: 'sample_uid_3', user_name: 'James Harrison', nationality: '🇬🇧', package_slug: 'photography-safari', package_name: 'Photography Safari', rating: 5, title: 'Best photography trip of my life', body: 'The dedicated photo vehicle and expert guide made all the difference. Got shots I\'ve been dreaming about for years — elephants with Kilimanjaro at dawn, cheetah in action. Worth every penny.', is_verified: true, is_visible: true, travel_date: '2024-07-20' },
  { user_id: 'sample_uid_4', user_name: 'Mei Ling', nationality: '🇨🇳', package_slug: 'cultural-immersion-tour', package_name: 'Cultural Immersion Tour', rating: 4, title: 'Truly authentic Kenya', body: 'The Maasai village experience was eye-opening. The cooking class was so fun and the food was amazing. I learned more about Kenya in 4 days than I could have from any book.', is_verified: true, is_visible: true, travel_date: '2024-10-05' },
  { user_id: 'sample_uid_5', user_name: 'Hiroshi Tanaka', nationality: '🇯🇵', package_slug: 'masai-mara-adventure', package_name: 'Masai Mara Adventure', rating: 5, title: 'Exceeded all expectations', body: 'The Great Migration is something every person must see at least once. The wildebeest crossing was chaotic, dramatic and beautiful. Our guide Samuel was phenomenal — very knowledgeable.', is_verified: true, is_visible: true, travel_date: '2024-08-28' },
  { user_id: 'sample_uid_6', user_name: 'Sarah Johnson', nationality: '🇺🇸', package_slug: 'samburu-safari', package_name: 'Samburu Safari', rating: 4, title: 'Wonderful hidden safari gem', body: 'We chose Samburu over the Mara because of the exclusive feel and we were not disappointed. Saw all the Samburu Special Five plus lions! The camp on the Ewaso River was stunning.', is_verified: false, is_visible: true, travel_date: '2024-11-12' },
];

async function seed() {
  console.log('🌍 Starting Sight Seekers Firestore seed...\n');

  // Seed packages + itineraries
  const packageIds = {};
  for (const pkg of packages) {
    const { itinerary, ...packageData } = pkg;
    const docRef = await db.collection('packages').add({
      ...packageData,
      created_at: FieldValue.serverTimestamp(),
    });
    packageIds[pkg.slug] = docRef.id;
    console.log(`✅ Package created: ${pkg.name} (${docRef.id})`);

    // Seed itinerary subcollection
    for (const day of itinerary) {
      await db.collection('packages').doc(docRef.id).collection('itinerary').add({
        ...day,
        created_at: FieldValue.serverTimestamp(),
      });
    }
    console.log(`   📅 ${itinerary.length} itinerary days added`);
  }

  // Seed reviews
  for (const review of reviews) {
    const { package_slug, ...reviewData } = review;
    const packageId = packageIds[package_slug] || 'unknown';
    await db.collection('reviews').add({
      ...reviewData,
      package_id: packageId,
      created_at: FieldValue.serverTimestamp(),
    });
    console.log(`✅ Review created: ${review.user_name} — ${review.package_name}`);
  }

  // Create admin user
  console.log('\n👤 Creating admin user...');
  let adminUid;
  try {
    const adminUser = await auth.createUser({
      email: 'admin@sightseekers.com',
      password: 'Admin@Safari2024',
      displayName: 'Safari Admin',
    });
    adminUid = adminUser.uid;
    console.log(`✅ Admin user created: ${adminUid}`);
  } catch (err) {
    if (err.code === 'auth/email-already-exists') {
      const existing = await auth.getUserByEmail('admin@sightseekers.com');
      adminUid = existing.uid;
      console.log(`ℹ️  Admin user already exists: ${adminUid}`);
    } else {
      throw err;
    }
  }

  // Set admin custom claim
  await auth.setCustomUserClaims(adminUid, { admin: true });
  console.log('✅ Admin custom claim set: { admin: true }');

  // Create admin Firestore document
  await db.collection('users').doc(adminUid).set({
    email: 'admin@sightseekers.com',
    first_name: 'Safari',
    last_name: 'Admin',
    role: 'admin',
    created_at: FieldValue.serverTimestamp(),
  });
  console.log('✅ Admin Firestore document created');

  console.log('\n🎉 Seeding complete!');
  console.log(`📦 ${packages.length} packages seeded`);
  console.log(`⭐ ${reviews.length} reviews seeded`);
  console.log('👤 1 admin user created');
  process.exit(0);
}

seed().catch((err) => {
  console.error('❌ Seed failed:', err);
  process.exit(1);
});
