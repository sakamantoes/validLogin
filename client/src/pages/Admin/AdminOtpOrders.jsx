import { useEffect, useState } from "react";
import {
  AlertCircle,
  CheckCircle2,
  Clock3,
  Inbox,
  Loader2,
  RefreshCw,
  Search,
  User,
  XCircle,
} from "lucide-react";
import EmptyState from "../../components/ui/EmptyState.jsx";
import Pagination from "../../components/ui/Pagination.jsx";
import { getAllOtpOrders } from "../../service/admin.js";
import { formatCurrency } from "../../utils/transaction.js";
import { formatServiceName } from "../../utils/serviceCode.js";

const FONT_DISPLAY = {
  fontFamily: "'Space Grotesk', ui-sans-serif, system-ui",
};

const FONT_MONO = {
  fontFamily: "'JetBrains Mono', ui-monospace, monospace",
};

const ORDERS_PER_PAGE = 20;

// Same status-badge language as the user-facing OTP Inbox, so an order
// reads the same way whether an admin or the owning user is looking at it.
const getStatusBadge = (status) => {
  switch (status) {
    case "OTP_RECEIVED":
    case "COMPLETED":
      return {
        label: status === "COMPLETED" ? "Completed" : "OTP Received",
        className: "border-success bg-success-soft text-success",
        icon: CheckCircle2,
      };
    case "CANCELLED":
    case "FAILED":
      return {
        label: status === "FAILED" ? "Failed" : "Cancelled",
        className: "border-brand bg-brand text-on-brand",
        icon: XCircle,
      };
    default:
      return {
        label: "Waiting",
        className: "border-warning bg-warning-soft text-warning",
        icon: Clock3,
      };
  }
};

const formatDate = (value) => {
  if (!value) return "N/A";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "N/A";

  return date.toLocaleString();
};

