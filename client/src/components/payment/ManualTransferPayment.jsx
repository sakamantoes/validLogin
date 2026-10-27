import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  Building2,
  CheckCircle2,
  Loader2,
} from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import {
  getManualAccountDetails,
  manualBankPayment,
  uploadImage,
} from "../../service/payment.js";

const inputClass =
  "mt-2 h-12 w-full rounded-xl border border-border bg-bg px-4 text-heading outline-none transition-colors placeholder:text-muted focus:border-brand";

export default function ManualTransferPayment({ amount = "", onBack }) {
  const [formData, setFormData] = useState({
    depositorName: "",
    amount,
  });
  const [receiptImage, setReceiptImage] = useState(null);
  const [receiptPreview, setReceiptPreview] = useState("");
  const [loading, setLoading] = useState(false);
  const [accountLoading, setAccountLoading] = useState(true);
  const [manualAccount, setManualAccount] = useState(null);
  const [requestError, setRequestError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    let ignore = false;

    const fetchManualAccount = async () => {
      try {
        setAccountLoading(true);
        const response = await getManualAccountDetails();
        if (!ignore) {
          setManualAccount(response?.data || null);
        }
      } catch (error) {
        if (!ignore) {
          const message =
            error?.response?.data?.message ||
            "Unable to load transfer account. Please try again.";
          setRequestError(message);
        }
      } finally {
        if (!ignore) {
          setAccountLoading(false);
        }
      }
    };

    fetchManualAccount();

    return () => {
      ignore = true;
    };
  }, []);

  useEffect(() => {
    return () => {
      if (receiptPreview) {
        URL.revokeObjectURL(receiptPreview);
      }
    };
  }, [receiptPreview]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setRequestError("");
    setSuccessMessage("");
    setFormData((current) => ({ ...current, [name]: value }));
  };

  const handleReceiptChange = (event) => {
    const file = event.target.files?.[0];

    setRequestError("");
    setSuccessMessage("");

    if (!file) {
      setReceiptImage(null);
      if (receiptPreview) {
        URL.revokeObjectURL(receiptPreview);
      }
      setReceiptPreview("");
      return;
    }

    if (!file.type.startsWith("image/")) {
      setReceiptImage(null);
      if (receiptPreview) {
        URL.revokeObjectURL(receiptPreview);
      }
      setReceiptPreview("");
      setRequestError("Please select a valid image receipt.");
      event.target.value = "";
      return;
    }

    if (receiptPreview) {
      URL.revokeObjectURL(receiptPreview);
    }

    setReceiptImage(file);
    setReceiptPreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    setLoading(true);
    setRequestError("");
    setSuccessMessage("");

    try {
      if (!manualAccount) {
        throw new Error("Transfer account is not available yet.");
      }

      if (!receiptImage) {
        throw new Error("Please upload your payment receipt image.");
      }

      const uploadedReceipt = await uploadImage(receiptImage);

      if (!uploadedReceipt?.url) {
        throw new Error("Receipt upload failed. Please try again.");
      }

      const payload = {
        depositorName: formData.depositorName.trim(),
        transactionId: uploadedReceipt.url,
        amount: Number(formData.amount),
      };

      const response = await manualBankPayment(payload);
      if (!response?.success) {
        throw new Error(response?.message || "Transfer submission failed.");
      }

      const message =
        response?.message ||
        "Transfer submitted successfully. We will confirm it shortly.";

      setSuccessMessage(message);
      toast.success(message);
      setFormData((current) => ({
        ...current,
        depositorName: "",
      }));
      setReceiptImage(null);
      setReceiptPreview("");
      event.target.reset();
    } catch (error) {
      const message =
        error?.response?.data?.message ||
        error?.message ||
        "Something went wrong. Try again.";

      console.error("error submitting manual payment: ", error);
      setRequestError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-bg px-4 py-6">
      <div className="w-full max-w-lg overflow-hidden rounded-2xl border border-border bg-surface-raised shadow-card">
        <div className="flex items-start gap-3 border-b border-border px-5 py-4">
          <button
            type="button"
            onClick={onBack}
            aria-label="Back to payment methods"
            className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-border text-muted transition-colors hover:border-brand hover:text-heading"
          >
            <ArrowLeft size={18} />
          </button>
          <div>
            <div className="flex items-center gap-2 text-brand-text">
              <Building2 size={17} />
              <span className="text-xs font-bold uppercase tracking-widest">
                Transfer
              </span>
            </div>
            <h2 className="mt-1 text-lg font-bold text-heading">
              Manual Transfer
            </h2>
            <p className="mt-1 text-sm text-muted">
              Transfer to the account below and submit your payment details.
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 p-5">
          {successMessage ? (
            <div className="flex items-start gap-2 rounded-xl border border-success bg-success-soft p-3 text-sm text-success">
              <CheckCircle2 size={16} className="mt-0.5 shrink-0" />
              <p>{successMessage}</p>
            </div>
          ) : null}

          {requestError ? (
            <div className="flex items-start gap-2 rounded-xl border border-border bg-brand p-3 text-sm text-on-brand">
              <AlertCircle size={16} className="mt-0.5 shrink-0" />
              <p>{requestError}</p>
            </div>
          ) : null}

          {accountLoading ? (
            <div className="flex items-center gap-2 rounded-xl border border-border bg-bg p-4 text-sm text-muted">
              <Loader2 size={16} className="animate-spin text-brand-text" />
              Loading transfer account...
            </div>
          ) : manualAccount ? (
            <div className="rounded-xl border border-border bg-bg p-4 text-sm text-muted">
              <div className="flex justify-between gap-4 py-1">
                <span className="text-muted">Bank</span>
                <span className="text-right font-semibold text-heading">
                  {manualAccount.bank_name}
                </span>
              </div>
              <div className="flex justify-between gap-4 py-1">
                <span className="text-muted">Account Name</span>
                <span className="text-right font-semibold text-heading">
                  {manualAccount.account_name}
                </span>
              </div>
              <div className="flex justify-between gap-4 py-1">
                <span className="text-muted">Account Number</span>
                <span className="text-right font-mono font-semibold text-heading">
                  {manualAccount.account_number}
                </span>
              </div>
            </div>
          ) : (
            <div className="flex items-start gap-2 rounded-xl border border-border bg-brand p-3 text-sm text-on-brand">
              <AlertCircle size={16} className="mt-0.5 shrink-0" />
              <p>No manual transfer account has been set by admin.</p>
            </div>
          )}

          <label className="block">
            <span className="text-sm font-semibold text-muted">
              Depositor Account name
            </span>
            <input
              name="depositorName"
              type="text"
              value={formData.depositorName}
              onChange={handleChange}
              placeholder="Name used for transfer"
              required
              disabled={loading}
              className={inputClass}
            />
          </label>

          <label className="block">
            <span className="text-sm font-semibold text-muted">
              Payment receipt image
            </span>
            <input
              name="transactionId"
              type="file"
              accept="image/*"
              onChange={handleReceiptChange}
              required
              disabled={loading}
              className="mt-2 block w-full cursor-pointer rounded-xl border border-border bg-bg text-sm text-muted outline-none transition-colors file:mr-4 file:h-12 file:border-0 file:bg-brand file:px-4 file:text-sm file:font-semibold file:text-on-brand hover:file:bg-brand disabled:cursor-not-allowed disabled:opacity-60"
            />
          </label>

          {receiptPreview ? (
            <div className="rounded-xl border border-border bg-bg p-3">
              <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-muted">
                Receipt Preview
              </p>
              <img
                src={receiptPreview}
                alt="Payment receipt preview"
                className="h-40 w-full rounded-lg object-cover"
              />
            </div>
          ) : null}

          <label className="block">
            <span className="text-sm font-semibold text-muted">Amount</span>
            <input
              name="amount"
              type="number"
              min="100"
              value={formData.amount}
              onChange={handleChange}
              required
              disabled={loading}
              className={inputClass}
            />
          </label>

          <button
            type="submit"
            disabled={loading || accountLoading || !manualAccount}
            className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-brand px-4 text-sm font-bold text-on-brand transition-colors hover:bg-brand disabled:cursor-not-allowed disabled:opacity-50"
          >
            <span>Submit Transfer Details</span>
            {loading ? (
              <Loader2 size={17} className="animate-spin" />
            ) : (
              <ArrowRight size={17} />
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
