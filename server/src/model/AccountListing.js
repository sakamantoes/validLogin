import mongoose from "mongoose";

const accountListingSchema = new mongoose.Schema(
  {
    provider: {
      type: String,
      required: true,
      enum: ["justverifyboost"],
      default: "justverifyboost",
      index: true,
    },
    providerAccountId: {
      type: String,
      required: true,
      index: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    providerPrice: {
      type: Number,
      required: true,
      min: 0,
    },
    sellingPrice: {
      type: Number,
      min: 0,
      default: 0
    },
    status: {
      type: String,
      enum: ["active", "inactive", "out_of_stock"],
      default: "active",
      index: true,
    },
    productType: {
      type: String,
      enum: ["account", "celeb_update", "working_picture"],
      default: "account",
      index: true,
    },
    category: {
      type: String,
      trim: true,
      default: null,
    },
    description: {
      type: String,
      trim: true,
      default: null,
    },
    quantity: {
      type: Number,
      default: 0
    },
    lastSyncedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  },
);

accountListingSchema.index(
  {
    provider: 1,
    providerAccountId: 1,
  },
  {
    unique: true,
  },
);

accountListingSchema.index({
  status: 1,
  productType: 1,
});

export default mongoose.model("AccountListing", accountListingSchema);
