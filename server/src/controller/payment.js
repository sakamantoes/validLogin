import axios from "axios";
import { env } from "../config/constant.js";
import WalletTransaction from "../model/WalletTransactions.js";
import User from "../model/User.js";
import crypto from "crypto";
import mongoose from "mongoose";
import {
  sendDepositSuccessNotification,
  sendDepositFailedNotification,
  sendPaymentReceivedNotification,
} from "./notificationController.js";

/* =========================================================
 * HELPERS
 * ======================================================= */

const normalizeSquadStatus = (status) => {
  const normalizedStatus = String(status || "").toLowerCase();

  if (normalizedStatus === "success" || normalizedStatus === "successful") {
    return "SUCCESS";
  }

  if (normalizedStatus === "failed" || normalizedStatus === "failure") {
    return "FAILED";
  }

  return "PENDING";
};

const normalizeCtexStatus = (status) => {
  const s = String(status || "").toUpperCase();
  if (s === "SUCCESS") return "SUCCESS";
  if (s === "FAILED" || s === "EXPIRED" || s === "CANCELLED") return "FAILED";
  return "PENDING";
};

/* =========================================================
 * SQUAD — existing
 * ======================================================= */

const initialiseDeposit = async (req, res, next) => {
  const { amount } = req.body;
  const user = req.user;

  try {
    const data = {
      email: user.email,
      amount: Number(amount * 100),
      currency: "NGN",
      initiate_type: "inline",
      callback_url: "https://www.validlogin.online/payment/status",
    };

    const squad = await axios.post(
      "https://api-d.squadco.com/transaction/initiate",
      data,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `${env.squad_api_secret}`,
        },
      },
    );

    if (!squad || squad.data.success === false || !squad.data.data) {
      res.statusCode = 400;
      throw new Error(squad.data.message || "Failed to initiate deposit");
    }

    const value = squad.data.data;

    await WalletTransaction.create({
      userId: user._id,
      amount: value.transaction_amount / 100,
      type: "DEPOSIT",
      referenceId: value.transaction_ref,
      paymentMethod: "SQUAD",
      depositorName: user.username,
    });

    res.status(201).json({
      success: true,
      message: "Deposit initiated, you will be notified once it's processed",
      data: value.checkout_url,
    });
  } catch (error) {
    console.log(error.response?.data);
    console.log(error.response?.status);
    next(error);
  }
};

const callbackUrlHandler = async (req, res, next) => {
  const { referenceId } = req.body;

  try {
    const transaction = await WalletTransaction.findOne({ referenceId });

    if (!transaction) {
      res.statusCode = 404;
      throw new Error("Transaction not found");
    }

    res.status(200).json({
      success: true,
      message: "Transaction callback received",
      data: transaction.status,
    });
  } catch (error) {
    next(error);
  }
};

const getPaymentStatus = async (req, res, next) => {
  const { referenceId } = req.body;

  try {
    const transaction = await WalletTransaction.findOne({ referenceId });

    if (!transaction) {
      res.statusCode = 404;
      throw new Error("Transaction not found");
    }

    res.status(200).json({
      success: true,
      message: "Payment status fetched",
      data: {
        referenceId: transaction.referenceId,
        status: transaction.status,
      },
    });
  } catch (error) {
    next(error);
  }
};

