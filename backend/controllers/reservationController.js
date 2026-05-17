const reservationService = require('../services/reservationService');

async function create(req, res) {
  try {
    const { showtimeId, seatIds } = req.body;
    if (!showtimeId || !seatIds || seatIds.length === 0)
      return res.status(400).json({ message: 'showtimeId and seatIds required' });
    const reservation = await reservationService.createReservation(req.user.user_id, showtimeId, seatIds);
    res.status(201).json(reservation);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
}

async function getUserReservations(req, res) {
  try {
    const reservations = await reservationService.getUserReservations(req.user.user_id);
    res.json(reservations);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

async function cancel(req, res) {
  try {
    const isAdmin = req.user.role === 'admin';
    const result = await reservationService.cancelReservation(req.params.id, req.user.user_id, isAdmin);
    res.json(result);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
}

module.exports = { create, getUserReservations, cancel };
