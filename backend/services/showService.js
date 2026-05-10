const pool = require('../db/connection');

async function getAllShows({ theatreId, title, date }) {
  let query = `
    SELECT s.*, t.name AS theatre_name, t.location
    FROM shows s
    JOIN theatres t ON s.theatre_id = t.theatre_id
    WHERE 1=1
  `;
  const params = [];

  if (theatreId) { query += ' AND s.theatre_id = ?'; params.push(theatreId); }
  if (title)     { query += ' AND s.title LIKE ?';   params.push(`%${title}%`); }
  if (date) {
    query += ' AND EXISTS (SELECT 1 FROM showtimes st WHERE st.show_id = s.show_id AND DATE(st.datetime) = ?)';
    params.push(date);
  }

  const [rows] = await pool.query(query, params);
  return rows;
}

async function getShowById(id) {
  const [rows] = await pool.query(
    `SELECT s.*, t.name AS theatre_name, t.location
     FROM shows s JOIN theatres t ON s.theatre_id = t.theatre_id
     WHERE s.show_id = ?`,
    [id]
  );
  return rows[0] || null;
}

module.exports = { getAllShows, getShowById };
