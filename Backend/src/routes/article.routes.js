const express = require('express');
const { body, param } = require('express-validator');
const articleController = require('../controllers/article.controller');
const { protect, restrictTo } = require('../middleware/auth.middleware');
const { validateRequest } = require('../middleware/validate.middleware');

const router = express.Router();

router.get('/', articleController.listArticles);

router.get('/:id', [param('id').isMongoId().withMessage('Valid article ID is required.')], validateRequest, articleController.getArticle);

router.post('/', [body('title').trim().notEmpty().withMessage('Title is required.'), body('content').trim().notEmpty().withMessage('Content is required.')], protect, restrictTo('vet', 'admin'), validateRequest, articleController.createArticle);

router.patch('/:id/publish', [param('id').isMongoId().withMessage('Valid article ID is required.')], protect, restrictTo('admin'), validateRequest, articleController.publishArticle);

router.delete('/:id', [param('id').isMongoId().withMessage('Valid article ID is required.')], protect, validateRequest, articleController.deleteArticle);

module.exports = router;