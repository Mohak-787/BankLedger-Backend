const express = require("express");
const cookieParser = require("cookie-parser");

const app = express();

app.use(express.json());
app.use(cookieParser());

/**
 * - Routes required
 */
const authRouter = require("./routes/auth.route");
const accountRouter = require("./routes/account.route");
const transactionRouter = require("./routes/transaction.route");

/**
 * - Use Routes
 */
app.use("/api/v1/auth", authRouter);
app.use("/api/v1/accounts", accountRouter);
app.use("/api/v1/transactions", transactionRouter);

module.exports = app;