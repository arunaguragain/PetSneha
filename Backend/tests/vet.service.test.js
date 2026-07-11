jest.mock('../src/repositories/vet.repository', () => ({
  findAllPublic: jest.fn(),
  findAll: jest.fn(),
  findById: jest.fn(),
  findByUserId: jest.fn(),
  create: jest.fn(),
  updateById: jest.fn(),
}));

jest.mock('../src/repositories/appointment.repository', () => ({
  findById: jest.fn(),
}));

jest.mock('../src/repositories/user.repository', () => ({
  updateById: jest.fn(),
}));

jest.mock('../src/services/admin.service', () => ({
  approveVet: jest.fn(),
}));

const vetRepository = require('../src/repositories/vet.repository');
const appointmentRepository = require('../src/repositories/appointment.repository');
const adminService = require('../src/services/admin.service');
const vetService = require('../src/services/vet.service');

describe('vet service', () => {
  beforeEach(() => jest.clearAllMocks());

  it('builds a filter for public vet listing', async () => {
    vetRepository.findAllPublic.mockResolvedValue([]);

    await vetService.listVets({ isVerified: 'true', location: 'kathmandu', minFee: '500' });

    expect(vetRepository.findAllPublic).toHaveBeenCalledWith(expect.objectContaining({
      isVerified: true,
      location: /kathmandu/i,
      consultationFee: { $gte: 500 },
    }));
  });

  it('rejects duplicate vet profile registration', async () => {
    vetRepository.findByUserId.mockResolvedValue({ id: 'vet-1' });

    await expect(vetService.registerVet({ role: 'vet', id: 'user-1' }, { name: 'Dr. Test' })).rejects.toMatchObject({
      statusCode: 409,
      message: 'Vet profile already exists.',
    });
  });

  it('allows admins to verify vets', async () => {
    adminService.approveVet.mockResolvedValue({ id: 'vet-1' });

    const result = await vetService.verifyVet({ role: 'admin' }, 'vet-1');

    expect(adminService.approveVet).toHaveBeenCalledWith('vet-1');
    expect(result).toEqual({ id: 'vet-1' });
  });

  it('blocks review submission for incomplete appointments', async () => {
    vetRepository.findById.mockResolvedValue({ _id: 'vet-1', reviews: [] });
    appointmentRepository.findById.mockResolvedValue({ petOwnerId: { toString: () => 'owner-1' }, vetId: { toString: () => 'vet-1' }, status: 'pending' });

    await expect(vetService.submitReview({ role: 'petOwner', id: 'owner-1' }, 'vet-1', { appointmentId: 'apt-1', rating: 5 })).rejects.toMatchObject({
      statusCode: 400,
      message: 'You can only review completed appointments.',
    });
  });
});
