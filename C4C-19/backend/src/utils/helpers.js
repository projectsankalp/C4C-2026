const jwt = require("jsonwebtoken");

const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: "30d"
  });
};

module.exports = {
  generateOTP,
  generateToken
};