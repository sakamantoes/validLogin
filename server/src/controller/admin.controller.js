import WalletTransaction from "../model/WalletTransactions.js";
import mongoose from "mongoose";
import User from "../model/User.js";
import PriceSetting from "../model/PriceSetting.js";
import otporder from "../model/OtpOrder.js";
import AvailableService from "../model/ServicesAvailable.js";
import calculateSellingPrice from "../utils/calculateSellingPrice.js";
import PricingSetting from "../model/PriceSetting.js";
import smspool_api from "../utils/smspool.js";
import CompanyWallet from "../model/CompanyWallet.js";
import { generateToken } from "../utils/jwttoken.js";
import { setAuthCookie } from "../utils/setCookie.js";
import { comparePassword } from "../utils/bycrpt.js";

const adminLogin = async (req, res, next) => {
  const { password } = req.body;
  try {
    if (!password || typeof password !== "string") {
      res.statusCode = 400;
      throw new Error("Password is required");
    }

    const admins = await User.find({ role: "admin" }).select("+password");

    let admin = null;
    for (const a of admins) {
      if (await comparePassword(password, a.password)) {
        admin = a;
        break;
      }
    }

    if (!admin) {
      res.statusCode = 401;
      throw new Error("Invalid Credentials! Are You A Thief?");
    }

    const jwtToken = generateToken({
      userId: admin._id,
      email: admin.email,
      role: admin.role,
    });

    setAuthCookie(res, jwtToken);

    res.status(200).json({
      status: 200,
      success: true,
      message: "Login successful",
      data: {
        id: admin._id,
        email: admin.email,
        username: admin.username,
        role: admin.role,
      },
    });
  } catch (error) {
    next(error);
  }
};

const getPlatformDeposits = async (req, res, next) => {
  try {
    const deposits = await WalletTransaction.find({});

    if (!deposits) {
      return res.status(200).json({
        status: 200,
        success: true,
        message: "your deposits was successfull",
        data: [],
      });
    }

    res.status(200).json({
      status: 200,
      success: true,
      message: "your deposits was successfull",
      data: deposits,
    });
  } catch (error) {
    next(error);
  }
};

const updateDepositsStatus = async (req, res, next) => {
  const { id } = req.params;
  const { status } = req.body;
  const session = await mongoose.startSession();

  let finalResult = null;

  try {
    if (!mongoose.Types.ObjectId.isValid(id) || id === undefined) {
      res.statusCode = 400;
      throw new Error("Invalid transaction ID");
    }

    if (!status) {
      res.statusCode = 400;
      throw new Error("missing status");
    }

    const statusValue = status.toUpperCase();

    await session.withTransaction(async () => {
      const transaction = await WalletTransaction.findOneAndUpdate(
        {
          _id: id,
          status: { $in: ["PENDING", "FAILED"] },
        },
        {
          $set: {
            status: statusValue,
          },
        },
        {
          new: true,
          session,
        },
      );

      if (!transaction) {
        res.statusCode = 400;

        throw new Error("you can only update pending or failed transaction");
      }

      if (statusValue !== "SUCCESS") {
        finalResult = transaction;
        return;
      }

      const user = await User.findOneAndUpdate(
        {
          _id: transaction.userId,
        },
        {
          $inc: {
            walletBalance: transaction.amount,
          },
        },
        {
          session,
          new: true,
        },
      );

      transaction.balanceBefore = user.walletBalance - transaction.amount;

      transaction.balanceAfter = user.walletBalance;

      await transaction.save({ session });

      finalResult = { receipt: transaction, user };
    });

    res.status(200).json({
      status: 200,
      success: true,
      message: "your request is successful",
      data: finalResult,
    });
  } catch (error) {
    next(error);
  } finally {
    await session.endSession();
  }
};

const priceSettingController = async (req, res, next) => {
  const { nariaRate, markupType, markupValue } = req.body;
  try {
    const priceSetting = await PriceSetting.findOneAndUpdate(
      {},
      {
        usdToNgnRate: nariaRate,
        globalMarkupType: markupType,
        globalMarkupValue: markupValue,
      },
      {
        new: true,
        upsert: true,
      },
    );

    res.status(200).json({
      status: 200,
      success: true,
      message: "you have successfully updated product price",
      data: priceSetting,
    });
  } catch (error) {
    next(error);
  }
};

