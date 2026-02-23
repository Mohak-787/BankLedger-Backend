const Account = require("../models/account.model");

/**
 * - Create account controller
 * - POST /api/v1/accounts/
 */
async function createAccountController(req, res) {
  try {
    const user = req.user;

    const account = await Account.create({
      user: user._id
    });

    res.status(201).json({
      account,
      success: true
    });

  } catch (error) {
    console.error("Error in createAccountController: ", error);
    return res.status(500).json({
      message: "Internal server error",
      success: false
    });
  }
}

/**
 * - Get user account controller
 * - GET /api/v1/accounts/
 */
async function getUserAccountsController(req, res) {
  try {
    const accounts = await Account.find({ user: req.user._id });

    res.status(200).json(accounts);

  } catch (error) {
    console.error("Error in getUserAccountsController: ", error);
    return res.status(500).json({
      message: "Internal server error",
      success: false
    });
  }
}

/**
 * - Get user account balance
 * - /api/v1/accounts/balance/:id
 */
async function getAccountBalanceController(req, res) {
  try {
    const { id: accountId } = req.params;

    const account = await Account.findOne({
      _id: accountId,
      user: req.user._id
    });

    if (!account) {
      return res.status(404).json({
        message: "Account not found",
        success: false
      })
    }

    const balance = await account.getBalance();

    res.status(200).json({
      accountId: account._id,
      balance,
      success: true
    });

  } catch (error) {
    console.error("Error in getAccountBalanceController: ", error);
    return res.status(500).json({
      message: "Internal server error",
      success: false
    });
  }
}

module.exports = {
  createAccountController,
  getUserAccountsController,
  getAccountBalanceController
}