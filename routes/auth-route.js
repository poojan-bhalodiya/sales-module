const express = require("express");
const authController = require("../controller/auth-crtl");

const router = express.Router();

router.post("/register", authController.createUser);

module.exports = router;
