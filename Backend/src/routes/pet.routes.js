const express = require('express');
const { body, param } = require('express-validator');
const petController = require('../controllers/pet.controller');
const { protect } = require('../middleware/auth.middleware');
const { petUpload } = require('../middleware/upload.middleware');
const { validateRequest } = require('../middleware/validate.middleware');

const router = express.Router();

router.use(protect);

router.get('/', petController.listPets);

router.get('/:id', [param('id').isMongoId().withMessage('Valid pet ID is required.')], validateRequest, petController.getPet);

router.post('/', petUpload.single('photo'), [body('name').trim().notEmpty().withMessage('Name is required.'), body('species').trim().notEmpty().withMessage('Species is required.')], validateRequest, petController.createPet);

router.patch('/:id', petUpload.single('photo'), [param('id').isMongoId().withMessage('Valid pet ID is required.')], validateRequest, petController.updatePet);

router.delete('/:id', [param('id').isMongoId().withMessage('Valid pet ID is required.')], validateRequest, petController.deletePet);

module.exports = router;