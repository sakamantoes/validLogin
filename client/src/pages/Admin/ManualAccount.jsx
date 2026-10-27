import { useEffect, useMemo, useState } from "react";
import {
  AlertCircle,
  Building2,
  CheckCircle2,
  CreditCard,
  Loader2,
  RefreshCw,
  Save,
} from "lucide-react";
import {
  getAdminManualAccountDetails,
  updateAdminManualAccountDetails,
} from "../../service/admin.js";

const FONT_DISPLAY = {
  fontFamily: "'Space Grotesk', ui-sans-serif, system-ui",
};

const FONT_MONO = {
  fontFamily: "'JetBrains Mono', ui-monospace, monospace",
};

const initialForm = {
  bank_name: "",
  account_name: "",
  account_number: "",
};

const inputClass =
  "mt-2 h-12 w-full rounded-xl border border-border bg-bg px-4 text-sm text-heading outline-none transition-colors placeholder:text-muted focus:border-brand disabled:cursor-not-allowed disabled:opacity-60";

const detailValue = (value) => value || "Not set";

export default function ManualAccount() {
  const [formData, setFormData] = useState(initialForm);
  const [account, setAccount] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const previewAccount = useMemo(
    () => ({
      bank_name: formData.bank_name.trim(),
      account_name: formData.account_name.trim(),
      account_number: formData.account_number.trim(),
    }),
    [formData],
  );

  const fetchAccount = async () => {
    try {
      setLoading(true);
      setError("");
      const response = await getAdminManualAccountDetails();
      const nextAccount = response?.data || null;
      setAccount(nextAccount);
      setFormData({
        bank_name: nextAccount?.bank_name || "",
        account_name: nextAccount?.account_name || "",
        account_number: nextAccount?.account_number || "",
      });
    } catch (error) {
      setError(
        error?.response?.data?.message ||
          "Failed to load manual transfer account.",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAccount();
  }, []);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setError("");
    setSuccess("");
    setFormData((current) => ({ ...current, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const payload = {
      bank_name: formData.bank_name.trim(),
      account_name: formData.account_name.trim(),
      account_number: formData.account_number.trim(),
    };

    if (
      !payload.bank_name ||
      !payload.account_name ||
      !payload.account_number
    ) {
      setError("Bank name, account name, and account number are required.");
      return;
    }

    try {
      setSaving(true);
      setError("");
      setSuccess("");
      const response = await updateAdminManualAccountDetails(payload);
      const updatedAccount = response?.data || payload;
      setAccount(updatedAccount);
      setFormData({
        bank_name: updatedAccount.bank_name || "",
        account_name: updatedAccount.account_name || "",
        account_number: updatedAccount.account_number || "",
      });
      setSuccess("Manual transfer account updated successfully.");
    } catch (error) {
      setError(
        error?.response?.data?.message ||
          error?.message ||
          "Failed to update manual transfer account.",
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      {/* Page header — title, description, and refresh action */}
      <section className="slanted-page-header rounded-2xl border border-border bg-surface p-6 shadow-card sm:p-8">
        <div className="flex flex-col gap-5 md:flex-row md:items-start md:justify-between">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-brand text-on-brand">
              <Building2 size={22} />
            </div>
            <div>
              <div
                className="inline-flex items-center gap-2 rounded-full border border-border bg-brand px-3 py-1 text-[10.5px] font-semibold uppercase tracking-wider text-on-brand"
                style={FONT_MONO}
              >
                <Building2 size={11} />
                Manual Transfer Account
              </div>
              <h1
                className="mt-3 text-2xl font-bold text-heading"
                style={FONT_DISPLAY}
              >
                Bank Account Configuration
              </h1>
              <p className="mt-1.5 max-w-2xl text-sm text-muted">
                Set the account users see when they choose manual transfer.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={fetchAccount}
            disabled={loading || saving}
            className="inline-flex h-11 shrink-0 items-center justify-center gap-2 rounded-xl border border-border bg-surface px-4 text-sm font-semibold text-heading transition-colors hover:bg-bg disabled:cursor-not-allowed disabled:opacity-60"
            style={FONT_MONO}
          >
            <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
            Refresh
          </button>
        </div>
      </section>

      {/* Feedback banners */}
      {success ? (
        <div
          className="flex items-start gap-2 rounded-xl border border-success bg-success-soft p-4 text-sm text-success"
          style={FONT_MONO}
        >
          <CheckCircle2 size={17} className="mt-0.5 shrink-0" />
          <p>{success}</p>
        </div>
      ) : null}

      {error ? (
        <div
          className="flex items-start gap-2 rounded-xl border border-border bg-brand p-4 text-sm text-on-brand"
          style={FONT_MONO}
        >
          <AlertCircle size={17} className="mt-0.5 shrink-0" />
          <p>{error}</p>
        </div>
      ) : null}

      {/* Two-column workspace */}
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(320px,420px)]">
        {/* Form panel */}
        <form
          onSubmit={handleSubmit}
          className="rounded-2xl border border-border bg-surface p-6 shadow-card"
        >
          <div className="flex items-center justify-between gap-4 border-b border-border pb-4">
            <div>
              <h2
                className="text-lg font-bold text-heading"
                style={FONT_DISPLAY}
              >
                Account Details
              </h2>
              <p className="mt-1 text-sm text-muted">
                These details replace the manual transfer account on the user
                payment screen.
              </p>
            </div>
            {loading ? (
              <Loader2 size={20} className="animate-spin text-brand-text" />
            ) : null}
          </div>

          <div className="mt-6 grid gap-5">
            <label className="block">
              <span
                className="text-xs font-semibold uppercase tracking-wider text-muted"
                style={FONT_MONO}
              >
                Bank Name
              </span>
              <input
                name="bank_name"
                type="text"
                value={formData.bank_name}
                onChange={handleChange}
                placeholder="Enter bank name"
                disabled={loading || saving}
                required
                className={inputClass}
                style={FONT_MONO}
              />
            </label>

            <label className="block">
              <span
                className="text-xs font-semibold uppercase tracking-wider text-muted"
                style={FONT_MONO}
              >
                Account Name
              </span>
              <input
                name="account_name"
                type="text"
                value={formData.account_name}
                onChange={handleChange}
                placeholder="Enter account name"
                disabled={loading || saving}
                required
                className={inputClass}
                style={FONT_MONO}
              />
            </label>

            <label className="block">
              <span
                className="text-xs font-semibold uppercase tracking-wider text-muted"
                style={FONT_MONO}
              >
                Account Number
              </span>
              <input
                name="account_number"
                type="text"
                inputMode="numeric"
                value={formData.account_number}
                onChange={handleChange}
                placeholder="Enter account number"
                disabled={loading || saving}
                required
                className={inputClass}
                style={FONT_MONO}
              />
            </label>
          </div>

          <button
            type="submit"
            disabled={loading || saving}
            className="mt-6 inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-brand px-4 text-sm font-bold text-on-brand transition-colors hover:bg-brand disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
            style={FONT_MONO}
          >
            {saving ? (
              <Loader2 size={17} className="animate-spin" />
            ) : (
              <Save size={17} />
            )}
            Save Account
          </button>
        </form>

        {/* Preview panel */}
        <aside className="space-y-4 rounded-2xl border border-border bg-surface p-6 shadow-card">
          <div className="flex items-center gap-3 border-b border-border pb-4">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-brand text-on-brand">
              <CreditCard size={20} />
            </div>
            <div>
              <h3
                className="text-lg font-bold text-heading"
                style={FONT_DISPLAY}
              >
                User Preview
              </h3>
              <p className="text-xs text-muted" style={FONT_MONO}>
                Manual transfer card
              </p>
            </div>
          </div>

          <div className="rounded-xl border border-border bg-bg p-4">
            <div className="flex justify-between gap-4 py-2.5">
              <span
                className="text-xs font-medium uppercase tracking-wider text-muted"
                style={FONT_MONO}
              >
                Bank
              </span>
              <span className="text-right text-sm font-semibold text-heading">
                {detailValue(previewAccount.bank_name)}
              </span>
            </div>
            <div className="flex justify-between gap-4 border-t border-border py-2.5">
              <span
                className="text-xs font-medium uppercase tracking-wider text-muted"
                style={FONT_MONO}
              >
                Account Name
              </span>
              <span className="text-right text-sm font-semibold text-heading">
                {detailValue(previewAccount.account_name)}
              </span>
            </div>
            <div className="flex justify-between gap-4 border-t border-border py-2.5">
              <span
                className="text-xs font-medium uppercase tracking-wider text-muted"
                style={FONT_MONO}
              >
                Account Number
              </span>
              <span
                className="text-right text-sm font-semibold text-heading"
                style={FONT_MONO}
              >
                {detailValue(previewAccount.account_number)}
              </span>
            </div>
          </div>

          <div className="rounded-xl border border-border bg-bg p-4">
            <p
              className="text-[10.5px] font-semibold uppercase tracking-wider text-muted"
              style={FONT_MONO}
            >
              Current saved account
            </p>
            <p className="mt-2 text-sm text-muted">
              {account
                ? `${account.bank_name} - ${account.account_name}`
                : "No account saved yet."}
            </p>
          </div>
        </aside>
      </div>
    </div>
  );
}