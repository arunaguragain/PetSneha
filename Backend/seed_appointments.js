const mongoose = require('mongoose');
const User = require('./src/models/user.model');
const Pet = require('./src/models/pet.model');
const Vet = require('./src/models/vet.model');
const Appointment = require('./src/models/appointment.model');
require('dotenv').config();

const seedAppointments = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('Connected to MongoDB');

    // Find Dr. Binod
    const drBinod = await Vet.findOne({ name: { $regex: /binod/i } });
    if (!drBinod) {
      console.error('Dr. Binod not found!');
      process.exit(1);
    }
    console.log('Found Dr. Binod:', drBinod.name);

    // Get some users with pets
    const users = await User.find({ role: 'petOwner' }).limit(5);
    if (users.length === 0) {
      console.error('No pet owners found!');
      process.exit(1);
    }

    const today = new Date('2026-07-09');
    const endDate = new Date('2026-07-31');

    const appointmentsToCreate = [];

    const availableTimeSlots = [
      '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
      '13:00', '13:30', '14:00', '14:30', '15:00', '15:30'
    ];

    for (let d = new Date(today); d <= endDate; d.setDate(d.getDate() + 1)) {
      // Create 2-3 appointments per day
      const numAppointments = Math.floor(Math.random() * 2) + 2;
      const usedSlots = new Set();
      const usedUsers = new Set();

      for (let i = 0; i < numAppointments; i++) {
        // Pick a random user who hasn't been used today yet
        const availableUsers = users.filter(u => !usedUsers.has(u._id.toString()));
        if (availableUsers.length === 0) break;

        const randomUser = availableUsers[Math.floor(Math.random() * availableUsers.length)];
        usedUsers.add(randomUser._id.toString());

        // Find a pet for this user
        const pet = await Pet.findOne({ ownerId: randomUser._id });
        if (!pet) continue;

        // Pick a random time slot that hasn't been used today
        let randomSlot;
        do {
          randomSlot = availableTimeSlots[Math.floor(Math.random() * availableTimeSlots.length)];
        } while (usedSlots.has(randomSlot));
        usedSlots.add(randomSlot);

        appointmentsToCreate.push({
          petOwnerId: randomUser._id,
          vetId: drBinod._id,
          petId: pet._id,
          date: new Date(d),
          timeSlot: randomSlot,
          status: 'pending',
          fee: drBinod.consultationFee || 500
        });
      }
    }

    console.log(`Creating ${appointmentsToCreate.length} appointments...`);
    await Appointment.insertMany(appointmentsToCreate);
    console.log('Successfully seeded appointments!');
    
  } catch (err) {
    console.error('Error seeding appointments:', err);
  } finally {
    mongoose.connection.close();
  }
};

seedAppointments();
