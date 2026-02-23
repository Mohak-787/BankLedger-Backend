const mongoose = require("mongoose");

const ledgerSchema = new mongoose.Schema({
  account: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Account",
    required: [true, "Ledger must be associated with an account"],
    index: true,
    immutable: true
  },
  amount: {
    type: Number,
    required: [true, "Amount is required for creating a ledger entry"],
    immutable: true
  },
  transaction: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Transaction",
    required: [true, "Ledger must be associated with a transaction"],
    index: true,
    immutable: true
  },
  type: {
    type: String,
    enum: {
      values: ["CREDIT", "DEBIT"],
      message: "Type can be either CREDIT or DEBIT",
    },
    required: [true, "Ledger type is required"],
    immutable: true
  }
}, { timestamps: true });

function preventModification() {
  throw new Error("Ledger entries are immutable and cannot be modified or deleted");
}

ledgerSchema.pre("findOneAndUpdate", preventModification);
ledgerSchema.pre("updateOne", preventModification);
ledgerSchema.pre("deleteOne", preventModification);
ledgerSchema.pre("remove", preventModification);
ledgerSchema.pre("deleteMany", preventModification);
ledgerSchema.pre("updateMany", preventModification);
ledgerSchema.pre("findOneAndDelete", preventModification);
ledgerSchema.pre("findOneAndReplace", preventModification);

const Ledger = mongoose.model("Ledger", ledgerSchema);
module.exports = Ledger;