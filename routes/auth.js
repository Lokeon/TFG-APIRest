const router = require("express").Router();
const User = require("../model/User");
const { registerValidation, loginValidation } = require("../validation");

router.post("/register", async (req, res) => {
  const { error } = registerValidation(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  //Check username exists
  const usernameExists = await User.findOne({
    username: req.body.username,
  });
  if (usernameExists) return res.status(400).send("Username already exists");

  const user = new User({
    username: req.body.username,
    email: req.body.email,
    password: req.body.password,
  });
  try {
    const savedUser = await user.save();
    res.send(savedUser);
  } catch (e) {
    res.status(400).send(e);
  }
});

module.exports = router;
