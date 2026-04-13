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
const FieldValue = admin.firestore.FieldValue;

const NEW_PACKAGES = [
  // ─── 1A. LOW BUDGET — LOW SEASON ───────────────────────────────────
  {
    name: 'Low Budget Safari — Low Season',
    slug: 'low-budget-safari-low-season',
    country: 'Kenya',
    tour_type: 'Wildlife',
    short_description: '5 days through Lake Naivasha & Maasai Mara on a budget. Best value for the ultimate Kenyan safari experience.',
    description: 'Experience the magic of Kenya without breaking the bank. This 5-day low season safari takes you from Nairobi to the serene Lake Naivasha before heading into the legendary Maasai Mara for two full days of game drives. Shared transport, budget camps, and an expert guide ensure a genuine safari at an unbeatable price.',
    price_per_person: 950,
    duration_days: 5,
    max_travelers: 8,
    discount_percent: 0,
    is_featured: false,
    is_active: true,
    highlights: [
      'Boat safari on Lake Naivasha',
      'Crescent Island walking safari',
      '2 full game drives in Maasai Mara',
      'Spot the Big Five',
      'Budget camp under the stars',
    ],
    includes: [
      'Park fees',
      'Shared safari van transport',
      'Budget camp accommodation',
      'All meals (breakfast, lunch, dinner)',
      'Guided game drives',
      'Drinking water',
      'Basic travel insurance',
    ],
    excludes: [
      'International flights',
      'Visa fees',
      'Personal spending money',
      'Tips & gratuities',
      'Optional balloon safari',
    ],
    itinerary: [
      { day_number: 1, title: 'Nairobi → Lake Naivasha', description: 'Transfer from Nairobi to Lake Naivasha. Afternoon boat safari and Crescent Island walking safari among giraffes and zebras.', activities: ['Boat safari', 'Crescent Island walk', 'Sundowner by the lake'], accommodation: 'Budget camp, Lake Naivasha', meals: { breakfast: false, lunch: true, dinner: true } },
      { day_number: 2, title: 'Naivasha → Maasai Mara', description: 'Early morning drive to the Maasai Mara. Afternoon game drive exploring the open savannah.', activities: ['Transfer to Mara', 'Afternoon game drive', 'Sundowner'], accommodation: 'Budget camp, Maasai Mara', meals: { breakfast: true, lunch: true, dinner: true } },
      { day_number: 3, title: 'Full Day in Maasai Mara', description: 'Full day game drive in the Mara. Track lions, elephants, cheetahs, and the famous wildebeest crossing.', activities: ['Morning game drive', 'Packed lunch in the bush', 'Afternoon game drive'], accommodation: 'Budget camp, Maasai Mara', meals: { breakfast: true, lunch: true, dinner: true } },
      { day_number: 4, title: 'Maasai Mara — Final Game Drive', description: 'Early morning game drive at golden hour — the best time to spot predators. Afternoon at leisure in camp.', activities: ['Dawn game drive', 'Camp leisure', 'Cultural village visit'], accommodation: 'Budget camp, Maasai Mara', meals: { breakfast: true, lunch: true, dinner: true } },
      { day_number: 5, title: 'Return to Nairobi', description: 'Breakfast at camp, then transfer back to Nairobi. Drop-off at hotel or airport.', activities: ['Breakfast', 'Scenic drive back to Nairobi', 'Airport/hotel drop-off'], accommodation: '', meals: { breakfast: true, lunch: false, dinner: false } },
    ],
  },

  // ─── 1B. LOW BUDGET — HIGH SEASON ──────────────────────────────────
  {
    name: 'Low Budget Safari — High Season',
    slug: 'low-budget-safari-high-season',
    country: 'Kenya',
    tour_type: 'Wildlife',
    short_description: '5 days Lake Naivasha & Maasai Mara during peak season. Witness the Great Wildebeest Migration at its most dramatic.',
    description: 'Same iconic route as the low season safari — Lake Naivasha and Maasai Mara — but timed to coincide with the Great Wildebeest Migration. Peak season means higher park fees but also the most spectacular wildlife viewing of the year. Shared transport, budget camps, expert guide.',
    price_per_person: 1250,
    duration_days: 5,
    max_travelers: 8,
    discount_percent: 0,
    is_featured: false,
    is_active: true,
    highlights: [
      'Witness the Great Wildebeest Migration',
      'Boat safari on Lake Naivasha',
      'Crescent Island walking safari',
      '2 full game drives in Maasai Mara',
      'Peak season — maximum wildlife activity',
    ],
    includes: [
      'Park fees (peak season rates)',
      'Shared safari van transport',
      'Budget camp accommodation',
      'All meals (breakfast, lunch, dinner)',
      'Guided game drives',
      'Drinking water',
      'Basic travel insurance',
    ],
    excludes: [
      'International flights',
      'Visa fees',
      'Personal spending money',
      'Tips & gratuities',
      'Optional balloon safari',
    ],
    itinerary: [
      { day_number: 1, title: 'Nairobi → Lake Naivasha', description: 'Transfer from Nairobi to Lake Naivasha. Afternoon boat safari and Crescent Island walk.', activities: ['Boat safari', 'Crescent Island walk', 'Sundowner by the lake'], accommodation: 'Budget camp, Lake Naivasha', meals: { breakfast: false, lunch: true, dinner: true } },
      { day_number: 2, title: 'Naivasha → Maasai Mara', description: 'Drive to the Mara during peak season — the savannah is alive. Afternoon game drive.', activities: ['Transfer to Mara', 'Afternoon game drive'], accommodation: 'Budget camp, Maasai Mara', meals: { breakfast: true, lunch: true, dinner: true } },
      { day_number: 3, title: 'Migration Day — Full Mara', description: 'Full day tracking the wildebeest herds and river crossings. The most dramatic safari experience in Africa.', activities: ['Dawn game drive', 'River crossing watch', 'Afternoon game drive'], accommodation: 'Budget camp, Maasai Mara', meals: { breakfast: true, lunch: true, dinner: true } },
      { day_number: 4, title: 'Maasai Mara — Final Drive', description: 'Morning game drive. Visit a Maasai cultural village in the afternoon.', activities: ['Morning game drive', 'Maasai village visit'], accommodation: 'Budget camp, Maasai Mara', meals: { breakfast: true, lunch: true, dinner: true } },
      { day_number: 5, title: 'Return to Nairobi', description: 'Breakfast and return transfer to Nairobi.', activities: ['Breakfast', 'Return to Nairobi'], accommodation: '', meals: { breakfast: true, lunch: false, dinner: false } },
    ],
  },

  // ─── 2A. MID-RANGE — LOW SEASON ────────────────────────────────────
  {
    name: 'Mid-Range Safari — Low Season',
    slug: 'mid-range-safari-low-season',
    country: 'Kenya',
    tour_type: 'Wildlife',
    short_description: '7 days across Amboseli, Lake Naivasha & Maasai Mara. Mid-range lodges, 4x4 Land Cruiser, cultural immersion.',
    description: 'A 7-day journey through three of Kenya\'s most iconic ecosystems. Start with Amboseli\'s vast elephant herds and views of Mount Kilimanjaro, recover in the tranquil beauty of Lake Naivasha, then finish with the heart of the safari experience — the Maasai Mara. Mid-range lodges, shared Land Cruiser, and a cultural village visit included.',
    price_per_person: 2450,
    duration_days: 7,
    max_travelers: 8,
    discount_percent: 0,
    is_featured: true,
    is_active: true,
    highlights: [
      'Amboseli elephants with Kilimanjaro backdrop',
      'Lake Naivasha boat safari & Crescent Island',
      'Maasai Mara core safari experience',
      'Maasai cultural village visit',
      'Shared 4x4 Land Cruiser',
      'Mid-range lodge accommodation',
    ],
    includes: [
      'Park fees',
      'Shared 4x4 Land Cruiser',
      'Mid-range lodge accommodation',
      'All meals (breakfast, lunch, dinner)',
      'Guided game drives',
      'Cultural village visit',
      'Drinking water',
    ],
    excludes: [
      'International flights',
      'Visa fees',
      'Personal spending money',
      'Tips & gratuities',
      'Optional balloon safari',
      'Alcoholic beverages',
    ],
    itinerary: [
      { day_number: 1, title: 'Nairobi → Amboseli', description: 'Transfer to Amboseli National Park. Afternoon game drive — first views of Kilimanjaro and elephant herds.', activities: ['Transfer to Amboseli', 'Afternoon game drive', 'Sundowner'], accommodation: 'Mid-range lodge, Amboseli', meals: { breakfast: false, lunch: true, dinner: true } },
      { day_number: 2, title: 'Full Day in Amboseli', description: 'Full day exploring Amboseli. Spot the famous big-tusked elephants and Kilimanjaro at sunrise.', activities: ['Dawn game drive', 'Kilimanjaro sunrise view', 'Afternoon game drive'], accommodation: 'Mid-range lodge, Amboseli', meals: { breakfast: true, lunch: true, dinner: true } },
      { day_number: 3, title: 'Amboseli → Lake Naivasha', description: 'Drive to Lake Naivasha through the Great Rift Valley escarpment. Afternoon boat safari.', activities: ['Rift Valley drive', 'Boat safari on Naivasha', 'Hippo watching'], accommodation: 'Mid-range lodge, Lake Naivasha', meals: { breakfast: true, lunch: true, dinner: true } },
      { day_number: 4, title: 'Naivasha → Maasai Mara', description: 'Morning Crescent Island walk, then drive to the Mara. Afternoon game drive.', activities: ['Crescent Island walk', 'Transfer to Mara', 'Afternoon game drive'], accommodation: 'Mid-range lodge, Maasai Mara', meals: { breakfast: true, lunch: true, dinner: true } },
      { day_number: 5, title: 'Full Day in Maasai Mara', description: 'Full day in the Mara. Track lions, cheetahs, and the big herds across the open savannah.', activities: ['Dawn game drive', 'Bush lunch', 'Afternoon game drive'], accommodation: 'Mid-range lodge, Maasai Mara', meals: { breakfast: true, lunch: true, dinner: true } },
      { day_number: 6, title: 'Mara — Cultural Day', description: 'Morning game drive then Maasai cultural village visit. Learn about traditional Maasai life.', activities: ['Morning game drive', 'Maasai village visit', 'Cultural experience'], accommodation: 'Mid-range lodge, Maasai Mara', meals: { breakfast: true, lunch: true, dinner: true } },
      { day_number: 7, title: 'Return to Nairobi', description: 'Final morning in the Mara, then transfer back to Nairobi.', activities: ['Breakfast', 'Return transfer to Nairobi'], accommodation: '', meals: { breakfast: true, lunch: false, dinner: false } },
    ],
  },

  // ─── 2B. MID-RANGE — HIGH SEASON ───────────────────────────────────
  {
    name: 'Mid-Range Safari — High Season',
    slug: 'mid-range-safari-high-season',
    country: 'Kenya',
    tour_type: 'Wildlife',
    short_description: '7 days Amboseli, Naivasha & Maasai Mara during peak season. Migration + elephants + Kilimanjaro — Kenya at its best.',
    description: 'The full mid-range Kenya circuit during high season. Amboseli elephants with Kilimanjaro, Lake Naivasha\'s hippos and flamingos, and the Maasai Mara during the Great Migration. Shared Land Cruiser, mid-range lodges, all meals, and a cultural village visit. Peak season means higher park fees — and unforgettable wildlife.',
    price_per_person: 3150,
    duration_days: 7,
    max_travelers: 8,
    discount_percent: 0,
    is_featured: false,
    is_active: true,
    highlights: [
      'Great Wildebeest Migration in the Mara',
      'Amboseli elephants + Mount Kilimanjaro',
      'Lake Naivasha flamingos & hippos',
      'Maasai cultural village visit',
      'Peak season — maximum wildlife',
      'Shared 4x4 Land Cruiser',
    ],
    includes: [
      'Park fees (peak season rates)',
      'Shared 4x4 Land Cruiser',
      'Mid-range lodge accommodation',
      'All meals (breakfast, lunch, dinner)',
      'Guided game drives',
      'Cultural village visit',
      'Drinking water',
    ],
    excludes: [
      'International flights',
      'Visa fees',
      'Personal spending money',
      'Tips & gratuities',
      'Optional balloon safari',
      'Alcoholic beverages',
    ],
    itinerary: [
      { day_number: 1, title: 'Nairobi → Amboseli', description: 'Transfer to Amboseli. Afternoon game drive with first views of Kilimanjaro.', activities: ['Transfer to Amboseli', 'Afternoon game drive'], accommodation: 'Mid-range lodge, Amboseli', meals: { breakfast: false, lunch: true, dinner: true } },
      { day_number: 2, title: 'Full Day in Amboseli', description: 'Full day with the big-tusked elephants and Kilimanjaro sunrise — one of Africa\'s iconic views.', activities: ['Dawn game drive', 'Kilimanjaro sunrise', 'Afternoon game drive'], accommodation: 'Mid-range lodge, Amboseli', meals: { breakfast: true, lunch: true, dinner: true } },
      { day_number: 3, title: 'Amboseli → Lake Naivasha', description: 'Drive through the Rift Valley to Naivasha. Afternoon boat safari and flamingo viewing.', activities: ['Rift Valley escarpment drive', 'Boat safari', 'Flamingo spotting'], accommodation: 'Mid-range lodge, Lake Naivasha', meals: { breakfast: true, lunch: true, dinner: true } },
      { day_number: 4, title: 'Naivasha → Maasai Mara', description: 'Crescent Island walk then drive to the Mara during peak season. Afternoon game drive.', activities: ['Crescent Island', 'Transfer to Mara', 'Afternoon game drive'], accommodation: 'Mid-range lodge, Maasai Mara', meals: { breakfast: true, lunch: true, dinner: true } },
      { day_number: 5, title: 'Migration Day — Full Mara', description: 'Full day chasing the wildebeest migration and river crossings — the greatest show on earth.', activities: ['Dawn migration tracking', 'River crossing watch', 'Afternoon game drive'], accommodation: 'Mid-range lodge, Maasai Mara', meals: { breakfast: true, lunch: true, dinner: true } },
      { day_number: 6, title: 'Mara — Cultural Day', description: 'Morning game drive and Maasai cultural village experience.', activities: ['Morning game drive', 'Maasai village visit'], accommodation: 'Mid-range lodge, Maasai Mara', meals: { breakfast: true, lunch: true, dinner: true } },
      { day_number: 7, title: 'Return to Nairobi', description: 'Final breakfast in the Mara, then transfer back to Nairobi.', activities: ['Breakfast', 'Return to Nairobi'], accommodation: '', meals: { breakfast: true, lunch: false, dinner: false } },
    ],
  },

  // ─── 3A. LUXURY — LOW SEASON ───────────────────────────────────────
  {
    name: 'Luxury Safari — Low Season',
    slug: 'luxury-safari-low-season',
    country: 'Kenya',
    tour_type: 'Luxury',
    short_description: '8 days fly-in Maasai Mara + Amboseli + Diani Beach. Private Land Cruiser, luxury lodges, domestic flights included.',
    description: 'The pinnacle of the Kenyan safari experience. Fly directly into the Maasai Mara — no long drives — then continue to Amboseli\'s luxury lodge before finishing with white-sand relaxation at Diani Beach. Private Land Cruiser, handpicked luxury camps, all meals and selected drinks, bush dinners, sundowners, and full cultural immersion. This is Kenya done properly.',
    price_per_person: 6200,
    duration_days: 8,
    max_travelers: 6,
    discount_percent: 0,
    is_featured: true,
    is_active: true,
    highlights: [
      'Fly-in directly to Maasai Mara',
      'Amboseli luxury lodge + Kilimanjaro views',
      'Diani Beach coast finish',
      'Private 4x4 Land Cruiser',
      'Bush dinners & sundowners',
      'Cultural immersion experience',
      'All domestic flights included',
    ],
    includes: [
      'All domestic flights (Nairobi–Mara–Amboseli–Diani)',
      'Private 4x4 Land Cruiser',
      'Luxury lodge & camp accommodation',
      'All meals (breakfast, lunch, dinner)',
      'Selected alcoholic & non-alcoholic drinks',
      'Sundowners in the bush',
      'Bush dinner experience',
      'Cultural immersion activities',
      'Park fees',
      'Premium travel insurance',
    ],
    excludes: [
      'International flights',
      'Visa fees',
      'Personal spending money',
      'Tips & gratuities',
      'Spa treatments',
      'Premium spirits',
    ],
    itinerary: [
      { day_number: 1, title: 'Nairobi → Fly to Maasai Mara', description: 'Morning flight from Wilson Airport directly into the heart of the Maasai Mara. Afternoon game drive in your private Land Cruiser. Sundowner in the open savannah.', activities: ['Domestic flight to Mara', 'Private game drive', 'Sundowner in the bush'], accommodation: 'Luxury tented camp, Maasai Mara', meals: { breakfast: false, lunch: true, dinner: true } },
      { day_number: 2, title: 'Full Day — Maasai Mara', description: 'Dawn game drive at golden hour — the best time to find lions and cheetahs. Bush lunch under an acacia tree. Afternoon drive through the vast plains.', activities: ['Dawn private game drive', 'Bush lunch under acacia', 'Afternoon game drive', 'Sundowner'], accommodation: 'Luxury tented camp, Maasai Mara', meals: { breakfast: true, lunch: true, dinner: true } },
      { day_number: 3, title: 'Maasai Mara — Cultural Day', description: 'Morning game drive, then a deep cultural immersion experience with local Maasai. Evening bush dinner under the stars.', activities: ['Morning game drive', 'Maasai cultural immersion', 'Bush dinner under stars'], accommodation: 'Luxury tented camp, Maasai Mara', meals: { breakfast: true, lunch: true, dinner: true } },
      { day_number: 4, title: 'Fly Mara → Amboseli', description: 'Morning game drive then fly to Amboseli. Afternoon arrival and first views of Kilimanjaro. Sundowner at the lodge.', activities: ['Morning game drive', 'Domestic flight to Amboseli', 'Sundowner with Kilimanjaro view'], accommodation: 'Luxury lodge, Amboseli', meals: { breakfast: true, lunch: true, dinner: true } },
      { day_number: 5, title: 'Full Day — Amboseli', description: 'Kilimanjaro at sunrise — one of the world\'s great views. Full day with the big-tusked elephants. Private game drive.', activities: ['Kilimanjaro sunrise game drive', 'Elephant herds tracking', 'Afternoon game drive', 'Sundowner'], accommodation: 'Luxury lodge, Amboseli', meals: { breakfast: true, lunch: true, dinner: true } },
      { day_number: 6, title: 'Amboseli — Leisure & Culture', description: 'Morning at leisure. Optional guided nature walk. Afternoon cultural visit. Final dinner under African skies.', activities: ['Guided bush walk', 'Cultural village visit', 'Leisure time at lodge', 'Farewell dinner'], accommodation: 'Luxury lodge, Amboseli', meals: { breakfast: true, lunch: true, dinner: true } },
      { day_number: 7, title: 'Fly Amboseli → Diani Beach', description: 'Fly to Kenya\'s stunning south coast. Check in to your beachfront property. Afternoon at leisure on the white sand.', activities: ['Domestic flight to Diani', 'Beach arrival', 'Leisure & swimming'], accommodation: 'Luxury beach resort, Diani', meals: { breakfast: true, lunch: true, dinner: true } },
      { day_number: 8, title: 'Diani Beach → Departure', description: 'Final morning on the Indian Ocean. Transfer to Mombasa airport for your departure flight.', activities: ['Beach morning', 'Transfer to Mombasa airport'], accommodation: '', meals: { breakfast: true, lunch: false, dinner: false } },
    ],
  },

  // ─── 3B. LUXURY — HIGH SEASON ──────────────────────────────────────
  {
    name: 'Luxury Safari — High Season',
    slug: 'luxury-safari-high-season',
    country: 'Kenya',
    tour_type: 'Luxury',
    short_description: '8 days fly-in luxury safari during peak season. Migration + Kilimanjaro + Diani Beach. The ultimate Kenyan experience.',
    description: 'The ultimate Kenyan luxury safari, timed for the Great Wildebeest Migration. Fly directly into the Maasai Mara and witness one of nature\'s greatest spectacles from your private Land Cruiser. Continue to Amboseli for elephants and Kilimanjaro before finishing at Diani Beach. Peak season luxury — the very best Kenya has to offer.',
    price_per_person: 8400,
    duration_days: 8,
    max_travelers: 6,
    discount_percent: 0,
    is_featured: true,
    is_active: true,
    highlights: [
      'Great Wildebeest Migration fly-in experience',
      'Private Land Cruiser — exclusively yours',
      'Amboseli elephants + Kilimanjaro at sunrise',
      'Diani Beach luxury coast finish',
      'Bush dinners & sundowners',
      'Peak season — the best wildlife viewing',
      'All domestic flights included',
    ],
    includes: [
      'All domestic flights (Nairobi–Mara–Amboseli–Diani)',
      'Private 4x4 Land Cruiser',
      'Luxury lodge & camp accommodation (peak season)',
      'All meals (breakfast, lunch, dinner)',
      'Selected alcoholic & non-alcoholic drinks',
      'Sundowners in the bush',
      'Bush dinner experience',
      'Cultural immersion activities',
      'Park fees (peak season rates)',
      'Premium travel insurance',
    ],
    excludes: [
      'International flights',
      'Visa fees',
      'Personal spending money',
      'Tips & gratuities',
      'Spa treatments',
      'Premium spirits',
    ],
    itinerary: [
      { day_number: 1, title: 'Nairobi → Fly into Maasai Mara', description: 'Flight into the Mara during peak migration season. First game drive — the plains are teeming with wildebeest. Sundowner in the open savannah.', activities: ['Domestic flight to Mara', 'Private game drive', 'Migration first sighting', 'Sundowner'], accommodation: 'Luxury tented camp, Maasai Mara', meals: { breakfast: false, lunch: true, dinner: true } },
      { day_number: 2, title: 'Migration Day — Full Mara', description: 'Full day tracking the migration. Position at the Mara River for the dramatic wildebeest crossing. Bush lunch in the field.', activities: ['Dawn migration tracking', 'River crossing watch', 'Bush lunch', 'Afternoon game drive'], accommodation: 'Luxury tented camp, Maasai Mara', meals: { breakfast: true, lunch: true, dinner: true } },
      { day_number: 3, title: 'Mara — Predator Day & Culture', description: 'Morning tracking lions and cheetahs. Afternoon Maasai cultural immersion. Evening bush dinner under the stars.', activities: ['Predator tracking', 'Maasai cultural immersion', 'Bush dinner under stars'], accommodation: 'Luxury tented camp, Maasai Mara', meals: { breakfast: true, lunch: true, dinner: true } },
      { day_number: 4, title: 'Fly Mara → Amboseli', description: 'Final morning game drive, then fly to Amboseli. Sundowner with the first views of Kilimanjaro.', activities: ['Morning game drive', 'Domestic flight to Amboseli', 'Sundowner with Kilimanjaro'], accommodation: 'Luxury lodge, Amboseli', meals: { breakfast: true, lunch: true, dinner: true } },
      { day_number: 5, title: 'Amboseli — Elephants & Kilimanjaro', description: 'Kilimanjaro at sunrise — the iconic Africa shot. Full day with Amboseli\'s legendary big-tusked elephant herds.', activities: ['Kilimanjaro sunrise', 'Elephant herds tracking', 'Afternoon game drive', 'Sundowner'], accommodation: 'Luxury lodge, Amboseli', meals: { breakfast: true, lunch: true, dinner: true } },
      { day_number: 6, title: 'Amboseli — Leisure & Culture', description: 'Guided bush walk in the morning. Cultural village visit. Final luxury dinner in Amboseli.', activities: ['Guided bush walk', 'Cultural village visit', 'Farewell dinner'], accommodation: 'Luxury lodge, Amboseli', meals: { breakfast: true, lunch: true, dinner: true } },
      { day_number: 7, title: 'Fly to Diani Beach', description: 'Fly to Kenya\'s famous south coast. White sand, turquoise Indian Ocean. Complete relaxation after an epic safari.', activities: ['Domestic flight to Diani', 'Beach arrival', 'Leisure'], accommodation: 'Luxury beach resort, Diani', meals: { breakfast: true, lunch: true, dinner: true } },
      { day_number: 8, title: 'Diani Beach → Departure', description: 'Final Indian Ocean morning. Transfer to Mombasa airport.', activities: ['Beach morning', 'Transfer to Mombasa airport'], accommodation: '', meals: { breakfast: true, lunch: false, dinner: false } },
    ],
  },
];

