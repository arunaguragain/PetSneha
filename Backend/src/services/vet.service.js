const vetRepository = require('../repositories/vet.repository');
const appointmentRepository = require('../repositories/appointment.repository');
const userRepository = require('../repositories/user.repository');
const AppError = require('../utils/AppError');

function parseNumber(value) {
  if (value === undefined || value === null || value === '') {
    return undefined;
  }

  const parsed = Number(value);
  return Number.isNaN(parsed) ? undefined : parsed;
}

function buildFilter(query) {
  const filter = {};

  if (query.isVerified !== undefined) {
    filter.isVerified = query.isVerified === 'true';
  } else if (query.verified !== undefined) {
    filter.isVerified = query.verified === 'true';
  }

  if (query.location) {
    filter.location = new RegExp(query.location, 'i');
  }

  const minFee = parseNumber(query.minFee || query.feeMin);
  const maxFee = parseNumber(query.maxFee || query.feeMax);
  if (minFee !== undefined || maxFee !== undefined) {
    filter.consultationFee = {};
    if (minFee !== undefined) {
      filter.consultationFee.$gte = minFee;
    }
    if (maxFee !== undefined) {
      filter.consultationFee.$lte = maxFee;
    }
  }

  return filter;
}

/**
 * Returns all vets matching the provided filters.
 * @param {object} query
 * @returns {Promise<Array<object>>}
 */
async function listVets(query) {
  return vetRepository.findAllPublic(buildFilter(query));
}

/**
 * Returns a single vet profile.
 * @param {string} vetId
 * @returns {Promise<object>}
 */
async function getVet(vetId) {
  const vet = await vetRepository.findById(vetId);
  if (!vet) {
    throw new AppError('Vet not found.', 404);
  }

  return vet;
}

/**
 * Returns open or 24-hour vets near the user.
 * @param {object} query
 * @returns {Promise<Array<object>>}
 */
async function getEmergencyVets(query) {
  const filter = {
    $or: [{ isOpenNow: true }, { 'availability.is24Hours': true }],
  };

  if (query.location) {
    filter.location = new RegExp(query.location, 'i');
  }

  return vetRepository.findAll(filter);
}

/**
 * Registers a vet profile for the logged-in vet user.
 * @param {{ id: string, role: string }} currentUser
 * @param {object} payload
 * @returns {Promise<object>}
 */
async function registerVet(currentUser, payload) {
  if (!['vet', 'admin'].includes(currentUser.role)) {
    throw new AppError('Only vet users can register a vet profile.', 403);
  }

  const existingVet = await vetRepository.findByUserId(currentUser.id);
  if (existingVet) {
    throw new AppError('Vet profile already exists.', 409);
  }

  return vetRepository.create({
    userId: currentUser.id,
    name: payload.name,
    specialisation: payload.specialisation,
    clinicName: payload.clinicName,
    location: payload.location,
    licenseNumber: payload.licenseNumber,
    yearsExperience: payload.yearsExperience,
    consultationFee: payload.consultationFee,
    availability: payload.availability,
    bio: payload.bio,
    profilePhoto: payload.profilePhoto,
  });
}

/**
 * Updates a vet profile owned by the current user.
 * @param {{ id: string, role: string }} currentUser
 * @param {string} vetId
 * @param {object} payload
 * @returns {Promise<object>}
 */
async function updateVetProfile(currentUser, vetId, payload) {
  const vet = await vetRepository.findById(vetId);
  if (!vet) {
    throw new AppError('Vet not found.', 404);
  }

  if (currentUser.role !== 'admin' && vet.userId.toString() !== currentUser.id) {
    throw new AppError('You can only update your own vet profile.', 403);
  }

  return vetRepository.updateById(vetId, payload);
}

/**
 * Toggles the open-now status of a vet profile.
 * @param {{ id: string, role: string }} currentUser
 * @param {string} vetId
 * @param {boolean} isOpenNow
 * @returns {Promise<object>}
 */
async function toggleOpenStatus(currentUser, vetId, isOpenNow) {
  const vet = await vetRepository.findById(vetId);
  if (!vet) {
    throw new AppError('Vet not found.', 404);
  }

  if (currentUser.role !== 'admin' && vet.userId.toString() !== currentUser.id) {
    throw new AppError('You can only update your own vet profile.', 403);
  }

  return vetRepository.updateById(vetId, { isOpenNow: Boolean(isOpenNow) });
}

/**
 * Verifies a vet profile.
 * @param {{ role: string }} currentUser
 * @param {string} vetId
 * @returns {Promise<object>}
 */
async function verifyVet(currentUser, vetId) {
  if (currentUser.role !== 'admin') {
    throw new AppError('Only admins can verify vets.', 403);
  }

  const vet = await vetRepository.findById(vetId);
  if (!vet) {
    throw new AppError('Vet not found.', 404);
  }

  return vetRepository.updateById(vetId, { isVerified: true });
}

/**
 * Returns all reviews for a vet.
 * @param {string} vetId
 * @returns {Promise<Array<object>>}
 */
async function getReviews(vetId) {
  const vet = await vetRepository.findById(vetId);
  if (!vet) {
    throw new AppError('Vet not found.', 404);
  }

  return vet.reviews || [];
}

/**
 * Submits a review after a completed appointment.
 * @param {{ id: string, role: string }} currentUser
 * @param {string} vetId
 * @param {{ appointmentId: string, rating: number, comment?: string }} payload
 * @returns {Promise<object>}
 */
async function submitReview(currentUser, vetId, payload) {
  const vet = await vetRepository.findById(vetId);
  if (!vet) {
    throw new AppError('Vet not found.', 404);
  }

  // If an appointmentId is provided, run the full ownership/status checks.
  if (payload.appointmentId) {
    const appointment = await appointmentRepository.findById(payload.appointmentId);
    if (!appointment) {
      throw new AppError('Appointment not found.', 404);
    }

    if (currentUser.role !== 'admin' && appointment.petOwnerId.toString() !== currentUser.id) {
      throw new AppError('You can only review your own appointment.', 403);
    }

    if (appointment.vetId.toString() !== vetId) {
      throw new AppError('This appointment does not belong to the selected vet.', 400);
    }

    if (appointment.status !== 'completed') {
      throw new AppError('You can only review completed appointments.', 400);
    }

    const alreadyReviewed = (vet.reviews || []).some(
      (review) => review.appointmentId && review.appointmentId.toString() === payload.appointmentId
    );
    if (alreadyReviewed) {
      throw new AppError('This appointment has already been reviewed.', 409);
    }
  }

  const rating = Number(payload.rating);
  const reviewCount = vet.reviewCount || 0;
  const updatedRating = ((vet.rating || 0) * reviewCount + rating) / (reviewCount + 1);

  return vetRepository.updateById(vetId, {
    $push: {
      reviews: {
        authorId: currentUser.id,
        appointmentId: payload.appointmentId || undefined,
        rating,
        comment: payload.comment,
      },
    },
    $set: {
      rating: Number(updatedRating.toFixed(2)),
      reviewCount: reviewCount + 1,
    },
  });
}

module.exports = {
  listVets,
  getVet,
  getEmergencyVets,
  registerVet,
  updateVetProfile,
  toggleOpenStatus,
  verifyVet,
  submitReview,
  getReviews,
};