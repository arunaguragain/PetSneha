const express = require('express');
const { body, param } = require('express-validator');
const reminderController = require('../controllers/reminder.controller');
const { protect } = require('../middleware/auth.middleware');
const { validateRequest } = require('../middleware/validate.middleware');

const router = express.Router();

router.use(protect);

router.get('/reminders', reminderController.listReminders);

router.get('/pets/:petId/reminders', [param('petId').isMongoId().withMessage('Valid pet ID is required.')], validateRequest, reminderController.listPetReminders);

router.post('/reminders', [body('petId').isMongoId().withMessage('Valid pet ID is required.'), body('title').trim().notEmpty().withMessage('Title is required.'), body('dueDate').notEmpty().withMessage('Due date is required.')], validateRequest, reminderController.createReminder);

router.patch('/reminders/:id', [param('id').isMongoId().withMessage('Valid reminder ID is required.')], validateRequest, reminderController.updateReminder);

router.delete('/reminders/:id', [param('id').isMongoId().withMessage('Valid reminder ID is required.')], validateRequest, reminderController.deleteReminder);

module.exports = router;