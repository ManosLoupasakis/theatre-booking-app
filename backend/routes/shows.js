const express = require('express');
const router = express.Router();
const showController = require('../controllers/showController');
const auth = require('../middleware/auth');

router.get('/', auth, showController.getAll);
router.get('/:id', auth, showController.getById);

module.exports = router;
