const express = require("express");
const app = express();
const cors = require("cors");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const logger = require("morgan");

//Import Routes
const authRoute = require("./routes/auth");
const userRoute = require("./routes/users");
const adminRoute = require("./routes/admin");
const guestRoute = require("./routes/guest");

dotenv.config();

//Connect to MongoDB
mongoose.connect(
  process.env.DB_CONNECT,
  { useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex: true },
  () => console.log("Connected to MongoDB")
);

//Middleware
app.use(cors());
app.use(express.json({ limit: "100mb" }));
app.use(logger("dev"));

//Route Middleware - Prefix
app.use("/api/auth", authRoute);
app.use("/api/users", userRoute);
app.use("/api/admins", adminRoute);
app.use("/api/guest", guestRoute);

app.listen(process.env.PORT || 3000, () =>
  console.log("Server up and running")
);
