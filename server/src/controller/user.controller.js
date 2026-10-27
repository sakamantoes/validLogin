import User from "../model/User.js";
import mongoose from "mongoose";
import PurchaseReceipt from "../model/PurchaseReceipt.js";
import WalletTransaction from "../model/WalletTransactions.js";
import PricingSetting from "../model/PriceSetting.js";
import calculateSellingPrice from "../utils/calculateSellingPrice.js";
import AvailableService from "../model/ServicesAvailable.js";
import { env } from "../config/constant.js";
import OtpOrder from "../model/OtpOrder.js";
import recieptNumberGenerator from "../utils/recieptNo.generator.js";
import { cancelNumberServices } from "../services/number/cancelNumber.js";
import { buyNumberOption } from "../services/number/buyNumber.js";
import { requestUserOtp } from "../services/number/checkNumber.js";
import { isPast, differenceInSeconds } from "date-fns";

const getUserWalletBalance = async (req, res, next) => {
  const user = req.user;
  try {
    const userExist = await User.findById({ _id: user._id });

    if (!userExist) {
      res.statusCode = 401;
      throw new Error("User not found");
    }

    res.status(200).json({
      success: true,
      message: "Wallet balance fetched successfully",
      data: userExist.walletBalance,
    });
  } catch (error) {
    next(error);
  }
};

const getAllUserDeposit = async (req, res, next) => {
  const user = req.user;

  try {
    const userExist = await User.findById({ _id: user._id });

    if (!userExist) {
      res.statusCode = 401;
      throw new Error("User not found");
    }

    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = Math.min(50, Math.max(1, parseInt(req.query.limit, 10) || 8));
    const { status, paymentMethod, search, dateFilter } = req.query;

    const baseQuery = { userId: userExist._id, type: "DEPOSIT" };
    const filterQuery = { ...baseQuery };

    if (status && status !== "ALL") {
      filterQuery.status = status;
    }

    if (paymentMethod && paymentMethod !== "ALL") {
      filterQuery.paymentMethod = paymentMethod;
    }

    if (search && search.trim()) {
      const regex = new RegExp(
        search.trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&"),
        "i",
      );
      filterQuery.$or = [
        { depositorName: regex },
        { referenceId: regex },
        { orderId: regex },
      ];
    }

    if (dateFilter && dateFilter !== "ALL") {
      const now = new Date();
      let from;

      if (dateFilter === "TODAY") {
        from = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      } else if (dateFilter === "7D") {
        from = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      } else if (dateFilter === "30D") {
        from = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      }

      if (from) {
        filterQuery.createdAt = { $gte: from };
      }
    }

    const [total, walletTransaction, summaryAgg] = await Promise.all([
      WalletTransaction.countDocuments(filterQuery),
      WalletTransaction.find(filterQuery)
        .sort({ _id: -1 })
        .skip((page - 1) * limit)
        .limit(limit),
      WalletTransaction.aggregate([
        { $match: baseQuery },
        {
          $group: {
            _id: "$status",
            count: { $sum: 1 },
            amount: { $sum: "$amount" },
          },
        },
      ]),
    ]);

    const summary = {
      total: 0,
      successful: 0,
      pending: 0,
      failed: 0,
      confirmedValue: 0,
    };

    summaryAgg.forEach((row) => {
      summary.total += row.count;
      if (row._id === "SUCCESS") {
        summary.successful = row.count;
        summary.confirmedValue = row.amount || 0;
      } else if (row._id === "PENDING") {
        summary.pending = row.count;
      } else if (row._id === "FAILED") {
        summary.failed = row.count;
      }
    });

    res.status(200).json({
      success: true,
      status: 200,
      message: "request was successfull",
      data: walletTransaction,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.max(1, Math.ceil(total / limit)),
      },
      summary,
    });
  } catch (error) {
    next(error);
  }
};

const getPurchaseHistory = async (req, res, next) => {
  const user = req.user;

  try {
    const userExist = await User.findById({ _id: user._id });

    if (!userExist) {
      res.statusCode = 401;
      throw new Error("User not found");
    }

    const receiptTransaction = await PurchaseReceipt.find({
      userId: userExist._id,
    }).sort({ _id: -1 });

    if (!receiptTransaction || receiptTransaction.length === 0) {
      return res.status(200).json({
        success: true,
        status: 200,
        message: "request was successfull",
        data: [],
      });
    }

    res.status(200).json({
      success: true,
      status: 200,
      message: "request was successfull",
      data: receiptTransaction,
    });
  } catch (error) {
    next(error);
  }
};

