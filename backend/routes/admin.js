const express = require('express');
const router = express.Router();
const adminAuth = require('../middleware/adminAuth');
const c = require('../controllers/adminController');

router.use(adminAuth);

router.get('/stats', c.getStats);

router.get('/theatres', c.getTheatres);
router.post('/theatres', c.createTheatre);
router.put('/theatres/:id', c.updateTheatre);
router.delete('/theatres/:id', c.deleteTheatre);

router.get('/shows', c.getShows);
router.post('/shows', c.createShow);
router.put('/shows/:id', c.updateShow);
router.delete('/shows/:id', c.deleteShow);

router.get('/showtimes', c.getShowtimes);
router.post('/showtimes', c.createShowtime);
router.put('/showtimes/:id', c.updateShowtime);
router.delete('/showtimes/:id', c.deleteShowtime);
router.post('/showtimes/:id/seats/generate', c.generateSeats);

router.get('/reservations', c.getReservations);
router.delete('/reservations/:id', c.cancelReservation);

router.get('/users', c.getUsers);
router.put('/users/:id/role', c.updateUserRole);
router.delete('/users/:id', c.deleteUser);

module.exports = router;