async function seedPackages() {
  console.log('🌍 Seeding packages to Firestore...\n');

  // Find and deactivate all existing packages EXCEPT Rand Kenya Safari
  const existing = await db.collection('packages').get();
  const toDeactivate = [];
  existing.forEach((doc) => {
    const data = doc.data();
    const slug = (data.slug || '').toLowerCase();
    const name = (data.name || '').toLowerCase();
    if (!slug.includes('rand-kenya') && !name.includes('rand kenya')) {
      toDeactivate.push(doc.id);
    }
  });

  if (toDeactivate.length > 0) {
    console.log(`🗑  Deactivating ${toDeactivate.length} old package(s)...`);
    await Promise.all(
      toDeactivate.map((id) =>
        db.collection('packages').doc(id).update({ is_active: false })
      )
    );
  }

  // Create new packages
  for (const pkg of NEW_PACKAGES) {
    const { itinerary, ...packageData } = pkg;

    // Check if slug already exists — update if so, create if not
    const existing = await db.collection('packages').where('slug', '==', pkg.slug).get();
    let packageRef;

    if (!existing.empty) {
      packageRef = existing.docs[0].ref;
      await packageRef.update({ ...packageData, updated_at: FieldValue.serverTimestamp() });
      console.log(`✏️  Updated: ${pkg.name}`);
    } else {
      packageRef = await db.collection('packages').add({
        ...packageData,
        created_at: FieldValue.serverTimestamp(),
        updated_at: FieldValue.serverTimestamp(),
      });
      console.log(`✅  Created: ${pkg.name}`);
    }

    // Write itinerary subcollection
    if (itinerary && itinerary.length > 0) {
      const itineraryRef = packageRef.collection('itinerary');
      // Clear existing itinerary
      const existingItinerary = await itineraryRef.get();
      await Promise.all(existingItinerary.docs.map((d) => d.ref.delete()));

      // Add new itinerary days
      await Promise.all(
        itinerary.map((day) =>
          itineraryRef.add({ ...day, created_at: FieldValue.serverTimestamp() })
        )
      );
      console.log(`   📅 Itinerary: ${itinerary.length} days added`);
    }
  }

  console.log('\n🎉 Done! All packages seeded successfully.');
  process.exit(0);
}

seedPackages().catch((err) => {
  console.error('❌ Seed failed:', err);
  process.exit(1);
});
