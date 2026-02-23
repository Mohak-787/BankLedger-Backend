const User = require("../models/user.model");
const jwt = require("jsonwebtoken");
const TokenBlackList = require("../models/blackList.model");

async function authMiddleware(req, res, next) {
  try {
    const token = req.cookies.token || req.headers.authorization?.split(" ")[1];

    if (!token) return res.status(401).json({
      message: "Unauthorized access: Token not found",
      success: false
    });

    const isTokenBlacklisted = await TokenBlackList.findOne({ token });

    if (isTokenBlacklisted) return res.status(401).json({
      message: "Unauthorized access: Token is invalid",
      success: false
    });

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      const user = await User.findById(decoded.userId);

      req.user = user;
      return next();

    } catch (error) {
      return res.status(401).json({
        message: "Unauthorized access: Invalid token",
        success: false
      });
    }

  } catch (error) {
    console.error("Error in authMiddleware: ", error);
    return res.status(500).json({
      message: "Internal server error",
      success: false
    });
  }
}

async function authSystemUserMiddleware(req, res, next) {
  try {
    const token = req.cookies.token || req.headers.authorization?.split(" ")[1];

    if (!token) return res.status(401).json({
      message: "Unauthorized access: Token not found",
      success: false
    });

    const isTokenBlacklisted = await TokenBlackList.findOne({ token });

    if (isTokenBlacklisted) return res.status(401).json({
      message: "Unauthorized access: Token is invalid",
      success: false
    });

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      const user = await User.findById(decoded.userId).select("+systemUser");

      if (!user.systemUser) {
        return res.status(403).json({
          message: "Forbidden access: Not a system user",
          success: false
        });
      }

      req.user = user;
      return next();

    } catch (error) {
      return res.status(401).json({
        message: "Unauthorized access: Invalid token",
        success: false
      });
    }

  } catch (error) {
    console.error("Error in authSystemUserMiddleware: ", error);
    return res.status(500).json({
      message: "Internal server error",
      success: false
    });
  }
}

module.exports = {
  authMiddleware,
  authSystemUserMiddleware
};