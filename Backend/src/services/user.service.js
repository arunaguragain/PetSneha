const userRepository = require('../repositories/user.repository');
const petRepository = require('../repositories/pet.repository');
const reminderRepository = require('../repositories/reminder.repository');
const orderRepository = require('../repositories/order.repository');
const appointmentRepository = require('../repositories/appointment.repository');
const healthRecordRepository = require('../repositories/healthRecord.repository');
const vetRepository = require('../repositories/vet.repository');
const AppError = require('../utils/AppError');

const checklistFields = ['sleepingArea', 'food', 'vetVisit', 'groomingTools'];

function pickUserFields(payload) {
  const allowed = ['name', 'phone', 'profilePhoto', 'savedVetId'];
  return allowed.reduce((accumulator, key) => {
    if (payload[key] !== undefined) {
      accumulator[key] = payload[key];
    }
    return accumulator;
  }, {});
}

function toBoolean(value) {
  if (value === true || value === 'true' || value === 1 || value === '1') {
    return true;
  }

  if (value === false || value === 'false' || value === 0 || value === '0') {
    return false;
  }

  return Boolean(value);
}

function buildChecklist(existingChecklist = {}, payload = {}) {
  return checklistFields.reduce((accumulator, key) => {
    if (Object.prototype.hasOwnProperty.call(payload, key)) {
      accumulator[key] = toBoolean(payload[key]);
      return accumulator;
    }

    accumulator[key] = toBoolean(existingChecklist[key]);
    return accumulator;
  }, {});
}

/**
 * Returns the current user profile.
 * @param {string} userId
 * @returns {Promise<object>}
 */
async function getCurrentUser(userId) {
  const user = await userRepository.findById(userId);
  if (!user) {
    throw new AppError('User not found.', 404);
  }

  // For vet users, ensure profilePhoto is synced from the Vet model
  if (user.role === 'vet' && !user.profilePhoto) {
    try {
      const vet = await vetRepository.findByUserId(userId);
      if (vet?.profilePhoto) {
        user.profilePhoto = vet.profilePhoto;
        // Also persist it so future requests are fast
        await userRepository.updateById(userId, { profilePhoto: vet.profilePhoto });
      }
    } catch (_) { /* ignore */ }
  }

  return user;
}

/**
 * Updates the current user profile.
 * @param {string} userId
 * @param {object} payload
 * @returns {Promise<object>}
 */
async function updateProfile(userId, payload) {
  const updatedUser = await userRepository.updateById(userId, pickUserFields(payload));
  if (!updatedUser) {
    throw new AppError('User not found.', 404);
  }

  return updatedUser;
}

/**
 * Toggles the current user language between English and Nepali.
 * @param {string} userId
 * @returns {Promise<object>}
 */
async function toggleLanguage(userId) {
  const user = await userRepository.findById(userId);
  if (!user) {
    throw new AppError('User not found.', 404);
  }

  const language = user.language === 'en' ? 'ne' : 'en';
  return userRepository.updateById(userId, { language });
}

/**
 * Returns the current onboarding checklist.
 * @param {string} userId
 * @returns {Promise<object>}
 */
async function getChecklist(userId) {
  const user = await userRepository.findById(userId);
  if (!user) {
    throw new AppError('User not found.', 404);
  }

  return buildChecklist(user.checklist || {});
}

/**
 * Updates the current onboarding checklist.
 * @param {string} userId
 * @param {object} payload
 * @returns {Promise<object>}
 */
async function updateChecklist(userId, payload) {
  const user = await userRepository.findById(userId);
  if (!user) {
    throw new AppError('User not found.', 404);
  }

  const checklist = buildChecklist(user.checklist || {}, payload);
  const updatedUser = await userRepository.updateById(userId, { checklist });
  if (!updatedUser) {
    throw new AppError('User not found.', 404);
  }

  return checklist;
}

/**
 * Deletes the current user account.
 * @param {string} userId
 * @returns {Promise<{ message: string }>}
 */
async function deleteAccount(userId) {
  const user = await userRepository.findById(userId);
  if (!user) {
    throw new AppError('User not found.', 404);
  }

  if (user.role === 'petOwner') {
    const pets = await petRepository.findByOwnerId(userId);
    const petIds = pets.map((pet) => pet._id.toString());
    if (petIds.length > 0) {
      await healthRecordRepository.deleteManyByPetIds(petIds);
      await petRepository.deleteManyByOwnerId(userId);
    }
    await reminderRepository.deleteManyByUserId(userId);
    await orderRepository.deleteManyByUserId(userId);
    await appointmentRepository.deleteManyByUserId(userId);
  }

  if (user.role === 'vet') {
    const vetProfile = await vetRepository.findByUserId(userId);
    if (vetProfile) {
      await vetRepository.deleteById(vetProfile._id);
    }
  }

  await userRepository.deleteById(userId);
  return { message: 'Account deleted successfully.' };
}

module.exports = { getCurrentUser, updateProfile, toggleLanguage, getChecklist, updateChecklist, deleteAccount };