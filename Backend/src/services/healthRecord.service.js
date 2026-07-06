const PDFDocument = require('pdfkit');
const petRepository = require('../repositories/pet.repository');
const healthRecordRepository = require('../repositories/healthRecord.repository');
const vetRepository = require('../repositories/vet.repository');
const AppError = require('../utils/AppError');

function canAccess(currentUser, pet, record) {
  if (currentUser.role === 'admin') {
    return true;
  }

  if (currentUser.role === 'vet') {
    return true;
  }

  return pet.ownerId.toString() === currentUser.id;
}

async function resolveVetId(currentUser) {
  if (currentUser.role !== 'vet') {
    return undefined;
  }

  const vetProfile = await vetRepository.findByUserId(currentUser.id);
  return vetProfile ? vetProfile._id : undefined;
}

/**
 * Returns all health records for a pet.
 * @param {{ id: string, role: string }} currentUser
 * @param {string} petId
 * @returns {Promise<Array<object>>}
 */
async function listRecords(currentUser, petId) {
  const pet = await petRepository.findById(petId);
  if (!pet) {
    throw new AppError('Pet not found.', 404);
  }

  if (!canAccess(currentUser, pet)) {
    throw new AppError('You do not have access to this pet.', 403);
  }

  return healthRecordRepository.findByPetId(petId);
}

/**
 * Creates a manual health record.
 * @param {{ id: string, role: string }} currentUser
 * @param {string} petId
 * @param {object} payload
 * @returns {Promise<object>}
 */
async function addManualRecord(currentUser, petId, payload) {
  const pet = await petRepository.findById(petId);
  if (!pet) {
    throw new AppError('Pet not found.', 404);
  }

  if (!canAccess(currentUser, pet)) {
    throw new AppError('You do not have access to this pet.', 403);
  }

  const vetId = await resolveVetId(currentUser);

  return healthRecordRepository.create({
    petId,
    vetId,
    appointmentId: payload.appointmentId,
    type: payload.type || 'other',
    customType: payload.type === 'other' ? payload.customType : undefined,
    title: payload.title,
    description: payload.description,
    date: payload.date,
    nextDueDate: payload.nextDueDate,
    status: payload.status,
    attachments: payload.attachments || [],
    addedBy: currentUser.role === 'vet' ? 'vet' : 'owner',
  });
}

/**
 * Updates a health record.
 * @param {{ id: string, role: string }} currentUser
 * @param {string} petId
 * @param {string} recordId
 * @param {object} payload
 * @returns {Promise<object>}
 */
async function updateRecord(currentUser, petId, recordId, payload) {
  const pet = await petRepository.findById(petId);
  if (!pet) {
    throw new AppError('Pet not found.', 404);
  }

  if (!canAccess(currentUser, pet)) {
    throw new AppError('You do not have access to this pet.', 403);
  }

  const record = await healthRecordRepository.findById(recordId);
  if (!record) {
    throw new AppError('Health record not found.', 404);
  }

  if (record.petId.toString() !== petId) {
    throw new AppError('This record does not belong to the selected pet.', 400);
  }

  return healthRecordRepository.updateById(recordId, payload);
}

/**
 * Deletes a health record.
 * @param {{ id: string, role: string }} currentUser
 * @param {string} petId
 * @param {string} recordId
 * @returns {Promise<{ message: string }>}
 */
async function deleteRecord(currentUser, petId, recordId) {
  const pet = await petRepository.findById(petId);
  if (!pet) {
    throw new AppError('Pet not found.', 404);
  }

  if (!canAccess(currentUser, pet)) {
    throw new AppError('You do not have access to this pet.', 403);
  }

  const record = await healthRecordRepository.findById(recordId);
  if (!record) {
    throw new AppError('Health record not found.', 404);
  }

  if (record.petId.toString() !== petId) {
    throw new AppError('This record does not belong to the selected pet.', 400);
  }

  await healthRecordRepository.deleteById(recordId);
  return { message: 'Health record deleted successfully.' };
}

function buildPdfBuffer(title, lines) {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: 40 });
    const chunks = [];

    doc.on('data', (chunk) => chunks.push(chunk));
    doc.on('end', () => resolve(Buffer.concat(chunks)));
    doc.on('error', reject);

    doc.fontSize(20).text(title);
    doc.moveDown();
    lines.forEach((line) => {
      doc.fontSize(11).text(line);
    });
    doc.end();
  });
}

/**
 * Generates a PDF summary for a pet's records.
 * @param {{ id: string, role: string }} currentUser
 * @param {string} petId
 * @returns {Promise<Buffer>}
 */
async function generateSummaryPdf(currentUser, petId) {
  const pet = await petRepository.findById(petId);
  if (!pet) {
    throw new AppError('Pet not found.', 404);
  }

  if (!canAccess(currentUser, pet)) {
    throw new AppError('You do not have access to this pet.', 403);
  }

  const records = await healthRecordRepository.findByPetId(petId);
  const lines = [`Pet: ${pet.name}`, `Species: ${pet.species}`, `Breed: ${pet.breed || 'N/A'}`, ''];

  records.forEach((record, index) => {
    lines.push(`${index + 1}. ${record.title} (${record.type})`);
    lines.push(`   Date: ${new Date(record.date).toDateString()}`);
    if (record.description) {
      lines.push(`   Notes: ${record.description}`);
    }
    lines.push('');
  });

  return buildPdfBuffer(`${pet.name} Health Summary`, lines);
}

module.exports = { listRecords, addManualRecord, updateRecord, deleteRecord, generateSummaryPdf };