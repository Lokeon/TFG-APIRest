const router = require("express").Router();
const bcrypt = require("bcryptjs");
const User = require("../model/User");
const verify = require("./verifyToken");

// GET Users with id
router.get("/:id", verify, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    res.send(user);
  } catch (error) {
    res.status(400).send(error);
  }
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

// PATCH - Change User's password
router.patch("/password/:id", verify, async (req, res) => {
  try {
    const salt = await bcrypt.genSalt(10);
    const hashPassword = await bcrypt.hash(req.body.password, salt);

    const updateUser = await User.updateOne(
      { _id: req.params.id },
      {
        $set: { password: hashPassword },
      }
    );
    res.send(updateUser);
  } catch (error) {
    res.status(400).send(error);
  }
});

module.exports = router;
