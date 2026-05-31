const express = require('express');
const { body, param } = require('express-validator');
const forumPostController = require('../controllers/forumPost.controller');
const { protect } = require('../middleware/auth.middleware');
const { validateRequest } = require('../middleware/validate.middleware');

const router = express.Router();

router.get('/', forumPostController.listPosts);

router.get('/:id', [param('id').isMongoId().withMessage('Valid post ID is required.')], validateRequest, forumPostController.getPost);

router.post('/', [body('title').trim().notEmpty().withMessage('Title is required.'), body('content').trim().notEmpty().withMessage('Content is required.')], protect, validateRequest, forumPostController.createPost);

router.post('/:id/answers', [param('id').isMongoId().withMessage('Valid post ID is required.'), body('content').trim().notEmpty().withMessage('Answer content is required.')], protect, validateRequest, forumPostController.addAnswer);

router.patch('/:id/upvote', [param('id').isMongoId().withMessage('Valid post ID is required.')], protect, validateRequest, forumPostController.upvotePost);

router.post('/:id/report', [param('id').isMongoId().withMessage('Valid post ID is required.')], validateRequest, forumPostController.reportPost);

module.exports = router;