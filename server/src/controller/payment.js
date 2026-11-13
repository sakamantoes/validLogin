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
import { ensureCtexCustomer } from "./ctexCustomerController.js";
import CtexWebhookEvent from "../model/CtexWebhookEvent.js";

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

// Verifies "X-C-TEX-Signature: sha256=<hex>" against the exact raw body bytes.
const validCtexSignature = (rawBody, header, secret) => {
  if (typeof header !== "string" || !header.startsWith("sha256=")) return false;
  const supplied = header.slice("sha256=".length);
  if (!/^[0-9a-f]{64}$/.test(supplied)) return false;
  const expected = crypto.createHmac("sha256", secret).update(rawBody).digest();
  const received = Buffer.from(supplied, "hex");
  return (
    received.length === expected.length &&
    crypto.timingSafeEqual(received, expected)
  );
};

const CTEX_API = () =>
  env.ctex_base_url || "https://api.ctex.online/api/v1";

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
 * ctex PAY — checkout URL flow
 * =======================================================
 *   paymentMethod: "ACCOUNT_TRANSFER"  → bank-transfer-only flow
 *   paymentMethod: OMITTED             → hosted checkout flow
 *
 * We use hosted checkout so the user is redirected to a ctex page
 * that handles transfer/card/USSD, then returns to our callback URL.
 * The webhook payload is identical either way.
 * ======================================================= */

const initializeCtexPayment = async (req, res, next) => {
  const { amount } = req.body;
  const user = req.user;

  try {
    if (!env.ctex_api_key) {
      res.statusCode = 503;
      throw new Error("ctex PAY is not configured");
    }

    const numericAmount = Number(amount);
    if (!Number.isFinite(numericAmount) || numericAmount < 100) {
      res.statusCode = 400;
      throw new Error("Minimum deposit amount is ₦100");
    }

    // Convert naira to kobo for ctex
    const amountKobo = Math.round(numericAmount * 100);

    // Unique idempotency key per deposit attempt
    const idempotencyKey = `ctex-${user._id}-${crypto
      .randomBytes(6)
      .toString("hex")
      .toUpperCase()}`;

    // Lazily create (or reuse) the C-TEX customer and get their UUID.
    const customerId = await ensureCtexCustomer(user);

    const payload = {
      amount: amountKobo,
      currency: "NGN",
      customerId,
      reference: idempotencyKey,
      description: `Wallet topup for ${user.email}`,
      // paymentMethod deliberately not set — hosted checkout
      // If hosted checkout fails, try adding: paymentMethod: "ACCOUNT_TRANSFER"
    };

    const response = await axios.post(`${CTEX_API()}/payments`, payload, {
      headers: {
        Authorization: `Bearer ${String(env.ctex_api_key).trim()}`,
        "Content-Type": "application/json",
        "Idempotency-Key": idempotencyKey,
      },
      timeout: 30000,
    });

    const body = response.data;
    if (!body?.success || !body?.data) {
      res.statusCode = 400;
      throw new Error(body?.message || "Failed to initiate ctex payment");
    }

    const payment = body.data;
    const checkoutUrl =
      payment.checkoutUrl || payment.providerMetadata?.checkoutUrl;

    if (!checkoutUrl) {
      res.statusCode = 502;
      throw new Error(
        "ctex PAY did not return a checkout URL. Try again shortly.",
      );
    }

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
    if (error.response) {
      console.error(
        "ctex init error:",
        error.response.status,
        JSON.stringify(error.response.data),
      );
      res.statusCode = error.response.status >= 500 ? 502 : 400;
      return next(
        new Error(
          error.response.data?.message || "Unable to start ctex payment",
        ),
      );
    }
    console.error("ctex init error:", error.message);
    if (res.statusCode < 400) res.statusCode = 502;
    next(error);
  }
};

/* =========================================================
 * ctex PAY webhook — production
 * =======================================================
 *   1. Verify X-C-TEX-Signature against the exact raw body.
 *   2. Parse JSON only after verification.
 *   3. Require type === "payment.success"; validate event id + ref.
 *   4. Insert event id into CtexWebhookEvent (unique index) →
 *      duplicates are a no-op, never re-fulfilled.
 *   5. Re-verify the payment from ctex's API using our key.
 *   6. Confirm status, paymentReference, merchantReference,
 *      currency, and amount.
 *   7. Credit the wallet atomically and mark the txn SUCCESS.
 *   8. 2xx on success / duplicate / definitive-ignore,
 *      401 only for bad signature, 5xx when we must be retried.
 * ======================================================= */

