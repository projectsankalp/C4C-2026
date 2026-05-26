const express = require("express");

const router = express.Router();

const {
  sendOTP,
  verifyOTP,
  registerUser
} = require("../controllers/authController");

router.post("/send-otp", sendOTP);

router.post("/verify-otp", verifyOTP);

router.post("/register", registerUser);

module.exports = router;