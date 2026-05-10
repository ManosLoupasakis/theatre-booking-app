const express = require('express');
const router = express.Router();
const seatController = require('../controllers/seatController');
const auth = require('../middleware/auth');

router.get('/', auth, seatController.getByShowtime);

module.exports = router;
