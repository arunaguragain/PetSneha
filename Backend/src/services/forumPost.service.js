const forumPostRepository = require('../repositories/forumPost.repository');
const AppError = require('../utils/AppError');

/**
 * Returns all forum posts.
 * @param {object} query
 * @returns {Promise<Array<object>>}
 */
async function listPosts(query) {
  const filter = {};
  if (query.group) {
    filter.group = query.group;
  }

  return forumPostRepository.findAll(filter);
}

/**
 * Returns a single forum post.
 * @param {string} postId
 * @returns {Promise<object>}
 */
async function getPost(postId) {
  const post = await forumPostRepository.findById(postId);
  if (!post) {
    throw new AppError('Post not found.', 404);
  }

  return post;
}

/**
 * Creates a forum post.
 * @param {{ id: string }} currentUser
 * @param {object} payload
 * @returns {Promise<object>}
 */
async function createPost(currentUser, payload) {
  return forumPostRepository.create({
    authorId: currentUser.id,
    isAnonymous: Boolean(payload.isAnonymous),
    title: payload.title,
    content: payload.content,
    group: payload.group,
  });
}

/**
 * Adds an answer to a forum post.
 * @param {{ id: string, role: string }} currentUser
 * @param {string} postId
 * @param {{ content: string }} payload
 * @returns {Promise<object>}
 */
async function addAnswer(currentUser, postId, payload) {
  const post = await forumPostRepository.findById(postId);
  if (!post) {
    throw new AppError('Post not found.', 404);
  }

  return forumPostRepository.updateById(postId, {
    $push: {
      answers: {
        authorId: currentUser.id,
        isVet: currentUser.role === 'vet',
        content: payload.content,
        upvotes: 0,
      },
    },
  });
}

/**
 * Upvotes or removes an upvote from a forum post.
 * @param {{ id: string }} currentUser
 * @param {string} postId
 * @returns {Promise<object>}
 */
async function upvotePost(currentUser, postId) {
  const post = await forumPostRepository.findById(postId);
  if (!post) {
    throw new AppError('Post not found.', 404);
  }

  const alreadyUpvoted = (post.upvotedBy || []).some((userId) => userId.toString() === currentUser.id);
  if (alreadyUpvoted) {
    return forumPostRepository.updateById(postId, {
      $pull: { upvotedBy: currentUser.id },
      $inc: { upvotes: -1 },
    });
  }

  return forumPostRepository.updateById(postId, {
    $push: { upvotedBy: currentUser.id },
    $inc: { upvotes: 1 },
  });
}

/**
 * Reports a forum post.
 * @param {string} postId
 * @returns {Promise<object>}
 */
async function reportPost(postId) {
  const post = await forumPostRepository.findById(postId);
  if (!post) {
    throw new AppError('Post not found.', 404);
  }

  return forumPostRepository.updateById(postId, { isReported: true });
}

module.exports = { listPosts, getPost, createPost, addAnswer, upvotePost, reportPost };