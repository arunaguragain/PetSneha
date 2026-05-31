const appointmentRepository = require('../repositories/appointment.repository');
const vetRepository = require('../repositories/vet.repository');
const petRepository = require('../repositories/pet.repository');
const userRepository = require('../repositories/user.repository');
const notificationService = require('./notification.service');
const AppError = require('../utils/AppError');

function toDateKey(date) {
  return new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Kathmandu' }).format(new Date(date));
}

function toTimeMinutes(timeValue) {
  const [hours, minutes] = String(timeValue).split(':').map(Number);
  return (hours || 0) * 60 + (minutes || 0);
}

function toTimeString(totalMinutes) {
  const hours = Math.floor(totalMinutes / 60)
    .toString()
    .padStart(2, '0');
  const minutes = (totalMinutes % 60).toString().padStart(2, '0');
  return `${hours}:${minutes}`;
}

function buildSlots(vet, date, bookedAppointments) {
  const bookedSlots = new Set(bookedAppointments.map((appointment) => appointment.timeSlot));
  const dayName = new Intl.DateTimeFormat('en-US', { weekday: 'long', timeZone: 'Asia/Kathmandu' }).format(new Date(date)).toLowerCase();
  const allowedDays = (vet.availability?.days || []).map((day) => day.toLowerCase());

  if (!vet.availability?.is24Hours && allowedDays.length > 0 && !allowedDays.includes(dayName)) {
    return [];
  }

  const startMinutes = vet.availability?.is24Hours ? 0 : toTimeMinutes(vet.availability?.openTime || '09:00');
  const endMinutes = vet.availability?.is24Hours ? 24 * 60 : toTimeMinutes(vet.availability?.closeTime || '17:00');
  const slots = [];

  for (let minutes = startMinutes; minutes < endMinutes; minutes += 30) {
    const slot = toTimeString(minutes);
    if (!bookedSlots.has(slot)) {
      slots.push(slot);
    }
  }

  return slots;
}

async function resolveVetProfile(currentUser) {
  const vet = await vetRepository.findByUserId(currentUser.id);
  if (!vet) {
    throw new AppError('Vet profile not found.', 404);
  }

  return vet;
}

/**
 * Returns appointments for the current user, vet, or admin.
 * @param {{ id: string, role: string }} currentUser
 * @returns {Promise<Array<object>>}
 */
async function listAppointments(currentUser) {
  if (currentUser.role === 'admin') {
    return appointmentRepository.findAll();
  }

  if (currentUser.role === 'vet') {
    const vet = await resolveVetProfile(currentUser);
    return appointmentRepository.findByVetId(vet._id);
  }

  return appointmentRepository.findByUserId(currentUser.id);
}

/**
 * Books an appointment and sends the confirmation email.
 * @param {{ id: string, role: string, email?: string, name?: string }} currentUser
 * @param {object} payload
 * @returns {Promise<object>}
 */
async function bookAppointment(currentUser, payload) {
  const pet = await petRepository.findById(payload.petId);
  if (!pet) {
    throw new AppError('Pet not found.', 404);
  }

  if (currentUser.role !== 'admin' && pet.ownerId.toString() !== currentUser.id) {
    throw new AppError('You can only book appointments for your own pets.', 403);
  }

  const vet = await vetRepository.findById(payload.vetId);
  if (!vet) {
    throw new AppError('Vet not found.', 404);
  }

  const date = new Date(payload.date);
  const bookedAppointments = await appointmentRepository.findByVetIdAndDate(vet._id, date);
  if (bookedAppointments.some((appointment) => appointment.timeSlot === payload.timeSlot)) {
    throw new AppError('This time slot is already booked.', 409);
  }

  const appointment = await appointmentRepository.create({
    petOwnerId: currentUser.id,
    vetId: vet._id,
    petId: pet._id,
    date,
    timeSlot: payload.timeSlot,
    status: 'confirmed',
    fee: vet.consultationFee,
    notes: payload.notes,
  });

  try {
    const user = await userRepository.findById(currentUser.id);
    const appointmentPayload = appointment.toObject();
    appointmentPayload.petName = pet.name;
    await notificationService.sendBookingConfirmationEmail(user, appointmentPayload, vet);
    await appointmentRepository.updateById(appointment._id, { confirmationEmailSent: true });
  } catch (error) {
    // Booking succeeds even if the email provider is temporarily unavailable.
  }

  return appointment;
}