const webhookHandler = async (req, res, next) => {
  const event = req.body;
  const session = await mongoose.startSession();

  try {
    const hash = crypto
      .createHmac("sha512", env.squad_api_secret)
      .update(JSON.stringify(event))
      .digest("hex")
      .toUpperCase();

    if (hash !== req.headers["x-squad-encrypted-body"]) return;

    res.sendStatus(200);

    const referenceId = event.TransactionRef || event.Body?.transaction_ref;

    if (!referenceId) {
      throw new Error("Transaction reference is required");
    }

    const verifyPayment = await axios.get(
      `https://api-d.squadco.com/transaction/verify/${referenceId}`,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `${env.squad_api_secret}`,
        },
      },
    );

    const response = verifyPayment.data;
    if (response.status !== 200) {
      throw new Error(
        response.message || "something went wrong verifying payment",
      );
    }
    const gatewayStatus = normalizeSquadStatus(
      response.data.transaction_status,
    );

    let webhookResult = {
      referenceId: response.data.transaction_ref,
      status: gatewayStatus,
      credited: false,
    };

    await session.withTransaction(async () => {
      const transaction = await WalletTransaction.findOne({
        referenceId,
      }).session(session);

      if (!transaction) {
        throw new Error("Transaction not found");
      }

      if (transaction.status === "SUCCESS") {
        webhookResult = {
          referenceId,
          status: transaction.status,
          credited: false,
          message: "Transaction already processed",
        };
        return;
      }

      if (gatewayStatus !== "SUCCESS") {
        transaction.status = gatewayStatus;
        await transaction.save({ session });

        await sendDepositFailedNotification(
          transaction.userId,
          transaction.amount,
          referenceId,
          event.Body?.failure_reason || "Payment processing failed",
        );

        webhookResult = {
          referenceId,
          status: transaction.status,
          credited: false,
        };
        return;
      }

      const amountToCredit = transaction.amount;
      const webhookAmount = Number(response.data.transaction_amount / 100);

      if (Number.isFinite(webhookAmount) && webhookAmount !== amountToCredit) {
        await sendDepositFailedNotification(
          transaction.userId,
          transaction.amount,
          referenceId,
          event.Body?.failure_reason ||
            "Payment processing failed because amount does not match transaction amount. contact support.. if payment went through",
        );
        throw new Error("Webhook amount does not match transaction amount");
      }

      const wallet = await User.findOneAndUpdate(
        { _id: transaction.userId },
        {
          $setOnInsert: { _id: transaction.userId },
          $inc: { walletBalance: amountToCredit },
        },
        { new: true, upsert: true, session },
      );

      transaction.status = "SUCCESS";
      transaction.orderId = response.data.gateway_transaction_ref;
      transaction.balanceAfter = wallet.walletBalance;
      transaction.balanceBefore = wallet.walletBalance - amountToCredit;

      await transaction.save({ session });

      await sendDepositSuccessNotification(
        transaction.userId,
        amountToCredit,
        referenceId,
        wallet.walletBalance,
      );

      webhookResult = {
        referenceId,
        status: transaction.status,
        credited: true,
        balanceBefore: transaction.balanceBefore,
        balanceAfter: transaction.balanceAfter,
      };
    });
  } catch (error) {
    console.log("squad webhook: ", error.message);
    next(error);
  } finally {
    await session.endSession();
  }
};

/* =========================================================
 * MANUAL — existing
 * ======================================================= */

const initializeManualPayment = async (req, res, next) => {
  const { amount, transactionId, depositorName } = req.body;
  const user = req.user;
  try {
    const transaction = await WalletTransaction.create({
      userId: user._id,
      amount: Number(amount),
      type: "DEPOSIT",
      referenceId: transactionId,
      paymentMethod: "MANUAL_TRANSFER",
      depositorName,
    });

    await sendPaymentReceivedNotification(
      user._id,
      Number(amount),
      transactionId,
      depositorName,
    );

    if (!transaction) {
      res.statusCode = 400;
      throw new Error("an error occured while updating payment");
    }

    res.status(201).json({
      status: 200,
      success: true,
      message:
        "your payment has been recieved, once payment is confirmed it will reflect in your balance",
      data: transaction,
    });
  } catch (error) {
    if (error?.code === 11000) {
      res.statusCode = 400;
      return next(
        new Error("This transaction reference has already been submitted"),
      );
    }

    next(error);
  }
};

/* =========================================================
 * QUEST — existing
 * ======================================================= */

