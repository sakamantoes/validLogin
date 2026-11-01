import mongoose from "mongoose";
import AccountListing from "../model/AccountListing.js";
import AccountOrder from "../model/AccountOrder.js";
import User from "../model/User.js";
import WalletTransaction from "../model/WalletTransactions.js";
import PurchaseReceipt from "../model/PurchaseReceipt.js";
import recieptNumberGenerator from "../utils/recieptNo.generator.js";
import { purchaseJustVerifyBoostAccount } from "../services/purschaseLog.js";

// export const logWebhook = async (req, res, next) => {
//   try {
//     const { event, productType, category, product } = req.body;
//     console.log("Webhook header names:", Object.keys(req.headers));
//     console.log("JustVerifyBoost webhook:", event);

//     // Only process account products
//     // if (
//     //   productType !== "account" ||
//     //   category !== "account" ||
//     //   !product?._id
//     // ) {
//     //   return res.status(200).json({
//     //     success: true,
//     //     message: "Webhook ignored",
//     //   });
//     // }

//     // const providerAccountId = product._id;

//     // // Handle deleted products
//     // if (event === "product.deleted") {
//     //   await AccountListing.findOneAndUpdate(
//     //     {
//     //       provider: "justverifyboost",
//     //       providerAccountId,
//     //     },
//     //     {
//     //       $set: {
//     //         status: "inactive",
//     //         lastSyncedAt: new Date(),
//     //       },
//     //     },
//     //   );

//     //   return res.status(200).json({
//     //     success: true,
//     //     message: "Account listing deactivated",
//     //   });
//     // }

//     // // Handle out-of-stock products
//     // if (event === "product.out_of_stock") {
//     //   await AccountListing.findOneAndUpdate(
//     //     {
//     //       provider: "justverifyboost",
//     //       providerAccountId,
//     //     },
//     //     {
//     //       $set: {
//     //         quantity: 0,
//     //         status: "out_of_stock",
//     //         lastSyncedAt: new Date(),
//     //       },
//     //     },
//     //   );

//     //   return res.status(200).json({
//     //     success: true,
//     //     message: "Account listing marked out of stock",
//     //   });
//     // }

//     // // Only process created and updated events below
//     // if (
//     //   event !== "product.created" &&
//     //   event !== "product.updated"
//     // ) {
//     //   return res.status(200).json({
//     //     success: true,
//     //     message: "Unsupported event ignored",
//     //   });
//     // }

//     // const providerPrice = Number(product.price);
//     // const quantity = Number(product.quantity);

//     // if (
//     //   !Number.isFinite(providerPrice) ||
//     //   providerPrice < 0 ||
//     //   !Number.isInteger(quantity) ||
//     //   quantity < 0
//     // ) {
//     //   return res.status(400).json({
//     //     success: false,
//     //     message: "Invalid product data",
//     //   });
//     // }

//     // const existingListing = await AccountListing.findOne({
//     //   provider: "justverifyboost",
//     //   providerAccountId,
//     // });

//     // // Preserve your existing selling price for now.
//     // // Replace this with your existing pricing/markup utility.
//     // const sellingPrice = existingListing
//     //   ? existingListing.sellingPrice
//     //   : 0;

//     // await AccountListing.findOneAndUpdate(
//     //   {
//     //     provider: "justverifyboost",
//     //     providerAccountId,
//     //   },
//     //   {
//     //     $set: {
//     //       name: product.title,
//     //       description: product.description || "",
//     //       category: product.socialMediaType || category,
//     //       providerPrice,
//     //       sellingPrice,
//     //       quantity,
//     //       status: quantity > 0 ? "active" : "out_of_stock",
//     //       lastSyncedAt: new Date(),
//     //     },
//     //     $setOnInsert: {
//     //       provider: "justverifyboost",
//     //       providerAccountId,
//     //     },
//     //   },
//     //   {
//     //     upsert: true,
//     //     returnDocument: "after",
//     //     runValidators: true,
//     //   },
//     // );

//     return res.status(200).json({
//       success: true,
//       message: "Account listing synchronized",
//     });
//   } catch (error) {
//     next(error);
//   }
// };


// admin logs endpoints

