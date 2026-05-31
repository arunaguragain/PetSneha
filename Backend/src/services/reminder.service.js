const reminderRepository = require('../repositories/reminder.repository');
const userRepository = require('../repositories/user.repository');
const petRepository = require('../repositories/pet.repository');
const vetRepository = require('../repositories/vet.repository');
const notificationService = require('./notification.service');
const AppError = require('../utils/AppError');

function toNepalDateKey(value) {
  return new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Kathmandu' }).format(new Date(value));
}

async function resolvePet(currentUser, petId) {
  const pet = await petRepository.findById(petId);
  if (!pet) {
    throw new AppError('Pet not found.', 404);
  }

  if (currentUser.role !== 'admin' && pet.ownerId.toString() !== currentUser.id) {
    throw new AppError('You do not have access to this pet.', 403);
  }

  return pet;
}

/**
 * Returns all reminders for the current user.
 * @param {{ id: string, role: string }} currentUser
 * @returns {Promise<Array<object>>}
 */
async function listReminders(currentUser) {
  return reminderRepository.findByUserId(currentUser.id);
}

/**
 * Returns reminders for a specific pet.
 * @param {{ id: string, role: string }} currentUser
 * @param {string} petId
 * @returns {Promise<Array<object>>}
 */
async function listPetReminders(currentUser, petId) {
  await resolvePet(currentUser, petId);
  return reminderRepository.findByPetId(petId);
}

/**
 * Creates a reminder.
 * @param {{ id: string, role: string }} currentUser
 * @param {object} payload
 * @returns {Promise<object>}
 */
async function createReminder(currentUser, payload) {
  await resolvePet(currentUser, payload.petId);
  return reminderRepository.create({
    userId: currentUser.id,
    petId: payload.petId,
    title: payload.title,
    type: payload.type,
    dueDate: payload.dueDate,
    leadTimeDays: payload.leadTimeDays,
    notifyVia: payload.notifyVia || ['push', 'email'],
    isActive: payload.isActive ?? true,
    notes: payload.notes,
  });
}

/**
 * Updates a reminder.
 * @param {{ id: string, role: string }} currentUser
 * @param {string} reminderId
 * @param {object} payload
 * @returns {Promise<object>}
 */
async function updateReminder(currentUser, reminderId, payload) {
  const reminder = await reminderRepository.findById(reminderId);
  if (!reminder) {
    throw new AppError('Reminder not found.', 404);
  }

  if (currentUser.role !== 'admin' && reminder.userId.toString() !== currentUser.id) {
    throw new AppError('You do not have access to this reminder.', 403);
  }

  return reminderRepository.updateById(reminderId, payload);
}

/**
 * Deletes a reminder.
 * @param {{ id: string, role: string }} currentUser
 * @param {string} reminderId
 * @returns {Promise<{ message: string }>}
 */
async function deleteReminder(currentUser, reminderId) {
  const reminder = await reminderRepository.findById(reminderId);
  if (!reminder) {
    throw new AppError('Reminder not found.', 404);
  }

  if (currentUser.role !== 'admin' && reminder.userId.toString() !== currentUser.id) {
    throw new AppError('You do not have access to this reminder.', 403);
  }

  await reminderRepository.deleteById(reminderId);
  return { message: 'Reminder deleted successfully.' };
}

/**
 * Finds due reminders and sends email notifications.
 * @returns {Promise<void>}
 */
async function processDueReminders() {
  const reminders = await reminderRepository.findActive();
  const todayKey = toNepalDateKey(new Date());

  for (const reminder of reminders) {
    const triggerDate = new Date(reminder.dueDate);
    triggerDate.setDate(triggerDate.getDate() - Number(reminder.leadTimeDays || 0));

    if (toNepalDateKey(triggerDate) !== todayKey) {
      continue;
    }

    const user = await userRepository.findById(reminder.userId);
    const pet = await petRepository.findById(reminder.petId);
    if (!user || !pet) {
      continue;
    }

    let savedVet = null;
    if (user.savedVetId) {
      savedVet = await vetRepository.findById(user.savedVetId);
    }

    try {
      await notificationService.sendReminderEmail(user, reminder, pet, savedVet);
      await reminderRepository.updateById(reminder._id, { isTriggered: true });
    } catch (error) {
      // Leave the reminder untriggered so the next cron run can retry.
    }
  }
}

module.exports = {
  listReminders,
  listPetReminders,
  createReminder,
  updateReminder,
  deleteReminder,
  processDueReminders,
};