const initializeQuestPayment = async (req, res, next) => {
  const { amount } = req.body;
  const user = req.user;
  const randomCode = crypto.randomBytes(6).toString("hex").toUpperCase();
  const reference = `validlogin-${user._id}-${randomCode}`;
  try {
    const data = {
      email: user.email,
      description: "wallet topup",
      reference,
      amount: Number(amount),
      metadata: { userId: user._id },
      return_url: "https://www.validlogin.online/payment/status",
    };

    const response = await axios.post(
      "https://payments-api.questlabs.cc/api/v1/checkout/initialize",
      data,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${env.quest_api_secret}`,
        },
      },
    );

    const value = response.data;

    if (!response.data) {
      res.statusCode = 400;
      throw new Error(response.data.message || "Failed to initiate deposit");
    }

    await WalletTransaction.create({
      userId: user._id,
      amount: value.data.amount,
      type: "DEPOSIT",
      referenceId: value.data.reference,
      paymentMethod: "QUEST",
      depositorName: user.username,
    });

    res.status(201).json({
      status: 201,
      success: true,
      message:
        "Payment initialized, redirect to the provided URL to complete payment",
      data: value.data.checkout_url,
    });
  } catch (error) {
    next(error);
  }
};

const questWebhook = async (req, res, next) => {
  const signature = req.headers["x-questpay-signature"];
  const payload = JSON.stringify(req.body);
  const session = await mongoose.startSession();

  try {
    const calculatedSignature = crypto
      .createHmac("sha256", env.quest_api_secret)
      .update(payload)
      .digest("hex");

    if (calculatedSignature !== signature) return;

    res.sendStatus(200);

    const event = req.body;

    if (event.event !== "payment.received") return;

    const referenceId = event.data?.reference;
    if (!referenceId) {
      throw new Error("Transaction reference is required");
    }

    const gatewayStatus = normalizeSquadStatus(event.data.status);

    await session.withTransaction(async () => {
      const transaction = await WalletTransaction.findOne({
        referenceId,
      }).session(session);

      if (!transaction) {
        throw new Error("Transaction not found");
      }

      if (transaction.status === "SUCCESS") {
        return;
      }

      if (gatewayStatus !== "SUCCESS") {
        transaction.status = gatewayStatus;
        await transaction.save({ session });

        await sendDepositFailedNotification(
          transaction.userId,
          transaction.amount,
          referenceId,
          "Payment processing failed",
        );
        return;
      }

      const amountToCredit = transaction.amount;
      const webhookAmount = Number(event.data.payment?.amountPaid);

      if (Number.isFinite(webhookAmount) && webhookAmount !== amountToCredit) {
        await sendDepositFailedNotification(
          transaction.userId,
          transaction.amount,
          referenceId,
          "Payment processing failed because amount does not match transaction amount. Contact support if payment went through.",
        );
        throw new Error("Webhook amount does not match transaction amount");
      }

      const wallet = await User.findOneAndUpdate(
        { _id: transaction.userId },
        {
          $setOnInsert: { _id: transaction.userId },
          $inc: { walletBalance: amountToCredit },
        },
        { new: true, upsert: true, session },
      );

      transaction.status = "SUCCESS";
      transaction.orderId = event.data.payment?.providerTransactionId;
      transaction.balanceAfter = wallet.walletBalance;
      transaction.balanceBefore = wallet.walletBalance - amountToCredit;
      await transaction.save({ session });

      await sendDepositSuccessNotification(
        transaction.userId,
        amountToCredit,
        referenceId,
        wallet.walletBalance,
      );
    });
  } catch (error) {
    console.log("quest webhook: ", error.message);
    next(error);
  } finally {
    await session.endSession();
  }
};

/* =========================================================
 * C-TEX PAY — checkout URL flow
 * =======================================================
 * Unlike Squad/Quest, C-TEX requires us to be explicit about which
 * checkout surface to open:
 *
 *   paymentMethod: "ACCOUNT_TRANSFER"  → bank-transfer-only flow
 *                                        (returns paymentInstructions)
 *   paymentMethod: OMITTED             → hosted checkout flow
 *                                        (returns checkoutUrl)
 *
 * We want the hosted checkout here so the user is redirected to a
 * C-TEX page that handles transfer/card/USSD, then returns to our
 * callback URL. The webhook payload is identical either way.
 * ======================================================= */

const initializeCtexPayment = async (req, res, next) => {
  const { amount } = req.body;
  const user = req.user;

  try {
    if (!env.ctex_api_key) {
      res.statusCode = 503;
      throw new Error("C-TEX PAY is not configured");
    }

    if (!Number.isFinite(Number(amount)) || Number(amount) <= 0) {
      res.statusCode = 400;
      throw new Error("A valid amount is required");
    }

    // Convert naira to kobo for C-TEX
    const amountKobo = Math.round(Number(amount) * 100);

    // Unique idempotency key per deposit attempt
    const idempotencyKey = `ctex-${user._id}-${crypto
      .randomBytes(6)
      .toString("hex")
      .toUpperCase()}`;

    /*
     * NOTE: paymentMethod intentionally OMITTED so C-TEX returns a
     * hosted checkout URL instead of a virtual account.
     */
    const payload = {
      amount: amountKobo,
      currency: "NGN",
      reference: idempotencyKey,
      description: `Wallet topup for ${user.email}`,
      metadata: {
        userId: String(user._id),
        email: user.email,
      },
      // paymentMethod deliberately not set — hosted checkout
    };

    const response = await axios.post(
      `${env.ctex_base_url || "https://api.ctex.online/api/v1"}/payments`,
      payload,
      {
        headers: {
          Authorization: `Bearer ${env.ctex_api_key}`,
          "Content-Type": "application/json",
          "Idempotency-Key": idempotencyKey,
        },
        timeout: 30000,
      },
    );

    const body = response.data;
    if (!body?.success || !body?.data) {
      res.statusCode = 400;
      throw new Error(body?.message || "Failed to initiate C-TEX payment");
    }

    const payment = body.data;
    const checkoutUrl = payment.checkoutUrl || payment.providerMetadata?.checkoutUrl;

    if (!checkoutUrl) {
      res.statusCode = 502;
      throw new Error(
        "C-TEX PAY did not return a checkout URL. Try again shortly.",
      );
    }

    // Record the pending deposit. Webhook will match on paymentReference.
    await WalletTransaction.create({
      userId: user._id,
      amount: Number(payment.amount) / 100, // naira
      type: "DEPOSIT",
      referenceId: payment.paymentReference,
      paymentMethod: "CTEX",
      depositorName: user.username,
      status: "PENDING",
      metadata: {
        ctexReference: payment.paymentReference,
        merchantReference: payment.merchantReference,
        amountKobo: Number(payment.amount),
        checkoutUrl,
      },
    });

    res.status(201).json({
      status: 201,
      success: true,
      message:
        "Deposit initialized, redirect to the provided URL to complete payment",
      data: {
        referenceId: payment.paymentReference,
        amount: Number(payment.amount) / 100,
        currency: payment.currency,
        status: payment.status,
        checkoutUrl,
      },
    });
  } catch (error) {
    const ctexMessage = error.response?.data?.message;
    if (ctexMessage) {
      console.log("C-TEX init error:", {
        status: error.response.status,
        message: ctexMessage,
      });
    } else {
      console.log("C-TEX init error:", error.message);
    }
    next(error);
  }
};

/* =========================================================
 * C-TEX PAY webhook — unchanged from account-transfer flow
 * =======================================================
 * The webhook payload is the same whether the customer paid via
 * bank transfer or via the hosted checkout. Nothing here needs to
 * change when switching to the checkout URL flow.
 * ======================================================= */

const ctexWebhook = async (req, res, next) => {
  const signature = req.headers["x-ctex-signature"];
  const rawBody = req.rawBody || JSON.stringify(req.body);

  const session = await mongoose.startSession();

  try {
    if (!env.ctex_webhook_secret) {
      console.error("C-TEX webhook: ctex_webhook_secret is not set");
      return res.sendStatus(200);
    }

    if (!signature) {
      console.warn("C-TEX webhook: missing signature header");
      return res.sendStatus(401);
    }

    const expected =
      "sha256=" +
      crypto
        .createHmac("sha256", env.ctex_webhook_secret)
        .update(rawBody)
        .digest("hex");

    const expectedBuf = Buffer.from(expected, "utf8");
    const receivedBuf = Buffer.from(signature, "utf8");

    if (
      expectedBuf.length !== receivedBuf.length ||
      !crypto.timingSafeEqual(expectedBuf, receivedBuf)
    ) {
      console.warn("C-TEX webhook: invalid signature");
      return res.sendStatus(401);
    }

    res.sendStatus(200);

    const event = req.body || {};
    const eventType = event.type;
    const data = event.data || {};

    if (eventType !== "payment.success") {
      console.log("C-TEX webhook: ignoring event", eventType);
      return;
    }

    const referenceId = data.paymentReference;
    if (!referenceId) {
      console.warn("C-TEX webhook: missing paymentReference");
      return;
    }

    const gatewayStatus = normalizeCtexStatus(data.status);

    await session.withTransaction(async () => {
      const transaction = await WalletTransaction.findOne({
        referenceId,
      }).session(session);

      if (!transaction) {
        console.warn("C-TEX webhook: no matching wallet transaction", {
          referenceId,
        });
        return;
      }

      if (transaction.status === "SUCCESS") {
        return;
      }

      if (gatewayStatus !== "SUCCESS") {
        transaction.status = gatewayStatus;
        await transaction.save({ session });

        await sendDepositFailedNotification(
          transaction.userId,
          transaction.amount,
          referenceId,
          "C-TEX PAY reported the payment did not succeed",
        );
        return;
      }

      const amountToCredit = transaction.amount; // naira
      const webhookAmountKobo = Number(data.amount);
      const webhookAmount = Number.isFinite(webhookAmountKobo)
        ? webhookAmountKobo / 100
        : NaN;

      if (Number.isFinite(webhookAmount) && webhookAmount !== amountToCredit) {
        await sendDepositFailedNotification(
          transaction.userId,
          transaction.amount,
          referenceId,
          "Payment amount did not match the amount requested. Contact support if you completed the transfer.",
        );
        throw new Error("C-TEX webhook amount mismatch");
      }

      const wallet = await User.findOneAndUpdate(
        { _id: transaction.userId },
        {
          $setOnInsert: { _id: transaction.userId },
          $inc: { walletBalance: amountToCredit },
        },
        { new: true, upsert: true, session },
      );

      transaction.status = "SUCCESS";
      transaction.orderId =
        data.metadata?.providerReference ||
        data.metadata?.providerTxnId ||
        referenceId;
      transaction.balanceAfter = wallet.walletBalance;
      transaction.balanceBefore = wallet.walletBalance - amountToCredit;

      await transaction.save({ session });

      await sendDepositSuccessNotification(
        transaction.userId,
        amountToCredit,
        referenceId,
        wallet.walletBalance,
      );
    });
  } catch (error) {
    console.log("C-TEX webhook error:", error.message);
  } finally {
    await session.endSession();
  }
};

/* =========================================================
 * EXPORTS
 * ======================================================= */

export {
  initialiseDeposit,
  webhookHandler,
  callbackUrlHandler,
  getPaymentStatus,
  initializeManualPayment,
  initializeQuestPayment,
  questWebhook,
  initializeCtexPayment,
  ctexWebhook,
};