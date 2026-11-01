import { useCallback, useEffect, useState } from "react";
import {
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  Loader2,
  Package,
  Search,
  ShoppingBag,
} from "lucide-react";
import { toast } from "react-toastify";
import AccountDetails from "../../components/AccountDetails.jsx";
import {
  buyActivePlatformLog,
  getActivePlatformLogs,
} from "../../service/platformLogs.js";
import { formatCurrency } from "../../utils/transaction.js";

const FONT_DISPLAY = {
  fontFamily: "'Space Grotesk', ui-sans-serif, system-ui",
};

const FONT_MONO = {
  fontFamily: "'JetBrains Mono', ui-monospace, monospace",
};

const PAGE_SIZE = 20;

export default function AccountStore() {
  const [logs, setLogs] = useState([]);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({
    page: 1,
    total: 0,
    totalPages: 1,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [buyingId, setBuyingId] = useState("");
  const [purchaseResult, setPurchaseResult] = useState(null);

  const fetchLogs = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      const response = await getActivePlatformLogs({
        page,
        limit: PAGE_SIZE,
        name: search.trim() || undefined,
      });
      const rows = Array.isArray(response?.data) ? response.data : [];
      setLogs(rows);
      setPagination(
        response?.pagination || {
          page,
          total: rows.length,
          totalPages: 1,
        },
      );
    } catch (err) {
      console.error("Failed to load account store:", err);
      setError(err?.response?.data?.message || "Failed to load available accounts");
    } finally {
      setLoading(false);
    }
  }, [page, search]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void fetchLogs();
    }, 250);
    return () => window.clearTimeout(timer);
  }, [fetchLogs]);

  const handleBuy = async (log) => {
    try {
      setBuyingId(log._id);
      setPurchaseResult(null);
      const response = await buyActivePlatformLog({
        logId: log._id,
        quantity: 1,
      });
      toast.success(
        response?.message ||
          (response?.data?.purchaseStatus === "processing"
            ? "Purchase is processing"
            : "Purchase completed successfully"),
      );
      setPurchaseResult(response?.data || null);
      await fetchLogs();
    } catch (err) {
      console.error("Failed to buy account listing:", err);
      toast.error(err?.response?.data?.message || "Failed to complete purchase");
    } finally {
      setBuyingId("");
    }
  };

  const totalPages = Math.max(Number(pagination.totalPages) || 1, 1);

  return (
    <div className="mx-auto w-full max-w-7xl min-w-0 space-y-5">
      <section className="slanted-page-header rounded-2xl border border-border bg-surface p-6 shadow-card sm:p-8">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-brand text-on-brand">
            <ShoppingBag size={22} />
          </div>
          <div>
            <h2 className="text-xl font-bold text-heading" style={FONT_DISPLAY}>
              Account Store
            </h2>
            <p className="mt-0.5 text-sm text-muted">
              Browse available accounts and purchase with your wallet.
            </p>
          </div>
        </div>
      </section>

      {purchaseResult && (
        <section className="space-y-4 rounded-2xl border border-border bg-surface p-5 shadow-card sm:p-6">
          <div>
            <h3 className="text-base font-semibold text-heading" style={FONT_DISPLAY}>
              Purchase details
            </h3>
            <p className="mt-1 text-sm text-muted">
              Receipt {purchaseResult.receiptNo || "processing"} · Status{" "}
              {purchaseResult.purchaseStatus || "processing"}
            </p>
          </div>
          <AccountDetails details={purchaseResult.accountDetails} />
        </section>
      )}

      <label className="relative block">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
        <input
          value={search}
          onChange={(event) => {
            setSearch(event.target.value);
            setPage(1);
          }}
          placeholder="Search accounts"
          className="h-11 w-full rounded-xl border border-border bg-surface pl-10 pr-3 text-sm text-heading placeholder:text-muted shadow-card focus:border-brand focus:outline-none focus:ring-1 focus:ring-focus-ring"
        />
      </label>

      {error && (
        <div className="flex items-center gap-2 rounded-xl border border-danger bg-danger-soft px-4 py-3 text-sm text-danger">
          <AlertCircle size={17} />
          {error}
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center gap-2 rounded-2xl border border-border bg-surface py-16 text-sm text-muted shadow-card">
          <Loader2 size={18} className="animate-spin text-brand-text" />
          Loading available accounts...
        </div>
      ) : logs.length === 0 ? (
        <div className="rounded-2xl border border-border bg-surface px-4 py-14 text-center shadow-card">
          <Package size={28} className="mx-auto text-muted" />
          <h3 className="mt-3 text-sm font-semibold text-heading" style={FONT_DISPLAY}>
            No accounts available
          </h3>
          <p className="mt-1 text-sm text-muted">
            Check back later or try another search.
          </p>
        </div>
      ) : (
        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {logs.map((log) => {
            const outOfStock = Number(log.quantity) < 1;
            const isBuying = buyingId === log._id;

            return (
              <article
                key={log._id}
                className="flex flex-col rounded-2xl border border-border bg-surface p-5 shadow-card transition-colors hover:border-border-strong"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand text-on-brand">
                    <Package size={18} />
                  </div>
                  <span
                    className="rounded-full border border-border bg-bg px-2.5 py-1 text-xs text-muted"
                    style={FONT_MONO}
                  >
                    {(log.productType || "account").replaceAll("_", " ")}
                  </span>
                </div>
                <h3 className="mt-4 text-base font-semibold text-heading" style={FONT_DISPLAY}>
                  {log.name || "Account listing"}
                </h3>
                <p className="mt-1 text-sm text-muted">
                  {log.category || "Account"}
                </p>
                {log.description && (
                  <p className="mt-3 line-clamp-3 text-sm leading-6 text-body">
                    {log.description}
                  </p>
                )}
                <div className="mt-auto pt-5">
                  <div className="mb-4 flex items-end justify-between gap-3">
                    <div>
                      <p className="text-xs text-muted" style={FONT_MONO}>
                        PRICE
                      </p>
                      <p className="mt-1 text-lg font-bold text-heading" style={FONT_DISPLAY}>
                        {formatCurrency(log.sellingPrice)}
                      </p>
                    </div>
                    <p className="text-xs text-muted" style={FONT_MONO}>
                      {outOfStock ? "Out of stock" : `${log.quantity} available`}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => void handleBuy(log)}
                    disabled={outOfStock || Boolean(buyingId)}
                    className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-brand px-4 text-sm font-semibold text-on-brand transition-colors hover:bg-brand-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {isBuying ? (
                      <Loader2 size={16} className="animate-spin" />
                    ) : (
                      <ShoppingBag size={16} />
                    )}
                    {outOfStock ? "Out of stock" : isBuying ? "Processing..." : "Buy"}
                  </button>
                </div>
              </article>
            );
          })}
        </section>
      )}

      <div className="flex items-center justify-between rounded-xl border border-border bg-surface px-4 py-3">
        <p className="text-xs text-muted" style={FONT_MONO}>
          {pagination.total || 0} accounts · Page {page} of {totalPages}
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
