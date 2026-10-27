import {
  AlertCircle,
  CheckCircle2,
  Clock3,
  Copy,
  CreditCard,
  Eye,
  FileText,
  Filter,
  Loader2,
  RefreshCw,
  Search,
  Wallet,
  X,
} from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import Pagination from "../../components/ui/Pagination.jsx";
import StatCard from "../../components/ui/StatCard.jsx";
import TransactionStatusBadge from "../../components/ui/TransactionStatusBadge.jsx";
import { getAllUserDeposits } from "../../service/wallet.js";
import {
  DATE_FILTER_OPTIONS,
  formatCurrency,
  formatPaymentMethod,
  formatTransactionDate,
} from "../../utils/transaction.js";

const ITEMS_PER_PAGE = 8;

const isManualReceipt = (deposit) => {
  const reference = String(deposit?.referenceId || "");

  return (
    deposit?.paymentMethod === "MANUAL_TRANSFER" &&
    /^https?:\/\/.+\.(png|jpe?g|webp|gif|avif)(\?.*)?$/i.test(reference)
  );
};

const emptySummary = {
  total: 0,
  successful: 0,
  pending: 0,
  failed: 0,
  confirmedValue: 0,
};

export default function UserDeposits() {
  const [deposits, setDeposits] = useState([]);
  const [summary, setSummary] = useState(emptySummary);
  const [totalPages, setTotalPages] = useState(1);
  const [totalResults, setTotalResults] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [methodFilter, setMethodFilter] = useState("ALL");
  const [dateFilter, setDateFilter] = useState("ALL");
  const [searchTerm, setSearchTerm] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [page, setPage] = useState(1);
  const [receiptPreview, setReceiptPreview] = useState(null);

  const fetchDeposits = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await getAllUserDeposits({
        page,
        limit: ITEMS_PER_PAGE,
        status: statusFilter,
        paymentMethod: methodFilter,
        dateFilter,
        search: searchTerm || undefined,
      });

      setDeposits(response?.data || []);
      setSummary(response?.summary || emptySummary);
      setTotalPages(response?.pagination?.totalPages || 1);
      setTotalResults(
        response?.pagination?.total ?? response?.data?.length ?? 0,
      );
    } catch (err) {
      console.error("Failed to fetch deposits:", err);
      setError(
        err?.response?.data?.message || "Failed to load deposit history",
      );
    } finally {
      setLoading(false);
    }
  };

  // Debounce free-text search before it drives a request.
  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      setSearchTerm(searchInput.trim());
    }, 350);

    return () => window.clearTimeout(timeoutId);
  }, [searchInput]);

  // Any filter change should return the user to page 1.
  useEffect(() => {
    setPage(1);
  }, [statusFilter, methodFilter, dateFilter, searchTerm]);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      void fetchDeposits();
    }, 0);

    return () => window.clearTimeout(timeoutId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, statusFilter, methodFilter, dateFilter, searchTerm]);

  const stats = [
    {
      label: "Total Deposits",
      value: summary.total,
      change: "All requests",
      icon: FileText,
      iconBg: "bg-brand",
      iconColor: "text-brand-text",
      changeBg: "bg-surface text-muted border-border",
    },
    {
      label: "Successful",
      value: summary.successful,
      change: "Confirmed",
      icon: CheckCircle2,
      iconBg: "bg-success-soft",
      iconColor: "text-success",
      changeBg: "bg-success-soft text-success border-success",
    },
    {
      label: "Pending",
      value: summary.pending,
      change: "Awaiting review",
      icon: Clock3,
      iconBg: "bg-warning-soft",
      iconColor: "text-warning",
      changeBg: "bg-warning-soft text-warning border-warning",
    },
    {
      label: "Confirmed Value",
      value: formatCurrency(summary.confirmedValue),
      change: `${summary.failed} failed`,
      icon: Wallet,
      iconBg: "bg-info-soft",
      iconColor: "text-info",
      changeBg: "bg-surface text-muted border-border",
    },
  ];

  const handleCopyReference = async (referenceId) => {
    try {
      await navigator.clipboard.writeText(referenceId);
      toast.success("Reference copied");
    } catch {
      toast.error("Failed to copy reference");
    }
  };

  const renderReference = (deposit) => {
    if (isManualReceipt(deposit)) {
      return (
        <button
          type="button"
          onClick={() => setReceiptPreview(deposit.referenceId)}
          className="group flex items-center gap-2 rounded-lg border border-border bg-bg px-2 py-1.5 text-xs font-medium text-muted transition-colors hover:border-brand hover:bg-surface hover:text-heading"
        >
          <img
            src={deposit.referenceId}
            alt="Manual deposit receipt"
            className="h-7 w-7 rounded object-cover"
          />
          <Eye size={13} />
          View
        </button>
      );
    }

    return (
      <button
        type="button"
        onClick={() => handleCopyReference(deposit.referenceId)}
        disabled={!deposit.referenceId}
        className="inline-flex max-w-40 items-center gap-2 rounded-lg border border-border bg-bg px-3 py-2 text-xs font-medium text-muted transition-colors hover:border-brand hover:bg-surface hover:text-heading disabled:cursor-not-allowed disabled:opacity-50"
      >
        <Copy size={13} />
        <span className="truncate font-mono">
          {deposit.referenceId || "N/A"}
        </span>
      </button>
    );
  };

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      {/* Deposit summary — 4-up KPI strip */}
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => (
          <StatCard key={stat.label} {...stat} />
        ))}
      </section>

      {/* Deposit records */}
      <section className="overflow-hidden rounded-2xl border border-border bg-surface shadow-card">
        {/* Header bar — title on the left, refresh on the right */}
        <div className="flex flex-col gap-3 border-b border-border bg-bg px-6 py-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-base font-semibold text-heading">
              Deposit Records
            </h2>
            <p className="mt-1 text-xs text-muted">
              {totalResults} result
              {totalResults === 1 ? "" : "s"}
            </p>
          </div>
          <button
            type="button"
            onClick={() => void fetchDeposits()}
            disabled={loading}
            className="inline-flex h-10 items-center gap-2 self-start rounded-lg border border-border bg-bg px-4 text-sm font-medium text-muted transition-colors hover:border-brand hover:bg-surface hover:text-heading disabled:cursor-not-allowed disabled:opacity-60 sm:self-auto"
          >
            <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
            Refresh
          </button>
        </div>

        {/* Filters toolbar — search spans full width on its own row, then
            3 dropdowns sit in an even grid below it. */}
        <div className="space-y-3 border-b border-border px-6 py-5">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
            <input
              value={searchInput}
              onChange={(event) => setSearchInput(event.target.value)}
              placeholder="Search depositor, reference, order ID"
              className="h-11 w-full rounded-lg border border-border bg-bg py-2 pl-10 pr-4 text-sm text-heading placeholder:text-muted focus:border-brand focus:outline-none focus:ring-1 focus:ring-focus-ring"
            />
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            <div className="relative">
              <Filter className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
              <select
                value={statusFilter}
                onChange={(event) => setStatusFilter(event.target.value)}
                className="h-11 w-full rounded-lg border border-border bg-bg py-2 pl-10 pr-4 text-sm text-heading focus:border-brand focus:outline-none focus:ring-1 focus:ring-focus-ring"
              >
                <option value="ALL">All Statuses</option>
                <option value="SUCCESS">Success</option>
                <option value="PENDING">Pending</option>
                <option value="FAILED">Failed</option>
              </select>
            </div>

            <select
              value={methodFilter}
              onChange={(event) => setMethodFilter(event.target.value)}
              className="h-11 w-full rounded-lg border border-border bg-bg px-4 py-2 text-sm text-heading focus:border-brand focus:outline-none focus:ring-1 focus:ring-focus-ring"
            >
              <option value="ALL">All Methods</option>
              <option value="MANUAL_TRANSFER">Manual Transfer</option>
              <option value="SQUAD">Squad</option>
              <option value="ALAT">ALAT</option>
            </select>

            <select
              value={dateFilter}
              onChange={(event) => setDateFilter(event.target.value)}
              className="h-11 w-full rounded-lg border border-border bg-bg px-4 py-2 text-sm text-heading focus:border-brand focus:outline-none focus:ring-1 focus:ring-focus-ring"
            >
              {DATE_FILTER_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-brand-text" />
          </div>
        ) : error ? (
          <div className="flex items-center justify-center gap-2 px-6 py-14 text-brand-text">
            <AlertCircle size={18} />
            <span>{error}</span>
          </div>
        ) : deposits.length === 0 ? (
          <div className="px-6 py-16 text-center">
            <CreditCard size={42} className="mx-auto text-muted" />
            <h3 className="mt-4 text-lg font-semibold text-heading">
              No deposits found
            </h3>
            <p className="mt-1 text-sm text-muted">
              There are no deposit records matching the current filters.
            </p>
          </div>
        ) : (
          <>
            {/* Desktop table */}
            <div className="hidden overflow-x-auto lg:block">
              <table className="min-w-full divide-y divide-border">
                <thead className="bg-bg">
                  <tr>
                    {[
                      "Depositor",
                      "Amount",
                      "Method",
                      "Status",
                      "Reference",
                      "Date",
                      "Action",
                    ].map((heading) => (
                      <th
                        key={heading}
                        className="px-6 py-3.5 text-left text-xs font-semibold uppercase tracking-widest text-muted"
                      >
                        {heading}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {deposits.map((deposit) => (
                    <tr
                      key={deposit._id}
                      className="transition-colors hover:bg-surface"
                    >
                      <td className="px-6 py-4">
                        <p className="font-semibold text-heading">
                          {deposit.depositorName || "N/A"}
                        </p>
                        <p className="mt-1 text-xs text-muted">
                          {deposit.orderId || "No order ID"}
                        </p>
                      </td>
                      <td className="px-6 py-4 font-semibold text-heading">
                        {formatCurrency(deposit.amount)}
                      </td>
                      <td className="px-6 py-4 text-sm text-muted">
                        {formatPaymentMethod(deposit.paymentMethod)}
                      </td>
                      <td className="px-6 py-4">
                        <TransactionStatusBadge status={deposit.status} />
                      </td>
                      <td className="px-6 py-4">{renderReference(deposit)}</td>
                      <td className="px-6 py-4 text-sm text-muted">
                        {formatTransactionDate(deposit)}
                      </td>
                      <td className="px-6 py-4">
                        <button
                          type="button"
                          onClick={() =>
                            handleCopyReference(deposit.referenceId)
                          }
                          disabled={!deposit.referenceId}
                          className="inline-flex h-9 items-center gap-2 rounded-lg border border-border bg-bg px-3 text-sm font-medium text-muted transition-colors hover:border-brand hover:bg-surface hover:text-heading disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          <Copy size={14} />
                          Copy Ref
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile cards */}
            <div className="grid gap-3 p-4 lg:hidden">
              {deposits.map((deposit) => (
                <article
                  key={deposit._id}
                  className="rounded-xl border border-border bg-bg p-4"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="truncate font-semibold text-heading">
                        {deposit.depositorName || "N/A"}
                      </p>
                      <p className="mt-1 text-xs text-muted">
                        {formatTransactionDate(deposit)}
                      </p>
                    </div>
                    <TransactionStatusBadge status={deposit.status} />
                  </div>
                  <div className="mt-4 grid gap-2 text-sm text-muted">
                    <p className="flex justify-between gap-3">
                      <span className="text-muted">Amount</span>
                      <span className="font-semibold text-heading">
                        {formatCurrency(deposit.amount)}
                      </span>
                    </p>
                    <p className="flex justify-between gap-3">
                      <span className="text-muted">Method</span>
                      <span>{formatPaymentMethod(deposit.paymentMethod)}</span>
                    </p>
                    <p className="flex items-center justify-between gap-3">
                      <span className="text-muted">
                        {isManualReceipt(deposit) ? "Receipt" : "Reference"}
                      </span>
                      {renderReference(deposit)}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleCopyReference(deposit.referenceId)}
                    disabled={!deposit.referenceId}
                    className="mt-4 flex h-10 w-full items-center justify-center gap-2 rounded-lg border border-border bg-bg text-sm font-medium text-muted transition-colors hover:border-brand hover:bg-surface hover:text-heading disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <Copy size={14} />
                    Copy Ref
                  </button>
                </article>
              ))}
            </div>

            <div className="border-t border-border px-6 py-4">
              <Pagination
                page={page}
                totalPages={totalPages}
                onPageChange={setPage}
              />
            </div>
          </>
        )}
      </section>

      {receiptPreview ? (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-bg p-4">
          <button
            type="button"
            aria-label="Close receipt preview"
            className="absolute inset-0"
            onClick={() => setReceiptPreview(null)}
          />
          <div className="relative max-h-[92vh] w-full max-w-3xl overflow-hidden rounded-2xl border border-border bg-surface-raised shadow-card">
            <div className="flex items-center justify-between gap-4 border-b border-border px-6 py-4">
              <h3 className="font-semibold text-heading">Payment Receipt</h3>
              <button
                type="button"
                aria-label="Close receipt preview"
                onClick={() => setReceiptPreview(null)}
                className="flex h-9 w-9 items-center justify-center rounded-lg text-muted transition-colors hover:bg-surface hover:text-heading"
              >
                <X size={18} />
              </button>
            </div>
            <div className="max-h-[80vh] overflow-auto bg-bg p-5">
              <img
                src={receiptPreview}
                alt="Manual deposit receipt full preview"
                className="mx-auto max-h-[76vh] max-w-full rounded-lg object-contain"
              />
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}