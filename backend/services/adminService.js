const pool = require('../db/connection');

// ── THEATRES ─────────────────────────────────────────────────────────────────

async function getAllTheatresAdmin() {
  const [rows] = await pool.query('SELECT * FROM theatres ORDER BY theatre_id');
  return rows;
}

async function createTheatre(name, location, description) {
  const [result] = await pool.query(
    'INSERT INTO theatres (name, location, description) VALUES (?, ?, ?)',
    [name, location, description || null]
  );
  return { theatre_id: result.insertId, name, location, description };
}

async function updateTheatre(id, name, location, description) {
  await pool.query(
    'UPDATE theatres SET name = ?, location = ?, description = ? WHERE theatre_id = ?',
    [name, location, description || null, id]
  );
  return { theatre_id: id, name, location, description };
}

async function deleteTheatre(id) {
  await pool.query('DELETE FROM theatres WHERE theatre_id = ?', [id]);
}

// ── SHOWS ─────────────────────────────────────────────────────────────────────

async function getAllShowsAdmin() {
  const [rows] = await pool.query(`
    SELECT s.*, t.name AS theatre_name
    FROM shows s
    JOIN theatres t ON s.theatre_id = t.theatre_id
    ORDER BY s.show_id
  `);
  return rows;
}

async function createShow(theatre_id, title, description, duration, age_rating) {
  const [result] = await pool.query(
    'INSERT INTO shows (theatre_id, title, description, duration, age_rating) VALUES (?, ?, ?, ?, ?)',
    [theatre_id, title, description || null, duration, age_rating || 'All']
  );
  return { show_id: result.insertId, theatre_id, title, description, duration, age_rating };
}

async function updateShow(id, theatre_id, title, description, duration, age_rating) {
  await pool.query(
    'UPDATE shows SET theatre_id = ?, title = ?, description = ?, duration = ?, age_rating = ? WHERE show_id = ?',
    [theatre_id, title, description || null, duration, age_rating || 'All', id]
  );
  return { show_id: id, theatre_id, title, description, duration, age_rating };
}

async function deleteShow(id) {
  await pool.query('DELETE FROM shows WHERE show_id = ?', [id]);
}

// ── SHOWTIMES ─────────────────────────────────────────────────────────────────

async function getAllShowtimesAdmin() {
  const [rows] = await pool.query(`
    SELECT st.*, s.title AS show_title, t.name AS theatre_name,
           (SELECT COUNT(*) FROM seats se WHERE se.showtime_id = st.showtime_id) AS seat_count
    FROM showtimes st
    JOIN shows s ON st.show_id = s.show_id
    JOIN theatres t ON s.theatre_id = t.theatre_id
    ORDER BY st.datetime DESC
  `);
  return rows;
}

async function createShowtime(show_id, datetime, hall, price) {
  const [result] = await pool.query(
    'INSERT INTO showtimes (show_id, datetime, hall, price) VALUES (?, ?, ?, ?)',
    [show_id, datetime, hall, price]
  );
  return { showtime_id: result.insertId, show_id, datetime, hall, price };
}

async function updateShowtime(id, show_id, datetime, hall, price) {
  await pool.query(
    'UPDATE showtimes SET show_id = ?, datetime = ?, hall = ?, price = ? WHERE showtime_id = ?',
    [show_id, datetime, hall, price, id]
  );
  return { showtime_id: id, show_id, datetime, hall, price };
}

async function deleteShowtime(id) {
  await pool.query('DELETE FROM showtimes WHERE showtime_id = ?', [id]);
}

const MAX_SEATS = 100;
const SEATS_PER_ROW = 10;

