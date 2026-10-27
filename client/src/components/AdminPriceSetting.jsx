// components/admin/PricingSettings.jsx
import React, { useState } from "react";
import { Loader2 } from "lucide-react";
import { updatePricingSettings } from "../service/admin.js";
import { toast } from "react-toastify";

const FONT_DISPLAY = {
  fontFamily: "'Space Grotesk', ui-sans-serif, system-ui",
};

const FONT_MONO = {
  fontFamily: "'JetBrains Mono', ui-monospace, monospace",
};

const AdminPriceSetting = () => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    nariaRate: "",
    markupType: "percentage",
    markupValue: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await updatePricingSettings(formData);
      toast.success("Pricing settings updated successfully.");
    } catch (error) {
      const message =
        error?.message ||
        error?.error ||
        error?.msg ||
        "Failed to update pricing settings.";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="overflow-hidden rounded-2xl border border-border bg-surface shadow-card">
      {/* Header band */}
      <div className="border-b border-border bg-bg px-6 py-5 sm:px-8">
        <h2
          className="text-lg font-bold text-heading"
          style={FONT_DISPLAY}
        >
          Global Price Control
        </h2>
        <p className="mt-1 text-sm leading-6 text-muted">
          Configure USD to NGN conversion rates and global markup settings for
          all products.
        </p>
      </div>

      <form onSubmit={handleSubmit}>
        {/* Form body */}
        <div className="grid gap-6 p-6 sm:p-8 md:grid-cols-3">
          {/* USD to NGN Rate */}
          <div>
            <label
              className="mb-2 block text-[10.5px] font-semibold uppercase tracking-wider text-muted"
              style={FONT_MONO}
            >
              USD to NGN Rate
            </label>
            <div className="relative">
              <span
                className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted"
                style={FONT_MONO}
              >
                ₦
              </span>
              <input
                type="number"
                name="nariaRate"
                value={formData.nariaRate}
                onChange={handleChange}
                required
                className="h-11 w-full rounded-lg border border-border bg-bg px-8 text-sm text-heading placeholder:text-muted focus:border-brand focus:outline-none focus:ring-1 focus:ring-focus-ring"
                style={FONT_MONO}
                placeholder="Enter Naira rate"
              />
            </div>
            <p
              className="mt-2 text-xs leading-5 text-muted"
              style={FONT_MONO}
            >
              Example: 1500 means 1 USD = 1500 NGN
            </p>
          </div>

          {/* Markup Type */}
          <div>
            <label
              className="mb-2 block text-[10.5px] font-semibold uppercase tracking-wider text-muted"
              style={FONT_MONO}
            >
              Markup Type
            </label>
            <div className="flex h-11 items-center gap-5">
              <label className="flex cursor-pointer items-center gap-2">
                <input
                  type="radio"
                  name="markupType"
                  value="percentage"
                  onChange={handleChange}
                  checked={formData.markupType === "percentage"}
                  className={`text-brand-text focus:ring-focus-ring ${
                    formData.markupType === "percentage" &&
                    "border-success border"
                  }`}
                />
                <span className="text-sm text-heading">Percentage (%)</span>
              </label>
              <label className="flex cursor-pointer items-center gap-2">
                <input
                  type="radio"
                  name="markupType"
                  value="fixed"
                  checked={formData.markupType === "fixed"}
                  onChange={handleChange}
                  className="text-brand-text focus:ring-focus-ring"
                />
                <span className="text-sm text-heading">Fixed (USD)</span>
              </label>
            </div>
            <p
              className="mt-2 text-xs leading-5 text-muted"
              style={FONT_MONO}
            >
              Choose how markup is applied to base prices
            </p>
          </div>

          {/* Markup Value */}
          <div>
            <label
              className="mb-2 block text-[10.5px] font-semibold uppercase tracking-wider text-muted"
              style={FONT_MONO}
            >
              Markup Value
            </label>
            <div className="relative">
              <span
                className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted"
                style={FONT_MONO}
              >
                {formData.markupType === "percentage" ? "%" : "$"}
              </span>
              <input
                type="number"
                value={formData.markupValue}
                onChange={handleChange}
                name="markupValue"
                className="h-11 w-full rounded-lg border border-border bg-bg px-8 text-sm text-heading placeholder:text-muted focus:border-brand focus:outline-none focus:ring-1 focus:ring-focus-ring"
                style={FONT_MONO}
                placeholder={`Enter markup ${
                  formData.markupType === "percentage" ? "percentage" : "amount"
                }`}
              />
            </div>
            <p
              className="mt-2 text-xs leading-5 text-muted"
              style={FONT_MONO}
            >
              {formData.markupType === "percentage"
                ? "Percentage added to the base price"
                : "Fixed USD amount added to the base price"}
            </p>
          </div>
        </div>

        {/* Footer action bar */}
        <div className="flex flex-col gap-3 border-t border-border bg-bg px-6 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-8">
          <p
            className="text-xs text-muted"
            style={FONT_MONO}
          >
            Changes apply globally to all products
          </p>
          <button
            type="submit"
            disabled={loading}
            className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-brand px-6 text-sm font-semibold text-on-brand transition-colors hover:bg-brand-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
            style={FONT_MONO}
          >
            {loading ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                Updating...
              </>
            ) : (
              "Update Price"
            )}
          </button>
        </div>
      </form>
    </section>
  );
};

export default AdminPriceSetting;