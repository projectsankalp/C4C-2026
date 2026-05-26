const User = require("../models/User");

const sendOTPService = require("../services/otpService");

const { generateOTP, generateToken } = require("../utils/helpers");

let otpStore = {};



const sendOTP = async (req, res) => {
  try {
    const { phone } = req.body;

    if (!phone) {
      return res.status(400).json({
        message: "Phone number required"
      });
    }

    const otp = generateOTP();

    otpStore[phone] = otp;

    const sent = await sendOTPService(phone, otp);

    if (!sent) {
      return res.status(500).json({
        message: "OTP sending failed"
      });
    }

    res.status(200).json({
      success: true,
      message: "OTP sent successfully"
    });

  } catch (error) {
    res.status(500).json({
      message: error.message
    });
  }
};



const verifyOTP = async (req, res) => {
  try {
    const { phone, otp } = req.body;

    if (otpStore[phone] !== otp) {
      return res.status(400).json({
        message: "Invalid OTP"
      });
    }

    let user = await User.findOne({ phone });

    if (!user) {
      user = await User.create({
        phone
      });
    }

    const token = generateToken(user._id);

    delete otpStore[phone];

    res.status(200).json({
      success: true,
      token,
      user
    });

  } catch (error) {
    res.status(500).json({
      message: error.message
    });
  }
};



const registerUser = async (req, res) => {
  try {

    const {
      name,
      phone,
      age,
      gender,
      height,
      weight,
      language,
      bpChecked,
      bpValue,
      familyHistory
    } = req.body;

    let user = await User.findOne({ phone });

    if (!user) {
      user = new User({
        name,
        phone,
        age,
        gender,
        height,
        weight,
        language,
        bpChecked,
        bpValue,
        familyHistory
      });

      await user.save();
    }

    res.status(201).json({
      success: true,
      user
    });

  } catch (error) {
    res.status(500).json({
      message: error.message
    });
  }
};



module.exports = {
  sendOTP,
  verifyOTP,
  registerUser
};