const express = require("express");
const app = express();
const cors = require("cors");
const mongoose = require("mongoose");
const dotenv = require("dotenv");

//Import Routes
const authRoute = require("./routes/auth");
const ratesRoute = require("./routes/rates");
const userRoute = require("./routes/users");
const adminRoute = require("./routes/admin");

dotenv.config();

//Connect to MongoDB
mongoose.connect(
  process.env.DB_CONNECT,
  { useNewUrlParser: true, useUnifiedTopology: true },
  () => console.log("Connected to MongoDB")
);

//Middleware
app.use(cors());
app.use(express.json({ limit: "100mb" }));

//Route Middleware - Prefix
app.use("/api/auth", authRoute);
app.use("/api/rates", ratesRoute);
app.use("/api/users", userRoute);
app.use("/api/admins", adminRoute);

app.listen(3000, () => console.log("Server up and running"));
