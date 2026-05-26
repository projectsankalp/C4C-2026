const jwt = require("jsonwebtoken");

const adminProtect = async (
  req,
  res,
  next
) => {

  try {

    const token =
      req.headers.authorization?.split(" ")[1];

    if (!token) {

      return res.status(401).json({
        message: "No token"
      });

    }

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET
    );

    req.admin = decoded;

    next();

  } catch (error) {

    res.status(401).json({
      message: "Admin authorization failed"
    });

  }

};

module.exports = adminProtect;