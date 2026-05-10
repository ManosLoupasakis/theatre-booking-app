const pool = require('../db/connection');

async function getAllTheatres(search) {
  let query = 'SELECT * FROM theatres';
  const params = [];
  if (search) {
    query += ' WHERE name LIKE ? OR location LIKE ?';
    params.push(`%${search}%`, `%${search}%`);
  }
  const [rows] = await pool.query(query, params);
  return rows;
}

async function getTheatreById(id) {
  const [rows] = await pool.query('SELECT * FROM theatres WHERE theatre_id = ?', [id]);
  return rows[0] || null;
}

module.exports = { getAllTheatres, getTheatreById };
