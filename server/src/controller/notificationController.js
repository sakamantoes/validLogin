// controllers/notificationController.js
import Notification from "../model/Notification.js";
import User from "../model/User.js";
import mongoose from "mongoose";

// Create a notification for a user
const createNotification = async (
  userId,
  type,
  title,
  message,
  metadata = {},
) => {
  try {
    const notification = await Notification.create({
      userId,
      type,
      title,
      message,
      metadata,
      read: false,
      createdAt: new Date(),
    });

    return notification;
  } catch (error) {
    console.error("Error creating notification:", error);
    return null;
  }
};

// Get all notifications for authenticated user
const getUserNotifications = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, unreadOnly = false } = req.query;
    const userId = req.user._id;

    const query = { userId };
    if (unreadOnly === "true") {
      query.read = false;
    }

    const notifications = await Notification.find(query)
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .lean();

    const total = await Notification.countDocuments(query);
    const unreadCount = await Notification.countDocuments({
      userId,
      read: false,
    });

    res.status(200).json({
      success: true,
      data: {
        notifications,
        unreadCount,
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        total,
      },
    });
  } catch (error) {
    next(error);
  }
};

// Mark a single notification as read
const markAsRead = async (req, res, next) => {
  const { notificationId } = req.params;
  const userId = req.user._id;

  try {
    const notification = await Notification.findOneAndUpdate(
      { _id: notificationId, userId },
      { read: true, readAt: new Date() },
      { new: true },
    );

    if (!notification) {
      res.statusCode = 404;
      throw new Error("Notification not found");
    }

    res.status(200).json({
      success: true,
      message: "Notification marked as read",
      data: notification,
    });
  } catch (error) {
    next(error);
  }
};

// Mark all notifications as read
const markAllAsRead = async (req, res, next) => {
  const userId = req.user._id;

  try {
    await Notification.updateMany(
      { userId, read: false },
      { read: true, readAt: new Date() },
    );

    res.status(200).json({
      success: true,
      message: "All notifications marked as read",
    });
  } catch (error) {
    next(error);
  }
};

