const express = require('express');
const router = express.Router();
const theatreController = require('../controllers/theatreController');
const auth = require('../middleware/auth');

router.get('/', auth, theatreController.getAll);
router.get('/:id', auth, theatreController.getById);

module.exports = router;
