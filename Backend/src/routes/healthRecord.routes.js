const express = require('express');
const { body, param } = require('express-validator');
const healthRecordController = require('../controllers/healthRecord.controller');
const { protect } = require('../middleware/auth.middleware');
const { validateRequest } = require('../middleware/validate.middleware');

const router = express.Router();

router.use(protect);

router.get('/pets/:petId/records/download', [param('petId').isMongoId().withMessage('Valid pet ID is required.')], validateRequest, healthRecordController.downloadSummary);

router.get('/pets/:petId/records', [param('petId').isMongoId().withMessage('Valid pet ID is required.')], validateRequest, healthRecordController.listRecords);

router.post('/pets/:petId/records', [param('petId').isMongoId().withMessage('Valid pet ID is required.'), body('title').trim().notEmpty().withMessage('Title is required.'), body('date').notEmpty().withMessage('Date is required.')], validateRequest, healthRecordController.addManualRecord);

router.patch('/pets/:petId/records/:id', [param('petId').isMongoId().withMessage('Valid pet ID is required.'), param('id').isMongoId().withMessage('Valid record ID is required.')], validateRequest, healthRecordController.updateRecord);

router.delete('/pets/:petId/records/:id', [param('petId').isMongoId().withMessage('Valid pet ID is required.'), param('id').isMongoId().withMessage('Valid record ID is required.')], validateRequest, healthRecordController.deleteRecord);

module.exports = router;