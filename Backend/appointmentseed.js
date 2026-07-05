/**
 * SEED FILE 2 of 5 — Appointments + health records + reminders
 * Run AFTER file 1. Run: node seeds/02_appointments_records_reminders.js
 *
 * Looks up everything by email/name against your REAL existing database —
 * does not assume fixed IDs. Safe to re-run (skips duplicates by a marker check).
 */
const mongoose = require('mongoose');
require('dotenv').config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/petsneha';
const User = require('./src/models/user.model.js');
const Vet = require('./src/models/vet.model.js');
const Pet = require('./src/models/pet.model.js');
const Appointment = require('./src/models/appointment.model.js');
const HealthRecord = require('./src/models/healthRecord.model.js');
const Reminder = require('./src/models/reminder.model.js');

const TODAY = new Date('2026-07-04'); // matches "today" in the app's context

// Real vets already in your database — looked up by name (adjust if your real names differ)
const OTHER_VET_NAMES = ['Dr. Anita Rai', 'Dr. Ramesh Sharma', 'Dr. Sunita Karki'];

function d(dateStr) {
  return new Date(dateStr);
}

async function findVetByEmail(email) {
  const user = await User.findOne({ email });
  if (!user) return null;
  return Vet.findOne({ userId: user._id });
}

async function findVetByName(name) {
  return Vet.findOne({ name });
}

async function findOwnerPet(email, petName, fallbackSpecies) {
  const user = await User.findOne({ email });
  if (!user) {
    console.warn(`  ! Owner ${email} not found — skipping their pets.`);
    return null;
  }
  let pet = await Pet.findOne({ ownerId: user._id, name: petName });
  if (!pet) {
    console.warn(`  ! Pet "${petName}" not found for ${email} — creating it now.`);
    pet = await Pet.create({ ownerId: user._id, name: petName, species: fallbackSpecies || 'Dog', breed: 'Mixed', age: 2 });
  }
  return { user, pet };
}

async function createAppointmentIfMissing({ petOwnerId, vetId, petId, date, timeSlot, status, fee, notes }) {
  const exists = await Appointment.findOne({ petOwnerId, vetId, petId, date, timeSlot });
  if (exists) return null;
  return Appointment.create({ petOwnerId, vetId, petId, date, timeSlot, status, fee, notes, confirmationEmailSent: true });
}

