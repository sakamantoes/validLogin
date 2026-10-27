// controllers/otpController.js

import smsBowerApi from "../utils/smsBowerApi.js";
import { env } from "../config/constant.js";
import PriceSetting from "../model/PriceSetting.js";
import OtpOrder from "../model/OtpOrder.js";
import WalletTransaction from "../model/WalletTransactions.js";
import PurchaseReceipt from "../model/PurchaseReceipt.js";
import User from "../model/User.js";

export const getCompanyStats = async (req, res, next) => {
  try {
    const totalOtpOrders = await OtpOrder.countDocuments();
    const totalOrders = totalOtpOrders;
    const completedOtpOrders = await OtpOrder.countDocuments({
      status: { $in: ["OTP_RECEIVED", "COMPLETED"] },
    });

    const completedOrders = completedOtpOrders;

    const cancelledOtpOrders = await OtpOrder.countDocuments({
      status: "CANCELLED",
    });

    const cancelledOrders = cancelledOtpOrders;

    const pendingOrders = await OtpOrder.countDocuments({
      status: { $in: ["PENDING", "WAITING_FOR_SMS"] },
    });

    const [recievedOtp, deposit, priceSetting, refundSummary, walletLiability] =
      await Promise.all([
        OtpOrder.find({
          status: { $in: ["OTP_RECEIVED", "COMPLETED"] },
        }),
        WalletTransaction.find({ type: "DEPOSIT" }),
        PriceSetting.findOne({}),
        PurchaseReceipt.aggregate([
          {
            $match: {
              purchaseType: "OTP_REFUND",
              status: "SUCCESS",
            },
          },
          { $group: { _id: null, total: { $sum: "$amount" } } },
        ]),
        User.aggregate([
          { $match: { role: "user" } },
          { $group: { _id: null, total: { $sum: "$walletBalance" } } },
        ]),
      ]);

    const depositTotals = deposit.reduce(
      (totals, transaction) => {
        const amount = Number(transaction.amount) || 0;
        totals[transaction.status.toLowerCase()] += amount;
        return totals;
      },
      { success: 0, pending: 0, failed: 0 },
    );
    const totalDeposit = depositTotals.success;
    const totalRefunds = refundSummary[0]?.total || 0;
    const customerWalletLiability = walletLiability[0]?.total || 0;
    const terminalOrders = completedOrders + cancelledOrders;
    const failedOrders = await OtpOrder.countDocuments({ status: "FAILED" });
    const successRate =
      terminalOrders + failedOrders > 0
        ? (completedOrders / (terminalOrders + failedOrders)) * 100
        : 0;

    const totalRevenue = recievedOtp.reduce(
      (total, order) => total + Number(order.sellingPrice),
      0,
    );

    const totalRevenueAfterRefunds = totalRevenue - totalRefunds;

    const providerPrice = recievedOtp.reduce((acc, curr) => {
      return acc + Number(curr.providerPrice);
    }, 0);

    const costPrice = recievedOtp.reduce((acc, curr) => {
      return (
        acc +
        Number(
          curr.costPrice || curr.providerPrice * priceSetting?.usdToNgnRate,
        )
      );
    }, 0);

    return res.json({
      success: true,
      data: {
        wallet: {
          totalProfit: Number(totalRevenueAfterRefunds - costPrice),
          totalRevenue: Number(totalRevenueAfterRefunds),
          totalDeposit,
          totalProviderCost: providerPrice,
          totalRefunds: Number(totalRefunds),
          customerWalletLiability: Number(customerWalletLiability),
        },
        stats: {
          totalOrders,
          completedOrders,
          cancelledOrders,
          pendingOrders,
          failedOrders,
          successRate: Number(successRate.toFixed(2)),
          deposits: {
            successful: Number(depositTotals.success),
            pending: Number(depositTotals.pending),
            failed: Number(depositTotals.failed),
          },
        },
      },
    });
  } catch (error) {
    console.error("GET COMPANY STATS ERROR:", error);
    next(error);
  }
};

// GET SMSBOWER BALANCE
export const getSmsBowerBalance = async (req, res) => {
  const API_KEY = env.sms_bower_api_key;
  try {
    const response = await smsBowerApi.get("/stubs/handler_api.php", {
      params: { api_key: API_KEY, action: "getBalance" },
    });
    return res.json({ success: true, balance: response.data });
  } catch (error) {
    console.error("Get SMSBower balance error:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};
