import mongoose from "mongoose";

const transactionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    type: {
      type: String,
      enum: ["OTP_PURCHASE", "REFUND", "DEPOSIT"],
      required: true,
    },

    provider: { type: String, enum: ["nodeotp", "smsactivate"] },

    amount: { type: Number, required: true },

    providerCost: { type: Number, default: 0 },

    profit: { type: Number, default: 0 },

    description: { type: String },

    orderId: { type: mongoose.Schema.Types.ObjectId, ref: "OtpOrder" },
  },
  { timestamps: true },
);

export default mongoose.model("Transaction", transactionSchema);
