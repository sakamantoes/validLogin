import mongoose from "mongoose";

const walletTransactionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      require: true,
      index: true,
    },
    depositorName: {
      type: String,
      index: true,
    },
    type: {
      type: String,
      enum: ["DEPOSIT", "PURCHASE", "REFUND"],
      default: "DEPOSIT",
    },
    amount: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
      enum: ["PENDING", "SUCCESS", "FAILED"],
      default: "PENDING",
    },
    referenceId: {
      type: String,
      unique: true,
      index: true,
    },
    orderId: String,

    paymentMethod: {
      type: String,
      enum: ["QUEST", "SQUAD", "MANUAL_TRANSFER","ADMIN_REFUND"],
    },

    balanceBefore: Number,
    balanceAfter: Number,
  },
  {
    timestamps: true,
  },
);

const WalletTransaction = mongoose.model(
  "walletTransaction",
  walletTransactionSchema,
);

export default WalletTransaction;
