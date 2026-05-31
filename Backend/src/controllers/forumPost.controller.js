const catchAsync = require('../utils/catchAsync');
const forumPostService = require('../services/forumPost.service');

function sendList(res, items) {
  return res.status(200).json({ status: 'success', results: items.length, data: { items } });
}

function sendItem(res, key, item, statusCode = 200) {
  return res.status(statusCode).json({ status: 'success', data: { [key]: item } });
}

/**
 * Lists forum posts.
 */
const listPosts = catchAsync(async (req, res) => {
  const posts = await forumPostService.listPosts(req.query);
  sendList(res, posts);
});

/**
 * Gets one forum post.
 */
const getPost = catchAsync(async (req, res) => {
  const post = await forumPostService.getPost(req.params.id);
  sendItem(res, 'post', post);
});

/**
 * Creates a forum post.
 */
const createPost = catchAsync(async (req, res) => {
  const post = await forumPostService.createPost(req.user, req.body);
  sendItem(res, 'post', post, 201);
});

/**
 * Adds an answer to a post.
 */
const addAnswer = catchAsync(async (req, res) => {
  const post = await forumPostService.addAnswer(req.user, req.params.id, req.body);
  sendItem(res, 'post', post, 201);
});

/**
 * Upvotes a forum post.
 */
const upvotePost = catchAsync(async (req, res) => {
  const post = await forumPostService.upvotePost(req.user, req.params.id);
  sendItem(res, 'post', post);
});

/**
 * Reports a forum post.
 */
const reportPost = catchAsync(async (req, res) => {
  const post = await forumPostService.reportPost(req.params.id);
  sendItem(res, 'post', post);
});

module.exports = { listPosts, getPost, createPost, addAnswer, upvotePost, reportPost };