const getUserWaitingForOtp = async (req, res, next) => {
  const { page = 1, limit = 5 } = req.query;
  try {
    const pageNumber = Math.max(Number(page) || 1, 1);
    const limitNumber = Math.min(Math.max(Number(limit) || 5, 1), 20);

    const otpOrders = await otporder
      .find({
        status: "WAITING_FOR_SMS",
      })
      .populate("userId", "username email")
      .sort({ createdAt: -1 })
      .limit(limitNumber)
      .skip((pageNumber - 1) * limitNumber)
      .lean();

    const total = await otporder.countDocuments({ status: "WAITING_FOR_SMS" });

    res.status(200).json({
      status: 200,
      success: true,
      message: "success",
      data: { otpOrders, total },
    });
  } catch (error) {
    next(error);
  }
};

const getAllOtpOrders = async (req, res, next) => {
  const { page = 1, limit = 25, status = "", search = "" } = req.query;

  try {
    const pageNumber = Math.max(Number(page) || 1, 1);
    const limitNumber = Math.min(Math.max(Number(limit) || 25, 1), 100);

    const query = {};
    const normalizedStatus = String(status).trim();
    const normalizedSearch = String(search).trim();

    if (normalizedStatus && normalizedStatus !== "ALL") {
      query.status = normalizedStatus;
    }

    if (normalizedSearch) {
      const regex = new RegExp(
        normalizedSearch.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"),
        "i",
      );
      query.$or = [
        { phoneNumber: regex },
        { service: regex },
        { country: regex },
        { provider: regex },
      ];
    }

    // Debugging view for admin — every order, any user, but never the raw
    // activationId or otpMessage (provider-facing internals), just the
    // fields useful for support/debugging plus the owning user's identity.
    const [otpOrders, total] = await Promise.all([
      otporder
        .find(query)
        .select("-activationId -otpMessage")
        .populate("userId", "username email")
        .sort({ _id: -1 })
        .skip((pageNumber - 1) * limitNumber)
        .limit(limitNumber)
        .lean(),
      otporder.countDocuments(query),
    ]);

    res.status(200).json({
      status: 200,
      success: true,
      message: "success",
      data: otpOrders,
      pagination: {
        page: pageNumber,
        limit: limitNumber,
        total,
        totalPages: Math.max(1, Math.ceil(total / limitNumber)),
      },
    });
  } catch (error) {
    next(error);
  }
};

