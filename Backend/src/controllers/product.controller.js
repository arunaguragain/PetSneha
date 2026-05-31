const catchAsync = require('../utils/catchAsync');
const productService = require('../services/product.service');

function sendList(res, items) {
  return res.status(200).json({ status: 'success', results: items.length, data: { items } });
}

function sendItem(res, key, item, statusCode = 200) {
  return res.status(statusCode).json({ status: 'success', data: { [key]: item } });
}

/**
 * Lists products.
 */
const listProducts = catchAsync(async (req, res) => {
  const products = await productService.listProducts(req.query);
  sendList(res, products);
});

/**
 * Gets one product.
 */
const getProduct = catchAsync(async (req, res) => {
  const product = await productService.getProduct(req.params.id);
  sendItem(res, 'product', product);
});

/**
 * Creates a product.
 */
const createProduct = catchAsync(async (req, res) => {
  const product = await productService.createProduct(req.user, req.body);
  sendItem(res, 'product', product, 201);
});

/**
 * Updates a product.
 */
const updateProduct = catchAsync(async (req, res) => {
  const product = await productService.updateProduct(req.user, req.params.id, req.body);
  sendItem(res, 'product', product);
});

/**
 * Deletes a product.
 */
const deleteProduct = catchAsync(async (req, res) => {
  await productService.deleteProduct(req.user, req.params.id);
  res.status(204).send();
});

module.exports = { listProducts, getProduct, createProduct, updateProduct, deleteProduct };