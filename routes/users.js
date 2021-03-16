const router = require("express").Router();
const bcrypt = require("bcryptjs");
const User = require("../model/User");
const verify = require("./verifyToken");
const multer = require("multer");
const avatar = multer({
  limits: {
    filesize: 1000000,
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

// POST User's Avatar
router.post("/avatar", verify, avatar.single("avatar"), async (req, res) => {
  try {
    const user = await User.findOne({ _id: req.user });
    user.avatar = req.file.buffer.toString("base64");

    await user.save();

    res.send(req.user);
  } catch (error) {
    res.status(400).send(error);
  }
});

module.exports = router;