async function run() {
  console.log('Connecting to', MONGO_URI);
  await mongoose.connect(MONGO_URI);
  console.log('Connected.');

  // ── Resolve vets ──────────────────────────────────────
  const vetBinod = await findVetByEmail('guragainaruna2060@gmail.com');
  if (!vetBinod) throw new Error('Dr. Binod Thapa (guragainaruna2060@gmail.com) not found. Check the email is correct.');

  const otherVets = [];
  for (const name of OTHER_VET_NAMES) {
    const v = await findVetByName(name);
    if (v) otherVets.push(v);
    else console.warn(`  ! Vet "${name}" not found in database — skipping appointments for this vet.`);
  }
  console.log(`Resolved Dr. Binod Thapa + ${otherVets.length} other vet(s).`);

  // ── Resolve your own account + pets ──────────────────
  const myResult = await User.findOne({ email: 'guragainaruna@gmail.com' });
  if (!myResult) throw new Error('Your account guragainaruna@gmail.com was not found.');
  let buddy = await Pet.findOne({ ownerId: myResult._id, name: 'Buddy' });
  let mimi = await Pet.findOne({ ownerId: myResult._id, name: 'Mimi' });
  if (!buddy) { console.warn('  ! Buddy not found — creating it.'); buddy = await Pet.create({ ownerId: myResult._id, name: 'Buddy', species: 'Dog', breed: 'Mixed', age: 2 }); }
  if (!mimi) { console.warn('  ! Mimi not found — creating it.'); mimi = await Pet.create({ ownerId: myResult._id, name: 'Mimi', species: 'Cat', breed: 'Domestic Shorthair', age: 2 }); }

  // ── Resolve file-1 owners' pets ───────────────────────
  const seededOwnerPets = [];
  const seededOwnerEmails = [
    'sachin.bhatta@test.petsneha.com', 'garima.bhandari@test.petsneha.com', 'ashim.lamsal@test.petsneha.com',
    'subidha.pandey@test.petsneha.com', 'sidhant.giri@test.petsneha.com', 'madhu.sudan@test.petsneha.com',
  ];
  for (const email of seededOwnerEmails) {
    const user = await User.findOne({ email });
    if (!user) { console.warn(`  ! Owner ${email} not found — run file 1 first. Skipping.`); continue; }
    const pets = await Pet.find({ ownerId: user._id });
    for (const pet of pets) seededOwnerPets.push({ user, pet });
  }
  console.log(`Resolved ${seededOwnerPets.length} pet(s) from file-1 owners.`);

  // ── APPOINTMENTS: spread April 1 – July 10, 2026 ──────
  // Past dates (before July 4) => completed/cancelled. Upcoming (July 4-10) => pending/confirmed.
  const apptPlan = [
    // [petOwnerEmail-or-null, pet, vet, dateStr, timeSlot, status, fee, notes]
    ...seededOwnerPets.map((entry, i) => {
      const dates = ['2026-04-05', '2026-04-20', '2026-05-10', '2026-05-25', '2026-06-08', '2026-06-22', '2026-07-06', '2026-07-09'];
      const dateStr = dates[i % dates.length];
      const isPast = new Date(dateStr) < TODAY;
      const status = isPast ? (i % 4 === 0 ? 'cancelled' : 'completed') : (i % 2 === 0 ? 'pending' : 'confirmed');
      const vet = i % 3 === 0 && otherVets.length ? otherVets[i % otherVets.length] : vetBinod;
      return { user: entry.user, pet: entry.pet, vet, dateStr, timeSlot: ['09:00', '10:30', '14:00', '15:30'][i % 4], status, fee: vet.consultationFee, notes: isPast ? 'Routine visit, no concerns.' : '' };
    }),
    // Buddy & Mimi — several appointments each, mostly with Dr. Binod Thapa
    { user: myResult, pet: buddy, vet: vetBinod, dateStr: '2026-04-12', timeSlot: '10:00', status: 'completed', fee: vetBinod.consultationFee, notes: 'Annual checkup, healthy. Recommended dental cleaning next visit.' },
    { user: myResult, pet: buddy, vet: vetBinod, dateStr: '2026-05-18', timeSlot: '11:00', status: 'completed', fee: vetBinod.consultationFee, notes: 'Dental cleaning done. No issues found.' },
    { user: myResult, pet: buddy, vet: vetBinod, dateStr: '2026-07-08', timeSlot: '09:30', status: 'confirmed', fee: vetBinod.consultationFee, notes: '' },
    { user: myResult, pet: mimi, vet: vetBinod, dateStr: '2026-04-25', timeSlot: '13:00', status: 'completed', fee: vetBinod.consultationFee, notes: 'Vaccination administered (FVRCP). No adverse reaction.' },
    { user: myResult, pet: mimi, vet: otherVets[0] || vetBinod, dateStr: '2026-06-15', timeSlot: '14:30', status: 'cancelled', fee: (otherVets[0] || vetBinod).consultationFee, notes: 'Owner rescheduled.' },
    { user: myResult, pet: mimi, vet: vetBinod, dateStr: '2026-07-10', timeSlot: '16:00', status: 'pending', fee: vetBinod.consultationFee, notes: '' },
  ];

  let apptCount = 0;
  for (const a of apptPlan) {
    const created = await createAppointmentIfMissing({
      petOwnerId: a.user._id, vetId: a.vet._id, petId: a.pet._id,
      date: d(a.dateStr), timeSlot: a.timeSlot, status: a.status, fee: a.fee, notes: a.notes,
    });
    if (created) apptCount++;
  }
  console.log(`Created ${apptCount} appointments (April 1 – July 10, 2026 spread).`);

  // ── HEALTH RECORDS for Buddy & Mimi (vet remarks) ─────
  const records = [
    { petId: buddy._id, vetId: vetBinod._id, type: 'checkup', title: 'Annual checkup', description: 'Overall healthy. Weight within normal range. Recommended dental cleaning at next visit.', date: d('2026-04-12'), status: 'done', addedBy: 'vet' },
    { petId: buddy._id, vetId: vetBinod._id, type: 'treatment', title: 'Dental cleaning', description: 'Dental cleaning performed under sedation. No extractions needed. Follow up in 12 months.', date: d('2026-05-18'), nextDueDate: d('2027-05-18'), status: 'done', addedBy: 'vet' },
    { petId: mimi._id, vetId: vetBinod._id, type: 'vaccination', title: 'FVRCP vaccination', description: 'Core vaccine administered, no adverse reaction observed. Booster due in 1 year.', date: d('2026-04-25'), nextDueDate: d('2027-04-25'), status: 'done', addedBy: 'vet' },
  ];
  let recCount = 0;
  for (const r of records) {
    const exists = await HealthRecord.findOne({ petId: r.petId, title: r.title, date: r.date });
    if (exists) continue;
    await HealthRecord.create(r);
    recCount++;
  }
  console.log(`Created ${recCount} health records for Buddy/Mimi.`);

  // ── REMINDERS for Buddy & Mimi ────────────────────────
  const reminders = [
    { userId: myResult._id, petId: buddy._id, title: 'Dental cleaning follow-up', type: 'checkup', dueDate: d('2027-05-18'), leadTimeDays: 7, notifyVia: ['email'], isActive: true },
    { userId: myResult._id, petId: mimi._id, title: 'FVRCP booster due', type: 'vaccination', dueDate: d('2027-04-25'), leadTimeDays: 7, notifyVia: ['email'], isActive: true },
  ];
  let remCount = 0;
  for (const r of reminders) {
    const exists = await Reminder.findOne({ userId: r.userId, petId: r.petId, title: r.title });
    if (exists) continue;
    await Reminder.create(r);
    remCount++;
  }
  console.log(`Created ${remCount} reminders for Buddy/Mimi.`);

  console.log('\n=== FILE 2 COMPLETE ===');
  await mongoose.disconnect();
}

run().catch((err) => {
  console.error('Seed failed:', err);
  mongoose.disconnect();
});