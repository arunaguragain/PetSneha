const mongoose = require('mongoose');
require('dotenv').config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/petsneha';
const User = require('./src/models/user.model.js');
const ForumPost = require('./src/models/forumPost.model.js');

const seedForum = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('Connected to DB');

    // Get a couple of pet owners
    const owners = await User.find({ role: 'petOwner' }).limit(3);
    const vets = await User.find({ role: 'vet' }).limit(1);

    if (owners.length < 2) {
      console.log('Not enough pet owners to seed forum posts. Please run petowner seed first.');
      process.exit(1);
    }

    const vetId = vets.length > 0 ? vets[0]._id : null;

    // Create 3 realistic forum posts
    const posts = [
      {
        authorId: owners[0]._id,
        isAnonymous: false,
        title: 'Best food for a 3-month-old Golden Retriever?',
        content: 'Hi everyone, I recently brought home a Golden Retriever puppy and I am confused about which brand of puppy kibble is best available in Kathmandu. Any recommendations?',
        group: 'dogs',
        upvotes: 4,
        answers: vetId ? [{
          authorId: vetId,
          isVet: true,
          content: 'For a Golden Retriever puppy, look for large-breed puppy formulas. Royal Canin Maxi Puppy or Purina Pro Plan Large Breed Puppy are generally available and very reliable options here in Nepal.',
          upvotes: 2
        }] : []
      },
      {
        authorId: owners[1]._id,
        isAnonymous: true,
        title: 'How to introduce a new kitten to my older cat?',
        content: 'I have a 4-year-old tabby who is very territorial. I just rescued a 2-month-old kitten. What is the safest way to introduce them without causing extreme stress?',
        group: 'cats',
        upvotes: 7,
        answers: [
          {
            authorId: owners[0]._id,
            isVet: false,
            content: 'Keep them in separate rooms at first. Let them smell each other under the door for a few days. Swap their blankets so they get used to the scent before meeting face to face!',
            upvotes: 5
          }
        ]
      },
      {
        authorId: owners[0]._id,
        isAnonymous: false,
        title: 'My dog is terrified of thunderstorms',
        content: 'Whenever it rains heavily or thunders, my dog shakes uncontrollably and hides under the bed. Is there anything I can do to calm him down during the monsoon season?',
        group: 'dogs',
        upvotes: 3,
        answers: []
      },
      {
        authorId: owners[1]._id,
        isAnonymous: false,
        title: 'appetite issues of Buddy , a year old labrador',
        content: 'Buddy has suddenly stopped eating his usual meals for the past 2 days. He is drinking water but refusing solid food. Should I take him to the vet immediately?',
        group: 'dogs',
        upvotes: 2,
        isReported: true,
        reportCount: 3,
        answers: []
      },
      {
        authorId: owners[0]._id,
        isAnonymous: true,
        title: 'Can I feed my cat vegetarian food?',
        content: 'I am a strict vegetarian and I want my cat to be on a vegetarian diet as well. What are the best plant-based cat food brands?',
        group: 'cats',
        upvotes: 0,
        isReported: true,
        reportCount: 5,
        answers: [
          {
            authorId: owners[1]._id,
            isVet: false,
            content: 'Cats are obligate carnivores! They absolutely need meat to survive. Please do not feed your cat a vegetarian diet.',
            upvotes: 12
          }
        ]
      },
      {
        authorId: owners[1]._id,
        isAnonymous: false,
        title: 'Best vets in Patan for emergency surgery?',
        content: 'Looking for a reliable and 24/7 emergency vet hospital in or around the Patan area. Any recommendations would be greatly appreciated.',
        group: 'emergency',
        upvotes: 8,
        answers: []
      }
    ];

    await ForumPost.insertMany(posts);
    console.log('Successfully seeded 6 forum posts!');

    process.exit(0);
  } catch (err) {
    console.error('Error seeding forum:', err);
    process.exit(1);
  }
};

seedForum();
