import { ArrowLeft } from "lucide-react";

export default function CtexPaymentShell({
  title,
  subtitle,
  onBack,
  children,
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-bg px-4 py-6 overflow-y-auto">
      <div className="w-full max-w-lg overflow-hidden rounded-2xl border border-border bg-surface-raised shadow-card">
        <div className="flex items-start gap-3 border-b border-border px-5 py-4">
          {onBack && (
            <button
              type="button"
              onClick={onBack}
              aria-label="Go back"
              className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-border text-muted transition-colors hover:border-brand hover:text-heading"
            >
              <ArrowLeft size={18} />
            </button>
          )}
          <div>
            <h2 className="text-lg font-bold text-heading">{title}</h2>
            {subtitle && <p className="mt-1 text-sm text-muted">{subtitle}</p>}
          </div>
        </div>
        <div className="p-5">{children}</div>
      </div>
    </div>
  );
}