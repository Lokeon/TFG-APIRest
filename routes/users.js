const router = require("express").Router();
const bcrypt = require("bcryptjs");
const User = require("../model/User");
const Game = require("../model/Games");
const Rate = require("../model/Rate");
const Petition = require("../model/Petitions");
const { PythonShell } = require("python-shell");
const verify = require("./verifyToken");
const multer = require("multer");
const { changedPassword } = require("../config/nodemailer.config");
const Games = require("../model/Games");
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

    const user = await User.findOne({
      _id: req.user,
    });

    changedPassword(user.username, user.email);
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

//GET all Games with pagination
router.get("/games", verify, async (req, res) => {
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
      platforms: games.platforms,
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
      platforms: games.platforms,
      image: games.image,
      avg: Math.round((avgGame[0].avgs + Number.EPSILON) * 100) / 100,
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

// DELETE Rate
router.delete("/rate/:nameGame", verify, async (req, res) => {
  try {
    const gameDeleted = await Rate.deleteOne({
      idUser: req.user,
      nameGame: req.params.nameGame,
    });
    res.send("Rate Deleted");
  } catch (error) {
    res.status(400).send(error);
  }
});

// PATCH Rate score
router.patch("/rate/update", verify, async (req, res) => {
  try {
    const updateRate = await Rate.updateOne(
      {
        idUser: req.user,
        nameGame: req.body.nameGame,
      },
      {
        $set: {
          score: req.body.score,
          date: Date.now(),
        },
      }
    );
    res.send("Rate Updated");
  } catch (error) {
    res.status(400).send(error);
  }
});

// POST Petition
router.post("/petition", verify, async (req, res) => {
  try {
    const findGame = await Game.findOne({
      name: req.body.nameGame,
    });

    if (findGame) {
      return res.status(400).send("Game already exists");
    } else {
      const findPetition = await Petition.findOne({
        nameGame: req.body.nameGame,
      });

      if (findPetition) {
        return res
          .status(400)
          .send("Game already registered. It is going to be added soon!!");
      }
      {
        const petition = new Petition({
          nameGame: req.body.nameGame,
        });

        const savedPetition = await petition.save();
        res.status(200).send(savedPetition);
      }
    }
  } catch (error) {
    res.status(400).send(error);
  }
});

// GET Refresh Rates
router.get("/rate/refresh/:id", verify, async (req, res) => {
  try {
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

    res.status(200).send({
      avg: avgGame[0].avgs,
      rates: rated,
    });
  } catch (error) {
    res.status(400).send(error);
  }
});

//GET Best Avg Game && Most Voted
router.get("/bestgames", verify, async (req, res) => {
  try {
    const mostVoted = await Rate.aggregate()
      .match({})
      .group({
        _id: "$nameGame",
        votes: { $sum: 1 },
      })
      .sort({
        votes: -1,
      })
      .limit(1);

    const mostVotedImg = await Game.findOne({
      name: mostVoted[0]._id,
    });

    const bestAvg = await Rate.aggregate()
      .match({})
      .group({
        _id: "$nameGame",
        avgs: { $avg: "$score" },
      })
      .sort({
        avgs: -1,
      })
      .limit(1);

    const bestAvgImg = await Game.findOne({
      name: bestAvg[0]._id,
    });

    res.status(200).send({
      idMostVoted: mostVotedImg._id,
      mostVoted: mostVoted[0]._id,
      mostVotedImg: mostVotedImg.image,
      idMostAvg: bestAvgImg._id,
      mostAvg: bestAvg[0]._id,
      mostAvgImg: bestAvgImg.image,
    });
  } catch (error) {
    res.status(400).send(error);
  }
});

//GET Recommendations
router.get("/recommendations", verify, async (req, res) => {
  try {
    const totalRates = await Rate.countDocuments({
      idUser: req.user,
    });

    if (totalRates >= 5) {
      const options = {
        mode: "text",
        args: [req.user._id],
      };

      PythonShell.run("./recosys/recosys.py", options, function (err, results) {
        if (err) throw err;
        res.send(JSON.parse(results));
      });
    } else {
      res.status(402).send("You need at least rate 5 games");
    }
  } catch (error) {
    res.status(400).send(error);
  }
});

module.exports = router;
