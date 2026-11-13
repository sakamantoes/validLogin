import mongoose from "mongoose";

/**
 * Idempotency table for C-TEX webhook events.
 *
 * C-TEX's handling-events.md requires: "Insert the event ID into a
 * database table with a unique constraint. If it already exists, do not
 * repeat fulfillment."
 *
 * The unique index on `eventId` gives us that guarantee. A duplicate
 * `insertOne` throws E11000, which the webhook handler catches and turns
 * into a silent 200.
 */
const ctexWebhookEventSchema = new mongoose.Schema(
  {
    eventId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    type: {
      type: String,
      required: true,
    },
    paymentReference: {
      type: String,
      index: true,
    },
    merchantReference: {
      type: String,
    },
    amount: {
      type: Number,
    },
    currency: {
      type: String,
    },
    rawPayload: {
      type: mongoose.Schema.Types.Mixed,
    },
    receivedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true },
);

const CtexWebhookEvent = mongoose.model(
  "CtexWebhookEvent",
  ctexWebhookEventSchema,
);

export default CtexWebhookEvent;