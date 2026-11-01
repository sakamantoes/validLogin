import { useMemo, useState } from "react";
import { ClipboardCopy, Eye, EyeOff } from "lucide-react";
import { toast } from "react-toastify";

const formatLabel = (label) =>
  String(label)
    .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
    .replace(/[_-]+/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/\b\w/g, (letter) => letter.toUpperCase());

const flattenDetails = (value, parentLabel = "") => {
  if (value === null || value === undefined) {
    return [];
  }

  if (Array.isArray(value)) {
    return value.flatMap((item, index) =>
      flattenDetails(item, parentLabel || `Account ${index + 1}`),
    );
  }

  if (typeof value === "object") {
    return Object.entries(value).flatMap(([key, item]) => {
      const label = parentLabel
        ? `${parentLabel} / ${formatLabel(key)}`
        : formatLabel(key);

      if (item && typeof item === "object") {
        return flattenDetails(item, label);
      }

      if (item === null || item === undefined) {
        return [];
      }

      return [{ label, value: String(item) }];
    });
  }

  return [{ label: parentLabel || "Account details", value: String(value) }];
};

export default function AccountDetails({ details }) {
  const [revealedFields, setRevealedFields] = useState({});
  const fields = useMemo(() => flattenDetails(details), [details]);

  const copyText = async (text, message) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success(message);
    } catch (error) {
      console.error("Failed to copy account details:", error);
      toast.error("Failed to copy account details");
    }
  };

  if (fields.length === 0) {
    return (
      <p className="text-sm text-muted">
        Account details will appear here once they are delivered.
      </p>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h4 className="text-sm font-semibold text-heading">
          Account details
        </h4>
        <button
          type="button"
          onClick={() =>
            void copyText(
              fields.map(({ label, value }) => `${label}: ${value}`).join("\n"),
              "Account details copied",
            )
          }
          className="inline-flex h-9 items-center gap-2 rounded-lg border border-border px-3 text-xs font-semibold text-muted transition-colors hover:border-brand hover:text-heading"
        >
          <ClipboardCopy size={14} />
          Copy all
        </button>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        {fields.map(({ label, value }, index) => {
          const revealed = Boolean(revealedFields[index]);

          return (
            <label key={`${label}-${index}`} className="min-w-0">
              <span className="mb-1 block text-xs font-medium text-muted">
                {label}
              </span>
              <span className="flex min-w-0 items-center gap-1">
                <input
                  type={revealed ? "text" : "password"}
                  value={value}
                  readOnly
                  autoComplete="off"
                  className="h-10 min-w-0 flex-1 rounded-lg border border-border bg-bg px-3 text-sm text-heading focus:border-brand focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() =>
                    setRevealedFields((current) => ({
                      ...current,
                      [index]: !current[index],
                    }))
                  }
                  aria-label={revealed ? `Hide ${label}` : `Show ${label}`}
                  title={revealed ? "Hide value" : "Show value"}
                  className="grid h-10 w-10 shrink-0 place-items-center rounded-lg border border-border text-muted transition-colors hover:border-brand hover:text-heading"
                >
                  {revealed ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
                <button
                  type="button"
                  onClick={() => void copyText(value, `${label} copied`)}
                  aria-label={`Copy ${label}`}
                  title={`Copy ${label}`}
                  className="grid h-10 w-10 shrink-0 place-items-center rounded-lg border border-border text-muted transition-colors hover:border-brand hover:text-heading"
                >
                  <ClipboardCopy size={15} />
                </button>
              </span>
            </label>
          );
        })}
      </div>
    </div>
  );
}
