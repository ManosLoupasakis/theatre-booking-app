require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const bcrypt = require('bcryptjs');
const pool = require('../db/connection');

async function seedAdmin() {
  try {
    // Add role column if it doesn't exist
    await pool.query(`
      ALTER TABLE users
      ADD COLUMN IF NOT EXISTS role ENUM('user','admin') NOT NULL DEFAULT 'user'
    `);
    console.log('✓ role column ready');

    const hash = await bcrypt.hash('admin123', 10);
    await pool.query(`
      INSERT INTO users (name, email, password, role)
      VALUES ('Admin', 'admin@theater.gr', ?, 'admin')
      ON DUPLICATE KEY UPDATE role = 'admin', password = ?
    `, [hash, hash]);
    console.log('✓ Admin user created: admin@theater.gr / admin123');
  } catch (err) {
    console.error('Error:', err.message);
  } finally {
    await pool.end();
  }
}

seedAdmin();
