const AppError = require('../utils/AppError');
const adminRepository = require('../repositories/admin.repository');

/**
 * Get full admin dashboard data.
 * @returns {Promise}
 */
async function getAdminDashboard() {
  const [stats, pendingVets, pendingArticles, reportedPosts, pendingProducts] = await Promise.all([
    adminRepository.getPlatformStats(),
    adminRepository.getPendingVets(),
    adminRepository.getPendingArticles(),
    adminRepository.getReportedPosts(),
    adminRepository.getPendingProducts(),
  ]);

  return {
    stats,
    pendingVetCount: pendingVets.length,
    pendingArticleCount: pendingArticles.length,
    reportedPostCount: reportedPosts.length,
    pendingProductCount: pendingProducts.length,
  };
}

/**
 * Get all users with pagination and search.
 * @param {object} filters
 * @returns {Promise}
 */
async function getAllUsers(filters) {
  return adminRepository.getAllUsers(filters);
}

/**
 * Get a user by id.
 * @param {string} userId
 * @returns {Promise}
 */
async function getUserById(userId) {
  const user = await adminRepository.getUserById(userId);
  if (!user) {
    throw new AppError('User not found.', 404);
  }

  return user;
}

/**
 * Deactivate a user account.
 * @param {string} targetUserId
 * @param {string} adminId
 * @returns {Promise}
 */
async function deactivateUser(targetUserId, adminId) {
  if (targetUserId === adminId) {
    throw new AppError('You cannot deactivate your own account.', 400);
  }

  const user = await adminRepository.setUserActiveStatus(targetUserId, false);
  if (!user) {
    throw new AppError('User not found.', 404);
  }

  return user;
}

/**
 * Reactivate a user account.
 * @param {string} targetUserId
 * @returns {Promise}
 */
async function reactivateUser(targetUserId) {
  const user = await adminRepository.setUserActiveStatus(targetUserId, true);
  if (!user) {
    throw new AppError('User not found.', 404);
  }

  return user;
}

/**
 * Get all pets with pagination and search.
 * @param {object} filters
 * @returns {Promise}
 */
async function getAllPets(filters) {
  return adminRepository.getAllPets(filters);
}

/**
 * Get all pending vet verifications.
 * @returns {Promise}
 */
async function getPendingVets() {
  return adminRepository.getPendingVets();
}

/**
 * Get all vets with filters.
 * @param {object} filters
 * @returns {Promise}
 */
async function getAllVets(filters) {
  return adminRepository.getAllVets(filters);
}

/**
 * Get all articles.
 * @param {object} filters
 * @returns {Promise}
 */
async function getAllArticles(filters) {
  return adminRepository.getAllArticles(filters);
}

/**
 * Get all products.
 * @param {object} filters
 * @returns {Promise}
 */
async function getAllProducts(filters) {
  return adminRepository.getAllProducts(filters);
}

/**
 * Get all forum posts.
 * @param {object} filters
 * @returns {Promise}
 */
async function getAllForumPosts(filters) {
  return adminRepository.getAllForumPosts(filters);
}

/**
 * Approve a vet.
 * @param {string} vetId
 * @returns {Promise}
 */
async function approveVet(vetId) {
  const vets = await adminRepository.getAllVets({});
  const vet = vets.items.find((item) => item._id.toString() === vetId);
  if (!vet) {
    throw new AppError('Vet not found.', 404);
  }

  if (vet.isVerified) {
    throw new AppError('Vet is already verified.', 400);
  }

  return adminRepository.setVetVerifiedStatus(vetId, true);
}

/**
 * Reject a vet.
 * @param {string} vetId
 * @param {string} reason
 * @returns {Promise}
 */
async function rejectVet(vetId, reason) {
  const vets = await adminRepository.getAllVets({});
  const vet = vets.items.find((item) => item._id.toString() === vetId);
  if (!vet) {
    throw new AppError('Vet not found.', 404);
  }

  return adminRepository.setVetVerifiedStatus(vetId, false, reason);
}

/**
 * Get all articles pending publication.
 * @returns {Promise}
 */
async function getPendingArticles() {
  return adminRepository.getPendingArticles();
}

/**
 * Publish an article.
 * @param {string} articleId
 * @returns {Promise}
 */
async function publishArticle(articleId) {
  const article = (await adminRepository.getPendingArticles()).find((item) => item._id.toString() === articleId);
  if (!article) {
    throw new AppError('Article not found.', 404);
  }

  if (article.isPublished) {
    throw new AppError('Article is already published.', 400);
  }

  const updated = await adminRepository.setArticlePublishedStatus(articleId, true);
  if (!updated) {
    throw new AppError('Article not found.', 404);
  }

  return updated;
}

/**
 * Reject an article with reason.
 * @param {string} articleId
 * @param {string} reason
 * @returns {Promise}
 */
async function rejectArticle(articleId, reason) {
  const article = (await adminRepository.getPendingArticles()).find((item) => item._id.toString() === articleId);
  if (!article) {
    throw new AppError('Article not found.', 404);
  }

  return adminRepository.setArticlePublishedStatus(articleId, false, reason);
}

/**
 * Get all reported forum posts.
 * @returns {Promise}
 */
async function getReportedPosts() {
  return adminRepository.getReportedPosts();
}

/**
 * Remove a reported forum post.
 * @param {string} postId
 * @returns {Promise}
 */
async function removePost(postId) {
  const post = (await adminRepository.getReportedPosts()).find((item) => item._id.toString() === postId);
  if (!post) {
    throw new AppError('Post not found.', 404);
  }

  await adminRepository.deleteForumPost(postId);
}

/**
 * Pin a forum post.
 * @param {string} postId
 * @returns {Promise}
 */
async function pinPost(postId) {
  const updated = await adminRepository.setPinnedStatus(postId, true);
  if (!updated) {
    throw new AppError('Post not found.', 404);
  }

  return updated;
}

/**
 * Get all pending products for seller verification.
 * @returns {Promise}
 */
async function getPendingProducts() {
  return adminRepository.getPendingProducts();
}

/**
 * Approve a product.
 * @param {string} productId
 * @returns {Promise}
 */
async function approveProduct(productId) {
  const product = (await adminRepository.getPendingProducts()).find((item) => item._id.toString() === productId);
  if (!product) {
    throw new AppError('Product not found.', 404);
  }

  return adminRepository.setProductVerifiedStatus(productId, true);
}

/**
 * Reject a product.
 * @param {string} productId
 * @returns {Promise}
 */
async function rejectProduct(productId) {
  const product = (await adminRepository.getPendingProducts()).find((item) => item._id.toString() === productId);
  if (!product) {
    throw new AppError('Product not found.', 404);
  }

  return adminRepository.setProductVerifiedStatus(productId, false);
}

/**
 * Get all orders (admin view).
 * @param {object} filters
 * @returns {Promise}
 */
async function getAllOrders(filters) {
  return adminRepository.getAllOrders(filters);
}

module.exports = {
  getAdminDashboard,
  getAllUsers,
  getUserById,
  deactivateUser,
  reactivateUser,
  getAllPets,
  getPendingVets,
  getAllVets,
  getAllArticles,
  getAllProducts,
  getAllForumPosts,
  approveVet,
  rejectVet,
  getPendingArticles,
  publishArticle,
  rejectArticle,
  getReportedPosts,
  removePost,
  pinPost,
  getPendingProducts,
  approveProduct,
  rejectProduct,
  getAllOrders,
};