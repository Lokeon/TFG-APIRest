const mongoose = require("mongoose");

const rateSchema = new mongoose.Schema({
  score: {
    type: Number,
    required: true,
  },
  idUser: {
    type: String,
    required: true,
  },
  idGame: {
    type: String,
    required: true,
  },
  nameGame: {
    type: String,
    required: true,
  },
  date: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Rate", rateSchema);
