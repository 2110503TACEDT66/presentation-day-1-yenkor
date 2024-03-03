const {topUp} = require('../controllers/topUp');
const express = require('express');

const router = express.Router();

router.route('/').post(topUp);

module.exports = router;