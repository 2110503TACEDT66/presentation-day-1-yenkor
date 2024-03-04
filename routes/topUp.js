const {topUp} = require('../controllers/topUp');
const {protect, authorize} = require('../middleware/auth');
const express = require('express');

const router = express.Router();

router.route('/').post(protect, authorize('admin', 'user'),topUp);

module.exports = router;