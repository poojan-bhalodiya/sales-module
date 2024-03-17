const express = require("express");
const app = express();
const port = 8080;
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const cors = require("cors");
const authRoutes = require("./routes/auth-route"); // Assuming your routes file is named authRoutes.js

dotenv.config();
app.use(cors());
app.use(express.json()); // Middleware to parse JSON bodies

mongoose
  .connect(process.env.MONGODB_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("Connected to MongoDB");
  })
  .catch((err) => {
    console.log(err);
  });

app.use("/auth", authRoutes); // Mount the router at /auth base path

app.listen(port, () => {
  console.log(`Port is running on ${port}`);
});