const getUserOtpOrders = async (req, res, next) => {
  const user = req.user;
  const { status, search } = req.query;

  try {
    const userExist = await User.findById({ _id: user._id });

    if (!userExist) {
      res.statusCode = 401;
      throw new Error("User not found");
    }

    const query = { userId: userExist._id };

    if (status && status !== "ALL") {
      query.status = status;
    }

    if (search && search.trim()) {
      const regex = new RegExp(
        search.trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&"),
        "i",
      );
      query.$or = [
        { phoneNumber: regex },
        { service: regex },
        { country: regex },
        { activationId: regex },
      ];
    }

    const otpOrders = await OtpOrder.find(query).sort({ _id: -1 });

    res.status(200).json({
      success: true,
      status: 200,
      message: "request was successfull",
      data: otpOrders,
    });
  } catch (error) {
    next(error);
  }
};

const checkUserOtpOrderStatus = async (req, res, next) => {
  const user = req.user;
  const { orderId } = req.params;
  const now = new Date();

  try {
    if (!orderId) {
      res.statusCode = 400;
      throw new Error("invalid id params");
    }

    const otpOrder = await OtpOrder.findById(orderId);

    if (!otpOrder) {
      res.statusCode = 404;
      throw new Error("otp order not found");
    }

    if (otpOrder.userId.toString() !== user._id.toString()) {
      res.statusCode = 403;
      throw new Error("You are not authorized to access this resource");
    }

    if (
      ["OTP_RECEIVED", "COMPLETED", "CANCELLED", "FAILED"].includes(
        otpOrder.status,
      )
    ) {
      return res.status(200).json({
        success: true,
        status: 200,
        message: "request was successfull",
        otpCode: otpOrder.otpCode,
        otpMessage: otpOrder.otpMessage,
        data: otpOrder,
      });
    }

    if (otpOrder.expiresAt) {
      const expiresAt = new Date(otpOrder.expiresAt);

      if (isPast(expiresAt)) {
        res.statusCode = 400;
        throw new Error(
          "otp session expired, click the cancel button to get a refund",
        );
      }

      const secondsLeft = differenceInSeconds(expiresAt, now);

      if (secondsLeft <= 30) {
        res.statusCode = 400;
        throw new Error(
          "otp session expiring soon, click the cancel button to get a refund",
        );
      }
    }

    const response = await requestUserOtp(otpOrder);
    const otpCode = response.otpCode || otpOrder.otpCode;
    const otpMessage = response.otpMessage || otpOrder.otpMessage;
    const status = response.status || otpOrder.status;

    const hasChanges =
      otpOrder.otpCode !== otpCode ||
      otpOrder.otpMessage !== otpMessage ||
      otpOrder.status !== status ||
      (status === "OTP_RECEIVED" && !otpOrder.completedAt);

    if (hasChanges) {
      otpOrder.otpCode = otpCode;
      otpOrder.otpMessage = otpMessage;
      otpOrder.status = status;

      if (status === "OTP_RECEIVED" && !otpOrder.completedAt) {
        otpOrder.completedAt = new Date();
      }

      await otpOrder.save();
    }

    res.status(200).json({
      success: true,
      status: 200,
      message: "request was successfull",
      otpCode,
      otpMessage,
      data: otpOrder,
    });
  } catch (error) {
    next(error);
  }
};

