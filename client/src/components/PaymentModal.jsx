import {
  ArrowLeft,
  ArrowRight,
  Building2,
  CreditCard,
  Landmark,
  X,
} from "lucide-react";
import { useState } from "react";

const paymentOptions = [
  {
    id: "quest",
    title: "Pay with QUEST",
    description: "Use QUESTPay to fund your wallet instantly.",
    icon: CreditCard,
  },
  {
    id: "manual-transfer",
    title: "Manual Transfer",
    description: "Send money to the account below for confirmation.",
    icon: Building2,
  },
];

export default function PaymentModal({
  isOpen = true,
  initialAmount = "",
  onClose,
  showBackButton = false,
  onSelectPaymentMethod,
}) {
  const [selectedMethod, setSelectedMethod] = useState("squad");
  const [amount, setAmount] = useState(initialAmount);

  if (!isOpen) return null;

  const selectedOption = paymentOptions.find(
    (option) => option.id === selectedMethod,
  );

  const handleProceed = () => {
    onSelectPaymentMethod?.({
      amount: Number(amount),
      paymentMethod: selectedMethod,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-bg px-4 py-6 overflow-y-auto">
      <div className="w-full max-w-lg overflow-hidden rounded-2xl border border-border bg-surface-raised shadow-card">
        <div className="flex items-start justify-between border-b border-border px-5 py-4">
          <div className="flex items-start gap-3">
            {showBackButton && (
              <button
                type="button"
                onClick={onClose}
                aria-label="Go back"
                className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-border text-muted transition-colors hover:border-brand hover:text-heading"
              >
                <ArrowLeft size={18} />
              </button>
            )}
            <div>
              <h2 className="text-lg font-bold text-heading">Fund Account</h2>
              <p className="mt-1 text-sm text-muted">
                Choose how you want to add money to your wallet.
              </p>
            </div>
          </div>
          {!showBackButton && (
            <button
              type="button"
              onClick={onClose}
              aria-label="Close payment modal"
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-border text-muted transition-colors hover:border-brand hover:text-heading"
            >
              <X size={18} />
            </button>
          )}
        </div>

        <div className="space-y-5 p-5">
          <label className="block">
            <span className="text-sm font-semibold text-muted">Amount</span>
            <input
              type="number"
              min="100"
              value={amount}
              onChange={(event) => setAmount(event.target.value)}
              placeholder="Enter amount"
              className="mt-2 h-12 w-full rounded-xl border border-border bg-bg px-4 text-heading outline-none transition-colors placeholder:text-muted focus:border-brand"
            />
          </label>

          <div className="grid gap-3">
            {paymentOptions.map((option) => {
              const Icon = option.icon;
              const isSelected = selectedMethod === option.id;

              return (
                <button
                  key={option.id}
                  type="button"
                  onClick={() => setSelectedMethod(option.id)}
                  className={`flex items-center gap-3 rounded-xl border p-4 text-left transition-all ${
                    isSelected
                      ? "border-brand bg-brand"
                      : "border-border bg-bg hover:border-brand hover:bg-surface"
                  }`}
                >
                  <span
                    className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-lg ${
                      isSelected
                        ? "bg-brand text-on-brand"
                        : "bg-surface text-muted"
                    }`}
                  >
                    <Icon size={20} />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-sm font-bold text-heading">
                      {option.title}
                    </span>
                    <span className="mt-1 block text-xs leading-5 text-muted">
                      {option.description}
                    </span>
                  </span>
                  <ArrowRight
                    size={18}
                    className={isSelected ? "text-brand-text" : "text-muted"}
                  />
                </button>
              );
            })}
          </div>

          <button
            type="button"
            onClick={handleProceed}
            disabled={!amount || Number(amount) <= 0}
            className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-brand px-4 text-sm font-bold text-on-brand transition-colors hover:bg-brand disabled:cursor-not-allowed disabled:opacity-50"
          >
            Continue with {selectedOption?.title.replace("Pay with ", "")}
            <ArrowRight size={17} />
          </button>
        </div>
      </div>
    </div>
  );
}
