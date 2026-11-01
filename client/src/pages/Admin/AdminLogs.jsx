import { useCallback, useEffect, useState } from "react";
import {
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  Loader2,
  Package,
  RefreshCw,
  Search,
  Save,
} from "lucide-react";
import { toast } from "react-toastify";
import {
  getAdminPlatformLogs,
  updateAdminPlatformLogPrice,
} from "../../service/platformLogs.js";
import { formatCurrency } from "../../utils/transaction.js";

const FONT_DISPLAY = {
  fontFamily: "'Space Grotesk', ui-sans-serif, system-ui",
};

const FONT_MONO = {
  fontFamily: "'JetBrains Mono', ui-monospace, monospace",
};

const PAGE_SIZE = 20;

const PRODUCT_TYPES = [
  { value: "", label: "All product types" },
  { value: "account", label: "Account" },
  { value: "celeb_update", label: "Celebrity update" },
  { value: "working_picture", label: "Working picture" },
];

const STATUSES = [
  { value: "", label: "All statuses" },
  { value: "active", label: "Active" },
  { value: "inactive", label: "Inactive" },
  { value: "out_of_stock", label: "Out of stock" },
];

export default function AdminLogs() {
  const [logs, setLogs] = useState([]);
  const [priceDrafts, setPriceDrafts] = useState({});
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [productType, setProductType] = useState("");
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({
    page: 1,
    total: 0,
    totalPages: 1,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [savingId, setSavingId] = useState("");

  const fetchLogs = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      const response = await getAdminPlatformLogs({
        page,
        limit: PAGE_SIZE,
        search: search.trim() || undefined,
        category: category.trim() || undefined,
        productType: productType || undefined,
        status: status || undefined,
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
      setPriceDrafts((current) => {
        const next = { ...current };
        rows.forEach((log) => {
          if (next[log._id] === undefined) {
            next[log._id] = String(log.sellingPrice ?? "");
          }
        });
        return next;
      });
    } catch (err) {
      console.error("Failed to load account listings:", err);
      setError(err?.response?.data?.message || "Failed to load account listings");
    } finally {
      setLoading(false);
    }
  }, [category, page, productType, search, status]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void fetchLogs();
    }, 250);
    return () => window.clearTimeout(timer);
  }, [fetchLogs]);

  const handleFilterChange = (setter) => (event) => {
    setter(event.target.value);
    setPage(1);
  };

  const handleSavePrice = async (log) => {
    const draft = priceDrafts[log._id];
    const sellingPrice = Number(draft);

    if (draft === "" || !Number.isFinite(sellingPrice) || sellingPrice < 0) {
      toast.error("Enter a valid non-negative selling price");
      return;
    }

    try {
      setSavingId(log._id);
      await updateAdminPlatformLogPrice(log._id, sellingPrice);
      toast.success("Selling price updated");
      await fetchLogs();
    } catch (err) {
      console.error("Failed to update account listing price:", err);
      toast.error(
        err?.response?.data?.message || "Failed to update selling price",
      );
    } finally {
      setSavingId("");
    }
  };

  const totalPages = Math.max(Number(pagination.totalPages) || 1, 1);

  return (
    <div className="mx-auto w-full max-w-7xl min-w-0 space-y-6">
      <section className="slanted-page-header rounded-2xl border border-border bg-surface p-6 shadow-card sm:p-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-brand text-on-brand">
              <Package size={22} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-heading" style={FONT_DISPLAY}>
                Account Listings
              </h2>
              <p className="mt-0.5 text-sm text-muted" style={FONT_MONO}>
                Manage customer-facing listings and selling prices
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => void fetchLogs()}
            disabled={loading}
            className="inline-flex h-10 items-center justify-center gap-2 self-start rounded-xl border border-border px-4 text-sm font-semibold text-muted transition-colors hover:border-brand hover:text-heading disabled:opacity-60 sm:self-auto"
          >
            <RefreshCw size={15} className={loading ? "animate-spin" : ""} />
            Refresh
          </button>
        </div>
      </section>

      <section className="rounded-2xl border border-border bg-surface p-4 shadow-card sm:p-5">
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <label className="relative sm:col-span-2 xl:col-span-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
            <input
              value={search}
              onChange={handleFilterChange(setSearch)}
              placeholder="Search listings"
              className="h-10 w-full rounded-lg border border-border bg-bg pl-9 pr-3 text-sm text-heading placeholder:text-muted focus:border-brand focus:outline-none focus:ring-1 focus:ring-focus-ring"
            />
          </label>
          <input
            value={category}
            onChange={handleFilterChange(setCategory)}
            placeholder="Filter by category"
            className="h-10 rounded-lg border border-border bg-bg px-3 text-sm text-heading placeholder:text-muted focus:border-brand focus:outline-none focus:ring-1 focus:ring-focus-ring"
          />
          <select
            value={productType}
            onChange={handleFilterChange(setProductType)}
            className="h-10 rounded-lg border border-border bg-bg px-3 text-sm text-heading focus:border-brand focus:outline-none focus:ring-1 focus:ring-focus-ring"
          >
            {PRODUCT_TYPES.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <select
            value={status}
            onChange={handleFilterChange(setStatus)}
            className="h-10 rounded-lg border border-border bg-bg px-3 text-sm text-heading focus:border-brand focus:outline-none focus:ring-1 focus:ring-focus-ring"
          >
            {STATUSES.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
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
          Loading listings...
        </div>
      ) : logs.length === 0 ? (
        <div className="rounded-2xl border border-border bg-surface px-4 py-14 text-center shadow-card">
          <Package size={28} className="mx-auto text-muted" />
          <h3 className="mt-3 text-sm font-semibold text-heading" style={FONT_DISPLAY}>
            No listings found
          </h3>
          <p className="mt-1 text-sm text-muted">
            Try changing your search or filters.
          </p>
        </div>
      ) : (
        <section className="space-y-3">
          {logs.map((log) => (
            <article
              key={log._id}
              className="rounded-2xl border border-border bg-surface p-5 shadow-card"
            >
              <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="text-base font-semibold text-heading" style={FONT_DISPLAY}>
                      {log.name || "Untitled listing"}
                    </h3>
                    <span className="rounded-full border border-border bg-bg px-2.5 py-1 text-xs text-muted">
                      {(log.productType || "account").replaceAll("_", " ")}
                    </span>
                    <span
                      className={`rounded-full border px-2.5 py-1 text-xs font-medium ${
                        log.status === "active"
                          ? "border-success bg-success-soft text-success"
                          : "border-border bg-bg text-muted"
                      }`}
                    >
                      {(log.status || "unknown").replaceAll("_", " ")}
                    </span>
                  </div>
                  <p className="mt-1 text-sm text-muted">
                    {log.category || "Uncategorized"}
                    {Number.isFinite(Number(log.quantity)) ? ` · ${log.quantity} available` : ""}
                  </p>
                  {log.description && (
                    <p className="mt-2 line-clamp-2 text-sm text-body">
                      {log.description}
                    </p>
                  )}
                  <p className="mt-2 text-xs text-muted" style={FONT_MONO}>
                    Provider cost: {formatCurrency(log.providerPrice)}
                  </p>
                </div>
                <div className="flex shrink-0 flex-col gap-2 sm:flex-row sm:items-end">
                  <label className="space-y-1">
                    <span className="block text-xs font-medium text-muted">
                      Selling price (NGN)
                    </span>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={priceDrafts[log._id] ?? ""}
                      onChange={(event) =>
                        setPriceDrafts((current) => ({
                          ...current,
                          [log._id]: event.target.value,
                        }))
                      }
                      className="h-10 w-full rounded-lg border border-border bg-bg px-3 text-sm text-heading focus:border-brand focus:outline-none focus:ring-1 focus:ring-focus-ring sm:w-40"
                    />
                  </label>
                  <button
                    type="button"
                    onClick={() => void handleSavePrice(log)}
                    disabled={savingId === log._id}
                    className="inline-flex h-10 shrink-0 items-center justify-center gap-2 whitespace-nowrap rounded-lg bg-brand px-4 text-sm font-semibold text-on-brand transition-colors hover:bg-brand-hover disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {savingId === log._id ? (
                      <Loader2 size={15} className="animate-spin" />
                    ) : (
                      <Save size={15} />
                    )}
                    Save price
                  </button>
                </div>
              </div>
            </article>
          ))}
        </section>
      )}

      <div className="flex items-center justify-between rounded-xl border border-border bg-surface px-4 py-3">
        <p className="text-xs text-muted" style={FONT_MONO}>
          {pagination.total || 0} listings · Page {page} of {totalPages}
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
