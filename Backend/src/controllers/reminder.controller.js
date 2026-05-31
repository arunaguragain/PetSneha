const catchAsync = require('../utils/catchAsync');
const reminderService = require('../services/reminder.service');

function sendList(res, items) {
  return res.status(200).json({ status: 'success', results: items.length, data: { items } });
}

function sendItem(res, key, item, statusCode = 200) {
  return res.status(statusCode).json({ status: 'success', data: { [key]: item } });
}

/**
 * Lists user reminders.
 */
const listReminders = catchAsync(async (req, res) => {
  const reminders = await reminderService.listReminders(req.user);
  sendList(res, reminders);
});

/**
 * Lists reminders for a pet.
 */
const listPetReminders = catchAsync(async (req, res) => {
  const reminders = await reminderService.listPetReminders(req.user, req.params.petId);
  sendList(res, reminders);
});

/**
 * Creates a reminder.
 */
const createReminder = catchAsync(async (req, res) => {
  const reminder = await reminderService.createReminder(req.user, req.body);
  sendItem(res, 'reminder', reminder, 201);
});

/**
 * Updates a reminder.
 */
const updateReminder = catchAsync(async (req, res) => {
  const reminder = await reminderService.updateReminder(req.user, req.params.id, req.body);
  sendItem(res, 'reminder', reminder);
});

/**
 * Deletes a reminder.
 */
const deleteReminder = catchAsync(async (req, res) => {
  await reminderService.deleteReminder(req.user, req.params.id);
  res.status(204).send();
});

module.exports = { listReminders, listPetReminders, createReminder, updateReminder, deleteReminder };