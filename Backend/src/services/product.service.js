const productRepository = require('../repositories/product.repository');
const AppError = require('../utils/AppError');

function buildFilter(query) {
  const filter = {};

  if (query.category) {
    filter.category = query.category;
  }

  if (query.petType) {
    filter.petType = query.petType;
  }

  const minPrice = query.minPrice ? Number(query.minPrice) : undefined;
  const maxPrice = query.maxPrice ? Number(query.maxPrice) : undefined;
  if (minPrice !== undefined || maxPrice !== undefined) {
    filter.price = {};
    if (minPrice !== undefined) {
      filter.price.$gte = minPrice;
    }
    if (maxPrice !== undefined) {
      filter.price.$lte = maxPrice;
    }
  }

  return filter;
}

/**
 * Returns all products with optional filters.
 * @param {object} query
 * @returns {Promise<Array<object>>}
 */
async function listProducts(query) {
  return productRepository.findAll(buildFilter(query));
}

/**
 * Returns a single product.
 * @param {string} productId
 * @returns {Promise<object>}
 */
async function getProduct(productId) {
  const product = await productRepository.findById(productId);
  if (!product) {
    throw new AppError('Product not found.', 404);
  }

  return product;
}

/**
 * Creates a product.
 * @param {{ id: string, role: string }} currentUser
 * @param {object} payload
 * @returns {Promise<object>}
 */
async function createProduct(currentUser, payload) {
  if (!['admin', 'vet'].includes(currentUser.role)) {
    throw new AppError('Only admins or vet sellers can create products.', 403);
  }

  return productRepository.create({
    name: payload.name,
    description: payload.description,
    price: payload.price,
    category: payload.category,
    petType: payload.petType || [],
    images: payload.images || [],
    stock: payload.stock,
    isVerifiedSeller: currentUser.role === 'admin',
    sellerId: currentUser.id,
  });
}

/**
 * Updates a product.
 * @param {{ id: string, role: string }} currentUser
 * @param {string} productId
 * @param {object} payload
 * @returns {Promise<object>}
 */
async function updateProduct(currentUser, productId, payload) {
  const product = await productRepository.findById(productId);
  if (!product) {
    throw new AppError('Product not found.', 404);
  }

  if (currentUser.role !== 'admin' && product.sellerId?.toString() !== currentUser.id) {
    throw new AppError('You can only update your own product.', 403);
  }

  return productRepository.updateById(productId, payload);
}

/**
 * Deletes a product.
 * @param {{ id: string, role: string }} currentUser
 * @param {string} productId
 * @returns {Promise<{ message: string }>}
 */
async function deleteProduct(currentUser, productId) {
  const product = await productRepository.findById(productId);
  if (!product) {
    throw new AppError('Product not found.', 404);
  }

  if (currentUser.role !== 'admin' && product.sellerId?.toString() !== currentUser.id) {
    throw new AppError('You can only delete your own product.', 403);
  }

  await productRepository.deleteById(productId);
  return { message: 'Product deleted successfully.' };
}

module.exports = { listProducts, getProduct, createProduct, updateProduct, deleteProduct };