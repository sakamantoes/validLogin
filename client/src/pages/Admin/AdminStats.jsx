import {
  AlertTriangle,
  BarChart3,
  CheckCircle2,
  Clock3,
  DollarSign,
  RefreshCw,
  TrendingUp,
  Users,
  Wallet,
  XCircle,
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { getCompanyStats } from "../../service/admin.js";

const FONT_DISPLAY = {
  fontFamily: "'Space Grotesk', ui-sans-serif, system-ui",
};

const FONT_MONO = {
  fontFamily: "'JetBrains Mono', ui-monospace, monospace",
};

const EMPTY_STATS = { wallet: {}, stats: {} };

const formatNaira = (value) =>
  `NGN ${Number(value || 0).toLocaleString("en-NG", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

const formatDollars = (value) =>
  `$${Number(value || 0).toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 4,
  })}`;

const formatNumber = (value) => Number(value || 0).toLocaleString("en-NG");

function MetricCard({ label, value, detail, icon: Icon, tone = "brand" }) {
  const tones = {
    brand: "bg-brand-soft text-brand-text",
    success: "bg-success-soft text-success",
    warning: "bg-warning-soft text-warning",
    danger: "bg-danger-soft text-danger",
    info: "bg-info-soft text-info",
  };

  return (
    <article className="group rounded-2xl border border-border bg-surface p-5 shadow-card transition-all duration-200 hover:-translate-y-0.5 hover:border-border-strong hover:shadow-lg">
      <div className="flex items-start justify-between gap-3">
        <div
          className={`grid h-10 w-10 place-items-center rounded-xl transition-transform duration-200 group-hover:scale-105 ${tones[tone]}`}
        >
          <Icon size={19} />
        </div>
        <span
          className="rounded-full border border-border bg-bg px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider text-muted"
          style={FONT_MONO}
        >
          {detail}
        </span>
      </div>
      <p
        className="mt-4 text-[10.5px] font-semibold uppercase tracking-widest text-muted"
        style={FONT_MONO}
      >
        {label}
      </p>
      <p
        className="mt-1.5 text-2xl font-bold tabular-nums tracking-tight text-heading"
        style={FONT_DISPLAY}
      >
        {value}
      </p>
    </article>
  );
}

function DepositRow({ label, amount, tone, Icon }) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-border py-3.5 last:border-b-0 last:pb-0 first:pt-0">
      <div className="flex min-w-0 items-center gap-3">
        <span
          className={`grid h-8 w-8 shrink-0 place-items-center rounded-lg ${tone}`}
        >
          <Icon size={16} />
        </span>
        <span className="truncate text-sm font-medium text-heading">
          {label}
        </span>
      </div>
      <span
        className="text-sm font-semibold tabular-nums text-heading"
        style={FONT_MONO}
      >
        {formatNaira(amount)}
      </span>
    </div>
  );
}

export default function AdminStats() {
  const [data, setData] = useState(EMPTY_STATS);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchStats = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      const response = await getCompanyStats();
      setData(response?.data || EMPTY_STATS);
    } catch (requestError) {
      console.error("Failed to fetch company stats:", requestError);
      setError(
        requestError?.response?.data?.message || "Unable to load company stats",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchStats();
  }, [fetchStats]);

  const wallet = data.wallet || {};
  const stats = data.stats || {};
  const deposits = stats.deposits || {};

  return (
    <div className="mx-auto w-full max-w-7xl space-y-6">
      {/* Page header */}
      <section className="slanted-page-header rounded-2xl border border-border bg-surface shadow-card">
        <div className="relative p-6 sm:p-8">
          <div className="relative flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <div
                className="mb-3 inline-flex items-center gap-2 rounded-full border border-border bg-brand px-3 py-1 text-[10.5px] font-semibold uppercase tracking-wider text-on-brand"
                style={FONT_MONO}
              >
                <BarChart3 size={12} />
                Company intelligence
              </div>
              <h2
                className="text-2xl font-bold tracking-tight text-heading sm:text-3xl"
                style={FONT_DISPLAY}
              >
                The numbers behind the operation.
              </h2>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-muted">
                Revenue, order health, deposits, and customer funds in one
                operational view.
              </p>
            </div>
            <button
              type="button"
              onClick={() => void fetchStats()}
              disabled={loading}
              title="Refresh company stats"
              className="inline-flex h-10 shrink-0 items-center justify-center gap-2 rounded-lg border border-border bg-surface px-4 text-sm font-medium text-heading transition-colors hover:border-brand hover:text-brand disabled:cursor-not-allowed disabled:opacity-60"
              style={FONT_MONO}
            >
              <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
              Refresh
            </button>
          </div>
        </div>
      </section>

      {/* Error banner */}
      {error && (
        <div className="flex items-center justify-between gap-4 rounded-xl border border-danger bg-danger-soft px-4 py-3 text-sm text-danger">
          <span style={FONT_MONO}>{error}</span>
          <button
            type="button"
            onClick={() => void fetchStats()}
            className="font-semibold underline"
            style={FONT_MONO}
          >
            Retry
          </button>
        </div>
      )}

      {/* Financial health section */}
      <section>
        <div className="mb-3 flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-brand-soft text-brand-text">
            <DollarSign size={15} />
          </div>
          <h3
            className="text-base font-semibold text-heading"
            style={FONT_DISPLAY}
          >
            Financial health
          </h3>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <MetricCard
            label="Net Revenue"
            value={formatNaira(wallet.totalRevenue)}
            detail="after refunds"
            icon={TrendingUp}
            tone="success"
          />
          <MetricCard
            label="Total Profit"
            value={formatNaira(wallet.totalProfit)}
            detail="estimated"
            icon={DollarSign}
          />
          <MetricCard
            label="Customer Liability"
            value={formatNaira(wallet.customerWalletLiability)}
            detail="wallet balances"
            icon={Users}
            tone="warning"
          />
          <MetricCard
            label="Provider Cost"
            value={formatDollars(wallet.totalProviderCost)}
            detail="USD"
            icon={Wallet}
            tone="info"
          />
        </div>
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          <MetricCard
            label="Successful Deposits"
            value={formatNaira(wallet.totalDeposit)}
            detail="confirmed"
            icon={CheckCircle2}
            tone="success"
          />
          <MetricCard
            label="Refunds"
            value={formatNaira(wallet.totalRefunds)}
            detail="successful OTP refunds"
            icon={RefreshCw}
            tone="warning"
          />
        </div>
      </section>

      {/* Order performance section */}
      <section>
        <div className="mb-3 flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-brand-soft text-brand-text">
            <BarChart3 size={15} />
          </div>
          <h3
            className="text-base font-semibold text-heading"
            style={FONT_DISPLAY}
          >
            Order performance
          </h3>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
          <MetricCard
            label="All Orders"
            value={formatNumber(stats.totalOrders)}
            detail="lifetime"
            icon={BarChart3}
          />
          <MetricCard
            label="Completed"
            value={formatNumber(stats.completedOrders)}
            detail="OTP received"
            icon={CheckCircle2}
            tone="success"
          />
          <MetricCard
            label="Pending"
            value={formatNumber(stats.pendingOrders)}
            detail="active"
            icon={Clock3}
            tone="warning"
          />
          <MetricCard
            label="Cancelled"
            value={formatNumber(stats.cancelledOrders)}
            detail="refunded"
            icon={RefreshCw}
            tone="info"
          />
          <MetricCard
            label="Failed"
            value={formatNumber(stats.failedOrders)}
            detail="terminal"
            icon={XCircle}
            tone="danger"
          />
          <MetricCard
            label="Success Rate"
            value={`${Number(stats.successRate || 0).toFixed(2)}%`}
            detail="terminal orders"
            icon={TrendingUp}
            tone="success"
          />
        </div>
      </section>

      {/* Deposit pipeline + At a glance */}
      <section className="grid gap-5 lg:grid-cols-[minmax(0,1.2fr)_minmax(280px,0.8fr)]">
        <div className="rounded-2xl border border-border bg-surface p-5 shadow-card sm:p-6">
          <div className="mb-5 flex items-start justify-between gap-4 border-b border-border pb-4">
            <div>
              <h3
                className="text-base font-semibold text-heading"
                style={FONT_DISPLAY}
              >
                Deposit pipeline
              </h3>
              <p className="mt-1 text-sm text-muted">
                Transaction value by current status.
              </p>
            </div>
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-brand-soft text-brand-text">
              <Wallet size={18} />
            </div>
          </div>
          <div>
            <DepositRow
              label="Successful deposits"
              amount={deposits.successful}
              tone="bg-success-soft text-success"
              Icon={CheckCircle2}
            />
            <DepositRow
              label="Pending deposits"
              amount={deposits.pending}
              tone="bg-warning-soft text-warning"
              Icon={Clock3}
            />
            <DepositRow
              label="Failed deposits"
              amount={deposits.failed}
              tone="bg-danger-soft text-danger"
              Icon={AlertTriangle}
            />
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-surface p-5 shadow-card sm:p-6">
          <div className="mb-5 flex items-start justify-between gap-4 border-b border-border pb-4">
            <div>
              <h3
                className="text-base font-semibold text-heading"
                style={FONT_DISPLAY}
              >
                At a glance
              </h3>
              <p className="mt-1 text-sm text-muted">
                The operational signals worth watching.
              </p>
            </div>
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-warning-soft text-warning">
              <AlertTriangle size={18} />
            </div>
          </div>
          <div className="space-y-4 text-sm">
            <div className="flex items-center justify-between gap-4 rounded-lg border border-border bg-bg px-3.5 py-3">
              <span
                className="text-xs font-medium uppercase tracking-wider text-muted"
                style={FONT_MONO}
              >
                Active orders
              </span>
              <strong
                className="text-sm font-semibold tabular-nums text-heading"
                style={FONT_MONO}
              >
                {formatNumber(stats.pendingOrders)}
              </strong>
            </div>
            <div className="flex items-center justify-between gap-4 rounded-lg border border-border bg-bg px-3.5 py-3">
              <span
                className="text-xs font-medium uppercase tracking-wider text-muted"
                style={FONT_MONO}
              >
                Failed orders
              </span>
              <strong
                className="text-sm font-semibold tabular-nums text-danger"
                style={FONT_MONO}
              >
                {formatNumber(stats.failedOrders)}
              </strong>
            </div>
            <div className="flex items-center justify-between gap-4 rounded-lg border border-border bg-bg px-3.5 py-3">
              <span
                className="text-xs font-medium uppercase tracking-wider text-muted"
                style={FONT_MONO}
              >
                Funds held for customers
              </span>
              <strong
                className="text-sm font-semibold tabular-nums text-heading"
                style={FONT_MONO}
              >
                {formatNaira(wallet.customerWalletLiability)}
              </strong>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}