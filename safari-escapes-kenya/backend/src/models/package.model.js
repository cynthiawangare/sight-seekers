const { pool } = require('../config/database');

const PackageModel = {
  async findAll({ search, minPrice, maxPrice, duration } = {}) {
    let query = 'SELECT * FROM packages WHERE 1=1';
    const values = [];
    let i = 1;
    if (search) { query += ` AND (title ILIKE $${i} OR description ILIKE $${i})`; values.push(`%${search}%`); i++; }
    if (minPrice) { query += ` AND price_cents >= $${i++}`; values.push(minPrice * 100); }
    if (maxPrice) { query += ` AND price_cents <= $${i++}`; values.push(maxPrice * 100); }
    if (duration) { query += ` AND duration_days = $${i++}`; values.push(duration); }
    query += ' ORDER BY created_at DESC';
    const { rows } = await pool.query(query, values);
    return rows;
  },

  async findById(id) {
    const { rows } = await pool.query('SELECT * FROM packages WHERE id=$1', [id]);
    return rows[0] || null;
  },

  async create({ title, description, priceCents, durationDays, location, imageUrl, highlights, included }) {
    const { rows } = await pool.query(
      `INSERT INTO packages (title, description, price_cents, duration_days, location, image_url, highlights, included)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING *`,
      [title, description, priceCents, durationDays, location, imageUrl, highlights, included]
    );
    return rows[0];
  },

  async update(id, fields) {
    const cols = ['title','description','price_cents','duration_days','location','image_url','highlights','included'];
    const keys = Object.keys(fields).filter(k => cols.includes(k));
    if (!keys.length) return null;
    const sets = keys.map((k, i) => `${k}=$${i + 1}`).join(', ');
    const values = keys.map(k => fields[k]);
    values.push(id);
    const { rows } = await pool.query(`UPDATE packages SET ${sets} WHERE id=$${keys.length + 1} RETURNING *`, values);
    return rows[0] || null;
  },

  async delete(id) {
    await pool.query('DELETE FROM packages WHERE id=$1', [id]);
  },
};

module.exports = PackageModel;
