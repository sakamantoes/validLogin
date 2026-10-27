import mongoose from "mongoose";

const supportMessageSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    userName: {
      type: String,
      required: true,
    },
    userEmail: {
      type: String,
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    adminReply: {
      type: String,
      default: null,
    },
    status: {
      type: String,
      enum: ["pending", "replied", "resolved"],
      default: "pending",
    },
    isReadByAdmin: {
      type: Boolean,
      default: false,
    },
    isReadByUser: {
      type: Boolean,
      default: true,
    },
    subject: {
      type: String,
      required: true,
    },
    attachments: [
      {
        filename: String,
        url: String,
      },
    ],
  },
  {
    timestamps: true,
  }
);

const Support = mongoose.model("Support", supportMessageSchema);
export default Support;