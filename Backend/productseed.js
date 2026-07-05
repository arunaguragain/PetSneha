/**
 * SEED FILE 4 of 5 — Products (30+), across all vets as sellers
 * Run AFTER files 1-3. Run: node seeds/04_products.js
 */
const mongoose = require('mongoose');
require('dotenv').config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/petsneha';
const User = require('./src/models/user.model.js');
const Vet = require('./src/models/vet.model.js');
const Product = require('./src/models/product.model.js');

// All vets who might sell products — resolved by name/email below.
const VET_IDENTIFIERS = [
  { byEmail: 'guragainaruna2060@gmail.com' }, // Dr. Binod Thapa
  { byName: 'Dr. Anita Rai' },
  { byName: 'Dr. Ramesh Sharma' },
  { byName: 'Dr. Sunita Karki' },
  { byName: 'Dr. Sunita Pandey' },       // from file 3, verified
  { byName: 'Dr. Nabin Gurung' },        // from file 3, pending
];

const PRODUCTS = [
  { name: 'Premium Dog Dry Food 10kg', category: 'food', petType: ['dog'], price: 3200, stock: 40, img: 'photo-1568640347023-a616a30bc3bd' },
  { name: 'Grain-Free Cat Food 5kg', category: 'food', petType: ['cat'], price: 2400, stock: 35, img: 'photo-1589924691995-400dc9ecc119' },
  { name: 'Puppy Starter Formula 3kg', category: 'food', petType: ['dog'], price: 1500, stock: 25, img: 'photo-1589924691995-400dc9ecc119' },
  { name: 'Senior Dog Joint Care Food', category: 'food', petType: ['dog'], price: 3600, stock: 18, img: 'photo-1568640347023-a616a30bc3bd' },
  { name: 'Kitten Wet Food Variety Pack', category: 'food', petType: ['cat'], price: 1200, stock: 50, img: 'photo-1589924691995-400dc9ecc119' },
  { name: 'Rabbit Pellet Feed 2kg', category: 'food', petType: ['rabbit'], price: 800, stock: 20, img: 'photo-1585110396000-c9ffd4e4b308' },
  { name: 'Bird Seed Mix 1kg', category: 'food', petType: ['bird'], price: 450, stock: 30, img: 'photo-1520808663317-647b476a81b9' },
  { name: 'Dog Training Treats 500g', category: 'food', petType: ['dog'], price: 650, stock: 60, img: 'photo-1568640347023-a616a30bc3bd' },
  { name: 'Adjustable Nylon Dog Collar', category: 'accessories', petType: ['dog'], price: 450, stock: 45, img: 'photo-1601758228041-f3b2795255f1' },
  { name: 'Retractable Dog Leash 5m', category: 'accessories', petType: ['dog'], price: 900, stock: 30, img: 'photo-1601758228041-f3b2795255f1' },
  { name: 'Cat Scratching Post', category: 'accessories', petType: ['cat'], price: 2200, stock: 15, img: 'photo-1571566882372-1598d88abd90' },
  { name: 'Cat Litter Box with Scoop', category: 'accessories', petType: ['cat'], price: 1800, stock: 15, img: 'photo-1571566882372-1598d88abd90' },
  { name: 'Ceramic Pet Food Bowl Set', category: 'accessories', petType: ['dog', 'cat'], price: 700, stock: 40, img: 'photo-1601758064135-c1949513c1f3' },
  { name: 'Interactive Cat Toy Wand', category: 'accessories', petType: ['cat'], price: 350, stock: 55, img: 'photo-1571566882372-1598d88abd90' },
  { name: 'Dog Chew Rope Toy Set', category: 'accessories', petType: ['dog'], price: 500, stock: 40, img: 'photo-1601758228041-f3b2795255f1' },
  { name: 'Bird Cage - Medium', category: 'shelter', petType: ['bird'], price: 2500, stock: 6, img: 'photo-1520808663317-647b476a81b9' },
  { name: 'Cozy Dog Bed - Large', category: 'shelter', petType: ['dog'], price: 2800, stock: 12, img: 'photo-1601758064135-c1949513c1f3' },
  { name: 'Cat Cave Bed - Soft Plush', category: 'shelter', petType: ['cat'], price: 1600, stock: 18, img: 'photo-1571566882372-1598d88abd90' },
  { name: 'Rabbit Hutch - Outdoor', category: 'shelter', petType: ['rabbit'], price: 4500, stock: 5, img: 'photo-1585110396000-c9ffd4e4b308' },
  { name: 'Portable Pet Travel Carrier', category: 'shelter', petType: ['dog', 'cat'], price: 2100, stock: 20, img: 'photo-1601758064135-c1949513c1f3' },
  { name: 'Pet Shampoo - Oatmeal Formula', category: 'bodycare', petType: ['dog', 'cat'], price: 550, stock: 45, img: 'photo-1601979031925-424e53b6caaa' },
  { name: 'Flea & Tick Treatment Drops', category: 'bodycare', petType: ['dog', 'cat'], price: 1200, stock: 30, img: 'photo-1601979031925-424e53b6caaa' },
  { name: 'Dog Nail Clipper Set', category: 'bodycare', petType: ['dog'], price: 400, stock: 35, img: 'photo-1601979031925-424e53b6caaa' },
  { name: 'Deshedding Brush - Dual Sided', category: 'bodycare', petType: ['dog', 'cat'], price: 650, stock: 40, img: 'photo-1601979031925-424e53b6caaa' },
  { name: 'Ear Cleaning Solution 100ml', category: 'bodycare', petType: ['dog', 'cat'], price: 380, stock: 40, img: 'photo-1601979031925-424e53b6caaa' },
  { name: 'Dental Chew Sticks Pack', category: 'bodycare', petType: ['dog'], price: 550, stock: 50, img: 'photo-1601979031925-424e53b6caaa' },
  { name: 'Puppy Training Pads (50pk)', category: 'wastemanagement', petType: ['dog'], price: 900, stock: 40, img: 'photo-1601758064135-c1949513c1f3' },
  { name: 'Clumping Cat Litter 10kg', category: 'wastemanagement', petType: ['cat'], price: 1100, stock: 35, img: 'photo-1571566882372-1598d88abd90' },
  { name: 'Biodegradable Poop Bags (200pk)', category: 'wastemanagement', petType: ['dog'], price: 350, stock: 60, img: 'photo-1601758228041-f3b2795255f1' },
  { name: 'Odour Control Litter Deodorizer', category: 'wastemanagement', petType: ['cat'], price: 400, stock: 30, img: 'photo-1571566882372-1598d88abd90' },
  { name: 'Small Animal Bedding 5L', category: 'wastemanagement', petType: ['rabbit'], price: 500, stock: 25, img: 'photo-1585110396000-c9ffd4e4b308' },
  { name: 'Bird Cage Liner Paper (30pk)', category: 'wastemanagement', petType: ['bird'], price: 300, stock: 30, img: 'photo-1520808663317-647b476a81b9' },
];

