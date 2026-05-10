const theatreService = require('../services/theatreService');

async function getAll(req, res) {
  try {
    const { search } = req.query;
    const theatres = await theatreService.getAllTheatres(search);
    res.json(theatres);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

async function getById(req, res) {
  try {
    const theatre = await theatreService.getTheatreById(req.params.id);
    if (!theatre) return res.status(404).json({ message: 'Theatre not found' });
    res.json(theatre);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

module.exports = { getAll, getById };
