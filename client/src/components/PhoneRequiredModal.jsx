// src/components/PhoneRequiredModal.jsx
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Phone, AlertCircle, X, Loader2 } from "lucide-react";
import { toast } from "react-toastify";
import { updatePhone } from "../service/auth";
import useAuth from "../store/useAuth";

const FONT_DISPLAY = {
  fontFamily: "'Space Grotesk', ui-sans-serif, system-ui",
};

const normalizePhone = (raw) => {
  const digits = String(raw || "").replace(/\D/g, "");
  if (/^234\d{10}$/.test(digits)) return "0" + digits.slice(3);
  return digits;
};

/**
 * Modal that forces the user to enter a Nigerian phone number.
 * Used when:
 *  - Existing users (Google signup or pre-phone-era accounts) attempt
 *    a C-TEX deposit without a phone on file.
 *  - The user opens Settings and wants to add or change their phone.
 *
 * Props:
 *  - open: boolean
 *  - onClose: () => void
 *  - onSuccess: (phone: string) => void  (optional)
 *  - dismissible: boolean (default true)  — if false, user can't close
 *    the modal without saving (e.g. blocked C-TEX deposit flow).
 */
export default function PhoneRequiredModal({
  open,
  onClose,
  onSuccess,
  dismissible = true,
}) {
  const { user, updateUser } = useAuth();
  const [phone, setPhone] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const profile = user?.data || user || {};

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    const normalized = normalizePhone(phone);
    if (!/^0\d{10}$/.test(normalized)) {
      setError("Enter a valid 11-digit Nigerian number, e.g. 08012345678");
      return;
    }

    setSubmitting(true);
    try {
      const response = await updatePhone(normalized);

      // Keep the auth store in sync so other pages see the new phone
      if (updateUser) {
        updateUser({ ...profile, phone: normalized });
      }

      toast.success("Phone number saved");
      onSuccess?.(normalized);
      onClose?.();
      setPhone("");
    } catch (err) {
      setError(
        err?.response?.data?.message ||
          "Failed to save phone number. Please try again.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!dismissible) return;
    setPhone("");
    setError("");
    onClose?.();
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
          onClick={handleClose}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 12 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 12 }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-md overflow-hidden rounded-2xl border border-border bg-surface shadow-xl"
          >
            <div className="p-6">
              <div className="mb-4 flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-soft text-brand-text">
                    <Phone size={18} />
                  </div>
                  <div>
                    <h2
                      style={FONT_DISPLAY}
                      className="text-base font-semibold text-heading"
                    >
                      Phone number required
                    </h2>
                    <p className="mt-0.5 text-xs text-muted">
                      We need your Nigerian phone to complete deposits.
                    </p>
                  </div>
                </div>
                {dismissible && (
                  <button
                    type="button"
                    onClick={handleClose}
                    className="rounded-lg p-1 text-muted hover:bg-bg-subtle hover:text-heading"
                    aria-label="Close"
                  >
                    <X size={18} />
                  </button>
                )}
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-body">
                    Nigerian phone number
                  </label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => {
                      setPhone(e.target.value);
                      if (error) setError("");
                    }}
                    placeholder="08012345678"
                    maxLength={11}
                    inputMode="numeric"
                    autoFocus
                    className={`w-full rounded-xl border bg-bg-subtle px-3.5 py-2.5 text-sm text-heading placeholder:text-muted focus:outline-none focus:ring-2 ${
                      error
                        ? "border-danger focus:border-danger focus:ring-danger/20"
                        : "border-border focus:border-brand focus:ring-brand/20"
                    }`}
                  />
                  {!error && (
                    <p className="mt-1.5 text-[11.5px] text-muted">
                      11 digits starting with 0, e.g. 08012345678
                    </p>
                  )}
                </div>

                {error && (
                  <div className="flex items-start gap-2 rounded-xl border border-danger/20 bg-danger-soft px-3 py-2.5 text-xs text-danger">
                    <AlertCircle size={14} className="mt-0.5 shrink-0" />
                    <span>{error}</span>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={submitting}
                  style={FONT_DISPLAY}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-brand px-4 py-2.5 text-sm font-medium text-on-brand transition-opacity hover:opacity-90 disabled:opacity-60"
                >
                  {submitting ? (
                    <>
                      <Loader2 size={15} className="animate-spin" />
                      Saving...
                    </>
                  ) : (
                    "Save phone number"
                  )}
                </button>
              </form>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}