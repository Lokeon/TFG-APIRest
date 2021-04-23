const router = require("express").Router();
const Game = require("../model/Games");

//GET all Games Paged
router.get("/games", async (req, res) => {
  const { page = 1, limit = 9 } = req.query;
  try {
    const games = await Game.find()
      .sort({
        date: -1,
      })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .exec();

    if (Object.keys(games).length == 0) {
      res.status(400).send("No more Games");
    } else {
      res.send(games);
    }
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

//GET one Game
router.get("/game/:id", async (req, res) => {
  try {
    const games = await Game.findOne({
      _id: req.params.id,
    });
    res.send(games);
  } catch (error) {
    res.status(400).send("Game doesn't exist");
  }
});

module.exports = router;
