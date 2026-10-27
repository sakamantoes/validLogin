// src/components/WalletBalanceCard.jsx
import { Eye, EyeOff, Loader2, RefreshCw, Wallet } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import useWallet from "../hooks/useWallet.js";

const FONT_DISPLAY = {
  fontFamily: "'Space Grotesk', ui-sans-serif, system-ui",
};
const FONT_MONO = { fontFamily: "'JetBrains Mono', ui-monospace, monospace" };

/* Format once, reused for every render */
const formatter = new Intl.NumberFormat("en-NG", {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

export default function WalletBalanceCard({
  label = "Wallet Balance",
  className = "",
}) {
  const navigate = useNavigate();
  const [showBalance, setShowBalance] = useState(false);
  const [mounted, setMounted] = useState(false);
  const { balance, isLoading, isError, refetch } = useWallet();

  /* Avoid SSR/hydration mismatch + skip the first "0.00" flash */
  useEffect(() => {
    setMounted(true);
  }, []);

  const formattedBalance = useMemo(
    () => formatter.format(Number(balance || 0)),
    [balance],
  );

  const walletDisplayValue = !mounted
    ? "\u00A0" // non-breaking space — keeps height, prevents flash
    : !showBalance
      ? "NGN ******"
      : `NGN ${formattedBalance}`;

  return (
    <div
      className={`
        group rounded-2xl border border-border bg-surface p-5 shadow-card
        transition-colors hover:border-border-strong
        ${className}
      `.trim()}
    >
      {/* Header row */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-soft text-brand-text">
          <Wallet size={19} />
        </div>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => setShowBalance((prev) => !prev)}
            className="flex h-10 w-10 items-center justify-center rounded-lg border border-border bg-bg-subtle p-2 text-muted transition-colors hover:text-heading focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
            aria-label={
              showBalance ? "Hide wallet balance" : "Show wallet balance"
            }
          >
            {showBalance ? <EyeOff size={14} /> : <Eye size={14} />}
          </button>
          <button
            type="button"
            onClick={() => {
              void refetch().catch(() => {});
            }}
            disabled={isLoading}
            className="flex h-10 w-10 items-center justify-center rounded-lg border border-border bg-bg-subtle p-2 text-muted transition-colors hover:text-heading focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand disabled:cursor-not-allowed disabled:opacity-60"
            aria-label="Refresh wallet balance"
          >
            <RefreshCw size={14} className={isLoading ? "animate-spin" : ""} />
          </button>
        </div>
      </div>

      {/* Label */}
      <p
        style={FONT_DISPLAY}
        className="mt-4 text-xs font-medium uppercase tracking-widest text-muted"
      >
        {label}
      </p>

      {/* Balance — fixed height, no layout shift */}
      <div className="mt-1 flex h-8 items-center">
        {!mounted || isLoading ? (
          <div className="flex items-center gap-2 text-sm text-muted">
            <Loader2 size={16} className="animate-spin text-brand" />
            <span style={FONT_DISPLAY}>Loading balance...</span>
          </div>
        ) : isError ? (
          <p style={FONT_DISPLAY} className="text-sm font-medium text-danger">
            Unable to load balance
          </p>
        ) : (
          <p
            style={FONT_MONO}
            className="text-2xl font-bold tabular-nums tracking-tight text-heading leading-none"
          >
            {walletDisplayValue}
          </p>
        )}
      </div>

      {/* Top-up button */}
      <button
        type="button"
        onClick={() => navigate("/f/fund-account")}
        style={FONT_DISPLAY}
        className="mt-4 flex h-10 w-full items-center justify-center gap-2 rounded-lg bg-brand font-semibold text-on-brand transition-colors hover:bg-brand-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand active:bg-brand-hover"
      >
        <Wallet size={15} />
        Top Up Wallet
      </button>
    </div>
  );
}
