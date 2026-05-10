const Booking = require('../models/Booking');
const Expert = require('../models/Expert');
const { validationResult } = require('express-validator');

// POST /bookings — create booking with race condition prevention
exports.createBooking = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, errors: errors.array() });
  }

  const { expertId, name, email, phone, date, timeSlot, notes } = req.body;

  try {
    const expert = await Expert.findById(expertId);
    if (!expert) return res.status(404).json({ success: false, message: 'Expert not found' });

    // Find the slot
    const slot = expert.slots.find(s => s.date === date && s.time === timeSlot);
    if (!slot) return res.status(404).json({ success: false, message: 'Slot not found' });
    if (slot.isBooked) return res.status(409).json({ success: false, message: 'Slot already booked' });

    // Atomic update — prevent race condition using findOneAndUpdate with condition
    const updated = await Expert.findOneAndUpdate(
      {
        _id: expertId,
        'slots._id': slot._id,
        'slots.isBooked': false // only update if still not booked
      },
      { $set: { 'slots.$.isBooked': true } },
      { new: true }
    );

    if (!updated) {
      return res.status(409).json({ success: false, message: 'Slot was just booked by someone else. Please choose another slot.' });
    }

    // Create booking record
    const booking = await Booking.create({
      expertId,
      expertName: expert.name,
      name, email, phone, date, timeSlot, notes
    });

    // Emit real-time slot update to all connected clients
    const io = req.app.get('io');
    io.emit('slotBooked', { expertId, date, timeSlot });

    res.status(201).json({ success: true, data: booking, message: 'Booking confirmed!' });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(409).json({ success: false, message: 'This slot is already booked.' });
    }
    next(err);
  }
};

// GET /bookings?email= — get bookings by email
exports.getBookingsByEmail = async (req, res, next) => {
  try {
    const { email } = req.query;
    if (!email) return res.status(400).json({ success: false, message: 'Email is required' });

    const bookings = await Booking.find({ email: email.toLowerCase() }).sort({ createdAt: -1 });
    res.json({ success: true, data: bookings });
  } catch (err) {
    next(err);
  }
};

// PATCH /bookings/:id/status
exports.updateBookingStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    if (!['Pending', 'Confirmed', 'Completed'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status' });
    }

    const booking = await Booking.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );
    if (!booking) return res.status(404).json({ success: false, message: 'Booking not found' });

    res.json({ success: true, data: booking });
  } catch (err) {
    next(err);
  }
};