export const getAllPlatformLogs = async (req, res, next) => {
  try {
    const {
      page = 1,
      limit = 20,
      search = "",
      status = "",
      productType = "",
      category = "",
    } = req.query;
    const pageNumber = Math.max(Number.parseInt(page, 10) || 1, 1);
    const limitNumber = Math.min(
      Math.max(Number.parseInt(limit, 10) || 20, 1),
      100,
    );
    const normalizedSearch = String(search).trim();
    const query = {};
    const normalizedStatus = String(status).trim();
    const normalizedProductType = String(productType).trim();
    const normalizedCategory = String(category).trim();

    if (normalizedStatus) {
      query.status = normalizedStatus;
    }

    if (normalizedProductType) {
      query.productType = normalizedProductType;
    }

    if (normalizedCategory) {
      query.category = { $regex: normalizedCategory, $options: "i" };
    }

    if (normalizedSearch) {
      const searchRegex = new RegExp(normalizedSearch, "i");
      query.$or = [
        { providerAccountId: searchRegex },
        { name: searchRegex },
        { provider: searchRegex },
        { status: searchRegex },
        { productType: searchRegex },
        { category: searchRegex },
      ];
    }

    const [logs, total] = await Promise.all([
      AccountListing.find(query)
        .sort({ createdAt: -1 })
        .skip((pageNumber - 1) * limitNumber)
        .limit(limitNumber)
        .lean(),
      AccountListing.countDocuments(query),
    ]);

    res.status(200).json({
      status: 200,
      success: true,
      message: "accounts fetched successfully",
      data: logs,
      pagination: {
        page: pageNumber,
        limit: limitNumber,
        total,
        totalPages: Math.max(Math.ceil(total / limitNumber), 1),
      },
    });
  } catch (error) {
    next(error);
  }
};

export const updatePlatformLogSellingPrice = async (req, res, next) => {
  const { id } = req.params;
  const { sellingPrice } = req.body;

  try {
    const log = await AccountListing.findByIdAndUpdate(
      id,
      { sellingPrice },
      { return: "after", runValidators: true },
    );

    if (!log) {
      res.statusCode = 404;
      throw new Error("log not found");
    }

    res.status(200).json({
      status: 200,
      success: true,
      message: "log selling price updated successfully",
      data: log,
    });
  } catch (error) {
    next(error);
  }
};

