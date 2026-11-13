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
 * Unlike Squad/Quest, ctex requires us to be explicit about which
 * checkout surface to open:
 *
 *   paymentMethod: "ACCOUNT_TRANSFER"  → bank-transfer-only flow
 *                                        (returns paymentInstructions)
 *   paymentMethod: OMITTED             → hosted checkout flow
 *                                        (returns checkoutUrl)
 *
 * We want the hosted checkout here so the user is redirected to a
 * ctex page that handles transfer/card/USSD, then returns to our
 * callback URL. The webhook payload is identical either way.
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
    // Print the FULL ctex response so you can see exactly which field failed
    if (error.response?.data) {
      console.log(
        "ctex init error (full response):",
        JSON.stringify(error.response.data, null, 2),
      );
      console.log("ctex init status:", error.response.status);
    } else {
      console.log("ctex init error:", error.message);
    }
    if (error.statusCode && !res.statusCode) res.statusCode = error.statusCode;
    next(error);
  }
};

/* =========================================================
 * ctex PAY webhook — production
 * =======================================================
 * Follows ctex's documented safe-handling flow:
 *
 *   1. Verify X-C-TEX-Signature against the exact raw body.
 *   2. Parse JSON only after verification.
 *   3. Require type === "payment.success"; validate event id + ref.
 *   4. Insert event id into CtexWebhookEvent (unique index) →
 *      duplicates are a no-op, never re-fulfilled.
 *   5. Re-verify the payment from ctex's API using our key.
 *   6. Confirm status, paymentReference, merchantReference,
 *      currency, and amount.
 *   7. Credit the wallet atomically and mark the txn SUCCESS.
 *   8. Respond 2xx on success / duplicate / safely-ignored.
 *      401 only for bad signature; 5xx only if we truly cannot
 *      persist or fulfill.
 *
 * The sender treats any 2xx as delivered. Never trust the body
 * before the signature is verified.
 * ======================================================= */

