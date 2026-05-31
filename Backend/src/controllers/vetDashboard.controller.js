const catchAsync = require('../utils/catchAsync');
const vetDashboardService = require('../services/vetDashboard.service');

function sendItem(res, item, statusCode = 200) {
  return res.status(statusCode).json({ status: 'success', data: item });
}

function getUserId(req) {
  return req.user?._id || req.user?.id;
}

/**
 * Get vet dashboard data.
 */
const getDashboard = catchAsync(async (req, res) => {
  const data = await vetDashboardService.getVetDashboard(getUserId(req));
  sendItem(res, data);
});

/**
 * Get vet appointments.
 */
const getAppointments = catchAsync(async (req, res) => {
  const data = await vetDashboardService.getVetAppointments(getUserId(req), req.query);
  sendItem(res, data);
});

/**
 * Confirm appointment.
 */
const confirmAppointment = catchAsync(async (req, res) => {
  const data = await vetDashboardService.confirmAppointment(getUserId(req), req.params.id);
  sendItem(res, data);
});

/**
 * Complete appointment.
 */
const completeAppointment = catchAsync(async (req, res) => {
  const data = await vetDashboardService.completeAppointment(getUserId(req), req.params.id, req.body);
  sendItem(res, data);
});

/**
 * Cancel appointment.
 */
const cancelAppointment = catchAsync(async (req, res) => {
  const data = await vetDashboardService.vetCancelAppointment(getUserId(req), req.params.id, req.body.reason);
  sendItem(res, data);
});

/**
 * Toggle vet status.
 */
const toggleOpenStatus = catchAsync(async (req, res) => {
  const data = await vetDashboardService.toggleOpenStatus(getUserId(req));
  sendItem(res, data);
});

/**
 * Submit article.
 */
const submitArticle = catchAsync(async (req, res) => {
  const data = await vetDashboardService.submitArticle(getUserId(req), req.body);
  sendItem(res, data, 201);
});

/**
 * Get my articles.
 */
const getMyArticles = catchAsync(async (req, res) => {
  const data = await vetDashboardService.getMyArticles(getUserId(req));
  sendItem(res, data);
});

/**
 * Reply to review.
 */
const replyToReview = catchAsync(async (req, res) => {
  const data = await vetDashboardService.replyToReview(getUserId(req), req.params.reviewId, req.body.reply);
  sendItem(res, data);
});

module.exports = {
  getDashboard,
  getAppointments,
  confirmAppointment,
  completeAppointment,
  cancelAppointment,
  toggleOpenStatus,
  submitArticle,
  getMyArticles,
  replyToReview,
};