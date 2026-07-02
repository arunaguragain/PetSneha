const catchAsync = require('../utils/catchAsync');
const vetService = require('../services/vet.service');
const vetDashboardService = require('../services/vetDashboard.service');

function sendList(res, items) {
  return res.status(200).json({ status: 'success', results: items.length, data: { items } });
}

function sendItem(res, key, item, statusCode = 200) {
  return res.status(statusCode).json({ status: 'success', data: { [key]: item } });
}

/**
 * Lists vets.
 */
const listVets = catchAsync(async (req, res) => {
  const vets = await vetService.listVets(req.query);
  sendList(res, vets);
});

/**
 * Gets one vet.
 */
const getVet = catchAsync(async (req, res) => {
  const vet = await vetService.getVet(req.params.id);
  sendItem(res, 'vet', vet);
});

/**
 * Lists emergency vets.
 */
const getEmergencyVets = catchAsync(async (req, res) => {
  const vets = await vetService.getEmergencyVets(req.query);
  sendList(res, vets);
});

/**
 * Registers a vet profile.
 */
const registerVet = catchAsync(async (req, res) => {
  const vet = await vetService.registerVet(req.user, req.body);
  sendItem(res, 'vet', vet, 201);
});

/**
 * Updates a vet profile.
 */
const updateVetProfile = catchAsync(async (req, res) => {
  // Log incoming data for debugging
  console.log('Received update request with fields:', Object.keys(req.body));
  Object.keys(req.body).forEach(key => {
    const value = req.body[key];
    if (typeof value === 'string') {
      console.log(`  ${key}: ${value.length} chars`);
    } else if (typeof value === 'object') {
      console.log(`  ${key}: object`);
    }
  });

  const updateData = {};
  
  // Whitelist and sanitize fields
  const allowedFields = ['name', 'specialisation', 'clinicName', 'location', 'yearsExperience', 'consultationFee', 'bio', 'availability', 'isOpenNow'];
  
  allowedFields.forEach(field => {
    if (field in req.body) {
      let value = req.body[field];
      
      // Truncate string fields to reasonable lengths
      if (typeof value === 'string') {
        const maxLengths = {
          name: 100,
          specialisation: 100,
          clinicName: 150,
          location: 150,
          bio: 500,
        };
        const maxLen = maxLengths[field];
        if (maxLen && value.length > maxLen) {
          console.log(`Truncating ${field} from ${value.length} to ${maxLen} chars`);
          value = value.substring(0, maxLen);
        }
      }
      
      updateData[field] = value;
    }
  });
  
  // Handle file upload
  if (req.file) {
    updateData.profilePhoto = `/uploads/vets/${req.file.filename}`;
  }
  
  console.log('Final update data fields:', Object.keys(updateData));
  const vet = await vetService.updateVetProfile(req.user, req.params.id, updateData);
  sendItem(res, 'vet', vet);
});

/**
 * Toggles a vet open-now status.
 */
const toggleOpenStatus = catchAsync(async (req, res) => {
  const vet = await vetService.toggleOpenStatus(req.user, req.params.id, req.body.isOpenNow);
  sendItem(res, 'vet', vet);
});

/**
 * Verifies a vet profile.
 */
const verifyVet = catchAsync(async (req, res) => {
  const vet = await vetService.verifyVet(req.user, req.params.id);
  sendItem(res, 'vet', vet);
});

/**
 * Submits a review for a vet.
 */
const submitReview = catchAsync(async (req, res) => {
  const vet = await vetService.submitReview(req.user, req.params.id, req.body);
  sendItem(res, 'vet', vet, 201);
});

/**
 * Lists reviews for a vet.
 */
const getReviews = catchAsync(async (req, res) => {
  const reviews = await vetService.getReviews(req.params.id);
  sendList(res, reviews);
});

/**
 * Reply to a review.
 */
const replyToReview = catchAsync(async (req, res) => {
  const updatedVet = await vetDashboardService.replyToReview(req.user.id, req.params.reviewId, req.body.reply);
  sendItem(res, 'vet', updatedVet);
});

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
  replyToReview,
};