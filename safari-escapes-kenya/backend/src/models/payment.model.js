const { pool } = require('../config/database');

const PaymentModel = {
  async create({ bookingId, userId, provider, providerRef, amount, currency, status }) {
    const { rows } = await pool.query(
      `INSERT INTO payments (booking_id, user_id, provider, provider_ref, amount, currency, status)
       VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING *`,
      [bookingId, userId, provider, providerRef, amount, currency, status]
    );
    return rows[0];
  },

  async findAll() {
    const { rows } = await pool.query(
      `SELECT p.*, u.name AS user_name, b.id AS booking_ref
       FROM payments p JOIN users u ON p.user_id=u.id JOIN bookings b ON p.booking_id=b.id
       ORDER BY p.created_at DESC`
    );
    return rows;
  },

  async updateStatusByRef(providerRef, status) {
    const { rows } = await pool.query(
      'UPDATE payments SET status=$1 WHERE provider_ref=$2 RETURNING *',
      [status, providerRef]
    );
    return rows[0];
  },
};

module.exports = PaymentModel;