export default function AdminOtpOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [searchInput, setSearchInput] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalResults, setTotalResults] = useState(0);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await getAllOtpOrders({
        page,
        limit: ORDERS_PER_PAGE,
        status: statusFilter,
        search: searchTerm || undefined,
      });

      setOrders(response?.data || []);
      setTotalPages(response?.pagination?.totalPages || 1);
      setTotalResults(
        response?.pagination?.total ?? response?.data?.length ?? 0,
      );
    } catch (err) {
      console.error("Failed to fetch OTP orders:", err);
      setError(err?.response?.data?.message || "Failed to load OTP orders");
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

  useEffect(() => {
    setPage(1);
  }, [statusFilter, searchTerm]);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      void fetchOrders();
    }, 0);

    return () => window.clearTimeout(timeoutId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, statusFilter, searchTerm]);

  const hasActiveFilter = Boolean(searchTerm || statusFilter !== "ALL");

  const clearFilters = () => {
    setSearchInput("");
    setSearchTerm("");
    setStatusFilter("ALL");
  };

  return (
    <div className="mx-auto max-w-7xl space-y-5">
      {/* Page header — title and badge on the left, refresh action on the right */}
      <section className="slanted-page-header flex flex-col gap-4 rounded-2xl border border-border bg-surface px-6 py-5 shadow-card sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-brand text-on-brand">
            <Inbox size={20} />
          </div>
          <div>
            <h1 className="text-lg font-bold text-heading" style={FONT_DISPLAY}>
              OTP Orders
            </h1>
            <div className="mt-0.5 flex items-center gap-2">
              <span
                className="inline-flex items-center gap-1 rounded-full border border-border bg-brand px-2.5 py-0.5 text-[10.5px] font-semibold text-on-brand"
                style={FONT_MONO}
              >
                Admin · Debugging
              </span>
              <span className="text-xs text-muted" style={FONT_MONO}>
                {totalResults} result{totalResults === 1 ? "" : "s"}
              </span>
            </div>
          </div>
        </div>
        <button
          type="button"
          onClick={() => void fetchOrders()}
          disabled={loading}
          className="inline-flex h-11 shrink-0 items-center justify-center gap-2 rounded-xl bg-brand px-5 text-sm font-semibold text-on-brand transition-colors hover:bg-brand-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand disabled:cursor-not-allowed disabled:opacity-50"
          style={FONT_MONO}
        >
          <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
          Refresh
        </button>
      </section>

      {/* Toolbar — search + status filter in a dedicated band */}
      <section className="rounded-2xl border border-border bg-surface p-4 shadow-card">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
            <input
              value={searchInput}
              onChange={(event) => setSearchInput(event.target.value)}
              placeholder="Search phone, service, country, provider"
              className="h-11 w-full rounded-lg border border-border bg-bg py-2 pl-10 pr-4 text-sm text-heading placeholder:text-muted focus:border-brand focus:outline-none focus:ring-1 focus:ring-focus-ring"
              style={FONT_MONO}
            />
          </div>

          <select
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value)}
            className="h-11 rounded-lg border border-border bg-bg px-4 text-sm text-heading focus:border-brand focus:outline-none focus:ring-1 focus:ring-focus-ring sm:w-52"
            style={FONT_MONO}
          >
            <option value="ALL">All Status</option>
            <option value="WAITING_FOR_SMS">Waiting</option>
            <option value="OTP_RECEIVED">OTP Received</option>
            <option value="COMPLETED">Completed</option>
            <option value="CANCELLED">Cancelled</option>
            <option value="FAILED">Failed</option>
          </select>

          {hasActiveFilter && (
            <button
              type="button"
              onClick={clearFilters}
              className="inline-flex h-11 shrink-0 items-center justify-center rounded-lg border border-border bg-bg px-4 text-xs font-semibold text-muted transition-colors hover:border-brand hover:text-heading"
              style={FONT_MONO}
            >
              Clear
            </button>
          )}
        </div>
      </section>

      {/* Orders workspace */}
      <section className="overflow-hidden rounded-2xl border border-border bg-surface shadow-card">
        {/* Header bar */}
        <div className="flex items-center justify-between border-b border-border bg-bg px-5 py-3.5">
          <h2
            className="text-sm font-semibold text-heading"
            style={FONT_DISPLAY}
          >
            Order Records
          </h2>
          <span className="text-xs text-muted" style={FONT_MONO}>
            Page {page} of {totalPages}
          </span>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="h-8 w-8 animate-spin text-brand-text" />
          </div>
        ) : error ? (
          <div className="flex items-center justify-center gap-2 px-5 py-12 text-brand-text">
            <AlertCircle size={18} />
            <span>{error}</span>
          </div>
        ) : orders.length === 0 ? (
          hasActiveFilter ? (
            <EmptyState
              icon={Search}
              title="No orders match your filters"
              description="Try a different search term or status."
              actionLabel="Clear filters"
              onAction={clearFilters}
            />
          ) : (
            <EmptyState
              icon={Inbox}
              title="No OTP orders yet"
              description="Orders will appear here once users start buying numbers."
            />
          )
        ) : (
          <>
            {/* Desktop table */}
            <div className="hidden overflow-x-auto lg:block">
              <table className="min-w-full divide-y divide-border">
                <thead className="bg-bg">
                  <tr>
                    {[
                      "User",
                      "Number",
                      "Service",
                      "OTP",
                      "Amount",
                      "Status",
                      "Cancel Reason",
                      "Purchased",
                      "Expires",
                    ].map((heading) => (
                      <th
                        key={heading}
                        className="px-5 py-3 text-left text-[10.5px] font-semibold uppercase tracking-wider text-muted"
                        style={FONT_MONO}
                      >
                        {heading}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {orders.map((order) => {
                    const statusBadge = getStatusBadge(order.status);
                    const StatusIcon = statusBadge.icon;

                    return (
                      <tr
                        key={order._id}
                        className="transition-colors hover:bg-bg"
                      >
                        <td className="px-5 py-4">
                          <p className="font-semibold text-heading">
                            {order.userId?.username || "Unknown user"}
                          </p>
                          <p
                            className="mt-1 text-xs text-muted"
                            style={FONT_MONO}
                          >
                            {order.userId?.email || "No email on record"}
                          </p>
                        </td>
                        <td
                          className="px-5 py-4 text-sm text-heading"
                          style={FONT_MONO}
                        >
                          {order.phoneNumber || "N/A"}
                        </td>
                        <td className="px-5 py-4 text-sm text-muted">
                          <p className="font-medium text-heading">
                            {formatServiceName(order.service)}
                          </p>
                          <p className="text-xs text-muted">
                            {order.country || "N/A"}
                          </p>
                        </td>
                        <td
                          className="px-5 py-4 text-sm text-muted"
                          style={FONT_MONO}
                        >
                          {order.otpCode || "—"}
                        </td>
                        <td
                          className="px-5 py-4 text-sm font-semibold text-heading"
                          style={FONT_MONO}
                        >
                          {formatCurrency(order.sellingPrice)}
                        </td>
                        <td className="px-5 py-4">
                          <span
                            className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-medium ${statusBadge.className}`}
                            style={FONT_MONO}
                          >
                            <StatusIcon size={12} />
                            {statusBadge.label}
                          </span>
                        </td>
                        <td
                          className="max-w-48 truncate px-5 py-4 text-sm text-muted"
                          style={FONT_MONO}
                        >
                          {order.cancelReason || "—"}
                        </td>
                        <td
                          className="px-5 py-4 text-sm text-muted"
                          style={FONT_MONO}
                        >
                          {formatDate(order.purchasedAt || order.createdAt)}
                        </td>
                        <td
                          className="px-5 py-4 text-sm text-muted"
                          style={FONT_MONO}
                        >
                          {formatDate(order.expiresAt)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Mobile cards */}
            <div className="grid gap-3 p-4 lg:hidden">
              {orders.map((order) => {
                const statusBadge = getStatusBadge(order.status);
                const StatusIcon = statusBadge.icon;

                return (
                  <article
                    key={order._id}
                    className="rounded-xl border border-border bg-bg p-4"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <User size={13} className="shrink-0 text-muted" />
                          <p className="truncate text-sm font-semibold text-heading">
                            {order.userId?.username || "Unknown user"}
                          </p>
                        </div>
                        <p
                          className="mt-0.5 truncate text-xs text-muted"
                          style={FONT_MONO}
                        >
                          {order.phoneNumber || "N/A"}
                        </p>
                      </div>
                      <span
                        className={`inline-flex shrink-0 items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-medium ${statusBadge.className}`}
                        style={FONT_MONO}
                      >
                        <StatusIcon size={12} />
                        {statusBadge.label}
                      </span>
                    </div>

                    <div className="mt-3 grid grid-cols-2 gap-2 text-sm text-muted">
                      <p className="flex flex-col">
                        <span
                          className="text-[10.5px] uppercase tracking-wider text-muted"
                          style={FONT_MONO}
                        >
                          Service
                        </span>
                        <span className="font-medium text-heading">
                          {formatServiceName(order.service)}
                        </span>
                      </p>
                      <p className="flex flex-col">
                        <span
                          className="text-[10.5px] uppercase tracking-wider text-muted"
                          style={FONT_MONO}
                        >
                          Country
                        </span>
                        <span className="font-medium text-heading">
                          {order.country || "N/A"}
                        </span>
                      </p>
                      <p className="flex flex-col">
                        <span
                          className="text-[10.5px] uppercase tracking-wider text-muted"
                          style={FONT_MONO}
                        >
                          Amount
                        </span>
                        <span
                          className="font-semibold text-heading"
                          style={FONT_MONO}
                        >
                          {formatCurrency(order.sellingPrice)}
                        </span>
                      </p>
                      <p className="flex flex-col">
                        <span
                          className="text-[10.5px] uppercase tracking-wider text-muted"
                          style={FONT_MONO}
                        >
                          OTP
                        </span>
                        <span
                          className="font-semibold text-heading"
                          style={FONT_MONO}
                        >
                          {order.otpCode || "—"}
                        </span>
                      </p>
                    </div>

                    {order.cancelReason ? (
                      <p className="mt-2 text-xs text-muted">
                        <span className="text-muted">Cancelled: </span>
                        {order.cancelReason}
                      </p>
                    ) : null}

                    <div
                      className="mt-3 flex items-center justify-between gap-3 border-t border-border pt-3 text-xs text-muted"
                      style={FONT_MONO}
                    >
                      <span>
                        {formatDate(order.purchasedAt || order.createdAt)}
                      </span>
                      <span>Expires {formatDate(order.expiresAt)}</span>
                    </div>
                  </article>
                );
              })}
            </div>

            <div className="border-t border-border px-5 py-4">
              <Pagination
                page={page}
                totalPages={totalPages}
                onPageChange={setPage}
              />
            </div>
          </>
        )}
      </section>
    </div>
  );
}
