const catchAsync = require('../utils/catchAsync');
const articleService = require('../services/article.service');

function sendList(res, items) {
  return res.status(200).json({ status: 'success', results: items.length, data: { items } });
}

function sendItem(res, key, item, statusCode = 200) {
  return res.status(statusCode).json({ status: 'success', data: { [key]: item } });
}

/**
 * Lists published articles.
 */
const listArticles = catchAsync(async (req, res) => {
  const articles = await articleService.listArticles(req.query);
  sendList(res, articles);
});

/**
 * Gets one article.
 */
const getArticle = catchAsync(async (req, res) => {
  const article = await articleService.getArticle(req.params.id);
  sendItem(res, 'article', article);
});

/**
 * Creates an article.
 */
const createArticle = catchAsync(async (req, res) => {
  const article = await articleService.createArticle(req.user, req.body);
  sendItem(res, 'article', article, 201);
});

/**
 * Publishes an article.
 */
const publishArticle = catchAsync(async (req, res) => {
  const article = await articleService.publishArticle(req.user, req.params.id);
  sendItem(res, 'article', article);
});

/**
 * Deletes an article.
 */
const deleteArticle = catchAsync(async (req, res) => {
  await articleService.deleteArticle(req.user, req.params.id);
  res.status(204).send();
});

module.exports = { listArticles, getArticle, createArticle, publishArticle, deleteArticle };