const ctexWebhook = async (req, res) => {
  // ---- 0. configuration guards --------------------------------------
  if (!env.ctex_webhook_secret) {
    console.error("ctex webhook: ctex_webhook_secret is not set");
    return res.sendStatus(503);
  }
  if (!env.ctex_api_key) {
    console.error("ctex webhook: ctex_api_key is not set");
    return res.sendStatus(503);
  }

  // ---- 1. raw body --------------------------------------------------
  // app.js stores the exact bytes on req.rawBody for /api/payment/*.
  // If it's missing we cannot verify the signature — refuse.
  const rawBody = req.rawBody;
  if (!rawBody) {
    console.error(
      "ctex webhook: raw body not captured — check app.js express.json verify hook",
    );
    return res.sendStatus(500);
  }

  const signature = req.headers["x-ctex-signature"];
  if (!signature) {
    console.warn("ctex webhook: missing X-C-TEX-Signature header");
    return res.sendStatus(401);
  }

  // ---- 2. signature verification ------------------------------------
  // Doc: "HMAC-SHA256 and the merchant webhook secret".
  // Header: "sha256=<lowercase-hex-digest>".
  const expected =
    "sha256=" +
    crypto
      .createHmac("sha256", env.ctex_webhook_secret)
      .update(rawBody)
      .digest("hex");

  const expectedBuf = Buffer.from(expected, "utf8");
  const receivedBuf = Buffer.from(String(signature), "utf8");

  if (
    expectedBuf.length !== receivedBuf.length ||
    !crypto.timingSafeEqual(expectedBuf, receivedBuf)
  ) {
    console.warn("ctex webhook: invalid signature");
    return res.sendStatus(401);
  }

  // ---- 3. parse JSON only after verification ------------------------
  let event;
  try {
    event = JSON.parse(rawBody);
  } catch (err) {
    console.error("ctex webhook: body is not valid JSON");
    // Signature matched, so this is a malformed payload from ctex.
    // Ack to stop retries of the same bytes.
    return res.sendStatus(200);
  }

  const eventType = event?.type;
  const eventId = event?.id;
  const data = event?.data || {};
  const paymentReference = data.paymentReference;

  if (eventType !== "payment.success") {
    // We only fulfill on payment.success; ack and drop everything else.
    console.log("ctex webhook: ignoring event type", eventType);
    return res.sendStatus(200);
  }

  if (!eventId || !paymentReference) {
    console.warn(
      "ctex webhook: missing event id or paymentReference — cannot persist",
      { eventId, paymentReference },
    );
    // Cannot safely persist → ask ctex to retry.
    return res.sendStatus(500);
  }

  // ---- 4. idempotency: insert event id with unique index ------------
  // If the event was already recorded, the insert throws E11000 and we
  // return 200 without re-fulfilling.
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
      console.log("ctex webhook: duplicate event, already fulfilled", {
        eventId,
      });
      return res.sendStatus(200);
    }
    console.error("ctex webhook: failed to persist event id", {
      eventId,
      message: err?.message,
    });
    // Cannot persist → ask ctex to retry.
    return res.sendStatus(500);
  }

  // ---- 5. verify the payment with ctex ------------------------------
  let verified;
  try {
    const verifyResponse = await axios.get(
      `${env.ctex_base_url || "https://api.ctex.online/api/v1"}/payments/${encodeURIComponent(
        paymentReference,
      )}`,
      {
        headers: {
          Authorization: `Bearer ${env.ctex_api_key}`,
          "Content-Type": "application/json",
        },
        timeout: 30000,
      },
    );
    verified = verifyResponse.data?.data;
  } catch (err) {
    // The event row is already persisted; a retry will hit the unique
    // index and skip fulfillment, so we must NOT persist again on a
    // 500 here — the row is the proof we received it. To let ctex retry
    // we need the row deleted so the next delivery can proceed.
    await CtexWebhookEvent.deleteOne({ eventId }).catch(() => {});
    console.error("ctex webhook: payment verification failed", {
      paymentReference,
      message: err?.message,
      status: err?.response?.status,
    });
    return res.sendStatus(500);
  }

  if (!verified) {
    await CtexWebhookEvent.deleteOne({ eventId }).catch(() => {});
    console.error(
      "ctex webhook: payment verification returned empty body",
      { paymentReference },
    );
    return res.sendStatus(500);
  }

  // ---- 6. compare expected values -----------------------------------
  const verifiedStatus = normalizeCtexStatus(verified.status);
  const verifiedAmountKobo = Number(verified.amount);
  const verifiedCurrency = String(verified.currency || "").toUpperCase();
  const verifiedPaymentRef = verified.paymentReference;
  const verifiedMerchantRef = verified.merchantReference;

  if (verifiedStatus !== "SUCCESS") {
    // Event said success but the source of truth disagrees.
    console.warn(
      "ctex webhook: verification says not SUCCESS; leaving for manual review",
      {
        paymentReference,
        verifiedStatus: verified.status,
      },
    );
    // Row stays as a record of what we received. Ack to stop retries —
    // this is a real mismatch, not a transient failure.
    return res.sendStatus(200);
  }

  if (verifiedPaymentRef !== paymentReference) {
    console.warn("ctex webhook: paymentReference mismatch", {
      expected: paymentReference,
      verified: verifiedPaymentRef,
    });
    return res.sendStatus(200);
  }

  if (
    verifiedMerchantRef &&
    data.merchantReference &&
    verifiedMerchantRef !== data.merchantReference
  ) {
    console.warn("ctex webhook: merchantReference mismatch", {
      fromEvent: data.merchantReference,
      fromVerify: verifiedMerchantRef,
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

  // ---- 7. fulfill: credit wallet atomically -------------------------
  const session = await mongoose.startSession();
  try {
    let credited = false;

    await session.withTransaction(async () => {
      const transaction = await WalletTransaction.findOne({
        referenceId: paymentReference,
      }).session(session);

      if (!transaction) {
        // Not our payment — persist the event row but don't credit.
        console.warn("ctex webhook: no matching wallet transaction", {
          paymentReference,
        });
        return;
      }

      if (transaction.status === "SUCCESS") {
        return; // already fulfilled
      }

      const expectedKobo = Math.round(transaction.amount * 100);
      if (
        Number.isFinite(verifiedAmountKobo) &&
        verifiedAmountKobo !== expectedKobo
      ) {
        // Verified amount differs from what we created the txn for.
        // Leave PENDING for manual reconciliation, record and ack.
        console.error("ctex webhook: amount mismatch vs wallet txn", {
          paymentReference,
          expectedKobo,
          verifiedAmountKobo,
        });
        return;
      }

      const amountToCredit = transaction.amount;

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
        verified.providerReference || verified.providerTransactionId;
      transaction.balanceAfter = wallet.walletBalance;
      transaction.balanceBefore = wallet.walletBalance - amountToCredit;
      await transaction.save({ session });

      credited = true;

      // Notification is best-effort and intentionally outside the
      // transaction so a notification failure never rolls back money.
      try {
        await sendDepositSuccessNotification(
          transaction.userId,
          amountToCredit,
          paymentReference,
          wallet.walletBalance,
        );
      } catch (notifyErr) {
        console.error(
          "ctex webhook: success notification failed (non-fatal)",
          {
            paymentReference,
            message: notifyErr?.message,
          },
        );
      }
    });

    console.log("ctex webhook: fulfilled", {
      paymentReference,
      credited,
    });

    return res.sendStatus(200);
  } catch (err) {
    // Fulfillment failed. Delete the event row so ctex's next retry can
    // re-enter the flow — otherwise the unique index would block it and
    // we'd lose money permanently.
    await CtexWebhookEvent.deleteOne({ eventId }).catch(() => {});
    console.error("ctex webhook: fulfillment failed", {
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