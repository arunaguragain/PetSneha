const Reminder = require('../models/reminder.model');

/**
 * Creates a reminder.
 * @param {object} payload
 * @returns {Promise<import('mongoose').Document>}
 */
async function create(payload) {
  return Reminder.create(payload);
}

/**
 * Finds reminders by user ID.
 * @param {string} userId
 * @returns {Promise<Array<import('mongoose').Document>>}
 */
async function findByUserId(userId) {
  return Reminder.find({ userId }).sort('dueDate');
}

/**
 * Finds reminders by pet ID.
 * @param {string} petId
 * @returns {Promise<Array<import('mongoose').Document>>}
 */
async function findByPetId(petId) {
  return Reminder.find({ petId }).sort('dueDate');
}

/**
 * Finds a reminder by ID.
 * @param {string} id
 * @returns {Promise<import('mongoose').Document|null>}
 */
async function findById(id) {
  return Reminder.findById(id);
}

/**
 * Finds active reminders that have not yet been triggered.
 * @returns {Promise<Array<import('mongoose').Document>>}
 */
async function findActive() {
  return Reminder.find({ isActive: true, isTriggered: false });
}

/**
 * Updates a reminder.
 * @param {string} id
 * @param {object} payload
 * @returns {Promise<import('mongoose').Document|null>}
 */
async function updateById(id, payload) {
  return Reminder.findByIdAndUpdate(id, payload, { new: true, runValidators: true });
}

/**
 * Deletes a reminder.
 * @param {string} id
 * @returns {Promise<import('mongoose').Document|null>}
 */
async function deleteById(id) {
  return Reminder.findByIdAndDelete(id);
}

/**
 * Deletes reminders for a user.
 * @param {string} userId
 * @returns {Promise<unknown>}
 */
async function deleteManyByUserId(userId) {
  return Reminder.deleteMany({ userId });
}

module.exports = { create, findByUserId, findByPetId, findById, findActive, updateById, deleteById, deleteManyByUserId };