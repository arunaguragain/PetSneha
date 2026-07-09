const User = require('../models/user.model');
const Vet = require('../models/vet.model');
const Appointment = require('../models/appointment.model');
const Order = require('../models/order.model');
const Article = require('../models/article.model');
const ForumPost = require('../models/forumPost.model');
const Product = require('../models/product.model');
const Pet = require('../models/pet.model');

const vetSchemaPath = Vet.schema.path('rejectionReason');
if (!vetSchemaPath) {
  Vet.schema.add({ rejectionReason: { type: String } });
}

const productSchemaPath = Product.schema.path('rejectionReason');
if (!productSchemaPath) {
  Product.schema.add({ rejectionReason: { type: String } });
}

/**
 * Get platform-wide statistics.
 * @returns {Promise}
 */
async function getPlatformStats() {
  const [petOwners, vets, admins, totalVets, verifiedVets, pendingVets, totalProducts, verifiedProducts, pendingProducts, appointments, orders, articles, forumPosts, totalPets] = await Promise.all([
    User.countDocuments({ role: 'petOwner' }),
    User.countDocuments({ role: 'vet' }),
    User.countDocuments({ role: 'admin' }),
    Vet.countDocuments(),
    Vet.countDocuments({ isVerified: true }),
    Vet.countDocuments({ isVerified: false }),
    Product.countDocuments(),
    Product.countDocuments({ isVerifiedSeller: true }),
    Product.countDocuments({ isVerifiedSeller: false }),
    Appointment.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }]),
    Order.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }]),
    Article.aggregate([{ $group: { _id: '$isPublished', count: { $sum: 1 } } }]),
    ForumPost.countDocuments({ isReported: true }),
    Pet.countDocuments(),
  ]);

  return {
    users: { petOwners, vets, admins },
    vets: { total: totalVets, verified: verifiedVets, pending: pendingVets },
    products: { total: totalProducts, verified: verifiedProducts, pending: pendingProducts },
    appointments: appointments.reduce((accumulator, item) => ({ ...accumulator, [item._id || 'unknown']: item.count }), {}),
    orders: orders.reduce((accumulator, item) => ({ ...accumulator, [item._id || 'unknown']: item.count }), {}),
    articles: articles.reduce(
      (accumulator, item) => ({
        ...accumulator,
        [item._id ? 'published' : 'pending']: item.count,
      }),
      {}
    ),
    forumPosts: { reported: forumPosts },
    pets: { total: totalPets },
  };
}

/**
 * Get all users with optional role filter and search.
 * @param {object} filters
 * @returns {Promise}
 */
async function getAllUsers(filters = {}) {
  const page = Math.max(Number(filters.page) || 1, 1);
  const limit = Math.max(Number(filters.limit) || 10, 1);
  const query = {};

  if (filters.role) {
    query.role = filters.role;
  }

  if (filters.search) {
    const searchRegex = new RegExp(filters.search, 'i');
    query.$or = [{ name: searchRegex }, { email: searchRegex }, { phone: searchRegex }];
  }

  const [total, users] = await Promise.all([
    User.countDocuments(query),
    User.find(query)
      .select('-password')
      .sort('-createdAt')
      .skip((page - 1) * limit)
      .limit(limit),
  ]);

  return { users, total, page, pages: Math.max(Math.ceil(total / limit), 1) };
}

/**
 * Get a single user by id with full details.
 * @param {string} userId
 * @returns {Promise}
 */
async function getUserById(userId) {
  return User.findById(userId).select('-password');
}

/**
 * Deactivate or reactivate a user account.
 * @param {string} userId
 * @param {boolean} isActive
 * @returns {Promise}
 */
async function setUserActiveStatus(userId, isActive) {
  return User.findByIdAndUpdate(userId, { isActive }, { new: true, runValidators: true }).select('-password');
}

/**
 * Get all vets pending verification.
 * @returns {Promise}
 */
async function getPendingVets() {
  return Vet.find({ isVerified: false }).sort('-createdAt');
}

/**
 * Get all vets.
 * @param {object} filters
 * @returns {Promise}
 */
async function getAllVets(filters = {}) {
  const query = {};

  if (filters.isVerified !== undefined) {
    query.isVerified = filters.isVerified === 'true' || filters.isVerified === true;
  }

  if (filters.search) {
    const searchRegex = new RegExp(filters.search, 'i');
    query.$or = [{ name: searchRegex }, { clinicName: searchRegex }, { location: searchRegex }, { licenseNumber: searchRegex }];
  }

  const page = Math.max(Number(filters.page) || 1, 1);
  const limit = Math.max(Number(filters.limit) || 10, 1);

  const [total, vets] = await Promise.all([
    Vet.countDocuments(query),
    Vet.find(query)
      .sort('-createdAt')
      .skip((page - 1) * limit)
      .limit(limit),
  ]);

  return { items: vets, total, page, pages: Math.max(Math.ceil(total / limit), 1) };
}

/**
 * Get all pets.
 * @param {object} filters
 * @returns {Promise}
 */
async function getAllPets(filters = {}) {
  const query = {};
  if (filters.search) {
    query.name = { $regex: filters.search, $options: 'i' };
  }
  const page = Number(filters.page) || 1;
  const limit = Number(filters.limit) || 20;
  const [items, total] = await Promise.all([
    Pet.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .populate('ownerId', 'name email'),
    Pet.countDocuments(query),
  ]);
  return { items, total, page, pages: Math.ceil(total / limit) || 1 };
}

