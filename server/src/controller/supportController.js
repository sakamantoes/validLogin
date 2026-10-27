import Support from "../model/Support.js";
import User from "../model/User.js";
import mongoose from "mongoose";
// ================= USER CONTROLLERS =================

// Create new support message
export const createSupportMessage = async (req, res, next) => {
  try {
    const { subject, message } = req.body;
    const userId = req.user._id;

    if (!subject || !message) {
      res.statusCode = 400;
      throw new Error("Subject and message are required");
    }

    const user = await User.findById(userId);
    if (!user) {
      res.statusCode = 404;
      throw new Error("User not found");
    }

    const supportMessage = await Support.create({
      userId,
      userName: user.name || user.email,
      userEmail: user.email,
      subject,
      message,
      status: "pending",
      isReadByAdmin: false,
      isReadByUser: true,
    });

    res.status(201).json({
      success: true,
      message: "Support message sent successfully",
      data: supportMessage,
    });
  } catch (error) {
    next(error);
  }
};

// Get user's own support messages
export const getUserSupportMessages = async (req, res, next) => {
  try {
    const userId = req.user._id;

    const messages = await Support.find({ userId }).sort({ createdAt: -1 });

    // Mark messages as read by user
    await Support.updateMany(
      { userId, isReadByUser: false },
      { $set: { isReadByUser: true } },
    );

    res.status(200).json({
      success: true,
      count: messages.length,
      data: messages,
    });
  } catch (error) {
    next(error);
  }
};

// Get single support message by ID (user)
export const getSupportMessageById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      res.statusCode = 400;
      throw new Error("invalid id params");
    }

    const message = await Support.findOne({ _id: id, userId });

    if (!message) {
      res.statusCode = 404;
      throw new Error("Support message not found");
    }

    // Mark as read by user
    if (!message.isReadByUser) {
      message.isReadByUser = true;
      await message.save();
    }

    res.status(200).json({
      success: true,
      data: message,
    });
  } catch (error) {
    next(error);
  }
};

// Add reply from user (additional message in same thread)
export const addUserReply = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { message } = req.body;
    const userId = req.user._id;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      res.statusCode = 400;
      throw new Error("invalid id");
    }
    
    if (!message) {
      res.statusCode = 400;
      throw new Error("Reply message is required");
    }

    const supportMessage = await Support.findOne({ _id: id, userId });

    if (!supportMessage) {
      res.statusCode = 404;
      throw new Error("Support message not found");
    }

    // Append new message to existing conversation
    const updatedMessage = `${supportMessage.message}\n\n[User Reply]: ${message}`;

    supportMessage.message = updatedMessage;
    supportMessage.status = "pending";
    supportMessage.isReadByAdmin = false;
    supportMessage.isReadByUser = true;

    await supportMessage.save();

    res.status(200).json({
      success: true,
      message: "Reply added successfully",
      data: supportMessage,
    });
  } catch (error) {
    next(error);
  }
};

// Delete user's own support message
export const deleteUserSupportMessage = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      res.statusCode = 400;
      throw new Error("invalid id params");
    }

    const message = await Support.findOneAndDelete({ _id: id, userId });

    if (!message) {
      res.statusCode = 404;
      throw new Error("Support message not found");
    }

    res.status(200).json({
      success: true,
      message: "Support message deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};

// ================= ADMIN CONTROLLERS =================

// Get all support messages (admin)
export const getAllSupportMessages = async (req, res, next) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;

    let query = {};
    if (status && status !== "all") {
      query.status = status;
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const messages = await Support.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .populate("userId", "name email");

    const total = await Support.countDocuments(query);

    res.status(200).json({
      success: true,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / parseInt(limit)),
      data: messages,
    });
  } catch (error) {
    next(error);
  }
};

// Get single support message (admin)
export const getAdminSupportMessageById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const message = await Support.findById(id).populate(
      "userId",
      "name email walletBalance",
    );

    if (!message) {
      res.statusCode = 404;
      throw new Error("Support message not found");
    }

    // Mark as read by admin
    if (!message.isReadByAdmin) {
      message.isReadByAdmin = true;
      await message.save();
    }

    res.status(200).json({
      success: true,
      data: message,
    });
  } catch (error) {
    next(error);
  }
};

// Reply to support message (admin)
export const adminReply = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { reply } = req.body;

    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      res.statusCode = 400;
      throw new Error("invalid id params");
    }

    if (!reply) {
      res.statusCode = 400;
      throw new Error("Reply message is required");
    }

    const message = await Support.findById(id);

    if (!message) {
      res.statusCode = 404;
      throw new Error("Support message not found");
    }

    message.adminReply = reply;
    message.status = "replied";
    message.isReadByUser = false;

    await message.save();

    res.status(200).json({
      success: true,
      message: "Reply sent successfully",
      data: message,
    });
  } catch (error) {
    next(error);
  }
};

// Update support message status (admin)
export const updateSupportStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      res.statusCode = 400;
      throw new Error("invalid id params");
    }

    if (!["pending", "replied", "resolved"].includes(status)) {
      res.statusCode = 400;
      throw new Error("Invalid status");
    }

    const message = await Support.findById(id);

    if (!message) {
      res.statusCode = 404;
      throw new Error("Support message not found");
    }

    message.status = status;
    await message.save();

    res.status(200).json({
      success: true,
      message: "Status updated successfully",
      data: message,
    });
  } catch (error) {
    next(error);
  }
};

// Delete support message (admin)
export const deleteSupportMessage = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      res.statusCode = 400;
      throw new Error("invalid id params");
    }

    const message = await Support.findByIdAndDelete(id);

    if (!message) {
      res.statusCode = 404;
      throw new Error("Support message not found");
    }

    res.status(200).json({
      success: true,
      message: "Support message deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};

// Get unread count for admin dashboard
export const getUnreadCount = async (req, res, next) => {
  try {
    const unreadCount = await Support.countDocuments({
      isReadByAdmin: false,
      status: { $ne: "resolved" },
    });

    const pendingCount = await Support.countDocuments({ status: "pending" });

    res.status(200).json({
      success: true,
      data: {
        unread: unreadCount,
        pending: pendingCount,
      },
    });
  } catch (error) {
    next(error);
  }
};
