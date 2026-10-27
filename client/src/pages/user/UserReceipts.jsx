import {
  AlertCircle,
  CheckCircle2,
  Clock3,
  Copy,
  FileText,
  Filter,
  Loader2,
  ReceiptText,
  RefreshCw,
  Search,
  Wallet,
  XCircle,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { toast } from "react-toastify";
import { getAlluserPurchaseReceipt } from "../../service/payment.js";

const FONT_DISPLAY = {
  fontFamily: "'Space Grotesk', ui-sans-serif, system-ui",
};

const FONT_MONO = {
  fontFamily: "'JetBrains Mono', ui-monospace, monospace",
};

const formatCurrency = (value) =>
  `NGN ${new Intl.NumberFormat("en-NG", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(Number(value || 0))}`;

const getObjectIdDate = (id) => {
  if (!id) return null;

  const timestamp = parseInt(String(id).slice(0, 8), 16);

  if (Number.isNaN(timestamp)) return null;

  return new Date(timestamp * 1000);
};

const formatReceiptDate = (receipt) => {
  const dateValue =
    receipt.createdAt || receipt.updatedAt || getObjectIdDate(receipt._id);

  if (!dateValue) return "No timestamp";

  const date = new Date(dateValue);

  if (Number.isNaN(date.getTime())) return "No timestamp";

  return date.toLocaleString();
};

const formatPurchaseType = (type) => {
  const typeMap = {
    LOG: "Log Purchase",
    OTP: "OTP Purchase",
  };

  return typeMap[type] || type || "Purchase";
};

const getStatusBadge = (status) => {
  switch (status) {
    case "SUCCESS":
      return {
        label: "Success",
        className: "border-success bg-success-soft text-success",
        icon: CheckCircle2,
      };

    case "FAILED":
      return {
        label: "Failed",
        className: "border-brand bg-brand text-on-brand",
        icon: XCircle,
      };

    default:
      return {
        label: "Pending",
        className: "border-warning bg-warning-soft text-warning",
        icon: Clock3,
      };
  }
};

export default function UserReceipts() {
  const [receipts, setReceipts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState("ALL");

  const fetchReceipts = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await getAlluserPurchaseReceipt();
      setReceipts(response?.data || []);
    } catch (err) {
      console.error("Failed to fetch receipts:", err);
      setError(err?.response?.data?.message || "Failed to load receipts");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReceipts();
  }, []);

  const filteredReceipts = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase();

    return receipts.filter((receipt) => {
      const receiptNo = String(receipt.receiptNo || "").toLowerCase();

      const matchesSearch =
        normalizedSearch.length === 0 || receiptNo.includes(normalizedSearch);

      const matchesType =
        typeFilter === "ALL" || receipt.purchaseType === typeFilter;

      return matchesSearch && matchesType;
    });
  }, [receipts, searchTerm, typeFilter]);

  const successfulReceipts = receipts.filter(
    (receipt) => receipt.status === "SUCCESS",
  ).length;

  const pendingReceipts = receipts.filter(
    (receipt) => receipt.status === "PENDING",
  ).length;

  const totalSpent = receipts
    .filter((receipt) => receipt.status === "SUCCESS")
    .reduce((sum, receipt) => sum + Number(receipt.amount || 0), 0);

  const handleCopyReceipt = async (receiptNo) => {
    try {
      await navigator.clipboard.writeText(receiptNo);
      toast.success("Receipt ID copied");
    } catch (err) {
      toast.error("Failed to copy receipt ID");
    }
  };

  const stats = [
    {
      label: "Total Receipts",
      value: receipts.length,
      change: "All purchases",
      icon: FileText,
      iconBg: "bg-brand",
      iconColor: "text-brand-text",
      changeBg: "bg-surface text-muted border-border",
    },
    {
      label: "Successful",
      value: successfulReceipts,
      change: "Completed",
      icon: CheckCircle2,
      iconBg: "bg-success-soft",
      iconColor: "text-success",
      changeBg: "bg-success-soft text-success border-success",
    },
    {
      label: "Pending",
      value: pendingReceipts,
      change: "Processing",
      icon: Clock3,
      iconBg: "bg-warning-soft",
      iconColor: "text-warning",
      changeBg: "bg-warning-soft text-warning border-warning",
    },
    {
      label: "Total Spent",
      value: formatCurrency(totalSpent),
      change: "Confirmed",
      icon: Wallet,
      iconBg: "bg-info-soft",
      iconColor: "text-info",
      changeBg: "bg-surface text-muted border-border",
    },
  ];

  return (
    <div className="mx-auto w-full max-w-[1500px] space-y-8">
      {/* =========================================================
          PAGE HEADER
      ========================================================== */}
      <header className="slanted-page-header rounded-2xl border border-border bg-surface px-6 py-7 shadow-card sm:px-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            <div className="mb-3 flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-success" />

              <p
                style={FONT_DISPLAY}
                className="text-[11px] font-semibold uppercase tracking-[0.2em] text-muted"
              >
                Account activity
              </p>
            </div>

            <h1
              style={FONT_DISPLAY}
              className="text-3xl font-bold tracking-tight text-heading sm:text-4xl"
            >
              Purchase Receipts
            </h1>

            <p className="mt-3 max-w-xl text-sm leading-6 text-muted">
              View and manage your purchase history, receipt details, and
              transaction records.
            </p>
          </div>

          <div className="flex shrink-0 items-center gap-3 rounded-xl border border-border bg-bg px-4 py-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-success-soft text-success">
              <ReceiptText size={15} />
            </div>

            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-muted">
                Records
              </p>

              <p
                style={FONT_MONO}
                className="mt-0.5 text-sm font-semibold text-heading"
              >
                {receipts.length}
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* =========================================================
          STATS
      ========================================================== */}
      <section className="grid grid-cols-1 gap-px overflow-hidden rounded-2xl border border-border bg-border sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="group relative bg-surface px-5 py-6 transition-colors hover:bg-surface-raised sm:px-6"
          >
            <div className="flex items-start justify-between gap-4">
              <div
                className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${stat.iconBg} ${stat.iconColor}`}
              >
                <stat.icon size={19} />
              </div>

              <span
                style={FONT_DISPLAY}
                className={`rounded-full border px-2.5 py-1 text-[10px] font-semibold ${stat.changeBg}`}
              >
                {stat.change}
              </span>
            </div>

            <div className="mt-7">
              <p
                style={FONT_DISPLAY}
                className="text-[10px] font-semibold uppercase tracking-[0.16em] text-muted"
              >
                {stat.label}
              </p>

              <p
                style={stat.label === "Total Spent" ? FONT_MONO : FONT_DISPLAY}
                className="mt-2 truncate text-2xl font-bold tracking-tight text-heading"
              >
                {stat.value}
              </p>
            </div>
          </div>
        ))}
      </section>

      {/* =========================================================
          RECEIPTS WORKSPACE
      ========================================================== */}
      <section className="overflow-hidden rounded-2xl border border-border bg-surface shadow-card">
        {/* ---------------------------------------------------------
            WORKSPACE HEADER
        ---------------------------------------------------------- */}
        <div className="border-b border-border px-5 py-5 sm:px-6">
          <div className="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-soft text-brand-text">
                <ReceiptText size={18} />
              </div>

              <div>
                <h2
                  style={FONT_DISPLAY}
                  className="text-base font-semibold text-heading"
                >
                  Receipt Records
                </h2>

                <p className="mt-0.5 text-xs text-muted">
                  {filteredReceipts.length} result
                  {filteredReceipts.length === 1 ? "" : "s"} found
                </p>
              </div>
            </div>

            <div className="flex flex-col gap-2 sm:flex-row">
              {/* Search */}
              <div className="relative min-w-0 sm:min-w-[280px]">
                <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />

                <input
                  type="search"
                  value={searchTerm}
                  onChange={(event) => setSearchTerm(event.target.value)}
                  placeholder="Search receipt ID"
                  className="h-10 w-full rounded-lg border border-border bg-bg py-2 pl-10 pr-4 text-sm text-heading outline-none transition-colors placeholder:text-muted focus:border-brand focus:ring-1 focus:ring-focus-ring"
                />
              </div>

              {/* Filter */}
              <div className="relative">
                <Filter className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />

                <select
                  value={typeFilter}
                  onChange={(event) => setTypeFilter(event.target.value)}
                  className="h-10 w-full min-w-[160px] appearance-none rounded-lg border border-border bg-bg py-2 pl-10 pr-9 text-sm text-heading outline-none transition-colors focus:border-brand focus:ring-1 focus:ring-focus-ring"
                >
                  <option value="ALL">All Types</option>
                  <option value="LOG">Log Purchase</option>
                  <option value="OTP">OTP Purchase</option>
                </select>
              </div>

              {/* Refresh */}
              <button
                type="button"
                onClick={() => {
                  void fetchReceipts();
                }}
                disabled={loading}
                className="flex h-10 shrink-0 items-center justify-center gap-2 rounded-lg border border-border bg-bg px-3 text-sm font-medium text-muted transition-colors hover:border-brand hover:bg-surface-raised hover:text-heading disabled:cursor-not-allowed disabled:opacity-60"
                aria-label="Refresh receipts"
              >
                <RefreshCw
                  size={15}
                  className={loading ? "animate-spin" : ""}
                />

                <span className="sm:hidden">Refresh</span>
              </button>
            </div>
          </div>
        </div>

        {/* ---------------------------------------------------------
            TABLE HEADER
        ---------------------------------------------------------- */}
        {!loading && !error && filteredReceipts.length > 0 && (
          <div
            style={FONT_DISPLAY}
            className="hidden border-b border-border bg-bg px-6 py-3 text-[10px] font-semibold uppercase tracking-[0.14em] text-muted lg:grid lg:grid-cols-[minmax(240px,1.5fr)_minmax(160px,1fr)_minmax(160px,1fr)_minmax(180px,1fr)_auto] lg:items-center lg:gap-6"
          >
            <span>Receipt</span>
            <span>Balance Before</span>
            <span>Balance After</span>
            <span>Date</span>
            <span>Status</span>
          </div>
        )}

        {/* ---------------------------------------------------------
            STATES
        ---------------------------------------------------------- */}
        {loading ? (
          <div className="flex min-h-[360px] items-center justify-center">
            <div className="flex flex-col items-center gap-3">
              <Loader2 className="h-7 w-7 animate-spin text-brand-text" />

              <p style={FONT_DISPLAY} className="text-sm text-muted">
                Loading receipt records...
              </p>
            </div>
          </div>
        ) : error ? (
          <div className="flex min-h-[360px] flex-col items-center justify-center px-5 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-brand-soft text-brand-text">
              <AlertCircle size={21} />
            </div>

            <p
              style={FONT_DISPLAY}
              className="mt-4 text-sm font-semibold text-heading"
            >
              Unable to load receipts
            </p>

            <p className="mt-1 max-w-sm text-sm text-muted">{error}</p>

            <button
              type="button"
              onClick={() => void fetchReceipts()}
              className="mt-5 inline-flex items-center gap-2 rounded-lg border border-border bg-surface px-4 py-2 text-sm font-medium text-heading transition-colors hover:border-brand"
            >
              <RefreshCw size={14} />
              Try again
            </button>
          </div>
        ) : filteredReceipts.length === 0 ? (
          <div className="flex min-h-[360px] flex-col items-center justify-center px-5 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-bg text-muted">
              <ReceiptText size={28} />
            </div>

            <h3
              style={FONT_DISPLAY}
              className="mt-5 text-base font-semibold text-heading"
            >
              No receipts found
            </h3>

            <p className="mt-1 max-w-sm text-sm leading-6 text-muted">
              No receipt records match the current search or filter.
            </p>
          </div>
        ) : (
          /* ---------------------------------------------------------
             RECEIPT LIST
          ---------------------------------------------------------- */
          <div className="divide-y divide-border">
            {filteredReceipts.map((receipt) => {
              const statusBadge = getStatusBadge(receipt.status);
              const StatusIcon = statusBadge.icon;

              return (
                <article
                  key={receipt._id}
                  className="group px-5 py-5 transition-colors hover:bg-bg sm:px-6"
                >
                  {/* =================================================
                      DESKTOP
                  ================================================== */}
                  <div className="hidden lg:grid lg:grid-cols-[minmax(240px,1.5fr)_minmax(160px,1fr)_minmax(160px,1fr)_minmax(180px,1fr)_auto] lg:items-center lg:gap-6">
                    {/* Receipt */}
                    <div className="min-w-0">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-bg text-muted">
                          <ReceiptText size={17} />
                        </div>

                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <p
                              style={FONT_MONO}
                              className="truncate text-sm font-semibold text-heading"
                            >
                              {formatCurrency(receipt.amount, receipt.currency)}
                            </p>

                            <span
                              style={FONT_DISPLAY}
                              className="shrink-0 rounded-full border border-border bg-surface px-2 py-0.5 text-[10px] font-medium text-muted"
                            >
                              {formatPurchaseType(receipt.purchaseType)}
                            </span>
                          </div>

                          <button
                            type="button"
                            onClick={() => handleCopyReceipt(receipt.receiptNo)}
                            disabled={!receipt.receiptNo}
                            className="mt-1 flex max-w-full items-center gap-1.5 text-left text-[11px] text-muted transition-colors hover:text-heading disabled:cursor-not-allowed"
                          >
                            <span style={FONT_MONO} className="truncate">
                              {receipt.receiptNo || "N/A"}
                            </span>

                            <Copy size={11} className="shrink-0" />
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Balance Before */}
                    <div>
                      <p
                        style={FONT_DISPLAY}
                        className="text-[10px] font-semibold uppercase tracking-wider text-muted"
                      >
                        Balance Before
                      </p>

                      <p
                        style={FONT_MONO}
                        className="mt-1 text-sm font-medium text-heading"
                      >
                        {formatCurrency(
                          receipt.balanceBefore,
                          receipt.currency,
                        )}
                      </p>
                    </div>

                    {/* Balance After */}
                    <div>
                      <p
                        style={FONT_DISPLAY}
                        className="text-[10px] font-semibold uppercase tracking-wider text-muted"
                      >
                        Balance After
                      </p>

                      <p
                        style={FONT_MONO}
                        className="mt-1 text-sm font-medium text-heading"
                      >
                        {formatCurrency(receipt.balanceAfter, receipt.currency)}
                      </p>
                    </div>

                    {/* Date */}
                    <div>
                      <p
                        style={FONT_DISPLAY}
                        className="text-[10px] font-semibold uppercase tracking-wider text-muted"
                      >
                        Date
                      </p>

                      <p className="mt-1 text-sm text-muted">
                        {formatReceiptDate(receipt)}
                      </p>
                    </div>

                    {/* Status */}
                    <div className="flex justify-end">
                      <span
                        style={FONT_DISPLAY}
                        className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-medium ${statusBadge.className}`}
                      >
                        <StatusIcon size={12} />
                        {statusBadge.label}
                      </span>
                    </div>
                  </div>

                  {/* =================================================
                      MOBILE / TABLET
                  ================================================== */}
                  <div className="lg:hidden">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex min-w-0 items-center gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-bg text-muted">
                          <ReceiptText size={17} />
                        </div>

                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <p
                              style={FONT_MONO}
                              className="text-sm font-semibold text-heading"
                            >
                              {formatCurrency(receipt.amount, receipt.currency)}
                            </p>

                            <span
                              style={FONT_DISPLAY}
                              className="rounded-full border border-border bg-surface px-2 py-0.5 text-[10px] font-medium text-muted"
                            >
                              {formatPurchaseType(receipt.purchaseType)}
                            </span>
                          </div>

                          <p
                            style={FONT_MONO}
                            className="mt-1 truncate text-[11px] text-muted"
                          >
                            {receipt.receiptNo || "N/A"}
                          </p>
                        </div>
                      </div>

                      <span
                        style={FONT_DISPLAY}
                        className={`inline-flex shrink-0 items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-medium ${statusBadge.className}`}
                      >
                        <StatusIcon size={12} />
                        {statusBadge.label}
                      </span>
                    </div>

                    <div className="mt-5 grid grid-cols-2 gap-x-5 gap-y-4 border-t border-border pt-4 sm:grid-cols-4">
                      <div>
                        <p
                          style={FONT_DISPLAY}
                          className="text-[10px] font-semibold uppercase tracking-wider text-muted"
                        >
                          Balance Before
                        </p>

                        <p
                          style={FONT_MONO}
                          className="mt-1 text-sm font-medium text-heading"
                        >
                          {formatCurrency(
                            receipt.balanceBefore,
                            receipt.currency,
                          )}
                        </p>
                      </div>

                      <div>
                        <p
                          style={FONT_DISPLAY}
                          className="text-[10px] font-semibold uppercase tracking-wider text-muted"
                        >
                          Balance After
                        </p>

                        <p
                          style={FONT_MONO}
                          className="mt-1 text-sm font-medium text-heading"
                        >
                          {formatCurrency(
                            receipt.balanceAfter,
                            receipt.currency,
                          )}
                        </p>
                      </div>

                      <div>
                        <p
                          style={FONT_DISPLAY}
                          className="text-[10px] font-semibold uppercase tracking-wider text-muted"
                        >
                          Date
                        </p>

                        <p className="mt-1 text-sm text-muted">
                          {formatReceiptDate(receipt)}
                        </p>
                      </div>

                      <div className="flex items-end sm:justify-end">
                        <button
                          type="button"
                          onClick={() => handleCopyReceipt(receipt.receiptNo)}
                          disabled={!receipt.receiptNo}
                          className="inline-flex items-center gap-2 rounded-lg border border-border bg-bg px-3 py-2 text-xs font-medium text-muted transition-colors hover:border-brand hover:bg-surface hover:text-heading disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          <Copy size={13} />
                          Copy ID
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* =================================================
                      DESCRIPTION
                  ================================================== */}
                  {receipt.description ? (
                    <div className="mt-4 border-t border-border pt-3 lg:ml-[52px]">
                      <p className="text-xs leading-5 text-muted">
                        {receipt.description}
                      </p>
                    </div>
                  ) : null}
                </article>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
