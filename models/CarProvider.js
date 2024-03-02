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

    tel: {
      type: String,
      required: [true, "Please add a tel"],
      maxlength: [10, "Phone number can not be longer than 10 characters"],
    },
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