/**
 * Reschedules an appointment.
 * @param {{ id: string, role: string }} currentUser
 * @param {string} appointmentId
 * @param {object} payload
 * @returns {Promise<object>}
 */
async function rescheduleAppointment(currentUser, appointmentId, payload) {
  const appointment = await appointmentRepository.findById(appointmentId);
  if (!appointment) {
    throw new AppError('Appointment not found.', 404);
  }

  if (currentUser.role !== 'admin' && appointment.petOwnerId.toString() !== currentUser.id) {
    throw new AppError('You can only reschedule your own appointments.', 403);
  }

  if (appointment.status === 'cancelled' || appointment.status === 'completed') {
    throw new AppError('This appointment can no longer be rescheduled.', 400);
  }

  const date = payload.date ? new Date(payload.date) : appointment.date;
  const vet = await vetRepository.findById(appointment.vetId);
  const bookedAppointments = await appointmentRepository.findByVetIdAndDate(appointment.vetId, date);
  if (bookedAppointments.some((existing) => existing._id.toString() !== appointmentId && existing.timeSlot === payload.timeSlot)) {
    throw new AppError('This time slot is already booked.', 409);
  }

  return appointmentRepository.updateById(appointmentId, {
    date,
    timeSlot: payload.timeSlot || appointment.timeSlot,
    notes: payload.notes ?? appointment.notes,
    status: 'confirmed',
    fee: vet?.consultationFee ?? appointment.fee,
  });
}

/**
 * Cancels an appointment.
 * @param {{ id: string, role: string }} currentUser
 * @param {string} appointmentId
 * @returns {Promise<object>}
 */
async function cancelAppointment(currentUser, appointmentId) {
  const appointment = await appointmentRepository.findById(appointmentId);
  if (!appointment) {
    throw new AppError('Appointment not found.', 404);
  }

  if (currentUser.role !== 'admin' && appointment.petOwnerId.toString() !== currentUser.id) {
    throw new AppError('You can only cancel your own appointments.', 403);
  }

  return appointmentRepository.updateById(appointmentId, { status: 'cancelled' });
}

/**
 * Marks an appointment complete.
 * @param {{ id: string, role: string }} currentUser
 * @param {string} appointmentId
 * @returns {Promise<object>}
 */
async function completeAppointment(currentUser, appointmentId) {
  if (!['vet', 'admin'].includes(currentUser.role)) {
    throw new AppError('Only vets can mark appointments complete.', 403);
  }

  const appointment = await appointmentRepository.findById(appointmentId);
  if (!appointment) {
    throw new AppError('Appointment not found.', 404);
  }

  if (currentUser.role === 'vet') {
    const vet = await resolveVetProfile(currentUser);
    if (appointment.vetId.toString() !== vet._id.toString()) {
      throw new AppError('You can only complete your own appointments.', 403);
    }
  }

  return appointmentRepository.updateById(appointmentId, { status: 'completed' });
}

/**
 * Returns available time slots for a vet on a date.
 * @param {string} vetId
 * @param {string} dateValue
 * @returns {Promise<Array<string>>}
 */
async function getAvailableSlots(vetId, dateValue) {
  const vet = await vetRepository.findById(vetId);
  if (!vet) {
    throw new AppError('Vet not found.', 404);
  }

  const date = new Date(dateValue);
  const bookedAppointments = await appointmentRepository.findByVetIdAndDate(vetId, date);
  return buildSlots(vet, date, bookedAppointments);
}

module.exports = {
  listAppointments,
  bookAppointment,
  rescheduleAppointment,
  cancelAppointment,
  completeAppointment,
  getAvailableSlots,
};