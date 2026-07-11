jest.mock('../src/repositories/appointment.repository', () => ({
  findAll: jest.fn(),
  findByVetId: jest.fn(),
  findByUserId: jest.fn(),
  findById: jest.fn(),
  findByIdPopulated: jest.fn(),
  findByVetIdAndDate: jest.fn(),
  create: jest.fn(),
  updateById: jest.fn(),
}));

jest.mock('../src/repositories/vet.repository', () => ({
  findByUserId: jest.fn(),
  findById: jest.fn(),
}));

jest.mock('../src/repositories/pet.repository', () => ({
  findById: jest.fn(),
}));

jest.mock('../src/repositories/user.repository', () => ({
  findById: jest.fn(),
}));

jest.mock('../src/services/notification.service', () => ({
  sendBookingRequestReceivedEmail: jest.fn(),
  sendNewBookingRequestEmail: jest.fn(),
  sendAppointmentCancelledEmail: jest.fn(),
  sendBookingConfirmationEmail: jest.fn(),
}));

const appointmentRepository = require('../src/repositories/appointment.repository');
const vetRepository = require('../src/repositories/vet.repository');
const petRepository = require('../src/repositories/pet.repository');
const userRepository = require('../src/repositories/user.repository');
const notificationService = require('../src/services/notification.service');
const appointmentService = require('../src/services/appointment.service');

describe('appointment service', () => {
  beforeEach(() => jest.clearAllMocks());

  it('returns all appointments for admin users', async () => {
    appointmentRepository.findAll.mockResolvedValue([{ id: 'a1' }]);

    const result = await appointmentService.listAppointments({ role: 'admin', id: 'admin-1' });

    expect(result).toEqual([{ id: 'a1' }]);
    expect(appointmentRepository.findAll).toHaveBeenCalled();
  });

  it('prevents booking when the slot is already taken', async () => {
    petRepository.findById.mockResolvedValue({ _id: 'pet-1', ownerId: { toString: () => 'owner-1' }, name: 'Milo' });
    vetRepository.findById.mockResolvedValue({ _id: 'vet-1', consultationFee: 100 });
    appointmentRepository.findByVetIdAndDate.mockResolvedValue([{ timeSlot: '09:00' }]);

    await expect(appointmentService.bookAppointment({ role: 'petOwner', id: 'owner-1' }, {
      petId: 'pet-1',
      vetId: 'vet-1',
      date: '2026-08-01',
      timeSlot: '09:00',
    })).rejects.toMatchObject({ statusCode: 409, message: 'This time slot is already booked.' });
  });

  it('builds available slots for a vet', async () => {
    vetRepository.findById.mockResolvedValue({
      _id: 'vet-1',
      availability: { is24Hours: false, openTime: '09:00', closeTime: '10:00', days: ['monday'] },
    });
    appointmentRepository.findByVetIdAndDate.mockResolvedValue([{ timeSlot: '09:30' }]);

    const result = await appointmentService.getAvailableSlots('vet-1', '2026-08-03');

    expect(result).toEqual(['09:00']);
  });

  it('blocks a vet from completing someone else appointment', async () => {
    vetRepository.findByUserId.mockResolvedValue({ _id: 'vet-1' });
    appointmentRepository.findById.mockResolvedValue({ vetId: { toString: () => 'vet-2' } });

    await expect(appointmentService.completeAppointment({ role: 'vet', id: 'user-1' }, 'apt-1')).rejects.toMatchObject({
      statusCode: 403,
      message: 'You can only complete your own appointments.',
    });
  });
});
