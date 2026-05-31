const articleRepository = require('../repositories/article.repository');
const vetRepository = require('../repositories/vet.repository');
const AppError = require('../utils/AppError');

function buildFilter(query) {
  const filter = {};

  if (query.petType) {
    filter.petType = query.petType;
  }

  if (query.season) {
    filter.season = query.season;
  }

  if (query.tags) {
    const tags = Array.isArray(query.tags) ? query.tags : String(query.tags).split(',').map((tag) => tag.trim());
    filter.tags = { $in: tags };
  }

  return filter;
}

/**
 * Returns all published articles.
 * @param {object} query
 * @returns {Promise<Array<object>>}
 */
async function listArticles(query) {
  return articleRepository.findAllPublished(buildFilter(query));
}

/**
 * Returns a single published article.
 * @param {string} articleId
 * @returns {Promise<object>}
 */
async function getArticle(articleId) {
  const article = await articleRepository.findById(articleId);
  if (!article || !article.isPublished) {
    throw new AppError('Article not found.', 404);
  }

  await articleRepository.updateById(articleId, { views: article.views + 1 });
  return article;
}

/**
 * Creates an article from a vet profile.
 * @param {{ id: string, role: string }} currentUser
 * @param {object} payload
 * @returns {Promise<object>}
 */
async function createArticle(currentUser, payload) {
  if (!['vet', 'admin'].includes(currentUser.role)) {
    throw new AppError('Only vets can submit articles.', 403);
  }

  const vet = await vetRepository.findByUserId(currentUser.id);
  if (!vet) {
    throw new AppError('Vet profile not found.', 404);
  }

  return articleRepository.create({
    title: payload.title,
    content: payload.content,
    summary: payload.summary,
    authorId: vet._id,
    petType: payload.petType || [],
    tags: payload.tags || [],
    season: payload.season,
    isVerified: currentUser.role === 'admin',
    isPublished: false,
    readTime: payload.readTime,
  });
}

/**
 * Publishes an article.
 * @param {{ role: string }} currentUser
 * @param {string} articleId
 * @returns {Promise<object>}
 */
async function publishArticle(currentUser, articleId) {
  if (currentUser.role !== 'admin') {
    throw new AppError('Only admins can publish articles.', 403);
  }

  const article = await articleRepository.findById(articleId);
  if (!article) {
    throw new AppError('Article not found.', 404);
  }

  return articleRepository.updateById(articleId, { isPublished: true, isVerified: true });
}

/**
 * Deletes an article.
 * @param {{ id: string, role: string }} currentUser
 * @param {string} articleId
 * @returns {Promise<{ message: string }>}
 */
async function deleteArticle(currentUser, articleId) {
  const article = await articleRepository.findById(articleId);
  if (!article) {
    throw new AppError('Article not found.', 404);
  }

  if (currentUser.role !== 'admin') {
    const vet = await vetRepository.findByUserId(currentUser.id);
    if (!vet || article.authorId.toString() !== vet._id.toString()) {
      throw new AppError('You can only delete your own article.', 403);
    }
  }

  await articleRepository.deleteById(articleId);
  return { message: 'Article deleted successfully.' };
}

module.exports = { listArticles, getArticle, createArticle, publishArticle, deleteArticle };