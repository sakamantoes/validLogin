import mongoose from "mongoose";

const AvailableServiceSchema = new mongoose.Schema(
  {
    providerService: {
      type: String,
      required: true,
      index: true,
    },
    providerCountry: {
      type: String,
      required: true,
      index: true,
    },
    provider: {
      type: String,
      enum: ["smspool", "smsbower"],
      required: true,
      index: true,
    },

    providerPrice: {
      type: Number,
      required: true,
    },
    internalService: {
      type: String,
      required: true,
      index: true,
    },
    internalCountry: {
      type: String,
      required: true,
      index: true,
    },
    customPrice: {
      type: Number,
      default: null,
    },

    stock: {
      type: Number,
    },

    active: {
      type: Boolean,
      default: false,
    },
    providerId: {
      type: String,
      required: true,
      index: true,
    },
    isVisible: {
      type: Boolean,
      default: false,
    },
    lastFetchedAt: {
      type: Date,
      default: Date.now,
    },
    availability: Boolean,
  },
  {
    timestamps: true,
  },
);

AvailableServiceSchema.index(
  {
    providerService: 1,
    providerCountry: 1,
    provider: 1,
    providerId: 1,
  },
  {
    unique: true,
  },
);

const AvailableService = mongoose.model(
  "AvailableService",
  AvailableServiceSchema,
);

export default AvailableService;
