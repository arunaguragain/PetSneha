const catchAsync = require('../utils/catchAsync');
const adminService = require('../services/admin.service');

function sendItem(res, item, statusCode = 200) {
  return res.status(statusCode).json({ status: 'success', data: item });
}

/**
 * Get admin dashboard.
 */
const getDashboard = catchAsync(async (req, res) => {
  const data = await adminService.getAdminDashboard();
  sendItem(res, data);
});

/**
 * Get all users.
 */
const getAllUsers = catchAsync(async (req, res) => {
  const data = await adminService.getAllUsers(req.query);
  sendItem(res, data);
});

/**
 * Get single user.
 */
const getUserById = catchAsync(async (req, res) => {
  const data = await adminService.getUserById(req.params.id);
  sendItem(res, data);
});

/**
 * Deactivate user.
 */
const deactivateUser = catchAsync(async (req, res) => {
  const data = await adminService.deactivateUser(req.params.id, req.user._id || req.user.id);
  sendItem(res, data);
});

/**
 * Reactivate user.
 */
const reactivateUser = catchAsync(async (req, res) => {
  const data = await adminService.reactivateUser(req.params.id);
  sendItem(res, data);
});

/**
 * Get all pets.
 */
const getAllPets = catchAsync(async (req, res) => {
  const data = await adminService.getAllPets(req.query);
  sendItem(res, data);
});

/**
 * Get pending vets.
 */
const getPendingVets = catchAsync(async (req, res) => {
  const data = await adminService.getPendingVets();
  sendItem(res, data);
});

/**
 * Get all vets.
 */
const getAllVets = catchAsync(async (req, res) => {
  const data = await adminService.getAllVets(req.query);
  sendItem(res, data);
});

/**
 * Approve vet.
 */
const approveVet = catchAsync(async (req, res) => {
  const data = await adminService.approveVet(req.params.id);
  sendItem(res, data);
});

/**
 * Reject vet.
 */
const rejectVet = catchAsync(async (req, res) => {
  const data = await adminService.rejectVet(req.params.id, req.body.reason);
  sendItem(res, data);
});

/**
 * Get pending articles.
 */
const getPendingArticles = catchAsync(async (req, res) => {
  const data = await adminService.getPendingArticles();
  sendItem(res, data);
});

/**
 * Get all articles.
 */
const getAllArticles = catchAsync(async (req, res) => {
  const data = await adminService.getAllArticles(req.query);
  sendItem(res, data);
});

/**
 * Publish article.
 */
const publishArticle = catchAsync(async (req, res) => {
  const data = await adminService.publishArticle(req.params.id);
  sendItem(res, data);
});

/**
 * Reject article.
 */
const rejectArticle = catchAsync(async (req, res) => {
  const data = await adminService.rejectArticle(req.params.id, req.body.reason);
  sendItem(res, data);
});

/**
 * Get reported posts.
 */
const getReportedPosts = catchAsync(async (req, res) => {
  const data = await adminService.getReportedPosts();
  sendItem(res, data);
});

/**
 * Get all forum posts.
 */
const getAllForumPosts = catchAsync(async (req, res) => {
  const data = await adminService.getAllForumPosts(req.query);
  sendItem(res, data);
});

/**
 * Remove post.
 */
const removePost = catchAsync(async (req, res) => {
  await adminService.removePost(req.params.id);
  res.status(204).send();
});

/**
 * Pin post.
 */
const pinPost = catchAsync(async (req, res) => {
  const data = await adminService.pinPost(req.params.id);
  sendItem(res, data);
});

/**
 * Get pending products.
 */
const getPendingProducts = catchAsync(async (req, res) => {
  const data = await adminService.getPendingProducts();
  sendItem(res, data);
});

/**
 * Get all products.
 */
const getAllProducts = catchAsync(async (req, res) => {
  const data = await adminService.getAllProducts(req.query);
  sendItem(res, data);
});

/**
 * Approve product.
 */
const approveProduct = catchAsync(async (req, res) => {
  const data = await adminService.approveProduct(req.params.id);
  sendItem(res, data);
});

/**
 * Reject product.
 */
const rejectProduct = catchAsync(async (req, res) => {
  const data = await adminService.rejectProduct(req.params.id);
  sendItem(res, data);
});

/**
 * Get all orders.
 */
const getAllOrders = catchAsync(async (req, res) => {
  const data = await adminService.getAllOrders(req.query);
  sendItem(res, data);
});

module.exports = {
  getDashboard,
  getAllUsers,
  getUserById,
  deactivateUser,
  reactivateUser,
  getAllPets,
  getPendingVets,
  getAllVets,
  approveVet,
  rejectVet,
  getPendingArticles,
  getAllArticles,
  publishArticle,
  rejectArticle,
  getReportedPosts,
  getAllForumPosts,
  removePost,
  pinPost,
  getPendingProducts,
  getAllProducts,
  approveProduct,
  rejectProduct,
  getAllOrders,
};