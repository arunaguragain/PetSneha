const catchAsync = require('../utils/catchAsync');
const petService = require('../services/pet.service');

function sendList(res, items) {
  return res.status(200).json({ status: 'success', results: items.length, data: { items } });
}

function sendItem(res, key, item, statusCode = 200) {
  return res.status(statusCode).json({ status: 'success', data: { [key]: item } });
}

/**
 * Lists the current user's pets.
 */
const listPets = catchAsync(async (req, res) => {
  const pets = await petService.listPets(req.user);
  sendList(res, pets);
});

/**
 * Gets a single pet.
 */
const getPet = catchAsync(async (req, res) => {
  const pet = await petService.getPet(req.user, req.params.id);
  sendItem(res, 'pet', pet);
});

/**
 * Creates a pet.
 */
const createPet = catchAsync(async (req, res) => {
  const pet = await petService.createPet(req.user, req.body, req.file);
  sendItem(res, 'pet', pet, 201);
});

/**
 * Updates a pet.
 */
const updatePet = catchAsync(async (req, res) => {
  const pet = await petService.updatePet(req.user, req.params.id, req.body, req.file);
  sendItem(res, 'pet', pet);
});

/**
 * Deletes a pet.
 */
const deletePet = catchAsync(async (req, res) => {
  await petService.deletePet(req.user, req.params.id);
  res.status(204).send();
});

module.exports = { listPets, getPet, createPet, updatePet, deletePet };