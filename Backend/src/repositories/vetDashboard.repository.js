const Appointment = require('../models/appointment.model');
const Vet = require('../models/vet.model');
const Article = require('../models/article.model');

const vetReviewsPath = Vet.schema.path('reviews');
if (vetReviewsPath && vetReviewsPath.schema && !vetReviewsPath.schema.path('reply')) {
  vetReviewsPath.schema.add({ reply: { type: String } });
}

/**
 * Find all appointments for a specific vet.
 * @param {string} vetId
 * @param {object} filters
 * @returns {Promise}
 */
async function findAppointmentsByVetId(vetId, filters = {}) {
  const query = { vetId };

  if (filters.status) {
    query.status = filters.status;
  }

  if (filters.date) {
    const date = new Date(filters.date);
    query.date = {
      $gte: new Date(date.getFullYear(), date.getMonth(), date.getDate()),
      $lt: new Date(date.getFullYear(), date.getMonth(), date.getDate() + 1),
    };
  }

  return Appointment.find(query).sort({ date: 1, timeSlot: 1 });
}

/**
 * Find a single appointment by id and vetId.
 * @param {string} appointmentId
 * @param {string} vetId
 * @returns {Promise}
 */
async function findAppointmentByIdAndVet(appointmentId, vetId) {
  return Appointment.findOne({ _id: appointmentId, vetId });
}

/**
 * Update appointment status.
 * @param {string} appointmentId
 * @param {string} status
 * @param {string} notes
 * @returns {Promise}
 */
async function updateAppointmentStatus(appointmentId, status, notes) {
  const update = { status };
  if (notes !== undefined) {
    update.notes = notes;
  }

  return Appointment.findByIdAndUpdate(appointmentId, update, { new: true, runValidators: true });
}

/**
 * Find vet profile by userId.
 * @param {string} userId
 * @returns {Promise}
 */
async function findVetByUserId(userId) {
  return Vet.findOne({ userId });
}

/**
 * Get dashboard stats for a vet.
 * @param {string} vetId
 * @returns {Promise}
 */
async function getVetStats(vetId) {
  const [totalAppointments, pendingCount, completedCount, vet] = await Promise.all([
    Appointment.countDocuments({ vetId }),
    Appointment.countDocuments({ vetId, status: 'pending' }),
    Appointment.countDocuments({ vetId, status: 'completed' }),
    Vet.findById(vetId).select('rating reviewCount'),
  ]);

  return {
    totalAppointments,
    pendingCount,
    completedCount,
    averageRating: vet ? vet.rating || 0 : 0,
    reviewCount: vet ? vet.reviewCount || 0 : 0,
  };
}

/**
 * Find all articles submitted by a vet.
 * @param {string} vetId
 * @returns {Promise}
 */
async function findArticlesByVetId(vetId) {
  return Article.find({ authorId: vetId }).sort('-createdAt');
}

/**
 * Add a reply to a review on the vet's profile.
 * @param {string} vetId
 * @param {string} reviewId
 * @param {string} replyText
 * @returns {Promise}
 */
async function addReviewReply(vetId, reviewId, replyText) {
  return Vet.findOneAndUpdate(
    { _id: vetId, 'reviews._id': reviewId },
    { $set: { 'reviews.$.reply': replyText } },
    { new: true, runValidators: true }
  );
}

module.exports = {
  findAppointmentsByVetId,
  findAppointmentByIdAndVet,
  updateAppointmentStatus,
  findVetByUserId,
  getVetStats,
  findArticlesByVetId,
  addReviewReply,
};