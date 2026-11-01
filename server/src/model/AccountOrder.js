import mongoose from "mongoose";

const accountOrderSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    accountListingId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "AccountListing",
      required: true,
      index: true,
    },

    provider: {
      type: String,
      required: true,
      default: "justverifyboost",
      index: true,
    },

    providerAccountId: {
      type: String,
      required: true,
    },

    providerPurchaseId: {
      type: String,
      required: false,
      index: true,
    },

    receiptNo: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },

    quantity: {
      type: Number,
      required: true,
      min: 1,
    },

    providerPrice: {
      type: Number,
      required: true,
      min: 0,
    },

    sellingPrice: {
      type: Number,
      required: true,
      min: 0,
    },

    amount: {
      type: Number,
      required: true,
      min: 0,
    },

    purchaseStatus: {
      type: String,
      enum: ["pending", "processing", "completed", "failed", "cancelled"],
      default: "pending",
      index: true,
    },

    deliveryStatus: {
      type: String,
      enum: ["pending", "processing", "delivered", "failed"],
      default: "pending",
      index: true,
    },

    accountDetails: {
      type: mongoose.Schema.Types.Mixed,
      default: null,
    },

    providerResponse: {
      type: mongoose.Schema.Types.Mixed,
      default: null,
    },

    deliveredAt: {
      type: Date,
      default: null,
    },

    completedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  },
);

accountOrderSchema.index({
  userId: 1,
  createdAt: -1,
});

accountOrderSchema.index({
  purchaseStatus: 1,
  deliveryStatus: 1,
});

accountOrderSchema.index({
  provider: 1,
  providerPurchaseId: 1,
});

export default mongoose.model("AccountOrder", accountOrderSchema);
