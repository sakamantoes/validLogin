import mongoose from "mongoose";

const purchaseReceiptSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    purchaseType: {
      type: String,
      enum: ["LOG", "OTP", "OTP_REFUND"],
      required: true,
    },

    itemId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      refPath: "itemModel",
    },

    itemModel: {
      type: String,
      enum: ["Log", "OtpOrder"],
      required: true,
    },

    amount: {
      type: Number,
      required: true,
      min: 0,
    },

    currency: {
      type: String,
      default: "NGN",
      uppercase: true,
      trim: true,
    },

    status: {
      type: String,
      enum: ["PENDING", "SUCCESS", "FAILED"],
      default: "SUCCESS",
    },

    receiptNo: {
      type: String,
      required: true,
      unique: true,
      index: true,
      trim: true,
    },

    balanceBefore: {
      type: Number,
      required: true,
      min: 0,
    },

    balanceAfter: {
      type: Number,
      required: true,
      min: 0,
    },

    description: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  },
);

const PurchaseReceipt = mongoose.model(
  "PurchaseReceipt",
  purchaseReceiptSchema,
);

export default PurchaseReceipt;
