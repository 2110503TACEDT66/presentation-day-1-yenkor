const mongoose = require("mongoose");

const CarProviderSchema = new mongoose.Schema(
  {
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

    telephone: {
      type: String,
      required: [true, "Please add a telephone"],
      maxlength: [10, "Phone number can not be longer than 10 characters"],
    },
    price: {
      type: Number,
      required: [true, "Please add a price"],
      min: [0, "Price cannot below than 0"]
    }
},
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

CarProviderSchema.virtual("renting", {
  ref: "Renting",
  localField: "_id",
  foreignField: "carProvider",
  justOne: false,
});

CarProviderSchema.pre(
  "deleteOne",
  { document: true, query: false },
  async function (next) {
    console.log(`Renting being removed from carProvider ${this._id}`);
    await this.model("Renting").deleteMany({ carProvider: this._id });
    next();
  }
);

module.exports = mongoose.model("CarProvider", CarProviderSchema);