const getServicesAvailableName = async (req, res, next) => {
  try {
    // A country/service only counts here if the admin has both activated
    // AND made it visible — same two-flag rule as getPlatformServices.
    const servicesName = await AvailableService.aggregate([
      {
        $group: {
          _id: "$internalCountry",
          totalServices: {
            $addToSet: {
              $cond: [
                { $and: ["$active", "$isVisible"] },
                "$internalService",
                false,
              ],
            },
          },
          totalStock: {
            $sum: {
              $cond: [{ $and: ["$active", "$isVisible"] }, "$stock", 0],
            },
          },
          activeCount: {
            $sum: {
              $cond: ["$active", 1, 0],
            },
          },
          totalListings: { $sum: 1 },
        },
      },
      {
        $project: {
          _id: 0,
          internalCountry: "$_id",
          totalServices: {
            $size: {
              $filter: {
                input: "$totalServices",
                as: "service",
                cond: { $ne: ["$$service", false] },
              },
            },
          },
          totalStock: 1,
          activeCount: 1,
          totalListings: 1,
          active: {
            $eq: ["$activeCount", "$totalListings"],
          },
        },
      },
      {
        $sort: {
          internalCountry: 1,
        },
      },
    ]);

    res.status(200).json({
      status: 200,
      success: true,
      message: "successfull",
      data: servicesName,
    });
  } catch (error) {
    next(error);
  }
};

