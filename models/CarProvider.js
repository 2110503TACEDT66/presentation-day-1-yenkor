const mongoose = require("mongoose");

const CarProviderSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Please add a name"],
    unique: true,
    trim: true,
  },

  address: {
    type: String,
    required: [true, "Please add an address"],
  },

  tel: {
    type: String,
    required: [true, "Please add a tel"],
    maxlength: [10, "Phone number can not be longer than 10 characters"],
  },
});

module.exports = mongoose.model("CarProvider", CarProviderSchema);
