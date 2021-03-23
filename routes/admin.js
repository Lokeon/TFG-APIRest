const router = require("express").Router();
const Admin = require("../model/Admin");
const User = require("../model/User");

//GET all Admin
router.get("/", async (req, res) => {
  try {
    const users = await Admin.find();
    res.send(users);
  } catch (error) {
    res.status(400).send(error);
  }
});

//GET all Users Admin version
router.get("/users", async (req, res) => {
  try {
    const users = await User.find();
    res.send(users);
  } catch (error) {
    res.status(400).send(error);
  }
});

//DELETE Admin version
router.delete("/users/delete/:id", async (req, res) => {
  try {
    const userDelete = await User.deleteOne({ _id: req.params.id });
    res.send("User Deleted")
  } catch (error) {
    res.status(400).send(error);
  }
});

module.exports = router;
