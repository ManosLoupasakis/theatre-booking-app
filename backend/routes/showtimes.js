const express = require('express');
const router = express.Router();
const showtimeController = require('../controllers/showtimeController');
const auth = require('../middleware/auth');

router.get('/', auth, showtimeController.getByShow);

module.exports = router;
