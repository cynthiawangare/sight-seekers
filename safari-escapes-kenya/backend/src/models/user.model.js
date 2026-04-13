const { pool } = require('../config/database');

const UserModel = {
  async findByEmail(email) {
    const { rows } = await pool.query('SELECT * FROM users WHERE email=$1', [email]);
    return rows[0] || null;
  },

  async findById(id) {
    const { rows } = await pool.query('SELECT * FROM users WHERE id=$1', [id]);
    return rows[0] || null;
  },

  async create({ name, email, passwordHash, role = 'user' }) {
    const { rows } = await pool.query(
      'INSERT INTO users (name, email, password_hash, role) VALUES ($1,$2,$3,$4) RETURNING *',
      [name, email, passwordHash, role]
    );
    return rows[0];
  },

  async update(id, fields) {
    const sets = [];
    const values = [];
    let i = 1;
    if (fields.name) { sets.push(`name=$${i++}`); values.push(fields.name); }
    if (fields.email) { sets.push(`email=$${i++}`); values.push(fields.email); }
    if (fields.passwordHash) { sets.push(`password_hash=$${i++}`); values.push(fields.passwordHash); }
    values.push(id);
    const { rows } = await pool.query(
      `UPDATE users SET ${sets.join(', ')} WHERE id=$${i} RETURNING id, name, email, role`,
      values
    );
    return rows[0];
  },
};

module.exports = UserModel;