// Delete a notification
const deleteNotification = async (req, res, next) => {
  const { notificationId } = req.params;
  const userId = req.user._id;

  try {
    if (!notificationId || !mongoose.Types.ObjectId.isValid(notificationId)) {
      res.statusCode = 400;
      throw new Error("invalid id params");
    }

    const notification = await Notification.findOneAndDelete({
      _id: notificationId,
      userId,
    });

    if (!notification) {
      res.statusCode = 404;
      throw new Error("Notification not found");
    }

    res.status(200).json({
      success: true,
      message: "Notification deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};

// Get unread notification count
const getUnreadCount = async (req, res, next) => {
  try {
    const userId = req.user._id;

    const unreadCount = await Notification.countDocuments({
      userId,
      read: false,
    });

    res.status(200).json({
      success: true,
      data: { unreadCount },
    });
  } catch (error) {
    next(error);
  }
};

// Get recent notifications from all users (for admin dashboard)
const getRecentSystemNotifications = async (req, res, next) => {
  try {
    const { limit = 3 } = req.query;
    
    // Fetch recent notifications from all users, populate user info
    const notifications = await Notification.find({})
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .populate('userId', 'email username fullName') // Get user details
      .lean();
    
    // Format notifications for display
    const formattedNotifications = notifications.map(notif => ({
      title: notif.title,
      detail: notif.message,
      amount: formatNotificationAmount(notif),
      direction: getNotificationDirection(notif.type),
      user: notif.userId?.email || notif.userId?.username || 'Unknown User',
      type: notif.type,
      createdAt: notif.createdAt,
    }));
    
    res.status(200).json({
      success: true,
      data: {
        notifications: formattedNotifications,
        total: await Notification.countDocuments(),
      },
    });
  } catch (error) {
    next(error);
  }
};

// Helper function to format notification amount
const formatNotificationAmount = (notification) => {
  const amount = notification.metadata?.amount;
  if (!amount) return '';
  
  // Format based on currency (assuming NGN or USD)
  const currency = notification.metadata?.currency || 'NGN';
  const symbol = currency === 'USD' ? '$' : '₦';
  
  if (notification.type.includes('SUCCESS') || notification.type.includes('CONFIRMED')) {
    return `+${symbol}${amount.toLocaleString()}`;
  }
  if (notification.type.includes('FAILED')) {
    return 'Failed';
  }
  if (notification.type === 'LOW_BALANCE') {
    return `⚠️ ${symbol}${amount.toLocaleString()}`;
  }
  
  return `${symbol}${amount.toLocaleString()}`;
};

// Helper function to determine notification direction/icon
const getNotificationDirection = (type) => {
  const positiveTypes = ['DEPOSIT_SUCCESS', 'PAYMENT_CONFIRMED', 'PAYMENT_RECEIVED'];
  const negativeTypes = ['DEPOSIT_FAILED', 'LOW_BALANCE'];
  
  if (positiveTypes.includes(type)) return 'up';
  if (negativeTypes.includes(type)) return 'down';
  return 'neutral';
};

// Also add a helper to get all notification types (for filtering)
const getNotificationTypes = async (req, res, next) => {
  try {
    const types = await Notification.distinct('type');
    res.status(200).json({
      success: true,
      data: { types },
    });
  } catch (error) {
    next(error);
  }
};


// Helper function to send deposit success notification
const sendDepositSuccessNotification = async (
  userId,
  amount,
  referenceId,
  balanceAfter,
) => {
  const title = "Deposit Successful";
  const message = `Your deposit of ₦${amount.toLocaleString()} has been successfully credited to your wallet.`;

  return await createNotification(userId, "DEPOSIT_SUCCESS", title, message, {
    amount,
    referenceId,
    balanceAfter,
    type: "deposit",
  });
};

// Helper function to send deposit pending notification
const sendDepositPendingNotification = async (userId, amount, referenceId) => {
  const title = "Deposit Pending";
  const message = `Your deposit of ₦${amount.toLocaleString()} is pending confirmation. You'll be notified once it's processed.`;

  return await createNotification(userId, "DEPOSIT_PENDING", title, message, {
    amount,
    referenceId,
    type: "deposit",
  });
};

// Helper function to send deposit failed notification
const sendDepositFailedNotification = async (
  userId,
  amount,
  referenceId,
  reason = null,
) => {
  const title = "Deposit Failed";
  let message = `Your deposit of ₦${amount.toLocaleString()} could not be processed.`;

  if (reason) {
    message += ` Reason: ${reason}`;
  }

  return await createNotification(userId, "DEPOSIT_FAILED", title, message, {
    amount,
    referenceId,
    type: "deposit",
    reason,
  });
};

// Helper function to send payment received notification (for manual payments)
const sendPaymentReceivedNotification = async (
  userId,
  amount,
  referenceId,
  depositorName,
) => {
  const title = "Payment Received";
  const message = `We have received your manual payment of ₦${amount.toLocaleString()}. Your wallet will be credited once confirmed.`;

  return await createNotification(userId, "PAYMENT_RECEIVED", title, message, {
    amount,
    referenceId,
    depositorName,
    type: "manual_payment",
  });
};

// Helper function to send payment confirmed notification (for manual payments)
const sendPaymentConfirmedNotification = async (
  userId,
  amount,
  referenceId,
  balanceAfter,
) => {
  const title = "Payment Confirmed";
  const message = `Your manual payment of ₦${amount.toLocaleString()} has been confirmed and credited to your wallet.`;

  return await createNotification(userId, "PAYMENT_CONFIRMED", title, message, {
    amount,
    referenceId,
    balanceAfter,
    type: "manual_payment",
  });
};

// Helper function to send low balance alert
const sendLowBalanceAlert = async (userId, currentBalance) => {
  const title = "Low Balance Alert";
  const message = `Your wallet balance is ₦${currentBalance.toLocaleString()}. Please top up to continue using our services.`;

  return await createNotification(userId, "LOW_BALANCE", title, message, {
    currentBalance,
    type: "alert",
  });
};

export {
  getUserNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  getUnreadCount,
  sendDepositSuccessNotification,
  sendDepositPendingNotification,
  sendDepositFailedNotification,
  sendPaymentReceivedNotification,
  sendPaymentConfirmedNotification,
  sendLowBalanceAlert,
  createNotification,
  getNotificationTypes,
  getRecentSystemNotifications,
};
