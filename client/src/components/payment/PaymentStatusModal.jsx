import { CheckCircle2, Clock3, X, XCircle } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { getSquadPaymentStatus } from "../../service/payment";

const POLL_INTERVAL_MS = 3000;
const MAX_POLLS = 20; // ~60s of waiting for the webhook to land

const statusContent = {
  success: {
    title: "Payment Successful",
    message:
      "Your payment was completed successfully. Your wallet will update shortly.",
    icon: CheckCircle2,
    iconClass: "bg-success-soft text-success",
    buttonClass: "bg-success-soft hover:bg-success-soft",
  },
  pending: {
    title: "Payment Pending",
    message:
      "Your payment is still being confirmed. We will update your wallet once it clears.",
    icon: Clock3,
    iconClass: "bg-warning-soft text-warning",
    buttonClass: "bg-brand text-on-brand hover:bg-brand",
  },
  failed: {
    title: "Payment Failed",
    message:
      "We could not confirm this payment. Please try again or use another payment method.",
    icon: XCircle,
    iconClass: "bg-brand text-on-brand",
    buttonClass: "bg-brand text-on-brand hover:bg-brand",
  },
};

export default function PaymentStatusModal() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [transactionStatus, setTransactionStatus] = useState("pending");
  const [isLoading, setIsLoading] = useState(true);
  const [statusError, setStatusError] = useState("");
  const pollCount = useRef(0);

  // Squad, Quest and ctex all land here with a different param name.
  const reference =
    searchParams.get("referenceId") ||
    searchParams.get("transaction_reference") ||
    searchParams.get("transaction_ref") ||
    searchParams.get("reference") ||
    searchParams.get("tx_ref") ||
    searchParams.get("paymentReference") ||
    searchParams.get("payment_reference") ||
    searchParams.get("merchantReference");

  const content = statusContent[transactionStatus] || {
    title: "Payment Status Unavailable",
    message:
      statusError ||
      "We could not read the payment status from this redirect link.",
    icon: Clock3,
    iconClass: "bg-surface text-muted",
    buttonClass: "bg-brand text-on-brand hover:bg-brand",
  };

  const Icon = content.icon;

  useEffect(() => {
    let cancelled = false;
    let timer = null;
    pollCount.current = 0;

    const fetchPaymentStatus = async () => {
      if (!reference) {
        setTransactionStatus("unavailable");
        setStatusError("No payment reference was found in this redirect link.");
        setIsLoading(false);
        return;
      }

      try {
        const response = await getSquadPaymentStatus({
          referenceId: reference,
        });
        if (cancelled) return;

        const status = String(response?.data?.status || "").toLowerCase();
        setStatusError("");

        if (status === "pending" && pollCount.current < MAX_POLLS) {
          // Redirect often beats the webhook; keep checking for a while.
          pollCount.current += 1;
          setTransactionStatus("pending");
          timer = setTimeout(fetchPaymentStatus, POLL_INTERVAL_MS);
          return;
        }

        setTransactionStatus(statusContent[status] ? status : "pending");
        setIsLoading(false);
      } catch (error) {
        if (cancelled) return;
        setTransactionStatus("unavailable");
        setStatusError(
          error?.data?.message ||
            error?.response?.data?.message ||
            "We could not verify this payment status. Please try again.",
        );
        setIsLoading(false);
      }
    };

    setIsLoading(true);
    fetchPaymentStatus();

    return () => {
      cancelled = true;
      if (timer) clearTimeout(timer);
    };
  }, [reference]);

  const handleClose = () => {
    navigate("/f/dashboard", { replace: true });
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-bg px-4 py-6">
      <div className="w-full max-w-md overflow-hidden rounded-2xl border border-border bg-surface-raised shadow-card">
        <div className="flex justify-end px-4 pt-4">
          <button
            type="button"
            onClick={handleClose}
            aria-label="Close payment status"
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-border text-muted transition-colors hover:border-brand hover:text-heading"
          >
            <X size={18} />
          </button>
        </div>

        <div className="px-6 pb-6 pt-1 text-center">
          <div
            className={`mx-auto flex h-16 w-16 items-center justify-center rounded-full ${content.iconClass}`}
          >
            <Icon size={32} />
          </div>

          <h2 className="mt-5 text-xl font-bold text-heading">
            {isLoading ? "Checking Payment Status" : content.title}
          </h2>
          <p className="mt-2 text-sm leading-6 text-muted">
            {isLoading
              ? "Please wait while we confirm your payment with the server."
              : content.message}
          </p>

          {reference && (
            <div className="mt-5 rounded-xl border border-border bg-bg p-4 text-left">
              <p className="text-xs font-semibold uppercase tracking-widest text-muted">
                Reference
              </p>
              <p className="mt-1 break-all font-mono text-sm font-semibold text-heading">
                {reference}
              </p>
            </div>
          )}

          <button
            type="button"
            onClick={handleClose}
            disabled={isLoading}
            className={`mt-6 flex h-11 w-full items-center justify-center rounded-xl px-4 text-sm font-bold transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${content.buttonClass}`}
          >
            {isLoading ? "Checking..." : "Okay"}
          </button>
        </div>
      </div>
    </div>
  );
}