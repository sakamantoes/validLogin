import { useCallback, useEffect, useState } from "react";
import {
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  ClipboardList,
  Loader2,
  RefreshCw,
} from "lucide-react";
import AccountDetails from "../../components/AccountDetails.jsx";
import { getMyAccountOrders } from "../../service/platformLogs.js";
import { formatCurrency, formatTransactionDate } from "../../utils/transaction.js";

const FONT_DISPLAY = {
  fontFamily: "'Space Grotesk', ui-sans-serif, system-ui",
};

const FONT_MONO = {
  fontFamily: "'JetBrains Mono', ui-monospace, monospace",
};

const PAGE_SIZE = 10;

const statusClassName = (status) => {
  if (["completed", "delivered"].includes(status)) {
    return "border-success bg-success-soft text-success";
  }
  if (["failed", "cancelled"].includes(status)) {
    return "border-danger bg-danger-soft text-danger";
  }
  return "border-warning bg-warning-soft text-warning";
};

export default function AccountOrders() {
  const [orders, setOrders] = useState([]);
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({
    page: 1,
    total: 0,
    totalPages: 1,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchOrders = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      const response = await getMyAccountOrders({
        page,
        limit: PAGE_SIZE,
      });
      setOrders(Array.isArray(response?.data) ? response.data : []);
      setPagination(
        response?.pagination || {
          page,
          total: 0,
          totalPages: 1,
        },
      );
    } catch (err) {
      console.error("Failed to load account orders:", err);
      setError(err?.response?.data?.message || "Failed to load account orders");
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void fetchOrders();
    }, 0);

    return () => window.clearTimeout(timer);
  }, [fetchOrders]);

  const totalPages = Math.max(Number(pagination.totalPages) || 1, 1);

  return (
    <div className="mx-auto w-full max-w-7xl min-w-0 space-y-5">
      <section className="slanted-page-header rounded-2xl border border-border bg-surface p-6 shadow-card sm:p-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-brand text-on-brand">
              <ClipboardList size={22} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-heading" style={FONT_DISPLAY}>
                My Account Orders
              </h2>
              <p className="mt-0.5 text-sm text-muted">
                View your purchases and securely reveal or copy delivered details.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => void fetchOrders()}
            disabled={loading}
            className="inline-flex h-10 items-center justify-center gap-2 self-start rounded-xl border border-border px-4 text-sm font-semibold text-muted transition-colors hover:border-brand hover:text-heading disabled:opacity-60 sm:self-auto"
          >
            <RefreshCw size={15} className={loading ? "animate-spin" : ""} />
            Refresh
          </button>
        </div>
      </section>

      {error && (
        <div className="flex items-center gap-2 rounded-xl border border-danger bg-danger-soft px-4 py-3 text-sm text-danger">
          <AlertCircle size={17} />
          {error}
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center gap-2 rounded-2xl border border-border bg-surface py-16 text-sm text-muted shadow-card">
          <Loader2 size={18} className="animate-spin text-brand-text" />
          Loading your orders...
        </div>
      ) : orders.length === 0 ? (
        <div className="rounded-2xl border border-border bg-surface px-4 py-14 text-center shadow-card">
          <ClipboardList size={28} className="mx-auto text-muted" />
          <h3 className="mt-3 text-sm font-semibold text-heading" style={FONT_DISPLAY}>
            No account orders yet
          </h3>
          <p className="mt-1 text-sm text-muted">
            Your account purchases and delivered details will appear here.
          </p>
        </div>
      ) : (
        <section className="space-y-4">
          {orders.map((order) => {
            const listing = order.accountListingId;
            const purchaseStatus = order.purchaseStatus || "pending";
            const deliveryStatus = order.deliveryStatus || "pending";

            return (
              <article
                key={order._id}
                className="space-y-4 rounded-2xl border border-border bg-surface p-5 shadow-card sm:p-6"
              >
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div className="min-w-0">
                    <h3 className="truncate text-base font-semibold text-heading" style={FONT_DISPLAY}>
                      {listing?.name || "Account purchase"}
                    </h3>
                    <p className="mt-1 text-xs text-muted" style={FONT_MONO}>
                      Receipt {order.receiptNo} · {formatTransactionDate(order)}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <span
                      className={`rounded-full border px-2.5 py-1 text-xs font-medium ${statusClassName(purchaseStatus)}`}
                    >
                      Purchase: {purchaseStatus}
                    </span>
                    <span
                      className={`rounded-full border px-2.5 py-1 text-xs font-medium ${statusClassName(deliveryStatus)}`}
                    >
                      Delivery: {deliveryStatus}
                    </span>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-x-5 gap-y-2 border-y border-border py-3 text-sm">
                  <span className="text-muted">
                    Quantity: <strong className="text-heading">{order.quantity}</strong>
                  </span>
                  <span className="text-muted">
                    Paid:{" "}
                    <strong className="text-heading">
                      {formatCurrency(order.amount)}
                    </strong>
                  </span>
                  <span className="text-muted">
                    Order date:{" "}
                    <strong className="text-heading">
                      {formatTransactionDate(order)}
                    </strong>
                  </span>
                </div>

                {order.accountDetails ? (
                  <AccountDetails details={order.accountDetails} />
                ) : (
                  <p className="text-sm text-muted">
                    {deliveryStatus === "delivered"
                      ? "No account details were included with this order."
                      : "Your account details will appear here once they are delivered."}
                  </p>
                )}
              </article>
            );
          })}
        </section>
      )}

      <div className="flex items-center justify-between rounded-xl border border-border bg-surface px-4 py-3">
        <p className="text-xs text-muted" style={FONT_MONO}>
          {pagination.total || 0} orders · Page {page} of {totalPages}
        </p>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setPage((current) => Math.max(current - 1, 1))}
            disabled={page <= 1 || loading}
            aria-label="Previous page"
            className="grid h-9 w-9 place-items-center rounded-lg border border-border text-muted transition-colors hover:border-brand hover:text-heading disabled:cursor-not-allowed disabled:opacity-40"
          >
            <ChevronLeft size={17} />
          </button>
          <button
            type="button"
            onClick={() => setPage((current) => Math.min(current + 1, totalPages))}
            disabled={page >= totalPages || loading}
            aria-label="Next page"
            className="grid h-9 w-9 place-items-center rounded-lg border border-border text-muted transition-colors hover:border-brand hover:text-heading disabled:cursor-not-allowed disabled:opacity-40"
          >
            <ChevronRight size={17} />
          </button>
        </div>
      </div>
    </div>
  );
}
