const express = require("express");
const authMiddleware = require("../middlewares/auth.middleware");
const transactionController = require("../controllers/transaction.controller");

const router = express.Router();

/* POST /api/v1/transactions/system/initial-funds */
router.route("/system/initial-funds").post(authMiddleware.authSystemUserMiddleware,
  transactionController.createInitialFundsTransaction);

/* Middleware to verify and identify user */
router.use(authMiddleware.authMiddleware);

/* POST /api/v1/transactions/ */
router.route("/").post(transactionController.createTransaction);

module.exports = router;