async function resolveVets() {
  const vets = [];
  for (const id of VET_IDENTIFIERS) {
    let vet;
    if (id.byEmail) {
      const user = await User.findOne({ email: id.byEmail });
      if (user) vet = await Vet.findOne({ userId: user._id });
    } else {
      vet = await Vet.findOne({ name: id.byName });
    }
    if (vet) vets.push(vet);
    else console.warn(`  ! Could not resolve vet ${id.byEmail || id.byName} — skipping as a seller.`);
  }
  return vets;
}

async function run() {
  console.log('Connecting to', MONGO_URI);
  await mongoose.connect(MONGO_URI);
  console.log('Connected.');

  const vets = await resolveVets();
  if (!vets.length) throw new Error('No vets resolved — run files 1-3 first.');
  console.log(`Resolved ${vets.length} vet(s) as potential sellers.`);

  let created = 0;
  for (let i = 0; i < PRODUCTS.length; i++) {
    const p = PRODUCTS[i];
    const seller = vets[i % vets.length]; // round-robin across all resolved vets
    const exists = await Product.findOne({ name: p.name, sellerId: seller.userId });
    if (exists) continue;

    // ~15% of products marked pending approval regardless of seller's own vet-verification status
    const isVerifiedSeller = (i % 7 !== 0);

    await Product.create({
      name: p.name,
      description: `${p.name} — quality product suitable for ${p.petType.join(' and ')} owners, sold by ${seller.name}.`,
      price: p.price,
      category: p.category,
      petType: p.petType,
      images: [`https://images.unsplash.com/${p.img}?w=800`],
      stock: p.stock,
      isVerifiedSeller,
      sellerId: seller.userId,
    });
    created++;
  }

  console.log(`Created ${created} products across ${vets.length} sellers.`);
  console.log('\n=== FILE 4 COMPLETE ===');
  await mongoose.disconnect();
}

run().catch((err) => {
  console.error('Seed failed:', err);
  mongoose.disconnect();
});