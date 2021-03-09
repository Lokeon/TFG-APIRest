const express = require("express");
const app = express();
const mongoose = require("mongoose");
const dotenv = require("dotenv");

//Import Routes
const authRoute = require("./routes/auth");
const ratesRoute = require("./routes/rates");

dotenv.config();

//Connect to MongoDB
mongoose.connect(
  process.env.DB_CONNECT,
  { useNewUrlParser: true, useUnifiedTopology: true },
  () => console.log("Connected to MongoDB")
);

//Middleware
app.use(express.json());

//Route Middleware - Prefix
app.use("/api/user", authRoute);
app.use("/api/rates", ratesRoute);

app.listen(3000, () => console.log("Server up and running"));
