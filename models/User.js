const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const UserSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please specify name'],
        trim: true
    },
    telephone: {
        type: String,
        maxlength: [10, 'Telephone number must not more than 10 digits']
    },
    email: {
        type: String,
        required: [true,'Please specify your email'],
        unique: true,
        match: [
            /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
            'Please add a valid email'
            ]
    },
    password: {
        type: String,
        required: [true, 'Please specify a password'],
        minlength: [8,'Password length must be at least 8 charactors'],
        select: false
    },
    resetPasswordToken: String,
    resetPasswordExpire: Date,
    balance: {
        type: Number,
        min: [0,"Balance cannot below than 0"],
        default: 0
    },
    role: {
        type: String,
        enum: ['user', 'admin'], //Check if role is valid
        default: 'user'
    },
    createAt: {
        type: Date,
        default: Date.now
    },

    address: {
        type: String,
        required: [false, 'options']
    },
});

//Encrypt user password before store in Database
UserSchema.pre('save', async function(next) {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
})

UserSchema.pre(
    "deleteOne", { document: true, query: false }, async function (next) {
        console.log(`Renting being removed from user ${this._id}`);
        await this.model("Renting").deleteMany({ user: this._id });
        next();
});
  

// Sign a token
UserSchema.methods.getSignedJwtToken = function() {
    return jwt.sign({id: this._id}, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRE
    });
}

//Check if password is match
UserSchema.methods.isPasswordMatch = async function(enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
}

//Check if user's balance is enough for renting
UserSchema.methods.checkBalance = async function(price) {
    return await this.balance >= price;
}

//Set user's balance
UserSchema.methods.setBalance = function(balance) {
    this.balance = balance
    return balance
}

module.exports = mongoose.model('User', UserSchema);