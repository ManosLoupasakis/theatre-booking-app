const svc = require('../services/adminService');

function handle(fn) {
  return async (req, res) => {
    try {
      const result = await fn(req, res);
      res.json(result);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  };
}

// Stats
const getStats = handle(async (req) => svc.getStats());

// Theatres
const getTheatres = handle(async () => svc.getAllTheatresAdmin());
const createTheatre = handle(async (req) => {
  const { name, location, description } = req.body;
  if (!name || !location) throw new Error('Name and location are required');
  return svc.createTheatre(name, location, description);
});
const updateTheatre = handle(async (req) => {
  const { name, location, description } = req.body;
  if (!name || !location) throw new Error('Name and location are required');
  return svc.updateTheatre(req.params.id, name, location, description);
});
const deleteTheatre = handle(async (req) => {
  await svc.deleteTheatre(req.params.id);
  return { message: 'Deleted' };
});

// Shows
const getShows = handle(async () => svc.getAllShowsAdmin());
const createShow = handle(async (req) => {
  const { theatre_id, title, description, duration, age_rating } = req.body;
  if (!theatre_id || !title || !duration) throw new Error('theatre_id, title, duration required');
  return svc.createShow(theatre_id, title, description, duration, age_rating);
});
const updateShow = handle(async (req) => {
  const { theatre_id, title, description, duration, age_rating } = req.body;
  if (!theatre_id || !title || !duration) throw new Error('theatre_id, title, duration required');
  return svc.updateShow(req.params.id, theatre_id, title, description, duration, age_rating);
});
const deleteShow = handle(async (req) => {
  await svc.deleteShow(req.params.id);
  return { message: 'Deleted' };
});

// Showtimes
const getShowtimes = handle(async () => svc.getAllShowtimesAdmin());
const createShowtime = handle(async (req) => {
  const { show_id, datetime, hall, price } = req.body;
  if (!show_id || !datetime || !hall || price == null) throw new Error('show_id, datetime, hall, price required');
  return svc.createShowtime(show_id, datetime, hall, price);
});
const updateShowtime = handle(async (req) => {
  const { show_id, datetime, hall, price } = req.body;
  if (!show_id || !datetime || !hall || price == null) throw new Error('show_id, datetime, hall, price required');
  return svc.updateShowtime(req.params.id, show_id, datetime, hall, price);
});
const deleteShowtime = handle(async (req) => {
  await svc.deleteShowtime(req.params.id);
  return { message: 'Deleted' };
});
const generateSeats = handle(async (req) => {
  const vip      = parseInt(req.body.vipCount,      10) || 0;
  const standard = parseInt(req.body.standardCount, 10) || 0;
  const balcony  = parseInt(req.body.balconyCount,  10) || 0;
  return svc.generateSeats(req.params.id, vip, standard, balcony);
});

// Reservations
const getReservations = handle(async () => svc.getAllReservationsAdmin());
const cancelReservation = handle(async (req) => {
  await svc.cancelReservationAdmin(req.params.id);
  return { message: 'Cancelled' };
});

// Users
const getUsers = handle(async () => svc.getAllUsersAdmin());
const updateUserRole = handle(async (req) => {
  const { role } = req.body;
  if (!['user', 'admin'].includes(role)) throw new Error('Invalid role');
  await svc.updateUserRole(req.params.id, role);
  return { message: 'Updated' };
});
const deleteUser = handle(async (req) => {
  await svc.deleteUser(req.params.id);
  return { message: 'Deleted' };
});

module.exports = {
  getStats,
  getTheatres, createTheatre, updateTheatre, deleteTheatre,
  getShows, createShow, updateShow, deleteShow,
  getShowtimes, createShowtime, updateShowtime, deleteShowtime, generateSeats,
  getReservations, cancelReservation,
  getUsers, updateUserRole, deleteUser,
};
