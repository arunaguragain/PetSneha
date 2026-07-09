/**
 * SEED FILE 1 of 5 — Pet owners + pets
 * Run: node seeds/01_owners_pets.js
 * Safe to re-run: skips any owner whose email already exists.
 */
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/petsneha';
const User = require('./src/models/user.model.js');
const Pet = require('./src/models/pet.model.js');

const PASSWORD = 'Password@123';

// Each owner + 1-2 pets. Edit names/species/breed freely.
const OWNERS = [
  {
    name: 'Sachin Bhatta', email: 'sachin.bhatta@test.petsneha.com', phone: '9841000001',
    pets: [{ name: 'Tommy', species: 'Dog', breed: 'Mixed Breed', age: 2, weight: 15, colour: 'Brown', gender: 'male', ownedSince: 2024 }],
  },
  {
    name: 'Garima Bhandari', email: 'garima.bhandari@test.petsneha.com', phone: '9841000002',
    pets: [
      { name: 'Bella', species: 'Cat', breed: 'Persian', age: 3, weight: 4, colour: 'White', gender: 'female', ownedSince: 2023 },
      { name: 'Rocky', species: 'Dog', breed: 'German Shepherd', age: 1, weight: 20, colour: 'Black & Tan', gender: 'male', ownedSince: 2025 },
    ],
  },
  {
    name: 'Ashim Lamsal', email: 'ashim.lamsal@test.petsneha.com', phone: '9841000003',
    pets: [{ name: 'Coco', species: 'Dog', breed: 'Shih Tzu', age: 4, weight: 7, colour: 'Cream', gender: 'male', ownedSince: 2022 }],
  },
  {
    name: 'Subidha Pandey', email: 'subidha.pandey@test.petsneha.com', phone: '9841000004',
    pets: [
      { name: 'Whiskers', species: 'Cat', breed: 'Domestic Shorthair', age: 2, weight: 3.5, colour: 'Tabby', gender: 'female', ownedSince: 2024 },
      { name: 'Simba', species: 'Cat', breed: 'Domestic Shorthair', age: 1, weight: 3, colour: 'Orange', gender: 'male', ownedSince: 2025 },
    ],
  },
  {
    name: 'Sidhant Giri', email: 'sidhant.giri@test.petsneha.com', phone: '9841000005',
    pets: [{ name: 'Max', species: 'Dog', breed: 'Labrador', age: 3, weight: 25, colour: 'Golden', gender: 'male', ownedSince: 2023 }],
  },
  {
    name: 'Madhu Sudan', email: 'madhu.sudan@test.petsneha.com', phone: '9841000006',
    pets: [{ name: 'Lucy', species: 'Dog', breed: 'Beagle', age: 2, weight: 12, colour: 'Tricolour', gender: 'female', ownedSince: 2024 }],
  },
];

async function run() {
  console.log('Connecting to', MONGO_URI);
  await mongoose.connect(MONGO_URI);
  console.log('Connected.');

  const hashedPw = await bcrypt.hash(PASSWORD, 12);

  for (const o of OWNERS) {
    let user = await User.findOne({ email: o.email });
    if (user) {
      console.log(`- ${o.name} already exists, skipping user creation.`);
    } else {
      user = await User.create({ name: o.name, email: o.email, password: hashedPw, role: 'petOwner', phone: o.phone });
      console.log(`+ Created owner: ${o.name} (${o.email})`);
    }

    for (const p of o.pets) {
      const existingPet = await Pet.findOne({ ownerId: user._id, name: p.name });
      if (existingPet) {
        console.log(`  - Pet "${p.name}" already exists for ${o.name}, skipping.`);
        continue;
      }
      await Pet.create({ ownerId: user._id, ...p });
      console.log(`  + Created pet "${p.name}" (${p.species}) for ${o.name}`);
    }
  }

  console.log('\n=== FILE 1 COMPLETE ===');
  console.log(`All new owner accounts use password: ${PASSWORD}`);
  await mongoose.disconnect();
}

run().catch((err) => {
  console.error('Seed failed:', err);
  mongoose.disconnect();
});