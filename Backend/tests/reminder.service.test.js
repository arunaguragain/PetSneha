jest.mock('../src/repositories/reminder.repository', () => ({
  findByUserId: jest.fn(),
  findByPetId: jest.fn(),
  create: jest.fn(),
  findById: jest.fn(),
  updateById: jest.fn(),
  deleteById: jest.fn(),
  findActive: jest.fn(),
}));

jest.mock('../src/repositories/pet.repository', () => ({
  findById: jest.fn(),
}));

jest.mock('../src/repositories/user.repository', () => ({
  findById: jest.fn(),
}));

jest.mock('../src/repositories/vet.repository', () => ({
  findById: jest.fn(),
}));

jest.mock('../src/services/notification.service', () => ({
  sendReminderEmail: jest.fn(),
}));

const reminderRepository = require('../src/repositories/reminder.repository');
const petRepository = require('../src/repositories/pet.repository');
const userRepository = require('../src/repositories/user.repository');
const vetRepository = require('../src/repositories/vet.repository');
const notificationService = require('../src/services/notification.service');
const reminderService = require('../src/services/reminder.service');

describe('reminder service', () => {
  beforeEach(() => jest.clearAllMocks());

  it('creates a reminder for a valid pet', async () => {
    petRepository.findById.mockResolvedValue({ ownerId: { toString: () => 'owner-1' } });
    reminderRepository.create.mockResolvedValue({ id: 'rem-1' });

    const result = await reminderService.createReminder({ role: 'petOwner', id: 'owner-1' }, {
      petId: 'pet-1',
      title: 'Vaccination',
      type: 'medical',
      dueDate: '2026-08-01',
      leadTimeDays: 3,
    });

    expect(reminderRepository.create).toHaveBeenCalledWith(expect.objectContaining({
      userId: 'owner-1',
      petId: 'pet-1',
      title: 'Vaccination',
    }));
    expect(result).toEqual({ id: 'rem-1' });
  });

  it('prevents access to another user reminder', async () => {
    reminderRepository.findById.mockResolvedValue({ userId: { toString: () => 'owner-2' } });

    await expect(reminderService.deleteReminder({ role: 'petOwner', id: 'owner-1' }, 'rem-1')).rejects.toMatchObject({
      statusCode: 403,
      message: 'You do not have access to this reminder.',
    });
  });

  it('processes due reminders and triggers notifications', async () => {
    reminderRepository.findActive.mockResolvedValue([{ _id: 'rem-1', dueDate: '2026-08-01', leadTimeDays: 0, userId: 'owner-1', petId: 'pet-1' }]);
    userRepository.findById.mockResolvedValue({ id: 'owner-1' });
    petRepository.findById.mockResolvedValue({ name: 'Milo' });
    vetRepository.findById.mockResolvedValue(null);
    notificationService.sendReminderEmail.mockResolvedValue(undefined);
    reminderRepository.updateById.mockResolvedValue({});

    const today = new Date();
    const dueDate = new Date(today);
    dueDate.setDate(dueDate.getDate());

    reminderRepository.findActive.mockResolvedValue([{ _id: 'rem-1', dueDate: dueDate.toISOString(), leadTimeDays: 0, userId: 'owner-1', petId: 'pet-1' }]);

    await reminderService.processDueReminders();

    expect(notificationService.sendReminderEmail).toHaveBeenCalled();
    expect(reminderRepository.updateById).toHaveBeenCalled();
  });
});
