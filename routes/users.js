const router = require("express").Router();
const bcrypt = require("bcryptjs");
const User = require("../model/User");
const Game = require("../model/Games");
const Rate = require("../model/Rate");
const verify = require("./verifyToken");
const multer = require("multer");
const { find } = require("../model/User");
const avatar = multer({
  limits: {
    filesize: 5000000,
  },
  fileFilter(req, file, cb) {
    if (!file.originalname.match(/\.(jpg|png|JPG|PNG|JPEG|jpeg)$/))
      return cb(new Error("Format file is not correct"));
    cb(undefined, true);
  },
});

//GET all Users
router.get("/", verify, async (req, res) => {
  try {
    const users = await User.find();
    res.send(users);
  } catch (error) {
    res.status(400).send(error);
  }
});

// GET One user
router.get("/user", verify, async (req, res) => {
  try {
    const user = await User.findOne({ _id: req.user });
    res.send(user);
  } catch (error) {
    res.status(400).send(error);
  }
});

// PATCH User's password
router.patch("/password", verify, async (req, res) => {
  try {
    const salt = await bcrypt.genSalt(10);
    const hashPassword = await bcrypt.hash(req.body.password, salt);

    const updateUser = await User.updateOne(
      { _id: req.user },
      {
        $set: { password: hashPassword },
      }
    );
    res.send(req.user);
  } catch (error) {
    res.status(400).send(error);
  }
});

// PATCH User's Avatar
router.patch("/avatar", verify, avatar.single("avatar"), async (req, res) => {
  try {
    const updateUser = await User.updateOne(
      { _id: req.user },
      {
        $set: { avatar: req.file.buffer.toString("base64") },
      }
    );

    res.send(req.user);
  } catch (error) {
    res.status(400).send(error);
  }
});

//GET all Games
router.get("/games", verify, async (req, res) => {
  try {
    const games = await Game.find();
    res.send(games);
  } catch (error) {
    res.status(400).send(error);
  }
});

//GET one Game
router.get("/game/:id", verify, async (req, res) => {
  const games = await Game.findOne({
    _id: req.params.id,
  });

  const findRate = await Rate.findOne({
    idGame: req.params.id,
  });

  if (!findRate) {
    res.send({
      _id: games._id,
      name: games.name,
      genre: games.genre,
      description: games.description,
      image: games.image,
      avg: 0.0,
      rates: 0,
    });
  } else {
    const avgGame = await Rate.aggregate()
      .match({
        idGame: req.params.id,
      })
      .group({
        _id: null,
        avgs: { $avg: "$score" },
      });

    const rated = await Rate.countDocuments({
      idGame: req.params.id,
    });

    res.send({
      _id: games._id,
      name: games.name,
      genre: games.genre,
      description: games.description,
      image: games.image,
      avg: avgGame[0].avgs,
      rates: rated,
    });
  }
});

// POST Rate
router.post("/rate", verify, async (req, res) => {
  try {
    const findRate = await Rate.findOne({
      idUser: req.body.idUser,
      idGame: req.body.idGame,
      nameGame: req.body.nameGame,
    });
    if (!findRate) {
      const rate = new Rate({
        score: req.body.score,
        idUser: req.body.idUser,
        idGame: req.body.idGame,
        nameGame: req.body.nameGame,
      });
      const savedRate = await rate.save();
      res.send(savedRate);
    } else {
      if (findRate.score != req.body.score) {
        findRate.score = req.body.score;

        const savedFRate = await findRate.save();
        res.status(201).send(savedFRate);
      }
    }
  } catch (error) {
    res.status(400).send(error);
  }
});

// GET Score from Rated Game
router.get("/rated/:idUser/:idGame", verify, async (req, res) => {
  try {
    const findRate = await Rate.findOne({
      idUser: req.params.idUser,
      idGame: req.params.idGame,
    });

    if (findRate) {
      res.send({
        score: findRate.score,
      });
    } else {
      res.status(400).send("Game not found");
    }
  } catch (error) {
    res.status(400).send(error);
  }
});

// GET Rates from User
router.get("/rated", verify, async (req, res) => {
  try {
    const findRate = await Rate.find({
      idUser: req.user,
    });

    if (findRate) {
      res.send(findRate);
    } else {
      res.status(400).send("Game not found");
    }
  } catch (error) {
    res.status(400).send(error);
  }
});

module.exports = router;
