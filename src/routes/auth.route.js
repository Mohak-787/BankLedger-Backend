const express = require("express");
const authController = require("../controllers/auth.controller");

const router = express.Router();

/* POST /api/v1/auth/register */
router.route("/register").post(authController.userRegisterController);

/* POST /api/v1/auth/login */
router.route("/login").post(authController.userLoginController);

/* POST /api/v1/auth/logout */
router.route("/logout").post(authController.userLogoutController);

module.exports = router;