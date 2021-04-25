const router = require("express").Router();
const User = require("../model/User");
const Admin = require("../model/Admin");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const dotenv = require("dotenv").config();
const fs = require("fs").promises;
const {
  registerUserValidation,
  registerAdminValidation,
  loginValidation,
} = require("../validation/validation");
const {
  sendConfirmationEmail,
  confirmedEmail,
} = require("../config/nodemailer.config");

// Register User
router.post("/register/users", async (req, res) => {
  const { error } = registerUserValidation(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  const emailExists = await User.findOne({
    email: req.body.email,
  });
  if (emailExists) return res.status(400).send("Email already exists");

  const usernameExists = await User.findOne({
    username: req.body.username,
  });
  if (usernameExists) return res.status(400).send("Username already exists");

  const salt = await bcrypt.genSalt(10);
  const hashPassword = await bcrypt.hash(req.body.password, salt);
  const file = await fs.readFile("./defaultAvatar/ic_avatar.jpeg", "base64");
  const token = jwt.sign(
    {
      email: req.body.email,
    },
    process.env.TOKEN_SECRET
  );

  const user = new User({
    username: req.body.username,
    email: req.body.email,
    password: hashPassword,
    confirmationCode: token,
    avatar: file,
  });
  try {
    const savedUser = await user.save();
    sendConfirmationEmail(req.body.username, req.body.email, token);
    res.send(savedUser);
  } catch (e) {
    res.status(400).send(e);
  }
});

// Register Admin
router.post("/register/admins", async (req, res) => {
  const { error } = registerAdminValidation(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  const usernameExists = await Admin.findOne({
    username: req.body.username,
  });
  if (usernameExists) return res.status(400).send("Admin already exists");

  const salt = await bcrypt.genSalt(10);
  const hashPassword = await bcrypt.hash(req.body.password, salt);

  const admin = new Admin({
    username: req.body.username,
    password: hashPassword,
  });
  try {
    const savedAdmin = await admin.save();
    res.send(savedAdmin);
  } catch (e) {
    res.status(400).send(e);
  }
});

//Confirm Email
router.get("/confirm/:code", async (req, res) => {
  try {
    const user = await User.findOne({ confirmationCode: req.params.code });
    if (!user) return res.status(400).send("User not found");
    const verified = jwt.verify(
      user.confirmationCode,
      process.env.TOKEN_SECRET
    );
    if (!verified) return res.status(400).send("User not verified");

    user.isConfirmed = true;
    const savedUser = await user.save();
    confirmedEmail(user.username, user.email);
    res.send("User confimed");
  } catch (error) {
    res.status(400).send(error);
  }
});

// Login Users
router.post("/login/users", async (req, res) => {
  const { error } = loginValidation(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  const user = await User.findOne({
    username: req.body.username,
  });

  const validPass = await bcrypt.compare(req.body.password, user.password);
  if (!validPass || !user) return res.status(400).send("Invalid password");
  if (user.isConfirmed) {
    //Create jwt token
    const token = jwt.sign(
      {
        _id: user._id,
      },
      process.env.TOKEN_SECRET
    );

    res.header("auth-token", token);
    res.send(token + " " + user._id);
  } else {
    res.status(400).send("Account pending to verify by email");
  }
});

// Login Admin
router.post("/login/admins", async (req, res) => {
  const { error } = loginValidation(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  const admin = await Admin.findOne({
    username: req.body.username,
  });
  if (!admin) return res.status(400).send("Admin doesn't exists");

  const validPass = await bcrypt.compare(req.body.password, admin.password);
  if (!validPass) return res.status(400).send("Invalid password");

  res.send(admin._id);
});

module.exports = router;
