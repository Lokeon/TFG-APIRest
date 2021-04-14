const mongoose = require("mongoose");

const petitionsSchema = new mongoose.Schema({
  nameGame: {
    type: String,
    required: true,
    max: 255,
  },
  date: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Petition", petitionsSchema);
