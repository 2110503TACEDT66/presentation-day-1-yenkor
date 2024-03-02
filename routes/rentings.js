const express = require('express');
const {getRentings, getRenting, addRenting, updateRenting, deleteRenting} = require('../controllers/rentings');

const router = express.Router({mergeParams: true});

//const {protect, authorize} = require('../middleware/auth');

router.route('/')
    .get(getRentings)       //add protect
    .post(addRenting);      //add protect and authorize
router.route('/:id')
    .get(getRenting)        //add protect
    .put(updateRenting)     //add protect and authorize
    .delete(deleteRenting); //add protect and authorize

module.exports = router;