import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    phone: {
      type: String,
      unique: true,
      sparse: true, // allows multiple docs without phone, but enforces uniqueness when present
      index: true,
      match: [/^0\d{10}$/, "Phone must be 11 digits starting with 0"],
    },
    ctexCustomerId: {
      type: String,
      default: null,
    },
    role: {
      type: String,
      required: true,
      enum: ["admin", "user"],
      default: "user",
    },
    walletBalance: {
      type: Number,
      default: 0,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    resetPasswordToken: String,
    resetPasswordTokenExpires: Date,
  },
  { timestamps: true },
);

const User = mongoose.model("User", userSchema);

export default User;