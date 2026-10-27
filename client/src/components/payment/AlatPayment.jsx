import { ArrowLeft, ArrowRight, CreditCard, Loader } from "lucide-react";
import { useState } from "react";
import { initializeQuestPayment } from "../../service/payment";

const inputClass =
  "mt-2 h-12 w-full rounded-xl border border-border bg-bg px-4 text-heading outline-none transition-colors placeholder:text-muted focus:border-brand";

export default function AlatPayment({ amount = "", onBack }) {
  const [formData, setFormData] = useState({
    amount,
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((current) => ({ ...current, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    const questData = {
      amount: Number(formData.amount),
      paymentMethod: "QUEST",
    };
    try {
      const response = await initializeQuestPayment(questData);
      console.log("quest data: ", response.data);
      window.location.href = response.data;
    } catch (error) {
      console.error("Error initializing Squad payment: ", error);
      toast.error(
        error.message || "Failed to initiate Squad payment. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-bg px-4 py-6">
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
              <CreditCard size={17} />
              <span className="text-xs font-bold uppercase tracking-widest">
                QUEST
              </span>
            </div>
            <h2 className="mt-1 text-lg font-bold text-heading">
              Pay with QUEST
            </h2>
            <p className="mt-1 text-sm text-muted">
              Enter your details to continue with QUESTPay.
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 p-5">
          <div className="w-full">
            <label className="block">
              <span className="text-sm font-semibold text-muted">
                Amount (NGN)
              </span>
              <input
                name="amount"
                type="tel"
                value={formData.amount}
                onChange={handleChange}
                required
                className={inputClass}
              />
            </label>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-brand px-4 text-sm font-bold text-on-brand transition-colors hover:bg-brand"
          >
            Proceed with QUEST
            {loading ? (
              <Loader size={16} className="animate-spin text-heading" />
            ) : (
              <ArrowRight size={17} />
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
