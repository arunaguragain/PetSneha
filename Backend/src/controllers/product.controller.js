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
  let images = req.body.images;
  if (req.files && req.files.length > 0) {
    images = req.files.map(file => `/uploads/products/${file.filename}`);
  }
  const payload = { ...req.body, images };
  const product = await productService.createProduct(req.user, payload, req.files);
  sendItem(res, 'product', product, 201);
});

/**
 * Updates a product.
 */
const updateProduct = catchAsync(async (req, res) => {
  let images = req.body.images;
  if (req.files && req.files.length > 0) {
    images = req.files.map(file => `/uploads/products/${file.filename}`);
  }
  const payload = { ...req.body, images };
  const product = await productService.updateProduct(req.user, req.params.id, payload, req.files);
  sendItem(res, 'product', product);
});

/**
 * Deletes a product.
 */
const deleteProduct = catchAsync(async (req, res) => {
  await productService.deleteProduct(req.user, req.params.id);
  res.status(204).send();
});

/**
 * Gets products for the currently logged-in vet.
 */
const getMyProducts = catchAsync(async (req, res) => {
  const products = await productService.getMyProducts(req.user);
  sendList(res, products);
});

module.exports = { listProducts, getProduct, createProduct, updateProduct, deleteProduct, getMyProducts };