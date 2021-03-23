const mongoose = require("mongoose");

const gameSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    max: 255,
  },
  genre: {
    type: String,
    required: true,
    max: 255,
  },
  description: {
    type: String,
    required: true,
  },
  date: {
    type: Date,
    default: Date.now,
  },
  image: {
    type: String,
    required: true,
  },
});

module.exports = mongoose.model("Game", gameSchema);
