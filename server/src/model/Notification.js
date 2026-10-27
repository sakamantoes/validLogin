// model/Notification.js
import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
    index: true
  },
  type: {
    type: String,
    enum: [
      "DEPOSIT_SUCCESS",
      "DEPOSIT_PENDING", 
      "DEPOSIT_FAILED",
      "PAYMENT_RECEIVED",
      "PAYMENT_CONFIRMED",
      "WITHDRAWAL_SUCCESS",
      "WITHDRAWAL_PENDING",
      "WITHDRAWAL_FAILED",
      "LOW_BALANCE",
      "GENERAL"
    ],
    required: true
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  message: {
    type: String,
    required: true,
    trim: true
  },
  read: {
    type: Boolean,
    default: false,
    index: true
  },
  readAt: {
    type: Date
  },
  metadata: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  }
}, {
  timestamps: {
    createdAt: true,
    updatedAt: true
  }
});

// Compound index for efficient queries
notificationSchema.index({ userId: 1, createdAt: -1 });
notificationSchema.index({ userId: 1, read: 1 });

// Auto-delete notifications older than 30 days
notificationSchema.index({ createdAt: 1 }, { expireAfterSeconds: 2592000 });

const Notification = mongoose.model("Notification", notificationSchema);

export default Notification;