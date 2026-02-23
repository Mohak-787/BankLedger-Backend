const User = require("../models/user.model");
const jwt = require("jsonwebtoken");
const emailService = require("../services/email.service");
const TokenBlackList = require("../models/blackList.model");

/** 
 * - User register controller
 * - POST /api/v1/auth/register
 */
async function userRegisterController(req, res) {
  try {
    const { email, password, name } = req.body;

    const isExists = await User.findOne({ email });
    if (isExists) {
      return res.status(422).json({
        message: "User already exists with this email",
        success: false
      });
    }

    const user = await User.create({
      email, password, name
    });

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
      expiresIn: "3d"
    });

    res.cookie("token", token);
    res.status(201).json({
      user: {
        _id: user._id,
        email: user.email,
        name: user.name
      },
      success: true
    });

    await emailService.sendRegistrationEmail(user.email, user.name);

  } catch (error) {
    console.error("Error in userRegisterController: ", error);
    return res.status(500).json({
      message: "Internal server error",
      success: false
    });
  }
}

/**
 * - User login controller
 * - POST /api/v1/auth/login
 */
async function userLoginController(req, res) {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email }).select("+password");
    if (!user) return res.status(401).json({
      message: "Invalid credentials",
      success: false
    });

    const isValidPassword = await user.comparePassword(password);
    if (!isValidPassword) return res.status(401).json({
      message: "Invalid credentials",
      success: false
    });

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
      expiresIn: "3d"
    });

    res.cookie("token", token);
    res.status(200).json({
      user: {
        _id: user._id,
        email: user.email,
        name: user.name
      },
      success: true
    });

  } catch (error) {
    console.error("Error in userLoginController: ", error);
    return res.status(500).json({
      message: "Internal server error",
      success: false
    });
  }
}

/**
 * - User logout controller
 * - POST /api/v1/auth/logout
 */
async function userLogoutController(req, res) {
  try {
    const token = req.cookies.token || req.headers.authorization?.split(" ")[1];

    if (!token) return res.status(200).json({
      message: "User logged out successfully",
      success: true
    });

    await TokenBlackList.create({ token });

    res.clearCookie("token");

    res.status(200).json({
      message: "User logged out successfully",
      success: true
    });

  } catch (error) {
    console.error("Error in userLogoutController: ", error);
    return res.status(500).json({
      message: "Internal server error",
      success: false
    });
  }
}

module.exports = {
  userRegisterController,
  userLoginController,
  userLogoutController
}