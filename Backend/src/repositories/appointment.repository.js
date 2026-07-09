const Appointment = require('../models/appointment.model');

const POPULATE_FIELDS = [
  { path: 'petId', select: 'name species breed profilePhoto' },
  { path: 'vetId', select: 'name clinicName clinicAddress consultationFee profilePhoto' },
  { path: 'petOwnerId', select: 'name email phone profilePhoto' },
];

function withPopulate(query) {
  return query.populate(POPULATE_FIELDS);
}

/**
 * Creates an appointment.
 * @param {object} payload
 * @returns {Promise<import('mongoose').Document>}
 */
async function create(payload) {
  return Appointment.create(payload);
}

/**
 * Finds appointments by user ID.
 * @param {string} userId
 * @returns {Promise<Array<import('mongoose').Document>>}
 */
async function findByUserId(userId) {
  return withPopulate(Appointment.find({ petOwnerId: userId }).sort('-date'));
}

/**
 * Finds all appointments.
 * @returns {Promise<Array<import('mongoose').Document>>}
 */
async function findAll() {
  return withPopulate(Appointment.find().sort('-date'));
}

/**
 * Finds appointments by vet ID.
 * @param {string} vetId
 * @returns {Promise<Array<import('mongoose').Document>>}
 */
async function findByVetId(vetId) {
  return withPopulate(Appointment.find({ vetId }).sort('-date'));
}

/**
 * Finds appointments by pet owner ID.
 * @param {string} petOwnerId
 * @returns {Promise<Array<import('mongoose').Document>>}
 */
async function findByPetOwnerId(petOwnerId) {
  return withPopulate(Appointment.find({ petOwnerId }).sort('-date'));
}

/**
 * Finds appointments for a vet on a date.
 * @param {string} vetId
 * @param {Date} date
 * @returns {Promise<Array<import('mongoose').Document>>}
 */
async function findByVetIdAndDate(vetId, date) {
  return Appointment.find({
    vetId,
    date: {
      $gte: new Date(date.getFullYear(), date.getMonth(), date.getDate()),
      $lt: new Date(date.getFullYear(), date.getMonth(), date.getDate() + 1),
    },
    status: { $ne: 'cancelled' },
  }).sort('timeSlot');
}

/**
 * Finds an appointment by ID.
 * @param {string} id
 * @returns {Promise<import('mongoose').Document|null>}
 */
async function findById(id) {
  return Appointment.findById(id);
}

/**
 * Finds an appointment by ID, populated with pet, vet, and owner details.
 * @param {string} id
 * @returns {Promise<import('mongoose').Document|null>}
 */
async function findByIdPopulated(id) {
  return withPopulate(Appointment.findById(id));
}

/**
 * Updates an appointment by ID.
 * @param {string} id
 * @param {object} payload
 * @returns {Promise<import('mongoose').Document|null>}
 */
async function updateById(id, payload) {
  return Appointment.findByIdAndUpdate(id, payload, { new: true, runValidators: true });
}

/**
 * Deletes appointments by user ID.
 * @param {string} userId
 * @returns {Promise<unknown>}
 */
async function deleteManyByUserId(userId) {
  return Appointment.deleteMany({ petOwnerId: userId });
}

module.exports = { create, findByUserId, findAll, findByVetId, findByPetOwnerId, findByVetIdAndDate, findById, findByIdPopulated, updateById, deleteManyByUserId };