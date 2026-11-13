import {
  AlertCircle,
  CheckCircle2,
  Clock,
  Loader2,
  RefreshCw,
  XCircle,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getCtexPaymentStatus } from "../../service/payment.js";
import CtexPaymentShell from "./CtexPaymentShell.jsx";
import { clearPendingCtex } from "./ctexStorage.js";

const POLL_INTERVAL_MS = 4000;
const MAX_ATTEMPTS = 40; // ~2.5 minutes, then we tell the user it's still processing

// Backend returns data.status as "PENDING" | "SUCCESS" | "FAILED"
const normalizeStatus = (res) => {
  const value = String(res?.data?.status ?? "").toUpperCase().trim();

  if (value === "SUCCESS") return "success";
  if (["FAILED", "EXPIRED", "CANCELLED"].includes(value)) return "failed";
  return "pending";
};

const formatNaira = (value) =>
  new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    maximumFractionDigits: 2,
  }).format(Number(value) || 0);

export default function CtexPaymentStatus({ reference, amount, onBack }) {
  const navigate = useNavigate();
  const [phase, setPhase] = useState("checking"); // checking | success | failed | timeout
  const [runId, setRunId] = useState(0);

  useEffect(() => {
    if (!reference) return undefined;

    const controller = new AbortController();
    let timer;
    let cancelled = false;
    let attempts = 0;

    const check = async () => {
      attempts += 1;

      try {
        const res = await getCtexPaymentStatus(reference, {
          signal: controller.signal,
        });
        if (cancelled) return;

        const status = normalizeStatus(res);

        if (status === "success") {
          clearPendingCtex();
          setPhase("success");
          return;
        }

        if (status === "failed") {
          clearPendingCtex();
          setPhase("failed");
          return;
        }
      } catch (err) {
        if (cancelled || err?.code === "ERR_CANCELED") return;
        // Network/server hiccup: keep polling until attempts run out.
      }

      if (attempts >= MAX_ATTEMPTS) {
        setPhase("timeout");
        return;
      }

      timer = setTimeout(check, POLL_INTERVAL_MS);
    };

    check();

    return () => {
      cancelled = true;
      controller.abort();
      clearTimeout(timer);
    };
  }, [reference, runId]);

  const recheck = () => {
    setPhase("checking");
    setRunId((id) => id + 1);
  };

  if (!reference) {
    return (
      <CtexPaymentShell title="Payment status" onBack={onBack}>
        <div className="space-y-4 text-center">
          <AlertCircle size={40} className="mx-auto text-muted" />
          <p className="text-sm text-muted">
            We couldn't find this payment in your session. If you were charged,
            your wallet will be credited automatically once C-TEX confirms the
            payment, and you'll get a notification.
          </p>
          <button
            type="button"
            onClick={() => navigate("/f/dashboard")}
            className="h-12 w-full rounded-xl bg-brand px-4 text-sm font-bold text-on-brand"
          >
            Back to dashboard
          </button>
        </div>
      </CtexPaymentShell>
    );
  }

  return (
    <CtexPaymentShell
      title="Payment status"
      subtitle={`Reference: ${reference}`}
      onBack={phase === "checking" ? undefined : onBack}
    >
      <div className="space-y-5 text-center" role="status" aria-live="polite">
        {phase === "checking" && (
          <>
            <Loader2 size={44} className="mx-auto animate-spin text-brand-text" />
            <div>
              <p className="text-base font-bold text-heading">
                Confirming your payment…
              </p>
              <p className="mt-1 text-sm text-muted">
                Please keep this page open. This usually takes a few seconds.
              </p>
            </div>
          </>
        )}

        {phase === "success" && (
          <>
            <CheckCircle2 size={48} className="mx-auto text-green-500" />
            <div>
              <p className="text-base font-bold text-heading">
                Payment successful
              </p>
              <p className="mt-1 text-sm text-muted">
                {amount
                  ? `${formatNaira(amount)} has been added to your wallet.`
                  : "Your wallet has been funded."}
              </p>
            </div>
            <button
              type="button"
              onClick={() => navigate("/f/dashboard")}
              className="h-12 w-full rounded-xl bg-brand px-4 text-sm font-bold text-on-brand transition-colors hover:bg-brand"
            >
              Go to dashboard
            </button>
          </>
        )}

        {phase === "failed" && (
          <>
            <XCircle size={48} className="mx-auto text-red-500" />
            <div>
              <p className="text-base font-bold text-heading">
                Payment not completed
              </p>
              <p className="mt-1 text-sm text-muted">
                The payment was cancelled, declined or expired. If money left
                your account, contact support with the reference above.
              </p>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <button
                type="button"
                onClick={onBack}
                className="h-12 rounded-xl bg-brand px-4 text-sm font-bold text-on-brand transition-colors hover:bg-brand"
              >
                Try again
              </button>
              <button
                type="button"
                onClick={() => navigate("/f/dashboard")}
                className="h-12 rounded-xl border border-border px-4 text-sm font-bold text-heading transition-colors hover:border-brand"
              >
                Dashboard
              </button>
            </div>
          </>
        )}

        {phase === "timeout" && (
          <>
            <Clock size={48} className="mx-auto text-muted" />
            <div>
              <p className="text-base font-bold text-heading">
                Still processing
              </p>
              <p className="mt-1 text-sm text-muted">
                We haven't received confirmation yet. If you completed the
                payment, your wallet will be credited automatically as soon as
                it's confirmed.
              </p>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <button
                type="button"
                onClick={recheck}
                className="flex h-12 items-center justify-center gap-2 rounded-xl bg-brand px-4 text-sm font-bold text-on-brand transition-colors hover:bg-brand"
              >
                <RefreshCw size={16} />
                Check again
              </button>
              <button
                type="button"
                onClick={() => navigate("/f/dashboard")}
                className="h-12 rounded-xl border border-border px-4 text-sm font-bold text-heading transition-colors hover:border-brand"
              >
                Dashboard
              </button>
            </div>
          </>
        )}
      </div>
    </CtexPaymentShell>
  );
}