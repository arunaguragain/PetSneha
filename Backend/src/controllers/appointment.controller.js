const catchAsync = require('../utils/catchAsync');
const appointmentService = require('../services/appointment.service');

function sendList(res, items) {
  return res.status(200).json({ status: 'success', results: items.length, data: { items } });
}

function sendItem(res, key, item, statusCode = 200) {
  return res.status(statusCode).json({ status: 'success', data: { [key]: item } });
}

/**
 * Lists appointments for the current user.
 */
const listAppointments = catchAsync(async (req, res) => {
  const appointments = await appointmentService.listAppointments(req.user);
  sendList(res, appointments);
});

/**
 * Books a new appointment.
 */
const bookAppointment = catchAsync(async (req, res) => {
  const appointment = await appointmentService.bookAppointment(req.user, req.body);
  sendItem(res, 'appointment', appointment, 201);
});

/**
 * Reschedules an appointment.
 */
const rescheduleAppointment = catchAsync(async (req, res) => {
  const appointment = await appointmentService.rescheduleAppointment(req.user, req.params.id, req.body);
  sendItem(res, 'appointment', appointment);
});

/**
 * Cancels an appointment.
 */
const cancelAppointment = catchAsync(async (req, res) => {
  const appointment = await appointmentService.cancelAppointment(req.user, req.params.id);
  sendItem(res, 'appointment', appointment);
});

/**
 * Marks an appointment as completed.
 */
const completeAppointment = catchAsync(async (req, res) => {
  const appointment = await appointmentService.completeAppointment(req.user, req.params.id);
  sendItem(res, 'appointment', appointment);
});

/**
 * Returns available slots for a vet.
 */
const getAvailableSlots = catchAsync(async (req, res) => {
  const slots = await appointmentService.getAvailableSlots(req.params.vetId, req.query.date);
  sendList(res, slots.map((slot) => ({ slot })));
});

module.exports = {
  listAppointments,
  bookAppointment,
  rescheduleAppointment,
  cancelAppointment,
  completeAppointment,
  getAvailableSlots,
};