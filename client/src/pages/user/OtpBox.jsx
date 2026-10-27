import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  AlertCircle,
  CheckCircle2,
  ChevronRight,
  Clock3,
  Copy,
  Inbox,
  Loader2,
  RefreshCw,
  Search,
  XCircle,
} from "lucide-react";
import { toast } from "react-toastify";
import EmptyState from "../../components/ui/EmptyState.jsx";
import {
  cancelActivation,
  checkOtpStatus,
  getMyOrders,
} from "../../service/number";
import { formatCurrency } from "../../utils/transaction.js";
import { formatServiceName } from "../../utils/serviceCode.js";

const FONT_DISPLAY = {
  fontFamily: "'Space Grotesk', ui-sans-serif, system-ui",
};

const FONT_MONO = {
  fontFamily: "'JetBrains Mono', ui-monospace, monospace",
};

const TERMINAL_STATUSES = ["OTP_RECEIVED", "COMPLETED", "CANCELLED", "FAILED"];

const OTP_STEPS = [
  "Buy a number",
  "Link it to the service you're verifying",
  "Click Get OTP to receive the code",
];

const OtpBox = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [checkingOrderId, setCheckingOrderId] = useState("");
  const [cancellingOrderId, setCancellingOrderId] = useState("");

  const fetchOrders = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await getMyOrders({
        status: statusFilter,
        search: searchTerm || undefined,
      });
      setOrders(response?.data || []);
    } catch (err) {
      console.error("Failed to fetch OTP orders:", err);
      setError(err?.response?.data?.message || "Failed to load OTP orders");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      setSearchTerm(searchInput.trim());
    }, 350);

    return () => window.clearTimeout(timeoutId);
  }, [searchInput]);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      void fetchOrders();
    }, 0);

    return () => {
      window.clearTimeout(timeoutId);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFilter, searchTerm]);

  const hasActiveFilter = Boolean(searchTerm || statusFilter !== "ALL");

  const clearFilters = () => {
    setSearchInput("");
    setSearchTerm("");
    setStatusFilter("ALL");
  };

  const formatDate = (value) => {
    if (!value) return "N/A";

    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "N/A";

    return date.toLocaleString();
  };

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

  const handleCopy = async (value, label) => {
    if (!value) return;

    try {
      await navigator.clipboard.writeText(value);
      toast.success(`${label} copied`);
    } catch {
      toast.error(`Failed to copy ${label.toLowerCase()}`);
    }
  };

  const handleCheckOtp = async (orderId) => {
    if (!orderId) return;

    try {
      setCheckingOrderId(orderId);

      const response = await checkOtpStatus(orderId);
      const updatedOrder = response?.data;

      if (updatedOrder?._id) {
        setOrders((currentOrders) =>
          currentOrders.map((order) =>
            order._id === updatedOrder._id ? updatedOrder : order,
          ),
        );
      }

      if (response?.otpCode || updatedOrder?.otpCode) {
        toast.success("OTP received");
      } else {
        toast.info("OTP is not available yet");
      }
    } catch (err) {
      console.error("Failed to check OTP status:", err);
      toast.error(err?.response?.data?.message || "Failed to check OTP");
    } finally {
      setCheckingOrderId("");
    }
  };

  const handleCancelOtp = async (order) => {
    if (!order?._id || !order?.activationId) return;

    const shouldCancel = window.confirm(
      "Are you sure you want to cancel this OTP order?",
    );

    if (!shouldCancel) return;

    try {
      setCancellingOrderId(order._id);

      const response = await cancelActivation(order.activationId);
      const updatedOrder = response?.data?.order;

      if (updatedOrder?._id) {
        setOrders((currentOrders) =>
          currentOrders.map((currentOrder) =>
            currentOrder._id === updatedOrder._id ? updatedOrder : currentOrder,
          ),
        );
      }

      toast.success(response?.message || "OTP cancelled successfully");
    } catch (err) {
      console.error("Failed to cancel OTP order:", err);
      toast.error(err?.response?.data?.message || "Failed to cancel OTP");
    } finally {
      setCancellingOrderId("");
    }
  };

  const renderActions = (order) => {
    const isChecking = checkingOrderId === order._id;
    const isCancelling = cancellingOrderId === order._id;
    const canCheckOtp = !TERMINAL_STATUSES.includes(order.status);
    const canCancelOtp =
      Boolean(order.activationId) && !TERMINAL_STATUSES.includes(order.status);

    return (
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => void handleCancelOtp(order)}
          disabled={isCancelling || !canCancelOtp}
          className="inline-flex h-9 items-center gap-2 rounded-lg border border-border bg-bg px-3 text-xs font-semibold text-muted transition-colors hover:border-brand hover:bg-surface hover:text-heading disabled:cursor-not-allowed disabled:opacity-50"
          style={FONT_MONO}
        >
          {isCancelling ? (
            <Loader2 size={14} className="animate-spin" />
          ) : (
            <XCircle size={14} />
          )}
          Cancel
        </button>
        <button
          type="button"
          onClick={() => void handleCheckOtp(order._id)}
          disabled={isChecking || !canCheckOtp}
          className="inline-flex h-9 items-center gap-2 rounded-lg bg-brand px-3 text-xs font-semibold text-on-brand transition-colors hover:bg-brand-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand disabled:cursor-not-allowed disabled:opacity-50"
          style={FONT_MONO}
        >
          {isChecking ? (
            <Loader2 size={14} className="animate-spin" />
          ) : (
            <RefreshCw size={14} />
          )}
          {order.otpCode ? "Checked" : "Get OTP"}
        </button>
      </div>
    );
  };

  return (
    <div className="mx-auto max-w-7xl">
      {/* Top section: steps on left, controls on right */}
      <div className="mb-6 grid gap-4 lg:grid-cols-[1fr_auto]">
        {/* OTP Steps — horizontal pill-style stepper */}
        <div className="rounded-2xl border border-border bg-surface px-5 py-4 shadow-card">
          <p
            className="mb-3 text-[10.5px] font-semibold uppercase tracking-wider text-muted"
            style={FONT_MONO}
          >
            How it works
          </p>
          <div className="flex flex-wrap items-center gap-x-2 gap-y-3">
            {OTP_STEPS.map((step, index) => (
              <div key={step} className="flex items-center gap-2">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-brand text-[10px] font-bold text-on-brand">
                  {index + 1}
                </span>
                <span className="text-xs text-body">{step}</span>
                {index < OTP_STEPS.length - 1 && (
                  <ChevronRight
                    size={14}
                    className="shrink-0 text-muted"
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Search + Status filter — stacked on the right */}
        <div className="flex flex-col gap-3 sm:flex-row lg:flex-col">
          <div className="relative sm:w-64 lg:w-56">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
            <input
              type="search"
              value={searchInput}
              onChange={(event) => setSearchInput(event.target.value)}
              placeholder="Search OTP orders"
              className="h-11 w-full rounded-lg border border-border bg-surface py-2 pl-10 pr-4 text-sm text-heading placeholder:text-muted focus:border-brand focus:outline-none focus:ring-1 focus:ring-focus-ring"
              style={FONT_MONO}
            />
          </div>
          <div className="flex gap-3">
            <select
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value)}
              className="h-11 flex-1 rounded-lg border border-border bg-surface px-4 text-sm text-heading focus:border-brand focus:outline-none focus:ring-1 focus:ring-focus-ring lg:w-56"
              style={FONT_MONO}
            >
              <option value="ALL">All Status</option>
              <option value="WAITING_FOR_SMS">Waiting</option>
              <option value="OTP_RECEIVED">OTP Received</option>
              <option value="COMPLETED">Completed</option>
              <option value="CANCELLED">Cancelled</option>
              <option value="FAILED">Failed</option>
            </select>
            <button
              type="button"
              onClick={() => {
                void fetchOrders();
              }}
              disabled={loading}
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border border-border bg-surface text-muted transition-colors hover:border-brand hover:text-heading disabled:cursor-not-allowed disabled:opacity-60"
              aria-label="Refresh orders"
            >
              <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
            </button>
          </div>
        </div>
      </div>

      {/* Orders container */}
      <section className="overflow-hidden rounded-2xl border border-border bg-surface shadow-card">
        {/* Header bar with count + clear filters */}
        <div className="flex items-center justify-between border-b border-border bg-bg px-5 py-3.5">
          <div className="flex items-baseline gap-2">
            <h2
              className="text-sm font-semibold text-heading"
              style={FONT_DISPLAY}
            >
              OTP Orders
            </h2>
            <span className="text-xs text-muted" style={FONT_MONO}>
              {orders.length} result{orders.length === 1 ? "" : "s"}
            </span>
          </div>
          {hasActiveFilter && (
            <button
              type="button"
              onClick={clearFilters}
              className="text-xs font-medium text-brand-text transition-colors hover:text-brand-hover"
              style={FONT_MONO}
            >
              Clear filters
            </button>
          )}
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
              description="Purchased numbers will appear here once you buy one."
              actionLabel="Buy a Number"
              onAction={() => navigate("/f/numbers")}
            />
          )
        ) : (
          <>
            {/* Desktop: stacked card list instead of a traditional table */}
            <div className="hidden lg:block">
              {orders.map((order) => {
                const statusBadge = getStatusBadge(order.status);
                const StatusIcon = statusBadge.icon;

                return (
                  <div
                    key={order._id}
                    className="group flex items-center gap-6 border-b border-border px-5 py-4 transition-colors last:border-b-0 hover:bg-bg"
                  >
                    {/* Left: number + activation ID */}
                    <div className="flex min-w-0 flex-[2] items-center gap-3">
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <p
                            className="truncate text-sm font-semibold text-heading"
                            style={FONT_MONO}
                          >
                            {order.phoneNumber || "N/A"}
                          </p>
                          {order.phoneNumber ? (
                            <button
                              type="button"
                              onClick={() =>
                                void handleCopy(order.phoneNumber, "Phone")
                              }
                              className="shrink-0 rounded p-1 text-muted opacity-0 transition-all hover:bg-surface hover:text-heading group-hover:opacity-100"
                              aria-label="Copy phone number"
                            >
                              <Copy size={13} />
                            </button>
                          ) : null}
                        </div>
                        <p
                          className="mt-0.5 truncate text-xs text-muted"
                          style={FONT_MONO}
                        >
                          {order.activationId || "No activation ID"}
                        </p>
                      </div>
                    </div>

                    {/* Middle: service + country */}
                    <div className="flex flex-[1.5] flex-col">
                      <span className="text-sm font-medium text-heading">
                        {String(
                          formatServiceName(order.service) || "N/A",
                        ).toUpperCase()}
                      </span>
                      <span className="mt-0.5 text-xs text-muted">
                        Country {order.country || "N/A"}
                      </span>
                    </div>

                    {/* Amount */}
                    <div className="flex flex-1 flex-col">
                      <span
                        className="text-sm font-semibold text-success"
                        style={FONT_MONO}
                      >
                        {formatCurrency(order.sellingPrice)}
                      </span>
                      <span
                        className="mt-0.5 text-xs text-muted"
                        style={FONT_MONO}
                      >
                        {formatDate(order.purchasedAt || order.createdAt)}
                      </span>
                    </div>

                    {/* OTP code + message */}
                    <div className="flex flex-[1.5] flex-col">
                      <span
                        className="text-sm font-semibold text-heading"
                        style={FONT_MONO}
                      >
                        {order.otpCode || "Waiting"}
                      </span>
                      <span className="mt-0.5 truncate text-xs text-muted">
                        {order.otpMessage || "No message yet"}
                      </span>
                    </div>

                    {/* Status badge */}
                    <div className="flex flex-1 justify-start">
                      <span
                        className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-medium ${statusBadge.className}`}
                        style={FONT_MONO}
                      >
                        <StatusIcon size={12} />
                        {statusBadge.label}
                      </span>
                    </div>

                    {/* Expiry */}
                    <div className="flex flex-1 flex-col">
                      <span
                        className="text-xs text-muted"
                        style={FONT_MONO}
                      >
                        Expires
                      </span>
                      <span
                        className="text-sm text-muted"
                        style={FONT_MONO}
                      >
                        {formatDate(order.expiresAt)}
                      </span>
                    </div>

                    {/* Actions */}
                    <div className="shrink-0">{renderActions(order)}</div>
                  </div>
                );
              })}
            </div>

            {/* Mobile cards — horizontal compact layout */}
            <div className="space-y-2 p-3 lg:hidden">
              {orders.map((order) => {
                const statusBadge = getStatusBadge(order.status);
                const StatusIcon = statusBadge.icon;

                return (
                  <article
                    key={order._id}
                    className="rounded-xl border border-border bg-bg p-3.5"
                  >
                    {/* Row 1: number + status */}
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex min-w-0 items-center gap-1.5">
                        <p
                          className="truncate text-sm font-semibold text-heading"
                          style={FONT_MONO}
                        >
                          {order.phoneNumber || "N/A"}
                        </p>
                        {order.phoneNumber ? (
                          <button
                            type="button"
                            onClick={() =>
                              void handleCopy(order.phoneNumber, "Phone")
                            }
                            className="shrink-0 rounded p-1 text-muted transition-colors hover:bg-surface hover:text-heading"
                            aria-label="Copy phone number"
                          >
                            <Copy size={12} />
                          </button>
                        ) : null}
                      </div>
                      <span
                        className={`inline-flex shrink-0 items-center gap-1 rounded-full border px-2 py-0.5 text-[10.5px] font-medium ${statusBadge.className}`}
                        style={FONT_MONO}
                      >
                        <StatusIcon size={10} />
                        {statusBadge.label}
                      </span>
                    </div>

                    {/* Row 2: service + country + amount on one line */}
                    <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted">
                      <span className="font-medium text-heading">
                        {String(
                          formatServiceName(order.service) || "N/A",
                        ).toUpperCase()}
                      </span>
                      <span>Country {order.country || "N/A"}</span>
                      <span
                        className="font-semibold text-success"
                        style={FONT_MONO}
                      >
                        {formatCurrency(order.sellingPrice)}
                      </span>
                    </div>

                    {/* Row 3: OTP code + message */}
                    <div className="mt-2 rounded-lg border border-border bg-surface px-3 py-2">
                      <div className="flex items-center justify-between">
                        <span
                          className="text-[10.5px] uppercase tracking-wider text-muted"
                          style={FONT_MONO}
                        >
                          OTP
                        </span>
                        <span
                          className="text-sm font-semibold text-heading"
                          style={FONT_MONO}
                        >
                          {order.otpCode || "Waiting"}
                        </span>
                      </div>
                      {order.otpMessage ? (
                        <p className="mt-0.5 truncate text-[11px] text-muted">
                          {order.otpMessage}
                        </p>
                      ) : null}
                    </div>

                    {/* Row 4: dates + actions */}
                    <div className="mt-2.5 flex items-center justify-between gap-3">
                      <div
                        className="text-[10.5px] text-muted"
                        style={FONT_MONO}
                      >
                        <span>
                          {formatDate(order.purchasedAt || order.createdAt)}
                        </span>
                        <span className="mx-1.5">·</span>
                        <span>Expires {formatDate(order.expiresAt)}</span>
                      </div>
                    </div>

                    <div className="mt-2.5">{renderActions(order)}</div>
                  </article>
                );
              })}
            </div>
          </>
        )}
      </section>
    </div>
  );
};

export default OtpBox;