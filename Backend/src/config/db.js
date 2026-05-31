const mongoose = require('mongoose');

/**
 * Connects the application to MongoDB.
 * @returns {Promise<typeof mongoose>}
 */
async function connectDB() {
  mongoose.set('strictQuery', true);
  return mongoose.connect(process.env.MONGO_URI);
}

module.exports = connectDB;