const mongoose = require('mongoose');

const provider = require('../models/CarProvider');

const RentingSchema = new mongoose.Schema({
    rentDate: {
        type: Date,
        required: [true, 'Please add Rent Date']
    },
    user: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: [true, 'Please add User']
    },
    carProvider: {
        type: mongoose.Schema.ObjectId,
        ref: 'CarProvider',
        required: [true, 'Please add Car Provider']
    },
    // price: {
    //     type: Number,
    //     default: function() {
    //         return this.carProvider.price;
    //     }
    // },
    creatAt: {
        type: Date,
        default: Date.now()
    }

});

module.exports = mongoose.model('Renting', RentingSchema);