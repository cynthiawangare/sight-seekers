const { pool } = require('../config/database');

const BookingModel = {
  async findByUserId(userId) {
    const { rows } = await pool.query(
      `SELECT b.*, p.title AS package_title FROM bookings b
       JOIN packages p ON b.package_id = p.id
       WHERE b.user_id=$1 ORDER BY b.created_at DESC`,
      [userId]
    );
    return rows;
  },

  async findById(id) {
    const { rows } = await pool.query('SELECT * FROM bookings WHERE id=$1', [id]);
    return rows[0] || null;
  },

  async findAll() {
    const { rows } = await pool.query(
      `SELECT b.*, u.name AS user_name, p.title AS package_title
       FROM bookings b JOIN users u ON b.user_id=u.id JOIN packages p ON b.package_id=p.id
       ORDER BY b.created_at DESC`
    );
    return rows;
  },

  async create({ userId, packageId, startDate, guests, totalCents }) {
    const { rows } = await pool.query(
      `INSERT INTO bookings (user_id, package_id, start_date, guests, total_cents, status)
       VALUES ($1,$2,$3,$4,$5,'pending') RETURNING *`,
      [userId, packageId, startDate, guests, totalCents]
    );
    return rows[0];
  },

  async updateStatus(id, status) {
    const { rows } = await pool.query(
      'UPDATE bookings SET status=$1 WHERE id=$2 RETURNING *',
      [status, id]
    );
    return rows[0];
  },
};

module.exports = BookingModel;
