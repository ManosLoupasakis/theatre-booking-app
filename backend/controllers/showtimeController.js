const showtimeService = require('../services/showtimeService');

async function getByShow(req, res) {
  try {
    const { showId } = req.query;
    if (!showId) return res.status(400).json({ message: 'showId required' });
    const showtimes = await showtimeService.getShowtimesByShow(showId);
    res.json(showtimes);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

module.exports = { getByShow };
