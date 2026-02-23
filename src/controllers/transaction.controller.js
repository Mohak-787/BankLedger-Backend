const Transaction = require("../models/transaction.model");
const Ledger = require("../models/ledger.model");
const Account = require("../models/account.model");
const emailService = require("../services/email.service");
const mongoose = require("mongoose");

/**
 * - Create Transaction controller
 * - POST /api/v1/transactions/
 */
async function createTransaction(req, res) {
  try {
    const { fromAccount, toAccount, amount, idempotencyKey } = req.body;

    if (!fromAccount || !toAccount || !amount || !idempotencyKey) {
      return res.status(400).json({
        message: "All fields are required",
        success: false
      });
    }

    // Check users
    const fromUserAccount = await Account.findOne({ _id: fromAccount });
    const toUserAccount = await Account.findOne({ _id: toAccount });

    if (!fromUserAccount || !toUserAccount) {
      return res.status(400).json({
        message: "Invalid account",
        success: false
      });
    }

    // Check idempotency key
    const isTransactionAlreadyExists = await Transaction.findOne({ idempotencyKey: idempotencyKey });

    if (isTransactionAlreadyExists) {
      if (isTransactionAlreadyExists.status === "COMPLETED") {
        return res.status(200).json({
          message: "Transaction already processed",
          transaction: isTransactionAlreadyExists,
          success: true
        });
      }

      if (isTransactionAlreadyExists.status === "PENDING") {
        return res.status(200).json({
          message: "Transaction is being processed",
          success: false
        });
      }

      if (isTransactionAlreadyExists.status === "FAILED") {
        return res.status(500).json({
          message: "Transaction failed, please try again",
          success: false
        });
      }

      if (isTransactionAlreadyExists.status === "REVERSED") {
        return res.status(500).json({
          message: "Transaction was reversed, please try again",
          success: false
        });
      }
    }

    // Check account status
    if (fromUserAccount.status != "ACTIVE" || toUserAccount.status != "ACTIVE") {
      return res.status(400).json({
        message: "Accounts must be ACTIVE to process transaction",
        success: false
      });
    }

    // Derive sender balance
    const balance = await fromUserAccount.getBalance();

    if (balance < amount) {
      return res.status(400).json({
        message: `Insufficient balance. Current balance is ${balance}. Requested amount is ${amount}`,
        success: false
      });
    }

    let transaction;
    try {
      // Create transaction (PENDING)
      const session = await mongoose.startSession();
      session.startTransaction();

      transaction = (await Transaction.create([{
        fromAccount,
        toAccount,
        amount,
        idempotencyKey,
        status: "PENDING"
      }], { session }))[0];

      // Create debit ledger entry
      const debitEntry = await Ledger.create([{
        account: fromAccount,
        amount,
        transaction: transaction._id,
        type: "DEBIT"
      }], { session });

      // Create credit ledger entry
      const creditEntry = await Ledger.create([{
        account: toAccount,
        amount,
        transaction: transaction._id,
        type: "CREDIT"
      }], { session });

      // Update transaction (COMPLETED)
      await Transaction.findOneAndUpdate(
        { _id: transaction._id },
        { status: "COMPLETED" },
        { session }
      );

      await session.commitTransaction();
      session.endSession();

    } catch (error) {
      return res.status(400).json({
        message: "Transaction is Pending due to some issue, please retry after sometime",
      });
    }
    // Send email notification
    await emailService.sendTransactionEmail(req.user.email, req.user.name, amount, toAccount);

    res.status(201).json({
      message: "Transaction completed successfully",
      transaction: transaction,
      success: true
    });

  } catch (error) {
    console.error("Error in createTransaction: ", error);
    return res.status(500).json({
      message: "Internal server error",
      success: false
    });
  }
}

/**
 * - Create Initial funds transaction for system user controller
 * - POST /api/v1/transactions/system/initial-funds
 * - Development purpose
 */
async function createInitialFundsTransaction(req, res) {
  try {
    const { toAccount, amount, idempotencyKey } = req.body;

    if (!toAccount || !amount || !idempotencyKey) {
      return res.status(400).json({
        message: "All fields are required",
        success: false
      });
    }

    // Check user
    const toUserAccount = await Account.findOne({ _id: toAccount });

    if (!toUserAccount) {
      return res.status(400).json({
        message: "Invalid account",
        success: false
      });
    }

    const fromUserAccount = await Account.findOne({
      user: req.user._id
    });

    if (!fromUserAccount) {
      return res.status(400).json({
        message: "System User not found",
        success: false
      });
    }

    // Create transaction (PENDING)
    const session = await mongoose.startSession();
    session.startTransaction();

    const transaction = await Transaction.create({
      fromAccount: fromUserAccount._id,
      toAccount,
      amount,
      idempotencyKey,
      status: "PENDING"
    });

    // Create debit ledger entry
    const debitEntry = await Ledger.create([{
      account: fromUserAccount._id,
      amount,
      transaction: transaction._id,
      type: "DEBIT"
    }], { session });

    // Create credit ledger entry
    const creditEntry = await Ledger.create([{
      account: toAccount,
      amount,
      transaction: transaction._id,
      type: "CREDIT"
    }], { session });

    // Update transaction (COMPLETED)
    transaction.status = "COMPLETED";
    await transaction.save({ session });

    await session.commitTransaction();
    session.endSession();

    res.status(201).json({
      message: "Initial funds transaction completed successfully",
      transaction: transaction,
      success: true
    });

  } catch (error) {
    console.error("Error in createInitialFundsTransaction: ", error);
    return res.status(500).json({
      message: "Internal server error",
      success: false
    });
  }
}

module.exports = {
  createTransaction,
  createInitialFundsTransaction
}