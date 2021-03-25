const router = require("express").Router();
const Admin = require("../model/Admin");
const User = require("../model/User");
const Game = require("../model/Games");
const multer = require("multer");
const image = multer({
  limits: {
    filesize: 5000000,
  },
  fileFilter(req, file, cb) {
    if (!file.originalname.match(/\.(jpg|png|JPG|PNG|JPEG|jpeg)$/))
      return cb(new Error("Format file is not correct"));
    cb(undefined, true);
  },
});

//GET all Admin
router.get("/", async (req, res) => {
  try {
    const admins = await Admin.find();
    res.send(admins);
  } catch (error) {
    res.status(400).send(error);
  }
});

//GET all Users
router.get("/users", async (req, res) => {
  try {
    const users = await User.find();
    res.send(users);
  } catch (error) {
    res.status(400).send(error);
  }
});

//DELETE User
router.delete("/users/delete/:id", async (req, res) => {
  try {
    const userDelete = await User.deleteOne({ _id: req.params.id });
    res.send("User Deleted");
  } catch (error) {
    res.status(400).send(error);
  }
});

//GET one Game
router.get("/games/:id", async (req, res) => {
  try {
    const games = await Game.findOne({
      _id: req.params.id,
    });
    res.send(games);
  } catch (error) {
    res.status(400).send(error);
  }
});

//GET all Games
router.get("/games", async (req, res) => {
  try {
    const games = await Game.find();
    res.send(games);
  } catch (error) {
    res.status(400).send(error);
  }
});

//POST Games Admin version
router.post("/games/game", image.single("image"), async (req, res) => {
  const gameExits = await Game.findOne({
    name: req.body.name,
  });
  if (gameExits) return res.status(400).send("Game already exists");

  const game = new Game({
    name: req.body.name,
    genre: req.body.genre,
    description: req.body.description,
    image: req.file.buffer.toString("base64"),
  });
  try {
    const savedGame = await game.save();
    res.send(savedGame);
  } catch (error) {
    res.status(400).send(error);
  }
});

//DELETE Game
router.delete("/games/delete/:id", async (req, res) => {
  try {
    const gameDeleted = await Game.deleteOne({ _id: req.params.id });
    res.send("Game Deleted");
  } catch (error) {
    res.status(400).send(error);
  }
});

// Update Game Avatar
router.put("/games/update/:id", async (req, res) => {
  try {
    const gameUpdated = await Game.updateOne(
      { _id: req.params.id },
      {
        $set: {
          name: req.body.name,
          genre: req.body.genre,
          description: req.body.description,
        },
      }
    );
    res.send("Game update");
  } catch (error) {
    res.status(400).send(error);
  }
});

// PATCH User's Avatar
router.patch("/games/image/:id", image.single("image"), async (req, res) => {
  try {
    const gameUpdate = await Game.updateOne(
      { _id: req.params.id },
      {
        $set: { image: req.file.buffer.toString("base64") },
      }
    );

    res.send("Image updated");
  } catch (error) {
    res.status(400).send(error);
  }
});

module.exports = router;
