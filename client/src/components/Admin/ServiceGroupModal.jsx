import { useEffect, useState } from "react";
import {
  AlertCircle,
  Loader2,
  Pencil,
  Save,
  ShieldCheck,
  X,
} from "lucide-react";
import {
  getAllPlatformServices,
  updatePlatformServiceCustomPrice,
  updatePlatformServiceVisibility,
} from "../../service/admin.js";
import { formatCurrency } from "../../utils/transaction.js";
import { getNumberAvailabilityInfo } from "../../utils/availability.js";

const formatUsd = (value) =>
  `$${new Intl.NumberFormat("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(Number(value || 0))}`;

const normalizeListings = (response) => {
  const listings = Array.isArray(response?.data) ? response.data : [];

  return listings
    .map((item) => {
      const availability = getNumberAvailabilityInfo(item);

      return {
        id: item._id,
        provider: item.provider || "Auto",
        providerPrice: Number(item.providerPrice || 0),
        costPrice: Number(item.costPrice || 0),
        sellingPrice: Number(item.sellingPrice || 0),
        customPrice:
          item.customPrice === null || item.customPrice === undefined
            ? null
            : Number(item.customPrice),
        stock: Number(item.stock || 0),
        availabilityLabel: availability.label,
        availabilityDetail: availability.detail,
        availabilityClassName: availability.className,
        active: Boolean(item.active),
        isVisible: Boolean(item.isVisible),
      };
    })
    .sort((a, b) => a.providerPrice - b.providerPrice);
};

