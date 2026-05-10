const seatService = require('../services/seatService');

async function getByShowtime(req, res) {
  try {
    const { showtimeId } = req.query;
    if (!showtimeId) return res.status(400).json({ message: 'showtimeId required' });
    const seats = await seatService.getSeatsByShowtime(showtimeId);
    res.json(seats);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

module.exports = { getByShowtime };
