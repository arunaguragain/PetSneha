const mongoose = require('mongoose');

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/petsneha').then(async () => {
  console.log('Connected to MongoDB');
  
  // Find a pet
  const Pet = mongoose.model('Pet', new mongoose.Schema({}, { strict: false }));
  const pet = await Pet.findOne();
  if (!pet) {
    console.log('No pet found to seed reminders for');
    process.exit(1);
  }

  const Reminder = mongoose.model('Reminder', new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    petId: { type: mongoose.Schema.Types.ObjectId, ref: 'Pet' },
    title: { type: String },
    type: { type: String },
    dueDate: { type: Date },
    leadTimeDays: { type: Number },
    notifyVia: [{ type: String }],
    isActive: { type: Boolean },
    isTriggered: { type: Boolean },
    notes: { type: String },
  }, { timestamps: true }));

  // Create an upcoming vaccination
  const upcomingDate = new Date();
  upcomingDate.setDate(upcomingDate.getDate() + 10);
  
  // Create an overdue alert
  const overdueDate = new Date();
  overdueDate.setDate(overdueDate.getDate() - 2);

  await Reminder.create([
    {
      userId: pet.owner,
      petId: pet._id,
      title: 'Vaccination - Rabies',
      type: 'vaccination',
      dueDate: upcomingDate,
      leadTimeDays: 7,
      notifyVia: ['email'],
      isActive: true,
      isTriggered: false,
    },
    {
      userId: pet.owner,
      petId: pet._id,
      title: 'Deworming Update',
      type: 'checkup',
      dueDate: overdueDate,
      leadTimeDays: 3,
      notifyVia: ['email'],
      isActive: true,
      isTriggered: false,
    }
  ]);

  console.log('Successfully seeded 1 upcoming vaccination and 1 pending alert for pet:', pet.name);
  process.exit(0);
}).catch(err => {
  console.error(err);
  process.exit(1);
});
