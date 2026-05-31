const express = require('express');
const { body, param, query } = require('express-validator');
const appointmentController = require('../controllers/appointment.controller');
const { protect } = require('../middleware/auth.middleware');
const { validateRequest } = require('../middleware/validate.middleware');

const router = express.Router();

router.use(protect);

router.get('/appointments', appointmentController.listAppointments);

router.post('/appointments', [body('vetId').isMongoId().withMessage('Valid vet ID is required.'), body('petId').isMongoId().withMessage('Valid pet ID is required.'), body('date').notEmpty().withMessage('Date is required.'), body('timeSlot').notEmpty().withMessage('Time slot is required.')], validateRequest, appointmentController.bookAppointment);

router.patch('/appointments/:id/cancel', [param('id').isMongoId().withMessage('Valid appointment ID is required.')], validateRequest, appointmentController.cancelAppointment);

router.patch('/appointments/:id/complete', [param('id').isMongoId().withMessage('Valid appointment ID is required.')], validateRequest, appointmentController.completeAppointment);

router.patch('/appointments/:id', [param('id').isMongoId().withMessage('Valid appointment ID is required.'), body('timeSlot').notEmpty().withMessage('Time slot is required.')], validateRequest, appointmentController.rescheduleAppointment);

router.get('/vets/:vetId/slots', [param('vetId').isMongoId().withMessage('Valid vet ID is required.'), query('date').notEmpty().withMessage('Date is required.')], validateRequest, appointmentController.getAvailableSlots);

module.exports = router;