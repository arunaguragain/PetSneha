jest.mock('../src/repositories/user.repository', () => ({
  findById: jest.fn(),
  updateById: jest.fn(),
  deleteById: jest.fn(),
}));

jest.mock('../src/repositories/pet.repository', () => ({
  findByOwnerId: jest.fn(),
  deleteManyByOwnerId: jest.fn(),
}));

jest.mock('../src/repositories/reminder.repository', () => ({
  deleteManyByUserId: jest.fn(),
}));

jest.mock('../src/repositories/order.repository', () => ({
  deleteManyByUserId: jest.fn(),
}));

jest.mock('../src/repositories/appointment.repository', () => ({
  deleteManyByUserId: jest.fn(),
}));

jest.mock('../src/repositories/healthRecord.repository', () => ({
  deleteManyByPetIds: jest.fn(),
}));

jest.mock('../src/repositories/vet.repository', () => ({
  findByUserId: jest.fn(),
  deleteById: jest.fn(),
}));

const userRepository = require('../src/repositories/user.repository');
const petRepository = require('../src/repositories/pet.repository');
const reminderRepository = require('../src/repositories/reminder.repository');
const orderRepository = require('../src/repositories/order.repository');
const appointmentRepository = require('../src/repositories/appointment.repository');
const healthRecordRepository = require('../src/repositories/healthRecord.repository');
const vetRepository = require('../src/repositories/vet.repository');
const userService = require('../src/services/user.service');

describe('user service', () => {
  beforeEach(() => jest.clearAllMocks());

  it('updates only allowed profile fields', async () => {
    userRepository.updateById.mockResolvedValue({ id: 'u1', name: 'Jane' });

    const result = await userService.updateProfile('u1', { name: 'Jane', phone: '123', password: 'x' });

    expect(userRepository.updateById).toHaveBeenCalledWith('u1', { name: 'Jane', phone: '123' });
    expect(result).toEqual({ id: 'u1', name: 'Jane' });
  });

  it('builds the onboarding checklist from existing values', async () => {
    userRepository.findById.mockResolvedValue({ checklist: { sleepArea: false, food: true } });

    const result = await userService.getChecklist('u1');

    expect(result).toEqual(expect.objectContaining({ sleepingArea: false, food: true, vetVisit: false, groomingTools: false }));
  });

  it('deletes a pet owner account and related data', async () => {
    userRepository.findById.mockResolvedValue({ id: 'u1', role: 'petOwner' });
    petRepository.findByOwnerId.mockResolvedValue([{ _id: { toString: () => 'pet-1' } }]);
    userRepository.deleteById.mockResolvedValue({});

    await userService.deleteAccount('u1');

    expect(healthRecordRepository.deleteManyByPetIds).toHaveBeenCalledWith(['pet-1']);
    expect(petRepository.deleteManyByOwnerId).toHaveBeenCalledWith('u1');
    expect(reminderRepository.deleteManyByUserId).toHaveBeenCalledWith('u1');
    expect(orderRepository.deleteManyByUserId).toHaveBeenCalledWith('u1');
    expect(appointmentRepository.deleteManyByUserId).toHaveBeenCalledWith('u1');
  });

  it('syncs a vet profile photo to the user record', async () => {
    userRepository.findById.mockResolvedValue({ role: 'vet', profilePhoto: null });
    vetRepository.findByUserId.mockResolvedValue({ profilePhoto: 'vet.png' });
    userRepository.updateById.mockResolvedValue({});

    await userService.getCurrentUser('u1');

    expect(userRepository.updateById).toHaveBeenCalledWith('u1', { profilePhoto: 'vet.png' });
  });
});
