const petRepository = require('../repositories/pet.repository');
const AppError = require('../utils/AppError');

function buildPhotoPath(file) {
  return file ? `/uploads/pets/${file.filename}` : undefined;
}

function canAccessPet(currentUser, pet) {
  return currentUser.role === 'admin' || pet.ownerId.toString() === currentUser.id;
}

/**
 * Returns all pets for the current user.
 * @param {{ id: string, role: string }} currentUser
 * @returns {Promise<Array<object>>}
 */
async function listPets(currentUser) {
  if (currentUser.role === 'admin') {
    return petRepository.findAll();
  }

  return petRepository.findByOwnerId(currentUser.id);
}

/**
 * Returns a single pet.
 * @param {{ id: string, role: string }} currentUser
 * @param {string} petId
 * @returns {Promise<object>}
 */
async function getPet(currentUser, petId) {
  const pet = await petRepository.findById(petId);
  if (!pet) {
    throw new AppError('Pet not found.', 404);
  }

  if (!canAccessPet(currentUser, pet)) {
    throw new AppError('You do not have access to this pet.', 403);
  }

  return pet;
}

/**
 * Creates a new pet.
 * @param {{ id: string, role: string }} currentUser
 * @param {object} payload
 * @param {Express.Multer.File} [file]
 * @returns {Promise<object>}
 */
async function createPet(currentUser, payload, file) {
  if (!['petOwner', 'admin'].includes(currentUser.role)) {
    throw new AppError('Only pet owners can add pets.', 403);
  }

  return petRepository.create({
    ownerId: currentUser.id,
    name: payload.name,
    species: payload.species,
    breed: payload.breed,
    age: payload.age,
    weight: payload.weight,
    colour: payload.colour,
    gender: payload.gender,
    ownedSince: payload.ownedSince,
    photo: buildPhotoPath(file),
  });
}

/**
 * Updates a pet.
 * @param {{ id: string, role: string }} currentUser
 * @param {string} petId
 * @param {object} payload
 * @param {Express.Multer.File} [file]
 * @returns {Promise<object>}
 */
async function updatePet(currentUser, petId, payload, file) {
  const pet = await petRepository.findById(petId);
  if (!pet) {
    throw new AppError('Pet not found.', 404);
  }

  if (!canAccessPet(currentUser, pet)) {
    throw new AppError('You do not have access to this pet.', 403);
  }

  return petRepository.updateById(petId, {
    ...payload,
    ...(file ? { photo: buildPhotoPath(file) } : {}),
  });
}

/**
 * Deletes a pet.
 * @param {{ id: string, role: string }} currentUser
 * @param {string} petId
 * @returns {Promise<{ message: string }>}
 */
async function deletePet(currentUser, petId) {
  const pet = await petRepository.findById(petId);
  if (!pet) {
    throw new AppError('Pet not found.', 404);
  }

  if (!canAccessPet(currentUser, pet)) {
    throw new AppError('You do not have access to this pet.', 403);
  }

  await petRepository.deleteById(petId);
  return { message: 'Pet deleted successfully.' };
}

module.exports = { listPets, getPet, createPet, updatePet, deletePet };