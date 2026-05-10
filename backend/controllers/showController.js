const showService = require('../services/showService');

async function getAll(req, res) {
  try {
    const { theatreId, title, date } = req.query;
    const shows = await showService.getAllShows({ theatreId, title, date });
    res.json(shows);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

async function getById(req, res) {
  try {
    const show = await showService.getShowById(req.params.id);
    if (!show) return res.status(404).json({ message: 'Show not found' });
    res.json(show);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

module.exports = { getAll, getById };
