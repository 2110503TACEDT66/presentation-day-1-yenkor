const mongoose = require('mongoose');

const RentingSchema = mongoose.Schema({
    rentDate: {
        type: Date,
        require: [true, 'Please add Rent Date']
    },
    user: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        require: [true, 'Please add User']
    },
    carProvider: {
        type: mongoose.Schema.ObjectId,
        ref: 'CarProvider',
        require: [true, 'Please add Car Provider']
    },
    creatAt: {
        type: Date,
        default: Date.now()
    }

});

module.exports = mongoose.model('Renting', RentingSchema);