const getPlatformServices = async (req, res, next) => {
  const {
    page = 1,
    limit = 12,
    service = "",
    search = "",
    country = "",
    sort = "price_asc",
  } = req.query;

  try {
    const pageNumber = Math.max(Number(page) || 1, 1);
    const limitNumber = Math.min(Math.max(Number(limit) || 12, 1), 100);
    const priceSetting = await PricingSetting.findOne({});

    if (!priceSetting) {
      res.statusCode = 400;

      throw new Error("error fetching price");
    }

    // Users only ever see listings the admin has both activated AND made
    // visible — two independent toggles admin controls separately.
    const query = {
      active: true,
      isVisible: true,
    };
    const normalizedService = String(service).trim();
    const normalizedSearch = String(search).trim();
    const normalizedCountry = String(country).trim();

    if (normalizedService) {
      query.internalService = normalizedService;
    }

    if (normalizedCountry) {
      query.internalCountry = normalizedCountry;
    }

    if (normalizedSearch) {
      const searchRegex = new RegExp(normalizedSearch, "i");
      query.$or = [
        { internalCountry: searchRegex },
        { internalService: searchRegex },
        { provider: searchRegex },
      ];
    }

    // Selling price is a monotonic function of providerPrice (a uniform
    // markup applied after the query), so sorting on providerPrice here
    // produces the same low-to-high/high-to-low order the user sees.
    const priceDirection = sort === "price_desc" ? -1 : 1;

    const [availableServices, total, services] = await Promise.all([
      AvailableService.find(query)
        .sort({ providerPrice: priceDirection })
        .skip((pageNumber - 1) * limitNumber)
        .limit(limitNumber)
        .lean(),
      AvailableService.countDocuments(query),
      AvailableService.aggregate([
        {
          $match: normalizedCountry
            ? {
                active: true,
                isVisible: true,
                internalCountry: normalizedCountry,
              }
            : { active: true, isVisible: true },
        },
        {
          $group: {
            _id: "$internalService",
            totalCountries: { $addToSet: "$internalCountry" },
            totalStock: { $sum: "$stock" },
            // Exclusivity is enforced on isVisible (only one listing per
            // service+country can be visible at a time), so when a country
            // is selected there's exactly one match per group here.
            providerPrice: { $first: "$providerPrice" },
            customPrice: { $first: "$customPrice" },
            liveRoutes: {
              $sum: {
                $cond: [
                  { $and: ["$availability", { $gt: ["$stock", 0] }] },
                  1,
                  0,
                ],
              },
            },
          },
        },
        {
          $project: {
            _id: 0,
            internalService: "$_id",
            totalCountries: { $size: "$totalCountries" },
            totalStock: 1,
            providerPrice: 1,
            customPrice: 1,
            liveRoutes: 1,
          },
        },
        { $sort: { internalService: 1 } },
      ]),
    ]);

    const finalProduct = availableServices.map((item) => {
      return {
        ...item,
        sellingPrice: calculateSellingPrice(item, priceSetting),
      };
    });

    // Only meaningful once a country is selected — that's when each group
    // above resolves to the single isVisible listing for that service.
    const finalServices = normalizedCountry
      ? services.map((item) => ({
          ...item,
          sellingPrice:
            item.providerPrice != null
              ? calculateSellingPrice(item, priceSetting)
              : null,
        }))
      : services;

    res.status(200).json({
      status: 200,
      success: true,
      message: "list of all available pricing",
      data: finalProduct,
      services: finalServices,
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

const buyNumberService = async (req, res, next) => {
  const user = req.user;
  const { service, country } = req.body;
  const session = await mongoose.startSession();
  const receiptNo = recieptNumberGenerator();
  let finalResult = null;
  let boughtService = null;
  let transactionSucceeded = false;

  try {
    const isUser = await User.findById(user._id);

    if (!isUser) {
      res.statusCode = 400;
      throw new Error("unAuthorise access");
    }

    // The user only ever picks a service+country — which exact listing
    // fulfills it is resolved here from whichever one admin has marked
    // isVisible for that pair (exclusivity is enforced when it's set).
    const selectedService = await AvailableService.findOne({
      internalService: service,
      internalCountry: country,
      isVisible: true,
      active: true,
    });

    if (!selectedService) {
      res.statusCode = 400;
      throw new Error("selected service unavailable");
    }

    const maxAllowedProviderPrice = Math.min(
      Number(selectedService.providerPrice) * 1.5,
      Number(selectedService.providerPrice) + 1,
    );

    const activeServices = await AvailableService.find({
      internalService: service,
      internalCountry: country,
      providerPrice: {
        $lte: maxAllowedProviderPrice,
      },
    }).sort({
      providerPrice: 1,
    });

    if (!activeServices.length) {
      res.statusCode = 400;
      throw new Error("service not available at the moment");
    }

    const priceSetting = await PricingSetting.findOne({});

    if (!priceSetting) {
      res.statusCode = 400;

      throw new Error("error fetching price");
    }

    let purchasedNumber = null;
    const minimumPrice = calculateSellingPrice(selectedService, priceSetting);

    if (isUser.walletBalance < minimumPrice) {
      res.statusCode = 400;
      throw new Error("insufficient funds");
    }

    for (const activeService of activeServices) {
      try {
        const buyBowerNumber = await buyNumberOption(activeService);

        const response = buyBowerNumber;

        if (!response?.activationId || !response?.phoneNumber) {
          console.log("purchase number failure: ", response);
          continue;
        }

        purchasedNumber = {
          response,
          activeService,
        };
        break;
      } catch (error) {
        console.error({
          providerId: activeService.providerId,
          providerPrice: activeService.providerPrice,
          error: error.message,
        });
      }
    }

    if (!purchasedNumber) {
      console.error("error purchasing number: ", purchasedNumber);
      res.statusCode = 400;
      throw new Error(
        "We could not secure a number for this service right now. Try refreshing the list or choosing another available option.",
      );
    }

    const response = purchasedNumber.response;
    const price = calculateSellingPrice(selectedService, priceSetting);
    const providerPrice = Number(response.activationCost);
    const costPrice = providerPrice * Number(priceSetting.usdToNgnRate);

    const activationTime = new Date(response.activationTime);
    boughtService = response;

    const expiresAt = new Date(activationTime.getTime() + 6 * 60 * 1000);
    await session.withTransaction(async () => {
      const updatedUser = await User.findOneAndUpdate(
        { _id: isUser._id, walletBalance: { $gte: price } },
        {
          $inc: {
            walletBalance: -price,
          },
        },
        { session },
      );

      if (!updatedUser) {
        res.statusCode = 400;
        throw new Error("insufficient balance");
      }

      const [otpOrder] = await OtpOrder.create(
        [
          {
            service,
            country,
            status: "WAITING_FOR_SMS",
            phoneNumber: response.phoneNumber,
            activationId: response.activationId,
            sellingPrice: price,
            userId: isUser._id,
            providerId: purchasedNumber.activeService.providerId,
            providerPrice,
            costPrice,
            canGetAnotherSms: response.canGetAnotherSms,
            activationOperator: response.activationOperator,
            provider: response.provider,
            expiresAt,
          },
        ],
        {
          session,
        },
      );

      if (!otpOrder) {
        res.statusCode = 400;
        throw new Error("something went wrong saving order");
      }

      const userBalance = isUser.walletBalance;
      const userAfteBalance = isUser.walletBalance - price;

      const [receipt] = await PurchaseReceipt.create(
        [
          {
            userId: isUser._id,
            amount: price,
            itemModel: "OtpOrder",
            itemId: otpOrder._id,
            receiptNo,
            purchaseType: "OTP",
            description: "number purchase",
            balanceAfter: Number(userAfteBalance),
            balanceBefore: Number(userBalance),
          },
        ],
        {
          session,
        },
      );

      if (!receipt) {
        res.statusCode = 400;
        throw new Error("an error occured, so purchase will be reversed");
      }

      finalResult = { receipt, otpOrder };
      transactionSucceeded = true;
    });

    res.status(200).json({
      status: 200,
      sucess: true,
      message: "you purchase was successsfull",
      data: finalResult,
    });
  } catch (error) {
    if (boughtService && !transactionSucceeded) {
      try {
        await cancelNumberServices(boughtService);
      } catch (cancelError) {
        console.error(
          "failed to cancel purchased number:",
          cancelError.message,
        );
      }
    }
    next(error);
  } finally {
    await session.endSession();
  }
};

const cancelOtpAndRefund = async (req, res, next) => {
  const user = req.user;
  const { orderId } = req.params;
  const session = await mongoose.startSession();
  const receiptNo = recieptNumberGenerator();
  let finalResult = null;

  try {
    if (!orderId) {
      res.statusCode = 400;
      throw new Error("invalid id parameters");
    }

    const userOrderExist = await OtpOrder.findOne({
      userId: user._id,
      activationId: orderId,
    });

    if (!userOrderExist) {
      res.statusCode = 404;
      throw new Error("otp order not found");
    }

    // already completed
    if (["OTP_RECEIVED", "COMPLETED"].includes(userOrderExist.status)) {
      res.statusCode = 400;
      throw new Error("otp already received");
    }

    // already cancelled
    if (["CANCELLED", "FAILED"].includes(userOrderExist.status)) {
      res.statusCode = 400;
      throw new Error("otp already cancelled");
    }

    // cancel from provider
    const smsCancel = await cancelNumberServices(userOrderExist);
    const response = smsCancel;
    const providerCancelSucceeded =
      response === "ACCESS_CANCEL" || response?.success === 1;

    // if provider fails to cancel
    if (!providerCancelSucceeded) {
      res.statusCode = 400;
      throw new Error("provider failed to cancel otp");
    }

    await session.withTransaction(async () => {
      // cancel order
      const updatedOrder = await OtpOrder.findByIdAndUpdate(
        userOrderExist._id,
        {
          $set: {
            status: "CANCELLED",
            cancelReason: "Cancelled by user",
          },
        },
        {
          session,
          new: true,
        },
      );

      if (!updatedOrder) {
        throw new Error("failed to update otp order");
      }

      // refund wallet
      const userSaved = await User.findByIdAndUpdate(
        user._id,
        {
          $inc: {
            walletBalance: Number(userOrderExist.sellingPrice),
          },
        },
        {
          session,
          new: true,
        },
      );

      // invalid user
      if (!userSaved) {
        throw new Error("user not found");
      }

      const balanceAfter = userSaved.walletBalance;

      const balanceBefore = balanceAfter - userOrderExist.sellingPrice;

      // generate receipt for record purpose
      const [receipt] = await PurchaseReceipt.create(
        [
          {
            userId: user._id,
            amount: userOrderExist.sellingPrice,
            itemModel: "OtpOrder",
            itemId: userOrderExist._id,
            receiptNo,
            purchaseType: "OTP_REFUND",
            description: "OTP order cancelled and refunded",
            balanceAfter: Number(balanceAfter),
            balanceBefore: Number(balanceBefore),
          },
        ],
        {
          session,
        },
      );

      if (!receipt) {
        throw new Error("failed to create refund receipt");
      }

      finalResult = {
        receipt,
        order: updatedOrder,
      };
    });

    res.status(200).json({
      status: 200,
      success: true,
      message: "otp cancelled and refunded successfully",
      data: finalResult,
    });
  } catch (error) {
    next(error);
  } finally {
    await session.endSession();
  }
};

export {
  getUserWalletBalance,
  getAllUserDeposit,
  getPurchaseHistory,
  getUserOtpOrders,
  checkUserOtpOrderStatus,
  getPlatformServices,
  getServicesAvailableName,
  buyNumberService,
  cancelOtpAndRefund,
};