async function generateSeats(showtime_id, vipCount, standardCount, balconyCount) {
  const total = vipCount + standardCount + balconyCount;
  if (total === 0) throw new Error('Βάλε τουλάχιστον 1 θέση.');
  if (total > MAX_SEATS) throw new Error(`Μέγιστο όριο ${MAX_SEATS} θέσεων.`);

  const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const values = [];
  let rowIndex = 0;

  function addSeats(count, category) {
    let remaining = count;
    while (remaining > 0) {
      const inThisRow = Math.min(remaining, SEATS_PER_ROW);
      const label = ALPHABET[rowIndex++];
      for (let n = 1; n <= inThisRow; n++) {
        values.push([showtime_id, label, n, category]);
      }
      remaining -= inThisRow;
    }
  }

  addSeats(vipCount,      'vip');
  addSeats(standardCount, 'standard');
  addSeats(balconyCount,  'balcony');

  await pool.query('DELETE FROM seats WHERE showtime_id = ?', [showtime_id]);
  if (values.length > 0) {
    await pool.query(
      'INSERT INTO seats (showtime_id, row_label, seat_number, category) VALUES ?',
      [values]
    );
  }
  return { created: values.length };
}

// ── RESERVATIONS ──────────────────────────────────────────────────────────────

async function getAllReservationsAdmin() {
  const [rows] = await pool.query(`
    SELECT r.reservation_id, r.status, r.created_at,
           u.name AS user_name, u.email AS user_email,
           st.datetime, st.hall, st.price,
           s.title AS show_title, t.name AS theatre_name,
           GROUP_CONCAT(CONCAT(se.row_label, se.seat_number) ORDER BY se.row_label, se.seat_number) AS seats
    FROM reservations r
    JOIN users u ON r.user_id = u.user_id
    JOIN showtimes st ON r.showtime_id = st.showtime_id
    JOIN shows s ON st.show_id = s.show_id
    JOIN theatres t ON s.theatre_id = t.theatre_id
    LEFT JOIN reservation_seats rs ON r.reservation_id = rs.reservation_id
    LEFT JOIN seats se ON rs.seat_id = se.seat_id
    GROUP BY r.reservation_id
    ORDER BY r.created_at DESC
  `);
  return rows;
}

async function cancelReservationAdmin(id) {
  const [rows] = await pool.query('SELECT * FROM reservations WHERE reservation_id = ?', [id]);
  if (rows.length === 0) throw new Error('Reservation not found');
  await pool.query("UPDATE reservations SET status = 'cancelled' WHERE reservation_id = ?", [id]);
}

// ── USERS ─────────────────────────────────────────────────────────────────────

async function getAllUsersAdmin() {
  const [rows] = await pool.query(
    'SELECT user_id, name, email, role, created_at FROM users ORDER BY user_id'
  );
  return rows;
}

async function updateUserRole(id, role) {
  await pool.query('UPDATE users SET role = ? WHERE user_id = ?', [role, id]);
}

async function deleteUser(id) {
  await pool.query('DELETE FROM users WHERE user_id = ?', [id]);
}

// ── STATS ─────────────────────────────────────────────────────────────────────

async function getStats() {
  const [[{ theatres }]] = await pool.query('SELECT COUNT(*) AS theatres FROM theatres');
  const [[{ shows }]] = await pool.query('SELECT COUNT(*) AS shows FROM shows');
  const [[{ showtimes }]] = await pool.query('SELECT COUNT(*) AS showtimes FROM showtimes');
  const [[{ reservations }]] = await pool.query("SELECT COUNT(*) AS reservations FROM reservations WHERE status = 'confirmed'");
  const [[{ users }]] = await pool.query('SELECT COUNT(*) AS users FROM users');
  return { theatres, shows, showtimes, reservations, users };
}

module.exports = {
  getAllTheatresAdmin, createTheatre, updateTheatre, deleteTheatre,
  getAllShowsAdmin, createShow, updateShow, deleteShow,
  getAllShowtimesAdmin, createShowtime, updateShowtime, deleteShowtime, generateSeats,
  getAllReservationsAdmin, cancelReservationAdmin,
  getAllUsersAdmin, updateUserRole, deleteUser,
  getStats,
};
