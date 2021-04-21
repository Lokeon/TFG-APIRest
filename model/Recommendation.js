const mongoose = require("mongoose");

const recoSchema = new mongoose.Schema({
  nameGame: {
    type: String,
    required: true,
    max: 255,
  },
  idUser: {
    type: String,
    required: true,
  },
  date: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Recommendation", recoSchema);
