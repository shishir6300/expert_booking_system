const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const { createBooking, getBookingsByEmail, updateBookingStatus } = require('../controllers/bookingController');

const bookingValidation = [
  body('expertId').notEmpty().withMessage('Expert ID is required'),
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('email').isEmail().withMessage('Valid email is required'),
  body('phone').matches(/^[0-9]{10}$/).withMessage('Valid 10-digit phone number required'),
  body('date').notEmpty().withMessage('Date is required'),
  body('timeSlot').notEmpty().withMessage('Time slot is required'),
];

router.get('/', getBookingsByEmail);
router.post('/', bookingValidation, createBooking);
router.patch('/:id/status', updateBookingStatus);

module.exports = router;
