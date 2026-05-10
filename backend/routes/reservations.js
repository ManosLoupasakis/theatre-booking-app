const express = require('express');
const router = express.Router();
const reservationController = require('../controllers/reservationController');
const auth = require('../middleware/auth');

router.post('/', auth, reservationController.create);
router.get('/my', auth, reservationController.getUserReservations);
router.delete('/:id', auth, reservationController.cancel);

module.exports = router;
