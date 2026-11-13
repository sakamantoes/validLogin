import { AlertCircle, ArrowRight, Loader2, Lock } from "lucide-react";
import { useRef, useState } from "react";
import { initializeCtexPayment } from "../../service/payment.js";
import CtexPaymentShell from "./CtexPaymentShell.jsx";
import { savePendingCtex } from "./ctexStorage.js";

const MIN_AMOUNT = 100;
const FALLBACK_ERROR = "Something went wrong. Please try again.";

// Turns any error shape (string, { field: "msg" }, array, Zod issues) into a string,
// so we never hand React an object to render.
const toMessage = (value) => {
  if (!value) return "";
  if (typeof value === "string") return value;

  if (Array.isArray(value)) {
    return value.map(toMessage).filter(Boolean).join(". ");
  }

  if (typeof value === "object") {
    if (typeof value.message === "string") return value.message;

    return Object.values(value).map(toMessage).filter(Boolean).join(". ");
  }

  return String(value);
};

const getErrorMessage = (err) => {
  const data = err?.response?.data;

  return (
    toMessage(data?.message) ||
    toMessage(data?.errors) ||
    toMessage(data?.error) ||
    toMessage(err?.message) ||
    FALLBACK_ERROR
  );
};

// Only follow https links (or http on localhost during development).
const isSafeRedirect = (value) => {
  try {
    const url = new URL(value);
    if (url.protocol === "https:") return true;
    return (
      import.meta.env.DEV &&
      url.protocol === "http:" &&
      ["localhost", "127.0.0.1"].includes(url.hostname)
    );
  } catch {
    return false;
  }
};

const formatNaira = (value) =>
  new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    maximumFractionDigits: 2,
  }).format(Number(value) || 0);

export default function CtexPayment({ amount, onBack }) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const submittingRef = useRef(false);

  const numericAmount = Number(amount);
  const isAmountValid =
    Number.isFinite(numericAmount) && numericAmount >= MIN_AMOUNT;

  const handlePay = async () => {
    if (submittingRef.current || !isAmountValid) return;

    submittingRef.current = true;
    setIsLoading(true);
    setError("");

    try {
      // Backend: { success, data: { referenceId, amount, currency, status, checkoutUrl } }
      const res = await initializeCtexPayment({
        amount: numericAmount,
        paymentMethod: "ctex", // required by the shared deposit validator
      });
      const payload = res?.data ?? {};
      const checkoutUrl =
        typeof payload.checkoutUrl === "string" ? payload.checkoutUrl.trim() : "";

      if (!checkoutUrl || !isSafeRedirect(checkoutUrl)) {
        throw new Error("We couldn't start your checkout. Please try again.");
      }

      // The user leaves the app for C-TEX; this lets us verify when they come back.
      if (payload.referenceId) {
        savePendingCtex({
          reference: payload.referenceId,
          amount: payload.amount ?? numericAmount,
        });
      }

      window.location.assign(checkoutUrl);
    } catch (err) {
      setError(getErrorMessage(err));
      submittingRef.current = false;
      setIsLoading(false);
    }
  };

  return (
    <CtexPaymentShell
      title="Pay with C-TEX PAY"
      subtitle="You'll be taken to a secure checkout to complete this payment."
      onBack={isLoading ? undefined : onBack}
    >
      <div className="space-y-5">
        <div className="rounded-xl border border-border bg-bg p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted">
            Amount to fund
          </p>
          <p className="mt-1 text-2xl font-bold text-heading">
            {isAmountValid ? formatNaira(numericAmount) : "—"}
          </p>
        </div>

        {!isAmountValid && (
          <div
            role="alert"
            className="flex items-start gap-2 rounded-xl border border-border bg-bg p-3 text-sm text-muted"
          >
            <AlertCircle size={18} className="mt-0.5 shrink-0" />
            <span>
              Enter a valid amount of at least {formatNaira(MIN_AMOUNT)} to
              continue.
            </span>
          </div>
        )}

        {error && (
          <div
            role="alert"
            className="flex items-start gap-2 rounded-xl border border-red-500/40 bg-red-500/10 p-3 text-sm text-red-500"
          >
            <AlertCircle size={18} className="mt-0.5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <button
          type="button"
          onClick={handlePay}
          disabled={isLoading || !isAmountValid}
          className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-brand px-4 text-sm font-bold text-on-brand transition-colors hover:bg-brand disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isLoading ? (
            <>
              <Loader2 size={17} className="animate-spin" />
              Redirecting to checkout…
            </>
          ) : (
            <>
              Pay {isAmountValid ? formatNaira(numericAmount) : ""}
              <ArrowRight size={17} />
            </>
          )}
        </button>

        <p className="flex items-center justify-center gap-1.5 text-xs text-muted">
          <Lock size={13} />
          Secured by C-TEX PAY. Your wallet is credited once payment is
          confirmed.
        </p>
      </div>
    </CtexPaymentShell>
  );
}