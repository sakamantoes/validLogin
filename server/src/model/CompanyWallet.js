import mongoose from "mongoose";

const companyWalletSchema = new mongoose.Schema(
  {
    bank_name: {
      type: String,
      required: true,
    },
    account_number: {
      type: String,
    },
    account_name: {
      type: String
    }
  },
  { timestamps: true },
);

export default mongoose.model("CompanyWallet", companyWalletSchema);
