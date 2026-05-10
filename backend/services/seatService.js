const pool = require('../db/connection');

async function getSeatsByShowtime(showtimeId) {
  const [rows] = await pool.query(
    `SELECT s.*,
       CASE WHEN rs.seat_id IS NOT NULL THEN 'reserved' ELSE 'available' END AS status
     FROM seats s
     LEFT JOIN reservation_seats rs ON s.seat_id = rs.seat_id
       AND rs.reservation_id IN (
         SELECT reservation_id FROM reservations
         WHERE showtime_id = ? AND status != 'cancelled'
       )
     WHERE s.showtime_id = ?
     ORDER BY s.row_label, s.seat_number`,
    [showtimeId, showtimeId]
  );
  return rows;
}

module.exports = { getSeatsByShowtime };
