const BookingModel = require('../models/booking.model');

exports.getUserBookings = async (req, res, next) => {
  try {
    const bookings = await BookingModel.findByUserId(req.user.id);
    res.json({ bookings });
  } catch (err) {
    next(err);
  }
};

exports.getBookingById = async (req, res, next) => {
  try {
    const booking = await BookingModel.findById(req.params.id);
    if (!booking) return res.status(404).json({ error: 'Booking not found' });
    if (booking.user_id !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Forbidden' });
    }
    res.json({ booking });
  } catch (err) {
    next(err);
  }
};

exports.createBooking = async (req, res, next) => {
  try {
    const booking = await BookingModel.create({ ...req.body, userId: req.user.id });
    res.status(201).json({ booking });
  } catch (err) {
    next(err);
  }
};

exports.cancelBooking = async (req, res, next) => {
  try {
    const booking = await BookingModel.findById(req.params.id);
    if (!booking) return res.status(404).json({ error: 'Booking not found' });
    if (booking.user_id !== req.user.id) return res.status(403).json({ error: 'Forbidden' });

    const updated = await BookingModel.updateStatus(req.params.id, 'cancelled');
    res.json({ booking: updated });
  } catch (err) {
    next(err);
  }
};
