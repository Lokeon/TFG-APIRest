const router = require("express").Router();
const Admin = require("../model/Admin");

//GET all Admin
router.get("/", async (req, res) => {
  try {
    const users = await Admin.find();
    res.send(users);
  } catch (error) {
    res.status(400).send(error);
  }
});

module.exports = router;
