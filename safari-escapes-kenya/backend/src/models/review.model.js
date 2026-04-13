const { pool } = require('../config/database');

const ReviewModel = {
  async findByPackageId(packageId) {
    const { rows } = await pool.query(
      `SELECT r.*, u.name AS user_name FROM reviews r
       JOIN users u ON r.user_id=u.id
       WHERE r.package_id=$1 ORDER BY r.created_at DESC`,
      [packageId]
    );
    return rows;
  },

  async findById(id) {
    const { rows } = await pool.query('SELECT * FROM reviews WHERE id=$1', [id]);
    return rows[0] || null;
  },

  async findAll() {
    const { rows } = await pool.query(
      `SELECT r.*, u.name AS user_name, p.title AS package_title
       FROM reviews r JOIN users u ON r.user_id=u.id JOIN packages p ON r.package_id=p.id
       ORDER BY r.created_at DESC`
    );
    return rows;
  },

  async create({ userId, packageId, rating, comment }) {
    const { rows } = await pool.query(
      'INSERT INTO reviews (user_id, package_id, rating, comment) VALUES ($1,$2,$3,$4) RETURNING *',
      [userId, packageId, rating, comment]
    );
    return rows[0];
  },

  async delete(id) {
    await pool.query('DELETE FROM reviews WHERE id=$1', [id]);
  },
};

module.exports = ReviewModel;