const ctexWebhook = async (req, res) => {
  const webhookSecret = String(env.ctex_webhook_secret || "").trim();
  const apiKey = String(env.ctex_api_key || "").trim();

  if (!webhookSecret || !apiKey) {
    console.error("ctex webhook: ctex_webhook_secret / ctex_api_key not set");
    return res.sendStatus(503);
  }

  // 1. raw body
  const rawBody = req.rawBody;
  if (!rawBody) {
    console.error(
      "ctex webhook: req.rawBody missing — check app.js verify hook",
    );
    return res.sendStatus(500);
  }

  // 2. signature (Node lowercases headers: X-C-TEX-Signature -> x-c-tex-signature)
  const signature = req.get("x-c-tex-signature");
  if (!validCtexSignature(rawBody, signature, webhookSecret)) {
    console.warn("ctex webhook: missing/invalid signature", {
      hasHeader: Boolean(signature),
      eventHeader: req.get("x-c-tex-event-id"),
    });
    return res.sendStatus(401);
  }

  // 3. parse only after verification
  let event;
  try {
    event = JSON.parse(rawBody.toString("utf8"));
  } catch {
    console.error("ctex webhook: signed body is not valid JSON");
    return res.sendStatus(200);
  }

  const eventType = event?.type;
  const eventId = event?.id;
  const data = event?.data || {};
  const paymentReference = data.paymentReference;

  if (eventType !== "payment.success") {
    console.log("ctex webhook: ignoring event type", eventType);
    return res.sendStatus(200);
  }

  if (!eventId || !paymentReference) {
    console.warn("ctex webhook: missing event id or paymentReference");
    return res.sendStatus(400);
  }

  // 4. idempotency
  try {
    await CtexWebhookEvent.create({
      eventId,
      type: eventType,
      paymentReference,
      merchantReference: data.merchantReference,
      amount: Number(data.amount),
      currency: data.currency,
      rawPayload: event,
    });
  } catch (err) {
    if (err?.code === 11000) {
      console.log("ctex webhook: duplicate event", { eventId });
      return res.sendStatus(200);
    }
    console.error("ctex webhook: failed to persist event", {
      eventId,
      message: err?.message,
    });
    return res.sendStatus(500);
  }

  // Release the idempotency lock so ctex's retry can re-enter.
  const release = () =>
    CtexWebhookEvent.deleteOne({ eventId }).catch(() => {});

  // 5. verify with ctex API
  let verified;
  try {
    const r = await axios.get(
      `${CTEX_API()}/payments/${encodeURIComponent(paymentReference)}`,
      {
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        timeout: 15000,
      },
    );
    verified = r.data?.data;
  } catch (err) {
    await release();
    console.error("ctex webhook: verification request failed", {
      paymentReference,
      message: err?.message,
      status: err?.response?.status,
    });
    return res.sendStatus(500);
  }

  if (!verified) {
    await release();
    console.error("ctex webhook: empty verification body", {
      paymentReference,
    });
    return res.sendStatus(500);
  }

  // 6. compare expected values
  const verifiedStatus = normalizeCtexStatus(verified.status);
  const verifiedAmountKobo = Number(verified.amount);
  const verifiedCurrency = String(verified.currency || "").toUpperCase();

  if (verifiedStatus === "PENDING") {
    // Not settled on ctex's side yet — let ctex retry.
    await release();
    console.warn("ctex webhook: verify says still pending, asking for retry", {
      paymentReference,
      status: verified.status,
    });
    return res.sendStatus(500);
  }

  if (verifiedStatus !== "SUCCESS") {
    console.warn("ctex webhook: verify says not successful", {
      paymentReference,
      status: verified.status,
    });
    return res.sendStatus(200);
  }

  if (verified.paymentReference !== paymentReference) {
    console.warn("ctex webhook: paymentReference mismatch", {
      expected: paymentReference,
      verified: verified.paymentReference,
    });
    return res.sendStatus(200);
  }

  if (
    verified.merchantReference &&
    data.merchantReference &&
    verified.merchantReference !== data.merchantReference
  ) {
    console.warn("ctex webhook: merchantReference mismatch", {
      paymentReference,
    });
    return res.sendStatus(200);
  }

  if (verifiedCurrency !== "NGN") {
    console.warn("ctex webhook: unexpected currency", {
      paymentReference,
      verifiedCurrency,
    });
    return res.sendStatus(200);
  }

  if (
    !Number.isFinite(verifiedAmountKobo) ||
    (Number.isFinite(Number(data.amount)) &&
      Number(data.amount) !== verifiedAmountKobo)
  ) {
    console.error("ctex webhook: event/verified amount mismatch", {
      paymentReference,
      eventAmount: data.amount,
      verifiedAmountKobo,
    });
    return res.sendStatus(200);
  }

  // 7. fulfil atomically
  const session = await mongoose.startSession();
  let credited = false;
  let notify = null;

  try {
    await session.withTransaction(async () => {
      credited = false;
      notify = null;

      const transaction = await WalletTransaction.findOne({
        referenceId: paymentReference,
      }).session(session);

      if (!transaction) {
        console.warn("ctex webhook: no matching wallet transaction", {
          paymentReference,
        });
        return;
      }

      if (transaction.status === "SUCCESS") return;

      const expectedKobo = Math.round(transaction.amount * 100);
      if (verifiedAmountKobo !== expectedKobo) {
        console.error("ctex webhook: amount mismatch vs wallet txn", {
          paymentReference,
          expectedKobo,
          verifiedAmountKobo,
        });
        return; // stays PENDING for manual reconciliation
      }

      const amountToCredit = transaction.amount;

      const wallet = await User.findOneAndUpdate(
        { _id: transaction.userId },
        { $inc: { walletBalance: amountToCredit } },
        { new: true, session },
      );

      if (!wallet) throw new Error("Wallet owner not found");

      transaction.status = "SUCCESS";
      transaction.orderId =
        verified.providerReference || verified.providerTransactionId;
      transaction.balanceAfter = wallet.walletBalance;
      transaction.balanceBefore = wallet.walletBalance - amountToCredit;
      await transaction.save({ session });

      credited = true;
      notify = {
        userId: transaction.userId,
        amount: amountToCredit,
        balance: wallet.walletBalance,
      };
    });

    console.log("ctex webhook: processed", { paymentReference, credited });

    // best-effort, after commit, exactly once
    if (credited && notify) {
      try {
        await sendDepositSuccessNotification(
          notify.userId,
          notify.amount,
          paymentReference,
          notify.balance,
        );
      } catch (notifyErr) {
        console.error("ctex webhook: notification failed (non-fatal)", {
          paymentReference,
          message: notifyErr?.message,
        });
      }
    }

    return res.sendStatus(200);
  } catch (err) {
    await release();
    console.error("ctex webhook: fulfilment failed", {
      paymentReference,
      message: err?.message,
    });
    return res.sendStatus(500);
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