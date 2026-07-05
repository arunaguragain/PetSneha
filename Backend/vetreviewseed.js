/**
 * SEED FILE 3 of 5 — More vets (verified + pending) + reviews
 * Run AFTER files 1-2. Run: node seeds/03_vets_reviews.js
 */
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/petsneha';
const User = require('./src/models/user.model.js');
const Vet = require('./src/models/vet.model.js');

const PASSWORD = 'Password@123';

const NEW_VETS = [
  {
    email: 'vet.pandey@test.petsneha.com', name: 'Dr. Sunita Pandey', specialisation: 'Canine Orthopedics',
    clinicName: 'Pandey Orthopedic Vet Clinic', location: 'Chabahil, Kathmandu', licenseNumber: 'NMC 4102',
    yearsExperience: 9, consultationFee: 950,
    availability: { days: ['Mon', 'Wed', 'Fri', 'Sat'], openTime: '10:00', closeTime: '18:00', is24Hours: false },
    isVerified: true, isOpenNow: true, bio: 'Specialist in canine joint and bone health, orthopedic surgery.',
    profilePhoto: 'https://images.unsplash.com/photo-1612531386530-97286d97c2d2?w=400',
  },
  {
    email: 'vet.gurung.pending@test.petsneha.com', name: 'Dr. Nabin Gurung', specialisation: 'General Practice',
    clinicName: 'Gurung Family Vet Care', location: 'Balaju, Kathmandu', licenseNumber: 'NMC 4210',
    yearsExperience: 2, consultationFee: 500,
    availability: { days: ['Tue', 'Thu', 'Sat'], openTime: '09:00', closeTime: '15:00', is24Hours: false },
    isVerified: false, isOpenNow: false, bio: 'Recently licensed general practice vet. Awaiting admin verification.',
    profilePhoto: 'https://images.unsplash.com/photo-1537368910025-700350fe46c7?w=400',
  },
];

// [reviewerEmail, vetName-to-find, rating, comment]
const REVIEWS = [
  ['sachin.bhatta@test.petsneha.com', 'Dr. Binod Thapa', 5, 'Very thorough with Tommy, explained everything clearly.'],
  ['garima.bhandari@test.petsneha.com', 'Dr. Binod Thapa', 4, 'Good experience overall, slight wait time.'],
  ['ashim.lamsal@test.petsneha.com', 'Dr. Anita Rai', 5, 'Excellent surgeon, Coco recovered quickly.'],
  ['subidha.pandey@test.petsneha.com', 'Dr. Ramesh Sharma', 4, 'Professional and gentle with a nervous cat.'],
  ['sidhant.giri@test.petsneha.com', 'Dr. Sunita Karki', 5, 'Best exotic vet in Kathmandu, highly recommend.'],
  ['madhu.sudan@test.petsneha.com', 'Dr. Binod Thapa', 5, 'Lucy loves visiting this clinic, very caring staff.'],
  ['guragainaruna@gmail.com', 'Dr. Binod Thapa', 5, 'Buddy and Mimi are always well taken care of here.'],
  ['guragainaruna@gmail.com', 'Dr. Sunita Pandey', 4, 'Great with orthopedic concerns, a bit pricey.'],
];

async function run() {
  console.log('Connecting to', MONGO_URI);
  await mongoose.connect(MONGO_URI);
  console.log('Connected.');

  const hashedPw = await bcrypt.hash(PASSWORD, 12);

  // ── Create the 2 new vets ─────────────────────────────
  for (const v of NEW_VETS) {
    let user = await User.findOne({ email: v.email });
    if (!user) {
      user = await User.create({ name: v.name, email: v.email, password: hashedPw, role: 'vet', phone: '98' + Math.floor(10000000 + Math.random() * 9999999) });
      console.log(`+ Created vet user: ${v.name}`);
    }
    const existingVet = await Vet.findOne({ userId: user._id });
    if (existingVet) {
      console.log(`  - Vet profile for ${v.name} already exists, skipping.`);
      continue;
    }
    await Vet.create({
      userId: user._id, name: v.name, specialisation: v.specialisation, clinicName: v.clinicName,
      location: v.location, licenseNumber: v.licenseNumber, yearsExperience: v.yearsExperience,
      consultationFee: v.consultationFee, availability: v.availability, isVerified: v.isVerified,
      isOpenNow: v.isOpenNow, bio: v.bio, profilePhoto: v.profilePhoto,
    });
    console.log(`  + Created vet profile for ${v.name} (${v.isVerified ? 'VERIFIED' : 'PENDING approval'})`);
  }

  // ── Reviews ────────────────────────────────────────────
  let reviewCount = 0;
  for (const [reviewerEmail, vetName, rating, comment] of REVIEWS) {
    const reviewer = await User.findOne({ email: reviewerEmail });
    const vet = await Vet.findOne({ name: vetName });
    if (!reviewer) { console.warn(`  ! Reviewer ${reviewerEmail} not found, skipping.`); continue; }
    if (!vet) { console.warn(`  ! Vet "${vetName}" not found, skipping.`); continue; }

    const alreadyReviewed = vet.reviews.some((r) => String(r.authorId) === String(reviewer._id) && r.comment === comment);
    if (alreadyReviewed) continue;

    vet.reviews.push({ authorId: reviewer._id, rating, comment });
    vet.reviewCount = vet.reviews.length;
    vet.rating = Number((vet.reviews.reduce((sum, r) => sum + r.rating, 0) / vet.reviews.length).toFixed(2));
    await vet.save();
    reviewCount++;
  }
  console.log(`Created ${reviewCount} reviews across vets.`);

  console.log('\n=== FILE 3 COMPLETE ===');
  console.log(`New vet accounts use password: ${PASSWORD}`);
  console.log('  Dr. Sunita Pandey (VERIFIED): vet.pandey@test.petsneha.com');
  console.log('  Dr. Nabin Gurung (PENDING - test admin approval): vet.gurung.pending@test.petsneha.com');
  await mongoose.disconnect();
}

run().catch((err) => {
  console.error('Seed failed:', err);
  mongoose.disconnect();
});