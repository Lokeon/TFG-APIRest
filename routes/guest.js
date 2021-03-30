const router = require("express").Router();
const Game = require("../model/Games");

//GET all Games
router.get("/games", async (req, res) => {
  try {
    const games = await Game.find();
    res.send(games);
  } catch (error) {
    res.status(400).send(error);
  }
});

// GET games with filter index
router.get("/games/:text", async (req, res) => {
  const query = {
    $text: {
      $search: '"' + req.params.text + '"',
    },
  };

  const projection = {
    _id: 0,
    name: 1,
    image: 1,
  };

  try {
    const games = await Game.find(query).select(projection);
    res.send(games);
  } catch (error) {
    res.status(400).send(error);
  }
});

module.exports = router;
