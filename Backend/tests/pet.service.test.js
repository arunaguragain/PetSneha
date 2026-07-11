jest.mock('../src/repositories/pet.repository', () => ({
  findAll: jest.fn(),
  findByOwnerId: jest.fn(),
  findById: jest.fn(),
  create: jest.fn(),
  updateById: jest.fn(),
  deleteById: jest.fn(),
}));

const petRepository = require('../src/repositories/pet.repository');
const petService = require('../src/services/pet.service');

describe('pet service', () => {
  beforeEach(() => jest.clearAllMocks());

  it('lists all pets for admins', async () => {
    petRepository.findAll.mockResolvedValue([{ name: 'Milo' }]);

    const result = await petService.listPets({ role: 'admin', id: 'admin-1' });

    expect(result).toEqual([{ name: 'Milo' }]);
    expect(petRepository.findAll).toHaveBeenCalled();
  });

  it('denies access when a pet owner does not match', async () => {
    petRepository.findById.mockResolvedValue({ ownerId: { toString: () => 'owner-2' } });

    await expect(petService.getPet({ role: 'petOwner', id: 'owner-1' }, 'pet-1')).rejects.toMatchObject({
      statusCode: 403,
      message: 'You do not have access to this pet.',
    });
  });

  it('creates a pet with a photo path when provided', async () => {
    petRepository.create.mockResolvedValue({ id: 'pet-1' });

    const file = { filename: 'pet.png' };
    const result = await petService.createPet({ role: 'petOwner', id: 'owner-1' }, { name: 'Luna' }, file);

    expect(petRepository.create).toHaveBeenCalledWith(expect.objectContaining({
      ownerId: 'owner-1',
      name: 'Luna',
      photo: '/uploads/pets/pet.png',
    }));
    expect(result).toEqual({ id: 'pet-1' });
  });
});
