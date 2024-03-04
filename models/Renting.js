const mongoose = require('mongoose');

const provider = require('../models/CarProvider');

const RentingSchema = new mongoose.Schema({
    rentDate: {
        type: Date,
        required: [true, 'Please add Rent Date']
    },
    rentTo: {
        type: Date,
        default: function() {
            return this.rentDate
        }
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
    createAt: {
        type: Date,
        default: Date.now()
    },
    returned: {
        type: Boolean,
        default: false
    }

});

module.exports = mongoose.model('Renting', RentingSchema);