const pool = require('../db/connection');

async function getShowtimesByShow(showId) {
  const [rows] = await pool.query(
    'SELECT * FROM showtimes WHERE show_id = ? ORDER BY datetime ASC',
    [showId]
  );
  return rows;
}

async function getShowtimeById(id) {
  const [rows] = await pool.query('SELECT * FROM showtimes WHERE showtime_id = ?', [id]);
  return rows[0] || null;
}

module.exports = { getShowtimesByShow, getShowtimeById };
