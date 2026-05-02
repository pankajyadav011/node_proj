

const mongoose = require("mongoose");

const urlSchema = new mongoose.Schema(
  {

    shortID: {
      type: String,
      required: [true, "shortID is required"],
      unique: true,
      trim: true,
    },


    longUrl: {
      type: String,
      required: [true, "longUrl is required"],
      trim: true,
    },


    accessCount: {
      type: Number,
      default: 0,
    },
  },
  {

    timestamps: true,
  }
);

const Url = mongoose.model("Url", urlSchema);

module.exports = Url;