const getAdminServices = async (req, res, next) => {
  const {
    page = 1,
    limit = 25,
    service = "",
    search = "",
    country = "",
  } = req.query;

  try {
    const pageNumber = Math.max(Number(page) || 1, 1);
    const limitNumber = Math.min(Math.max(Number(limit) || 25, 1), 100);
    const priceSetting = await PricingSetting.findOne({});

    if (!priceSetting) {
      res.statusCode = 400;

      throw new Error("error fetching price");
    }

    // No `active: true` here — admin manages the catalog, so listings the
    // admin has deactivated must still be visible (and filterable).
    const query = {};
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

    const [availableServices, total, services] = await Promise.all([
      AvailableService.find(query)
        .sort({ internalService: 1, internalCountry: 1, providerPrice: 1 })
        .skip((pageNumber - 1) * limitNumber)
        .limit(limitNumber)
        .lean(),
      AvailableService.countDocuments(query),
      // Service dropdown summary — scoped to the selected country (if any),
      // but never to `active`, mirroring getAdminServices' own query.
      AvailableService.aggregate([
        {
          $match: normalizedCountry
            ? { internalCountry: normalizedCountry }
            : {},
        },
        {
          $group: {
            _id: "$internalService",
            totalCountries: { $addToSet: "$internalCountry" },
            totalStock: { $sum: "$stock" },
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
            liveRoutes: 1,
          },
        },
        { $sort: { internalService: 1 } },
      ]),
    ]);

    const finalServices = availableServices.map((item) => {
      return {
        ...item,
        costPrice: Number(item.providerPrice * priceSetting.usdToNgnRate),
        sellingPrice: calculateSellingPrice(item, priceSetting),
      };
    });

    res.status(200).json({
      status: 200,
      success: true,
      message: "services has been fetched",
      data: finalServices,
      services,
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

// One row per (service, country) pair instead of one row per provider
// listing — the flat listing table forced the admin to scroll through every
// provider price for the same service+country to find the isVisible one.
// Each group carries just the currently-visible listing's price (or null),
// the modal drill-down (getAdminServices filtered to that exact pair) is
// what shows every provider so the admin can pick which one to make visible.
const getAdminServiceGroups = async (req, res, next) => {
  const { page = 1, limit = 25, service = "", search = "" } = req.query;

  try {
    const pageNumber = Math.max(Number(page) || 1, 1);
    const limitNumber = Math.min(Math.max(Number(limit) || 25, 1), 100);
    const priceSetting = await PricingSetting.findOne({});

    if (!priceSetting) {
      res.statusCode = 400;

      throw new Error("error fetching price");
    }

    const match = {};
    const normalizedService = String(service).trim();
    const normalizedSearch = String(search).trim();

    if (normalizedService) {
      match.internalService = normalizedService;
    }

    if (normalizedSearch) {
      const searchRegex = new RegExp(normalizedSearch, "i");
      match.$or = [
        { internalCountry: searchRegex },
        { internalService: searchRegex },
      ];
    }

    const basePipeline = [
      { $match: match },
      {
        $group: {
          _id: { service: "$internalService", country: "$internalCountry" },
          providerCount: { $sum: 1 },
          liveProviderCount: {
            $sum: {
              $cond: [
                { $and: ["$availability", { $gt: ["$stock", 0] }] },
                1,
                0,
              ],
            },
          },
          lowestProviderPrice: { $min: "$providerPrice" },
          // Exclusivity guarantees at most one isVisible listing per
          // group, so the conditional-push + $first pair below resolves
          // to either that single listing or nothing.
          visible: {
            $push: {
              $cond: [
                "$isVisible",
                {
                  id: "$_id",
                  provider: "$provider",
                  providerPrice: "$providerPrice",
                  customPrice: "$customPrice",
                },
                "$$REMOVE",
              ],
            },
          },
        },
      },
      {
        $project: {
          _id: 0,
          internalService: "$_id.service",
          internalCountry: "$_id.country",
          providerCount: 1,
          liveProviderCount: 1,
          lowestProviderPrice: 1,
          visible: { $first: "$visible" },
        },
      },
      { $sort: { internalService: 1, internalCountry: 1 } },
    ];

    const [rows, totalResult] = await Promise.all([
      AvailableService.aggregate([
        ...basePipeline,
        { $skip: (pageNumber - 1) * limitNumber },
        { $limit: limitNumber },
      ]),
      AvailableService.aggregate([...basePipeline, { $count: "total" }]),
    ]);

    const total = totalResult[0]?.total || 0;

    const data = rows.map((row) => ({
      internalService: row.internalService,
      internalCountry: row.internalCountry,
      providerCount: row.providerCount,
      liveProviderCount: row.liveProviderCount,
      lowestProviderPrice: row.lowestProviderPrice,
      visibleListing: row.visible
        ? {
            id: row.visible.id,
            provider: row.visible.provider,
            providerPrice: row.visible.providerPrice,
            sellingPrice: calculateSellingPrice(row.visible, priceSetting),
          }
        : null,
    }));

    res.status(200).json({
      status: 200,
      success: true,
      message: "grouped services fetched",
      data,
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

const getServicesAvailableName = async (req, res, next) => {
  try {
    // Grouped by service (admin manages the catalog per-service), and
    // unlike the user-facing version, nothing here is filtered by
    // `active` — admin sees every country and every service regardless
    // of activation status.
    const servicesName = await AvailableService.aggregate([
      {
        $group: {
          _id: "$internalService",
          totalCountries: { $addToSet: "$internalCountry" },
          totalStock: { $sum: "$stock" },
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
          internalService: "$_id",
          totalCountries: { $size: "$totalCountries" },
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
          internalService: 1,
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

const updateServiceActiveStatus = async (req, res, next) => {
  const { service } = req.params;
  const { active } = req.body;

  try {
    if (!service) {
      res.statusCode = 400;
      throw new Error("service is required");
    }

    if (typeof active !== "boolean") {
      res.statusCode = 400;
      throw new Error("active should be true or false");
    }

    const result = await AvailableService.updateMany(
      {
        internalService: service,
      },
      {
        $set: {
          active,
        },
      },
    );

    if (result.matchedCount === 0) {
      res.statusCode = 404;
      throw new Error("service not found");
    }

    res.status(200).json({
      status: 200,
      success: true,
      message: "service status updated successfully",
      data: {
        service,
        active,
        modifiedCount: result.modifiedCount,
      },
    });
  } catch (error) {
    next(error);
  }
};

const updateServiceCustomPrice = async (req, res, next) => {
  const { id } = req.params;
  const { customPrice } = req.body;

  try {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      res.statusCode = 400;
      throw new Error("Invalid service ID");
    }

    const priceValue =
      customPrice === null || customPrice === "" ? null : Number(customPrice);

    if (priceValue !== null && (Number.isNaN(priceValue) || priceValue < 0)) {
      res.statusCode = 400;
      throw new Error("customPrice should be a valid amount");
    }

    const service = await AvailableService.findByIdAndUpdate(
      id,
      {
        $set: {
          customPrice: priceValue,
        },
      },
      {
        new: true,
      },
    );

    if (!service) {
      res.statusCode = 404;
      throw new Error("service not found");
    }

    res.status(200).json({
      status: 200,
      success: true,
      message: "custom price updated successfully",
      data: service,
    });
  } catch (error) {
    next(error);
  }
};

const updateServiceVisibility = async (req, res, next) => {
  const { id } = req.params;
  const { isVisible } = req.body;

  try {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      res.statusCode = 400;
      throw new Error("Invalid service ID");
    }

    if (typeof isVisible !== "boolean") {
      res.statusCode = 400;
      throw new Error("isVisible should be true or false");
    }

    const target = await AvailableService.findById(id);

    if (!target) {
      res.statusCode = 404;
      throw new Error("service not found");
    }

    // Only one listing can be visible per service+country at a time — the
    // buy flow resolves a purchase from whichever single listing is
    // isVisible, so making a new one visible must retire the old one.
    if (isVisible) {
      await AvailableService.updateMany(
        {
          internalService: target.internalService,
          internalCountry: target.internalCountry,
          _id: { $ne: target._id },
        },
        { $set: { isVisible: false } },
      );
    }

    target.isVisible = isVisible;
    await target.save();

    res.status(200).json({
      status: 200,
      success: true,
      message: "service visibility updated successfully",
      data: target,
    });
  } catch (error) {
    next(error);
  }
};

const getSmsPoolBalance = async (req, res, next) => {
  try {
    const response = await smspool_api.get("/request/balance");

    const balance = response.data;

    if (!balance || balance.success === 0) {
      res.statusCode = 400;
      throw new Error(balance?.message || "error fetching SMSPool balance");
    }

    const balanceValue =
      typeof balance === "object" ? balance.balance : balance;

    res.status(200).json({
      status: 200,
      success: true,
      message: "fetched SMSPool balance successfully",
      data: {
        balance: Number(balanceValue || 0),
        currency: balance.currency || "USD",
        raw: balance,
      },
    });
  } catch (error) {
    next(error);
  }
};

const setManualAccountDetails = async (req, res, next) => {
  const { bank_name, account_name, account_number } = req.body;
  try {
    const account = await CompanyWallet.findOneAndUpdate(
      {},
      {
        bank_name,
        account_name,
        account_number,
      },
      {
        new: true,
        upsert: true,
      },
    );

    res.status(200).json({
      success: true,
      status: 200,
      message: "account number fetched",
      data: account,
    });
  } catch (error) {
    next(error);
  }
};

const getManualAccountDetails = async (req, res, next) => {
  try {
    const account = await CompanyWallet.findOne({});

    res.status(200).json({
      status: 200,
      success: true,
      message: "data fetchd successfully",
      data: account,
    });
  } catch (error) {
    next(error);
  }
};


export {
  adminLogin,
  getManualAccountDetails,
  setManualAccountDetails,
  getPlatformDeposits,
  updateDepositsStatus,
  priceSettingController,
  getUserWaitingForOtp,
  getAllOtpOrders,
  getAdminServices,
  getAdminServiceGroups,
  getServicesAvailableName,
  updateServiceActiveStatus,
  updateServiceCustomPrice,
  updateServiceVisibility,
  getSmsPoolBalance,
};
