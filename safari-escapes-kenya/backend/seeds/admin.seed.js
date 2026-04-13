require('dotenv').config({ path: '../../.env' });
const { pool } = require('../src/config/database');
const { hashPassword } = require('../src/utils/bcrypt');

async function seed() {
  const passwordHash = await hashPassword('Admin@Safari2024!');
  await pool.query(
    `INSERT INTO users (name, email, password_hash, role)
     VALUES ($1, $2, $3, 'admin')
     ON CONFLICT (email) DO NOTHING`,
    ['Admin', 'admin@sightseekers.com', passwordHash]
  );
  console.log('Admin user seeded: admin@sightseekers.com / Admin@Safari2024!');
  await pool.end();
}

seed().catch((err) => { console.error(err); process.exit(1); });