// Drill-down for one (service, country) pair — every provider price behind
// that pair, and the control to pick which single one becomes the
// isVisible listing users actually buy at.
export default function ServiceGroupModal({ group, onClose, onChanged }) {
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [updatingVisibilityId, setUpdatingVisibilityId] = useState("");
  const [editingId, setEditingId] = useState("");
  const [priceDraft, setPriceDraft] = useState("");
  const [savingPriceId, setSavingPriceId] = useState("");

  useEffect(() => {
    if (!group) return;

    const fetchListings = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await getAllPlatformServices({
          service: group.service,
          country: group.country,
          limit: 100,
        });

        setListings(normalizeListings(response));
      } catch (err) {
        console.error("Failed to fetch providers:", err);
        setError(err?.response?.data?.message || "Failed to load providers");
      } finally {
        setLoading(false);
      }
    };

    void fetchListings();
  }, [group]);

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === "Escape") onClose();
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  if (!group) return null;

  const handleSetVisible = async (item) => {
    if (item.isVisible || updatingVisibilityId) return;

    try {
      setUpdatingVisibilityId(item.id);
      setError("");
      await updatePlatformServiceVisibility(item.id, true);

      setListings((prev) =>
        prev.map((listing) => ({
          ...listing,
          isVisible: listing.id === item.id,
        })),
      );
      onChanged?.();
    } catch (err) {
      console.error("Failed to update visibility:", err);
      setError(err?.response?.data?.message || "Failed to update visibility");
    } finally {
      setUpdatingVisibilityId("");
    }
  };

  const startEditingPrice = (item) => {
    setEditingId(item.id);
    setPriceDraft(item.customPrice === null ? "" : String(item.customPrice));
  };

  const cancelEditingPrice = () => {
    setEditingId("");
    setPriceDraft("");
  };

  const saveCustomPrice = async (item) => {
    const priceValue = priceDraft.trim() === "" ? null : Number(priceDraft);

    if (priceValue !== null && (Number.isNaN(priceValue) || priceValue < 0)) {
      setError("Custom price should be a valid amount");
      return;
    }

    try {
      setSavingPriceId(item.id);
      setError("");
      await updatePlatformServiceCustomPrice(item.id, priceValue);

      setListings((prev) =>
        prev.map((listing) =>
          listing.id === item.id
            ? {
                ...listing,
                customPrice: priceValue,
                sellingPrice:
                  priceValue === null ? listing.sellingPrice : priceValue,
              }
            : listing,
        ),
      );
      cancelEditingPrice();
      onChanged?.();
    } catch (err) {
      console.error("Failed to update custom price:", err);
      setError(err?.response?.data?.message || "Failed to update custom price");
    } finally {
      setSavingPriceId("");
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-bg p-4"
      onClick={onClose}
    >
      <div
        className="max-h-[85vh] w-full max-w-2xl overflow-hidden rounded-2xl border border-border bg-surface-raised shadow-card"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-center justify-between gap-3 border-b border-border px-5 py-4">
          <div className="min-w-0">
            <h2 className="truncate text-sm font-semibold text-heading">
              {group.serviceName}
            </h2>
            <p className="mt-0.5 truncate text-xs text-muted">
              {group.country} · pick the provider price users see
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-border text-muted transition-colors hover:border-brand hover:text-heading"
          >
            <X size={16} />
          </button>
        </div>

        {error && (
          <div className="mx-5 mt-4 flex items-start gap-2 rounded-lg border border-border bg-brand p-3 text-sm text-on-brand">
            <AlertCircle size={16} className="mt-0.5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <div className="max-h-[60vh] space-y-2 overflow-y-auto p-5">
          {loading ? (
            <div className="flex items-center justify-center gap-2 py-12 text-sm text-muted">
              <Loader2 size={18} className="animate-spin" />
              Loading providers...
            </div>
          ) : listings.length === 0 ? (
            <p className="py-12 text-center text-sm text-muted">
              No providers found for this service and country.
            </p>
          ) : (
            listings.map((item) => (
              <div
                key={item.id}
                className={`rounded-xl border p-3.5 transition-colors ${
                  item.isVisible
                    ? "border-success bg-success-soft"
                    : "border-border bg-bg"
                }`}
              >
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-heading">
                      {item.provider}
                    </span>
                    <span
                      className={`rounded-full border px-2 py-0.5 text-xs font-semibold ${item.availabilityClassName}`}
                    >
                      {item.availabilityLabel}
                    </span>
                    {!item.active && (
                      <span className="rounded-full border border-border bg-surface px-2 py-0.5 text-xs font-semibold text-muted">
                        Inactive
                      </span>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={() => handleSetVisible(item)}
                    disabled={
                      item.isVisible || updatingVisibilityId === item.id
                    }
                    className={`inline-flex shrink-0 items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-semibold transition-colors disabled:cursor-not-allowed ${
                      item.isVisible
                        ? "border-success bg-success-soft text-success"
                        : "border-border text-muted hover:border-brand hover:bg-surface hover:text-heading disabled:opacity-60"
                    }`}
                  >
                    {updatingVisibilityId === item.id ? (
                      <Loader2 size={13} className="animate-spin" />
                    ) : item.isVisible ? (
                      <ShieldCheck size={13} />
                    ) : null}
                    {item.isVisible ? "Visible to users" : "Make Visible"}
                  </button>
                </div>

                <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-muted">
                      Provider (USD)
                    </p>
                    <p className="mt-0.5 text-sm text-muted">
                      {formatUsd(item.providerPrice)}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-muted">
                      Cost Price
                    </p>
                    <p className="mt-0.5 text-sm text-muted">
                      {formatCurrency(item.costPrice)}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-muted">
                      Selling Price
                    </p>
                    <p className="mt-0.5 text-sm font-semibold text-heading">
                      {formatCurrency(item.sellingPrice)}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-muted">
                      Custom Price
                    </p>
                    {editingId === item.id ? (
                      <div className="mt-0.5 flex items-center gap-1.5">
                        <input
                          value={priceDraft}
                          onChange={(e) => setPriceDraft(e.target.value)}
                          placeholder="Auto"
                          type="number"
                          min="0"
                          className="h-8 w-20 rounded-lg border border-border bg-bg px-2 text-xs text-heading outline-none focus:border-brand focus:ring-1 focus:ring-focus-ring"
                        />
                        <button
                          type="button"
                          onClick={() => saveCustomPrice(item)}
                          disabled={savingPriceId === item.id}
                          className="flex h-8 w-8 items-center justify-center rounded-lg border border-success bg-success-soft text-success transition-colors hover:bg-success-soft disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          {savingPriceId === item.id ? (
                            <Loader2 size={13} className="animate-spin" />
                          ) : (
                            <Save size={13} />
                          )}
                        </button>
                        <button
                          type="button"
                          onClick={cancelEditingPrice}
                          className="flex h-8 w-8 items-center justify-center rounded-lg border border-border text-muted transition-colors hover:bg-surface hover:text-heading"
                        >
                          <X size={13} />
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => startEditingPrice(item)}
                        className="mt-0.5 inline-flex items-center gap-1 text-sm text-muted transition-colors hover:text-heading"
                      >
                        {item.customPrice === null
                          ? "Auto"
                          : formatCurrency(item.customPrice)}
                        <Pencil size={11} className="text-muted" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