/**
 * Get all articles.
 * @param {object} filters
 * @returns {Promise}
 */
async function getAllArticles(filters = {}) {
  const query = {};
  if (filters.search) {
    query.title = { $regex: filters.search, $options: 'i' };
  }
  const page = Number(filters.page) || 1;
  const limit = Number(filters.limit) || 20;
  const [items, total] = await Promise.all([
    Article.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .populate('authorId', 'name'),
    Article.countDocuments(query),
  ]);
  return { items, total, page, pages: Math.ceil(total / limit) || 1 };
}

/**
 * Get all products.
 * @param {object} filters
 * @returns {Promise}
 */
async function getAllProducts(filters = {}) {
  const query = {};
  if (filters.search) {
    query.name = { $regex: filters.search, $options: 'i' };
  }
  const page = Number(filters.page) || 1;
  const limit = Number(filters.limit) || 20;
  const [items, total] = await Promise.all([
    Product.find(query)
      .populate('sellerId', 'name')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit),
    Product.countDocuments(query),
  ]);
  return { items, total, page, pages: Math.ceil(total / limit) || 1 };
}

/**
 * Get all forum posts.
 * @param {object} filters
 * @returns {Promise}
 */
async function getAllForumPosts(filters = {}) {
  const query = {};
  if (filters.search) {
    query.title = { $regex: filters.search, $options: 'i' };
  }
  const page = Number(filters.page) || 1;
  const limit = Number(filters.limit) || 20;
  const [items, total] = await Promise.all([
    ForumPost.find(query)
      .sort({ isPinned: -1, createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .populate('authorId', 'name'),
    ForumPost.countDocuments(query),
  ]);
  return { items, total, page, pages: Math.ceil(total / limit) || 1 };
}

/**
 * Set vet verified status with optional rejection reason.
 * @param {string} vetId
 * @param {boolean} isVerified
 * @param {string} rejectionReason
 * @returns {Promise}
 */
async function setVetVerifiedStatus(vetId, isVerified, rejectionReason) {
  return Vet.findByIdAndUpdate(
    vetId,
    { isVerified, ...(rejectionReason !== undefined ? { rejectionReason } : {}) },
    { new: true, runValidators: true }
  );
}

/**
 * Get all articles pending review.
 * @returns {Promise}
 */
async function getPendingArticles() {
  return Article.find({ isPublished: false })
    .sort('-createdAt')
    .populate('authorId', 'name');
}

/**
 * Publish or reject an article.
 * @param {string} articleId
 * @param {boolean} isPublished
 * @param {string} rejectionReason
 * @returns {Promise}
 */
async function setArticlePublishedStatus(articleId, isPublished, rejectionReason) {
  const update = { isPublished, isVerified: isPublished };
  if (!isPublished && rejectionReason) {
    update.summary = update.summary ? `${update.summary}\nRejection reason: ${rejectionReason}` : `Rejection reason: ${rejectionReason}`;
  }

  return Article.findByIdAndUpdate(articleId, update, { new: true, runValidators: true });
}

/**
 * Get all reported forum posts.
 * @returns {Promise}
 */
async function getReportedPosts() {
  return ForumPost.find({ isReported: true }).sort('-createdAt');
}

/**
 * Remove a forum post.
 * @param {string} postId
 * @returns {Promise}
 */
async function deleteForumPost(postId) {
  return ForumPost.findByIdAndDelete(postId);
}

/**
 * Pin or unpin a forum post.
 * @param {string} postId
 * @param {boolean} isPinned
 * @returns {Promise}
 */
async function setPinnedStatus(postId, isPinned) {
  return ForumPost.findByIdAndUpdate(postId, { isPinned }, { new: true, runValidators: true });
}

/**
 * Get all products pending seller verification.
 * @returns {Promise}
 */
async function getPendingProducts() {
  return Product.find({ isVerifiedSeller: false }).populate('sellerId', 'name').sort('-createdAt');
}

/**
 * Verify or reject a product/seller.
 * @param {string} productId
 * @param {boolean} isVerified
 * @returns {Promise}
 */
async function setProductVerifiedStatus(productId, isVerified) {
  return Product.findByIdAndUpdate(productId, { isVerifiedSeller: isVerified }, { new: true, runValidators: true });
}

/**
 * Get all orders with filters.
 * @param {object} filters
 * @returns {Promise}
 */
async function getAllOrders(filters = {}) {
  const page = Math.max(Number(filters.page) || 1, 1);
  const limit = Math.max(Number(filters.limit) || 10, 1);
  const query = {};

  if (filters.status) {
    query.status = filters.status;
  }

  const [total, orders] = await Promise.all([
    Order.countDocuments(query),
    Order.find(query)
      .populate('userId', 'name email phone')
      .populate({
        path: 'items.productId',
        select: 'name price sellerId',
        populate: { path: 'sellerId', select: 'name' },
      })
      .sort('-createdAt')
      .skip((page - 1) * limit)
      .limit(limit),
  ]);

  return { orders, total, page, pages: Math.max(Math.ceil(total / limit), 1) };
}

module.exports = {
  getPlatformStats,
  getAllUsers,
  getUserById,
  setUserActiveStatus,
  getPendingVets,
  getAllVets,
  setVetVerifiedStatus,
  getAllPets,
  getPendingArticles,
  getAllArticles,
  getAllProducts,
  getAllForumPosts,
  setArticlePublishedStatus,
  getReportedPosts,
  deleteForumPost,
  setPinnedStatus,
  getPendingProducts,
  setProductVerifiedStatus,
  getAllOrders,
};
