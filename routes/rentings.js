const express = require('express');
const {getRentings, getRenting, addRenting, updateRenting, deleteRenting, getOverdueRentings} = require('../controllers/rentings');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router({mergeParams: true});

router.route('/')
    .get(protect,getRentings)       
    .post(protect,authorize('admin' ,'user'),addRenting);       
router.route('/nearandover').get(protect, getOverdueRentings);
router.route('/:id')
    .get(protect,getRenting)        
    .put(protect, authorize('admin', 'user'),updateRenting)      
    .delete(protect, authorize('admin', 'user'),deleteRenting);  

module.exports = router;
