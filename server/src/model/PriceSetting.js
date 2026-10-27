import mongoose from "mongoose";

const PriceSettingSchema = new mongoose.Schema(
  {
    usdToNgnRate: {
      type: Number,
      required: true,
      default: 1700,
    },

    globalMarkupType: {
      type: String,
      enum: ["fixed", "percentage"],
      default: "percentage",
    },

    globalMarkupValue: {
      type: Number,
      default: 20,
    },
  },
  {
    timestamps: true,
  },
);

const PriceSetting = mongoose.model("PriceSetting", PriceSettingSchema);

export default PriceSetting;
