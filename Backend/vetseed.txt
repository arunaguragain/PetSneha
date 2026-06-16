const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/petsneha';

const User = require('./src/models/user.model.js');
const Vet = require('./src/models/vet.model.js');

const mockVets = [
  {
    user: {
      name: "Dr. Anita Rai",
      email: "anita.rai@petsneha.com",
      password: "password123",
      role: "vet",
      phone: "9841234567",
      profilePhoto: "/Dr. Anita Rai.png"
    },
    vet: {
      name: "Dr. Anita Rai",
      specialisation: "Veterinary Surgery & Canine Specialist",
      clinicName: "Gokarna Animal Clinic",
      location: "Gokarna, Kathmandu",
      licenseNumber: "NMC 4812",
      yearsExperience: 8,
      consultationFee: 600,
      availability: {
        days: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
        openTime: '09:00',
        closeTime: '17:00',
        is24Hours: false
      },
      isVerified: true,
      isOpenNow: true,
      rating: 4.8,
      reviewCount: 12,
      bio: "Dr. Anita Rai has been practicing veterinary surgery in Kathmandu for over 8 years. She is dedicated to small animal wellness and advanced canine treatments.",
      profilePhoto: "/Dr. Anita Rai.png"
    }
  },
  {
    user: {
      name: "Dr. Binod Thapa",
      email: "binod.thapa@petsneha.com",
      password: "password123",
      role: "vet",
      phone: "9841345678",
      profilePhoto: "/Dr. Binod Thapa.png"
    },
    vet: {
      name: "Dr. Binod Thapa",
      specialisation: "Feline Medicine & Diagnostics",
      clinicName: "Kathmandu Veterinary Hospital",
      location: "Tripureshwar, Kathmandu",
      licenseNumber: "NMC 3519",
      yearsExperience: 12,
      consultationFee: 800,
      availability: {
        days: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu'],
        openTime: '08:00',
        closeTime: '18:00',
        is24Hours: false
      },
      isVerified: true,
      isOpenNow: true,
      rating: 4.9,
      reviewCount: 25,
      bio: "With a decade-long focus on feline health and internal medicine, Dr. Thapa is passionate about diagnostic imaging and preventative care.",
      profilePhoto: "/Dr. Binod Thapa.png"
    }
  },
  {
    user: {
      name: "Dr. Ramesh Sharma",
      email: "ramesh.sharma@petsneha.com",
      password: "password123",
      role: "vet",
      phone: "9841456789",
      profilePhoto: "/Dr. Ramesh Sharma.png"
    },
    vet: {
      name: "Dr. Ramesh Sharma",
      specialisation: "General Veterinary Medicine",
      clinicName: "Lalitpur Pet Clinic",
      location: "Jawalakhel, Lalitpur",
      licenseNumber: "NMC 2911",
      yearsExperience: 6,
      consultationFee: 500,
      availability: {
        days: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
        openTime: '10:00',
        closeTime: '19:00',
        is24Hours: false
      },
      isVerified: true,
      isOpenNow: true,
      rating: 4.7,
      reviewCount: 15,
      bio: "Dr. Ramesh Sharma provides comprehensive health checkups, vaccination counseling, and general medical care for both dogs and cats.",
      profilePhoto: "/Dr. Ramesh Sharma.png"
    }
  },
  {
    user: {
      name: "Dr. Sunita Karki",
      email: "sunita.karki@petsneha.com",
      password: "password123",
      role: "vet",
      phone: "9841567890",
      profilePhoto: "/Dr. Sunita Karki.png"
    },
    vet: {
      name: "Dr. Sunita Karki",
      specialisation: "Avian & Exotic Animal Medicine",
      clinicName: "Exotic Pet Care Centre",
      location: "Maharajgunj, Kathmandu",
      licenseNumber: "NMC 5092",
      yearsExperience: 5,
      consultationFee: 700,
      availability: {
        days: ['Sun', 'Mon', 'Wed', 'Thu', 'Fri'],
        openTime: '09:00',
        closeTime: '16:00',
        is24Hours: false
      },
      isVerified: true,
      isOpenNow: false,
      rating: 4.8,
      reviewCount: 9,
      bio: "Dr. Sunita Karki specialises in birds, reptiles, rodents, and other exotic pets, offering specialized care tailored to unique animal species.",
      profilePhoto: "/Dr. Sunita Karki.png"
    }
  }
];

async function seed() {
  try {
    console.log('Connecting to database:', MONGO_URI);
    await mongoose.connect(MONGO_URI);
    console.log('Connected to MongoDB!');

    const emails = mockVets.map(mv => mv.user.email);
    const licenses = mockVets.map(mv => mv.vet.licenseNumber);

    console.log('Cleaning up existing mock vets...');
    await User.deleteMany({ email: { $in: emails } });
    await Vet.deleteMany({ licenseNumber: { $in: licenses } });

    for (const data of mockVets) {
      console.log(`Seeding user: ${data.user.name}...`);
      const hashedPassword = await bcrypt.hash(data.user.password, 12);
      
      const userDoc = new User({
        ...data.user,
        password: hashedPassword
      });
      await userDoc.save();

      console.log(`Seeding vet profile for: ${data.vet.name}...`);
      const vetDoc = new Vet({
        ...data.vet,
        userId: userDoc._id
      });
      await vetDoc.save();
    }

    console.log('Successfully seeded mock vet profiles!');
  } catch (error) {
    console.error('Error seeding database:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB.');
  }
}

seed();
