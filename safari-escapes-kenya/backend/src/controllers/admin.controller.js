const UserModel = require('../models/user.model');
const BookingModel = require('../models/booking.model');
const PaymentModel = require('../models/payment.model');
const ReviewModel = require('../models/review.model');
const { pool } = require('../config/database');

exports.getDashboardStats = async (_req, res, next) => {
  try {
    const [users, bookings, payments, reviews] = await Promise.all([
      pool.query('SELECT COUNT(*) FROM users'),
      pool.query('SELECT COUNT(*) FROM bookings'),
      pool.query('SELECT COALESCE(SUM(amount),0) AS total FROM payments WHERE status=$1', ['paid']),
      pool.query('SELECT COUNT(*) FROM reviews'),
    ]);
    res.json({
      totalUsers: parseInt(users.rows[0].count),
      totalBookings: parseInt(bookings.rows[0].count),
      totalRevenue: parseInt(payments.rows[0].total),
      totalReviews: parseInt(reviews.rows[0].count),
    });
  } catch (err) {
    next(err);
  }
};

exports.getAllUsers = async (_req, res, next) => {
  try {
    const { rows } = await pool.query('SELECT id, name, email, role, created_at FROM users ORDER BY created_at DESC');
    res.json({ users: rows });
  } catch (err) {
    next(err);
  }
};

exports.getUserById = async (req, res, next) => {
  try {
    const user = await UserModel.findById(req.params.id);
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json({ user });
  } catch (err) {
    next(err);
  }
};

exports.updateUserRole = async (req, res, next) => {
  try {
    const { role } = req.body;
    const { rows } = await pool.query('UPDATE users SET role=$1 WHERE id=$2 RETURNING *', [role, req.params.id]);
    res.json({ user: rows[0] });
  } catch (err) {
    next(err);
  }
};

exports.deleteUser = async (req, res, next) => {
  try {
    await pool.query('DELETE FROM users WHERE id=$1', [req.params.id]);
    res.json({ message: 'User deleted' });
  } catch (err) {
    next(err);
  }
};

exports.getAllBookings = async (_req, res, next) => {
  try {
    const bookings = await BookingModel.findAll();
    res.json({ bookings });
  } catch (err) {
    next(err);
  }
};

exports.updateBookingStatus = async (req, res, next) => {
  try {
    const booking = await BookingModel.updateStatus(req.params.id, req.body.status);
    res.json({ booking });
  } catch (err) {
    next(err);
  }
};

exports.getAllPayments = async (_req, res, next) => {
  try {
    const payments = await PaymentModel.findAll();
    res.json({ payments });
  } catch (err) {
    next(err);
  }
};

exports.getAllReviews = async (_req, res, next) => {
  try {
    const reviews = await ReviewModel.findAll();
    res.json({ reviews });
  } catch (err) {
    next(err);
  }
};

exports.deleteReview = async (req, res, next) => {
  try {
    await ReviewModel.delete(req.params.id);
    res.json({ message: 'Review deleted' });
  } catch (err) {
    next(err);
  }
};
