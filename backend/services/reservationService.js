const pool = require('../db/connection');

async function createReservation(userId, showtimeId, seatIds) {
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    // Lock seats and check availability
    const placeholders = seatIds.map(() => '?').join(',');
    const [taken] = await conn.query(
      `SELECT rs.seat_id FROM reservation_seats rs
       JOIN reservations r ON rs.reservation_id = r.reservation_id
       WHERE r.showtime_id = ? AND r.status != 'cancelled'
       AND rs.seat_id IN (${placeholders}) FOR UPDATE`,
      [showtimeId, ...seatIds]
    );
    if (taken.length > 0) throw new Error('One or more seats are already reserved');

    const [res] = await conn.query(
      'INSERT INTO reservations (user_id, showtime_id, status) VALUES (?, ?, ?)',
      [userId, showtimeId, 'confirmed']
    );
    const reservationId = res.insertId;

    const seatValues = seatIds.map(seatId => [reservationId, seatId]);
    await conn.query('INSERT INTO reservation_seats (reservation_id, seat_id) VALUES ?', [seatValues]);

    await conn.commit();
    return { reservation_id: reservationId, showtime_id: showtimeId, seat_ids: seatIds };
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }
}

async function getUserReservations(userId) {
  const [rows] = await pool.query(
    `SELECT r.reservation_id, r.status, r.created_at,
            st.datetime, st.hall, st.price,
            s.title AS show_title, t.name AS theatre_name,
            GROUP_CONCAT(CONCAT(se.row_label, se.seat_number) ORDER BY se.row_label, se.seat_number) AS seats
     FROM reservations r
     JOIN showtimes st ON r.showtime_id = st.showtime_id
     JOIN shows s ON st.show_id = s.show_id
     JOIN theatres t ON s.theatre_id = t.theatre_id
     LEFT JOIN reservation_seats rs ON r.reservation_id = rs.reservation_id
     LEFT JOIN seats se ON rs.seat_id = se.seat_id
     WHERE r.user_id = ?
     GROUP BY r.reservation_id
     ORDER BY st.datetime DESC`,
    [userId]
  );
  return rows;
}

async function cancelReservation(reservationId, userId, isAdmin = false) {
  const query = isAdmin
    ? 'SELECT * FROM reservations WHERE reservation_id = ?'
    : 'SELECT * FROM reservations WHERE reservation_id = ? AND user_id = ?';
  const params = isAdmin ? [reservationId] : [reservationId, userId];

  const [rows] = await pool.query(query, params);
  if (rows.length === 0) throw new Error('Reservation not found');
  if (rows[0].status === 'cancelled') throw new Error('Already cancelled');

  await pool.query(
    "UPDATE reservations SET status = 'cancelled' WHERE reservation_id = ?",
    [reservationId]
  );
  return { message: 'Reservation cancelled' };
}

module.exports = { createReservation, getUserReservations, cancelReservation };
