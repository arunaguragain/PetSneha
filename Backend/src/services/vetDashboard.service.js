const AppError = require('../utils/AppError');
const vetDashboardRepository = require('../repositories/vetDashboard.repository');
const healthRecordRepository = require('../repositories/healthRecord.repository');
const articleRepository = require('../repositories/article.repository');
const vetRepository = require('../repositories/vet.repository');
const userRepository = require('../repositories/user.repository');
const petRepository = require('../repositories/pet.repository');
const notificationService = require('./notification.service');

function startOfDay(date = new Date()) {
  const value = new Date(date);
  value.setHours(0, 0, 0, 0);
  return value;
}

function endOfDay(date = new Date()) {
  const value = new Date(date);
  value.setHours(23, 59, 59, 999);
  return value;
}

async function resolveVet(userId) {
  const vet = await vetDashboardRepository.findVetByUserId(userId);
  if (!vet) {
    throw new AppError('Vet profile not found.', 404);
  }
  return vet;
}

/**
 * Get vet's own dashboard data.
 * @param {string} userId
 * @returns {Promise}
 */
async function getVetDashboard(userId) {
  const vet = await resolveVet(userId);
  const today = new Date();
  const todayAppointments = await vetDashboardRepository.findAppointmentsByVetId(vet._id, {
    date: today,
  });
  const upcomingAppointments = (await vetDashboardRepository.findAppointmentsByVetId(vet._id, {})).filter(
    (appointment) =>
      appointment.status !== 'cancelled' && new Date(appointment.date) > endOfDay(today)
  );
  const stats = await vetDashboardRepository.getVetStats(vet._id);

  return { vet, todayAppointments, upcomingAppointments, stats };
}

/**
 * Get all appointments for this vet with optional filters.
 * @param {string} userId
 * @param {object} filters
 * @returns {Promise}
 */
async function getVetAppointments(userId, filters) {
  const vet = await resolveVet(userId);
  return vetDashboardRepository.findAppointmentsByVetId(vet._id, filters);
}

/**
 * Confirm an appointment.
 * @param {string} userId
 * @param {string} appointmentId
 * @returns {Promise}
 */
async function confirmAppointment(userId, appointmentId) {
  const vet = await resolveVet(userId);
  const appointment = await vetDashboardRepository.findAppointmentByIdAndVet(appointmentId, vet._id);
  if (!appointment) {
    throw new AppError('Appointment not found.', 404);
  }

  if (appointment.status !== 'pending') {
    throw new AppError('Only pending appointments can be confirmed.', 400);
  }

  const updated = await vetDashboardRepository.updateAppointmentStatus(appointmentId, 'confirmed', appointment.notes);

  // Fetch details and send confirmation email
  const user = await userRepository.findById(updated.petOwnerId);
  const pet = await petRepository.findById(updated.petId);

  try {
    await notificationService.sendBookingConfirmationEmail(user, updated, vet, pet);
    updated.confirmationEmailSent = true;
    await updated.save();
  } catch (emailError) {
    console.error('Failed to send booking confirmation email:', emailError.message);
  }

  return updated;
}

/**
 * Complete an appointment and add visit notes.
 * @param {string} userId
 * @param {string} appointmentId
 * @param {object} visitData
 * @returns {Promise}
 */
async function completeAppointment(userId, appointmentId, visitData) {
  const vet = await resolveVet(userId);
  const appointment = await vetDashboardRepository.findAppointmentByIdAndVet(appointmentId, vet._id);
  if (!appointment) {
    throw new AppError('Appointment not found.', 404);
  }

  if (appointment.status !== 'confirmed') {
    throw new AppError('Only confirmed appointments can be completed.', 400);
  }

  const notesParts = [visitData.notes, visitData.diagnosis, visitData.treatment].filter(Boolean);
  const notes = notesParts.join('\n');
  const updatedAppointment = await vetDashboardRepository.updateAppointmentStatus(appointmentId, 'completed', notes);
  const healthRecord = await healthRecordRepository.create({
    petId: appointment.petId,
    vetId: vet._id,
    appointmentId: appointment._id,
    type: 'checkup',
    title: visitData.diagnosis || 'Vet visit',
    description: notes,
    date: new Date(),
    nextDueDate: visitData.nextDueDate,
    status: visitData.nextDueDate ? 'upcoming' : 'done',
    attachments: [],
    addedBy: 'vet',
  });

  return { appointment: updatedAppointment, healthRecord };
}

/**
 * Cancel an appointment.
 * @param {string} userId
 * @param {string} appointmentId
 * @param {string} reason
 * @returns {Promise}
 */
async function vetCancelAppointment(userId, appointmentId, reason) {
  const vet = await resolveVet(userId);
  const appointment = await vetDashboardRepository.findAppointmentByIdAndVet(appointmentId, vet._id);
  if (!appointment) {
    throw new AppError('Appointment not found.', 404);
  }

  if (appointment.status === 'completed' || appointment.status === 'cancelled') {
    throw new AppError('This appointment cannot be cancelled.', 400);
  }

  const updated = await vetDashboardRepository.updateAppointmentStatus(appointmentId, 'cancelled', reason || appointment.notes);
  const user = await userRepository.findById(updated.petOwnerId);
  const pet = await petRepository.findById(updated.petId);

  const appointmentPayload = updated.toObject();
  appointmentPayload.petName = pet?.name;
  appointmentPayload.vetName = vet?.name;
  appointmentPayload.pet = pet;
  appointmentPayload.vet = vet;

  try {
    await notificationService.sendAppointmentCancelledEmail(user, appointmentPayload, false);
    await notificationService.sendAppointmentCancelledEmail(vet, appointmentPayload, true);
  } catch (error) {
    console.error('Failed to send appointment cancellation emails:', error.message);
  }

  return updated;
}

/**
 * Toggle vet open/close status.
 * @param {string} userId
 * @returns {Promise}
 */
async function toggleOpenStatus(userId) {
  const vet = await resolveVet(userId);
  return vetRepository.updateById(vet._id, { isOpenNow: !vet.isOpenNow });
}

/**
 * Submit an article.
 * @param {string} userId
 * @param {object} articleData
 * @returns {Promise}
 */
async function submitArticle(userId, articleData) {
  const vet = await resolveVet(userId);
  return articleRepository.create({
    title: articleData.title,
    content: articleData.content,
    summary: articleData.summary,
    authorId: vet._id,
    petType: articleData.petType || [],
    tags: articleData.tags || [],
    season: articleData.season || 'all',
    isPublished: false,
    isVerified: false,
    readTime: articleData.readTime,
    imageUrl: articleData.imageUrl,
  });
}

/**
 * Get all articles submitted by this vet.
 * @param {string} userId
 * @returns {Promise}
 */
async function getMyArticles(userId) {
  const vet = await resolveVet(userId);
  return vetDashboardRepository.findArticlesByVetId(vet._id);
}

/**
 * Reply to a review on the vet's own profile.
 * @param {string} userId
 * @param {string} reviewId
 * @param {string} replyText
 * @returns {Promise}
 */
async function replyToReview(userId, reviewId, replyText) {
  const vet = await resolveVet(userId);
  const updatedVet = await vetDashboardRepository.addReviewReply(vet._id, reviewId, replyText);
  if (!updatedVet) {
    throw new AppError('Review not found.', 404);
  }

  return updatedVet;
}

module.exports = {
  getVetDashboard,
  getVetAppointments,
  confirmAppointment,
  completeAppointment,
  vetCancelAppointment,
  toggleOpenStatus,
  submitArticle,
  getMyArticles,
  replyToReview,
};