const express = require("express");
const authMiddleware = require("../middlewares/auth.middleware");
const accountController = require("../controllers/account.controller");
const router = express.Router();

router.use(authMiddleware.authMiddleware);

/* POST /api/v1/accounts/ */
router.route("/").post(accountController.createAccountController);

/* GET /api/v1/accounts/ */
router.route("/").get(accountController.getUserAccountsController);

/* GET /api/v1/accounts/balance/:id */
router.route("/balance/:id").get(accountController.getAccountBalanceController);

module.exports = router;