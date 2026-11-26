import axios from "axios";
import { env } from "../config/constant.js";
import User from "../model/User.js";

/* =========================================================
 * C-TEX PAY — customer provisioning
 * =======================================================
 * C-TEX requires a `customerId` (their UUID, not ours) when
 * creating a payment. We lazily create that customer the first
 * time a user tries to deposit via C-TEX, then cache it on the
 * User document.
 *
 * Doc references:
 *   POST /customers        → 201 { data: { customer } }
 *   GET  /customers        → 200 { data: { customers, pagination } }
 *   Duplicate email/phone  → 409 Conflict
 * ======================================================= */

const getCtexBaseUrl = () =>
  env.ctex_base_url || "https://api.ctex.online/api/v1";

const ctexHeaders = (idempotencyKey) => ({
  Authorization: `Bearer ${env.ctex_api_key}`,
  "Content-Type": "application/json",
  ...(idempotencyKey ? { "Idempotency-Key": idempotencyKey } : {}),
});

const splitName = (rawName, fallback) => {
  const cleaned = String(rawName || "").trim();
  if (!cleaned) {
    return { firstName: fallback, lastName: fallback };
  }
  const parts = cleaned.split(/\s+/);
  const firstName = parts.shift() || fallback;
  const lastName = parts.length ? parts.join(" ") : fallback;
  return { firstName, lastName };
};

/**
 * Find an existing C-TEX customer by email (used to recover from
 * a 409 duplicate-email response).
 */
const findCtexCustomerByEmail = async (email) => {
  const response = await axios.get(`${getCtexBaseUrl()}/customers`, {
    headers: ctexHeaders(),
    params: { search: email, limit: 100 },
    timeout: 30000,
  });

  const body = response.data;
  const customers = body?.data?.customers || [];
  const match = customers.find(
    (c) => String(c.email || "").toLowerCase() === email.toLowerCase(),
  );
  return match || null;
};

/**
 * Create (or reuse) a C-TEX customer for the given user and persist
 * the returned customer UUID on the User document.
 *
 * Returns the C-TEX customer UUID string.
 * Throws an Error (with .statusCode set) on failure.
 */
export const ensureCtexCustomer = async (user) => {
  if (!env.ctex_api_key) {
    const err = new Error("C-TEX PAY is not configured");
    err.statusCode = 503;
    throw err;
  }

  const accountEmail = String(user.email || "").trim().toLowerCase();
  if (
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(accountEmail) ||
    accountEmail.endsWith("@example.com")
  ) {
    const err = new Error(
      "Add a valid email address to your account before making a CTEX payment.",
    );
    err.statusCode = 400;
    throw err;
  }

  // 1. Already provisioned → reuse.
  if (user.ctexCustomerId) {
    return user.ctexCustomerId;
  }

  // 2. Build the creation payload from the user document.
  const { firstName, lastName } = splitName(
    user.username || user.fullName,
    "Customer",
  );
  const email = String(user.email || "").trim().toLowerCase();

  if (
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ||
    email.endsWith("@example.com")
  ) {
    const err = new Error(
      "Add a valid email address to your account before making a CTEX payment.",
    );
    err.statusCode = 400;
    throw err;
  }

  const payload = {
    firstName: firstName.length >= 2 ? firstName : "Customer",
    lastName: lastName.length >= 2 ? lastName : "Account",
    email,
    metadata: {
      externalCustomerId: String(user._id),
    },
  };

  if (user.phone) {
    // Keep under the documented 30-char limit.
    payload.phone = String(user.phone).slice(0, 30);
  }

  const idempotencyKey = `ctex-customer-${user._id}`;

  let customer = null;

  try {
    const response = await axios.post(
      `${getCtexBaseUrl()}/customers`,
      payload,
      { headers: ctexHeaders(idempotencyKey), timeout: 30000 },
    );

    customer = response.data?.data?.customer || null;
  } catch (error) {
    const status = error.response?.status;
    const message = error.response?.data?.message;

    // 3. Duplicate email/phone → try to recover the existing customer.
    if (status === 409) {
      customer = await findCtexCustomerByEmail(email);
      if (!customer) {
        const err = new Error(
          "C-TEX reports this email/phone is already registered, but we could not find the existing customer. Please contact support.",
        );
        err.statusCode = 409;
        throw err;
      }
    } else {
      console.log("C-TEX customer creation failed:", {
        status,
        message,
        fields: error.response?.data?.fields,
      });
      const err = new Error(
        message || "Failed to create C-TEX customer. Please try again.",
      );
      err.statusCode = status && status >= 400 && status < 500 ? status : 502;
      throw err;
    }
  }

  const ctexCustomerId = customer?.id || customer?.customerCode;
  if (!ctexCustomerId) {
    const err = new Error(
      "C-TEX did not return a customer id. Please contact support.",
    );
    err.statusCode = 502;
    throw err;
  }

  // 4. Persist for future deposits.
  await User.updateOne(
    { _id: user._id },
    { $set: { ctexCustomerId } },
    { runValidators: false },
  );

  // Keep the in-memory user object in sync for the caller.
  user.ctexCustomerId = ctexCustomerId;

  return ctexCustomerId;
};

/**
 * Optional HTTP endpoint: POST /api/payment/ctex/create-customer
 * Useful for proactively provisioning the customer (e.g. on
 * onboarding) without initiating a deposit.
 */
export const createCtexCustomer = async (req, res, next) => {
  try {
    const customerId = await ensureCtexCustomer(req.user);

    res.status(201).json({
      success: true,
      message: "C-TEX customer is ready",
      data: { customerId },
    });
  } catch (error) {
    if (error.statusCode) res.statusCode = error.statusCode;
    next(error);
  }
};
