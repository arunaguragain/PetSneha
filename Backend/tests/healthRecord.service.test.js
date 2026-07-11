jest.mock('../src/repositories/pet.repository', () => ({
  findById: jest.fn(),
}));

jest.mock('../src/repositories/healthRecord.repository', () => ({
  findByPetId: jest.fn(),
  create: jest.fn(),
  findById: jest.fn(),
  updateById: jest.fn(),
  deleteById: jest.fn(),
}));

jest.mock('../src/repositories/vet.repository', () => ({
  findByUserId: jest.fn(),
}));

const petRepository = require('../src/repositories/pet.repository');
const healthRecordRepository = require('../src/repositories/healthRecord.repository');
const vetRepository = require('../src/repositories/vet.repository');
const healthRecordService = require('../src/services/healthRecord.service');

describe('health record service', () => {
  beforeEach(() => jest.clearAllMocks());

  it('blocks access when a pet owner tries to view someone else pet records', async () => {
    petRepository.findById.mockResolvedValue({ ownerId: { toString: () => 'owner-2' } });

    await expect(healthRecordService.listRecords({ role: 'petOwner', id: 'owner-1' }, 'pet-1')).rejects.toMatchObject({
      statusCode: 403,
      message: 'You do not have access to this pet.',
    });
  });

  it('creates a manual record and tags it as added by a vet', async () => {
    petRepository.findById.mockResolvedValue({ ownerId: { toString: () => 'owner-1' } });
    vetRepository.findByUserId.mockResolvedValue({ _id: 'vet-1' });
    healthRecordRepository.create.mockResolvedValue({ id: 'record-1' });

    const result = await healthRecordService.addManualRecord({ role: 'vet', id: 'user-1' }, 'pet-1', {
      title: 'Vaccination',
      description: 'Done',
      type: 'vaccination',
      date: '2026-07-01',
    });

    expect(healthRecordRepository.create).toHaveBeenCalledWith(expect.objectContaining({
      petId: 'pet-1',
      vetId: 'vet-1',
      addedBy: 'vet',
      title: 'Vaccination',
    }));
    expect(result).toEqual({ id: 'record-1' });
  });

  it('prevents updating a record that belongs to a different pet', async () => {
    petRepository.findById.mockResolvedValue({ ownerId: { toString: () => 'owner-1' } });
    healthRecordRepository.findById.mockResolvedValue({ petId: { toString: () => 'pet-2' } });

    await expect(healthRecordService.updateRecord({ role: 'petOwner', id: 'owner-1' }, 'pet-1', 'record-1', { title: 'Updated' })).rejects.toMatchObject({
      statusCode: 400,
      message: 'This record does not belong to the selected pet.',
    });
  });

  it('generates a PDF summary buffer for accessible records', async () => {
    petRepository.findById.mockResolvedValue({ name: 'Milo', species: 'Dog', breed: 'Labrador', ownerId: { toString: () => 'owner-1' } });
    healthRecordRepository.findByPetId.mockResolvedValue([{ title: 'Checkup', type: 'visit', date: '2026-01-01', description: 'Normal' }]);

    const result = await healthRecordService.generateSummaryPdf({ role: 'petOwner', id: 'owner-1' }, 'pet-1');

    expect(Buffer.isBuffer(result)).toBe(true);
    expect(result.length).toBeGreaterThan(0);
  });
});
