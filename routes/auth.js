const router = require("express").Router();
const User = require("../model/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const {
  registerValidation,
  loginValidation,
} = require("../validation/validation");

// Register
router.post("/register", async (req, res) => {
  const { error } = registerValidation(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  //Check username exists
  const usernameExists = await User.findOne({
    username: req.body.username,
  });
  if (usernameExists) return res.status(400).send("Username already exists");

  const salt = await bcrypt.genSalt(10);
  const hashPassword = await bcrypt.hash(req.body.password, salt);

  const user = new User({
    username: req.body.username,
    email: req.body.email,
    password: hashPassword,
  });
  try {
    const savedUser = await user.save();
    res.send({ userId: user._id });
  } catch (e) {
    res.status(400).send(e);
  }
});

// Login
router.post("/login", async (req, res) => {
  const { error } = loginValidation(req.body);
  if (error) return res.status(400).send(error.details[0].message);
  //Check username exists
  const user = await User.findOne({
    username: req.body.username,
  });
  if (!user) return res.status(400).send("Username doesn't exists");

  const validPass = await bcrypt.compare(req.body.password, user.password);
  if (!validPass) return res.status(400).send("Invalid password");

  //Create jwt token
  const token = jwt.sign(
    {
      _id: user._id,
    },
    process.env.TOKEN_SECRET
  );

  res.header("auth-token", token);
  res.send(token + " " + user._id);
});

module.exports = router;