const getAccountOrders = async (req, res, next, { userId, includeUser }) => {
  try {
    const {
      page = 1,
      limit = 20,
      status = "",
      deliveryStatus = "",
      search = "",
    } = req.query;
    const pageNumber = Math.max(Number.parseInt(page, 10) || 1, 1);
    const limitNumber = Math.min(
      Math.max(Number.parseInt(limit, 10) || 20, 1),
      100,
    );
    const query = {};

    if (userId) {
      query.userId = userId;
    }

    if (status) {
      query.purchaseStatus = status;
    }

    if (deliveryStatus) {
      query.deliveryStatus = deliveryStatus;
    }

    const normalizedSearch = String(search).trim();
    if (normalizedSearch) {
      const escapedSearch = normalizedSearch.replace(
        /[.*+?^${}()|[\]\\]/g,
        "\\$&",
      );
      const searchRegex = new RegExp(escapedSearch, "i");
      query.$or = [
        { receiptNo: searchRegex },
        { providerAccountId: searchRegex },
        { providerPurchaseId: searchRegex },
      ];
    }

    const ordersQuery = AccountOrder.find(query)
      .select("-providerResponse")
      .populate("accountListingId", "name category productType")
      .sort({ createdAt: -1 })
      .skip((pageNumber - 1) * limitNumber)
      .limit(limitNumber)
      .lean();

    if (includeUser) {
      ordersQuery.populate("userId", "username email");
    }

    const [orders, total] = await Promise.all([
      ordersQuery,
      AccountOrder.countDocuments(query),
    ]);

    res.status(200).json({
      status: 200,
      success: true,
      message: "account orders fetched successfully",
      data: orders,
      pagination: {
        page: pageNumber,
        limit: limitNumber,
        total,
        totalPages: Math.max(Math.ceil(total / limitNumber), 1),
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getMyAccountOrders = (req, res, next) =>
  getAccountOrders(req, res, next, { userId: req.user._id, includeUser: false });

export const getAllAccountOrders = (req, res, next) =>
  getAccountOrders(req, res, next, { includeUser: true });

// user logs endpoints
export const getActivePlatformLogs = async (req, res, next) => {
  try {
    const { name = "", category = "", page = 1, limit = 20 } = req.query;
    const pageNumber = Math.max(Number.parseInt(page, 10) || 1, 1);
    const limitNumber = Math.min(
      Math.max(Number.parseInt(limit, 10) || 20, 1),
      100,
    );
    
    const query = {
      status: "active",
      sellingPrice: { $gt: 0 },
    };

    const normalizedName = String(name).trim();
    const normalizedCategory = String(category).trim();

    if (normalizedName) {
      query.name = { $regex: normalizedName, $options: "i" };
    }

    if (normalizedCategory) {
      query.category = { $regex: normalizedCategory, $options: "i" };
    }

    const [logs, total] = await Promise.all([
      AccountListing.find(query)
        .select("-provider -providerPrice")
        .sort({ createdAt: -1 })
        .skip((pageNumber - 1) * limitNumber)
        .limit(limitNumber)
        .lean(),
      AccountListing.countDocuments(query),
    ]);

    res.status(200).json({
      status: 200,
      success: true,
      message: "active logs fetched successfully",
      data: logs,
      pagination: {
        page: pageNumber,
        limit: limitNumber,
        total,
        totalPages: Math.max(Math.ceil(total / limitNumber), 1),
      },
    });
  } catch (error) {
    next(error);
  }
};

export const buyActiveLogs = async (req, res, next) => {
  const { logId, quantity } = req.body;
  const user = req.user;
  const session = await mongoose.startSession();
  const receiptNo = recieptNumberGenerator();
  let order = null;
  let walletTransaction = null;
  let receipt = null;
  let chargeInKobo;

  try {
    if (!user) {
      res.statusCode = 401;
      throw new Error("unauthorized access");
    }

    const isUser = await User.findById(user._id);

    if (!isUser) {
      res.statusCode = 401;
      throw new Error("unauthorized access");
    }

    const log = await AccountListing.findOne({
      _id: logId,
      status: "active",
      quantity: { $gt: 0 },
    });

    if (!log) {
      res.statusCode = 400;
      throw new Error("This Service Is Currently Not Available");
    }

    if (
      !Number.isInteger(quantity) ||
      quantity < 1 ||
      quantity > log.quantity
    ) {
      res.statusCode = 400;
      throw new Error("Invalid purchase quantity");
    }

    const amount = log.sellingPrice * quantity;
    chargeInKobo = Math.round(amount * 100);

    if (isUser.walletBalance < chargeInKobo) {
      res.statusCode = 400;
      throw new Error("Insufficent Funds");
    }

    await session.withTransaction(async () => {
      const balanceBefore = isUser.walletBalance;
      const deductedUser = await User.findOneAndUpdate(
        { _id: isUser._id, walletBalance: { $gte: chargeInKobo } },
        { $inc: { walletBalance: -chargeInKobo } },
        { new: true, session },
      );

      if (!deductedUser) {
        res.statusCode = 400;
        throw new Error("Insufficent Funds");
      }

      const reservedListing = await AccountListing.findOneAndUpdate(
        {
          _id: log._id,
          status: "active",
          quantity: { $gte: quantity },
        },
        {
          $inc: { quantity: -quantity },
        },
        { returnDocument: "after", session },
      );

      if (!reservedListing) {
        res.statusCode = 400;
        throw new Error("This Service Is Currently Not Available");
      }

      [order] = await AccountOrder.create(
        [
          {
            userId: isUser._id,
            accountListingId: log._id,
            provider: log.provider,
            providerAccountId: log.providerAccountId,
            receiptNo,
            quantity,
            providerPrice: log.providerPrice * quantity,
            sellingPrice: log.sellingPrice,
            amount,
            purchaseStatus: "pending",
            deliveryStatus: "pending",
          },
        ],
        { session },
      );

      [walletTransaction] = await WalletTransaction.create(
        [
          {
            userId: isUser._id,
            type: "PURCHASE",
            amount: chargeInKobo,
            currency: "NGN",
            provider: log.provider,
            status: "PENDING",
            referenceId: receiptNo,
            orderId: order._id.toString(),
            balanceBefore,
            balanceAfter: deductedUser.walletBalance,
          },
        ],
        { session },
      );

      [receipt] = await PurchaseReceipt.create(
        [
          {
            userId: isUser._id,
            purchaseType: "LOG",
            itemId: order._id,
            itemModel: "AccountOrder",
            amount,
            receiptNo,
            status: "PENDING",
            balanceBefore: balanceBefore / 100,
            balanceAfter: deductedUser.walletBalance / 100,
            description: "Active account purchase",
          },
        ],
        { session },
      );
    });

    let result;
    try {
      result = await purchaseJustVerifyBoostAccount(
        log.providerAccountId,
        quantity,
      );
    } catch (providerError) {
      const providerResponse = providerError.response?.data;
      if (!providerResponse || providerResponse.success !== false) {
        await AccountOrder.findByIdAndUpdate(order._id, {
          $set: { purchaseStatus: "processing", providerResponse: null },
        });

        return res.status(202).json({
          status: 202,
          success: true,
          message: "Purchase is processing and will be reconciled later",
          data: {
            orderId: order._id,
            receiptNo: receipt.receiptNo,
            amount,
            purchaseStatus: "processing",
          },
        });
      }

      result = providerResponse;
    }

    const providerOrder = result?.order;
    const providerPurchaseId =
      providerOrder?._id ||
      providerOrder?.externalOrderId ||
      result?.purchase?._id;
    const accountDetails =
      result?.accountDetails || providerOrder?.accountDetails || null;

    if (result?.success === true && providerPurchaseId) {
      let finalResult = null;
      const isCompleted = providerOrder?.status === "completed";

      await session.withTransaction(async () => {
        const updatedOrder = await AccountOrder.findByIdAndUpdate(
          order._id,
          {
            $set: {
              providerPurchaseId: providerPurchaseId.toString(),
              providerResponse: result,
              accountDetails,
              purchaseStatus: isCompleted ? "completed" : "processing",
              deliveryStatus: accountDetails ? "delivered" : "processing",
              ...(accountDetails ? { deliveredAt: new Date() } : {}),
              ...(isCompleted ? { completedAt: new Date() } : {}),
            },
          },
          { session, new: true, runValidators: true },
        );

        await WalletTransaction.findByIdAndUpdate(
          walletTransaction._id,
          { $set: { status: "SUCCESS" } },
          { session, runValidators: true },
        );

        await PurchaseReceipt.findByIdAndUpdate(
          receipt._id,
          { $set: { status: "SUCCESS" } },
          { session, runValidators: true },
        );

        finalResult = { order: updatedOrder };
      });

      return res.status(200).json({
        status: 200,
        success: true,
        message: "Purchase completed successfully",
        data: {
          orderId: finalResult.order._id,
          receiptNo: receipt.receiptNo,
          amount,
          purchaseStatus: finalResult.order.purchaseStatus,
          deliveryStatus: finalResult.order.deliveryStatus,
          accountDetails: finalResult.order.accountDetails,
        },
      });
    }

    // if (result?.success !== false) {
    //   await AccountOrder.findByIdAndUpdate(order._id, {
    //     $set: { purchaseStatus: "processing", providerResponse: result ?? null },
    //   });

    //   return res.status(202).json({
    //     status: 202,
    //     success: true,
    //     message: "Purchase is processing and will be reconciled later",
    //     data: {
    //       orderId: order._id,
    //       receiptNo: receipt.receiptNo,
    //       amount,
    //       purchaseStatus: "processing",
    //     },
    //   });
    // }

    // await session.withTransaction(async () => {
    //   const refundedTransaction = await WalletTransaction.findOneAndUpdate(
    //     { _id: walletTransaction._id, status: "PENDING" },
    //     { $set: { status: "REFUNDED" } },
    //     { new: true, session, runValidators: true },
    //   );

    //   if (!refundedTransaction) {
    //     return;
    //   }

    //   const refundedUser = await User.findOneAndUpdate(
    //     { _id: isUser._id },
    //     { $inc: { walletBalance: chargeInKobo } },
    //     { new: true, session },
    //   );

    //   if (!refundedUser) throw new Error("failed to refund user wallet");

    //   await WalletTransaction.create(
    //     [
    //       {
    //         userId: isUser._id,
    //         type: "REFUND",
    //         amount: chargeInKobo,
    //         currency: "NGN",
    //         provider: log.provider,
    //         status: "SUCCESS",
    //         referenceId: `${receiptNo}-refund`,
    //         orderId: order._id.toString(),
    //         balanceBefore: refundedUser.walletBalance - chargeInKobo,
    //         balanceAfter: refundedUser.walletBalance,
    //       },
    //     ],
    //     { session },
    //   );

    //   await AccountOrder.findByIdAndUpdate(
    //     order._id,
    //     {
    //       $set: {
    //         purchaseStatus: "failed",
    //         deliveryStatus: "failed",
    //         providerResponse: result,
    //       },
    //     },
    //     { session },
    //   );

    //   await AccountListing.findByIdAndUpdate(
    //     log._id,
    //     { $inc: { quantity } },
    //     { session },
    //   );

    //   await PurchaseReceipt.findByIdAndUpdate(
    //     receipt._id,
    //     { $set: { status: "FAILED" } },
    //     { session },
    //   );
    // });

    console.error(result.message);

    return res.status(400).json({
      status: 400,
      success: false,
      message: "purchase failed",
      data: {
        orderId: order._id,
        receiptNo: receipt.receiptNo,
        amount,
        purchaseStatus: "failed",
      },
    });
  } catch (error) {
    next(error);
  } finally {
    await session.endSession();
  }
};
