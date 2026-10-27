import { ChevronLeft, ChevronRight } from "lucide-react";

const getPageList = (current, total) => {
  const delta = 1;
  const range = [];

  for (
    let i = Math.max(2, current - delta);
    i <= Math.min(total - 1, current + delta);
    i += 1
  ) {
    range.push(i);
  }

  if (current - delta > 2) range.unshift("...");
  if (current + delta < total - 1) range.push("...");

  return [1, ...range, total];
};

export default function Pagination({ page, totalPages, onPageChange, className = "" }) {
  if (totalPages <= 1) {
    return null;
  }

  const pages = getPageList(page, totalPages);

  return (
    <nav
      aria-label="Pagination"
      className={`flex flex-wrap items-center justify-between gap-3 ${className}`}
    >
      <button
        type="button"
        onClick={() => onPageChange(page - 1)}
        disabled={page <= 1}
        className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-border bg-bg px-3 text-sm font-medium text-muted transition-colors hover:border-brand hover:bg-surface hover:text-heading disabled:cursor-not-allowed disabled:opacity-40"
      >
        <ChevronLeft size={15} />
        Prev
      </button>

      <div className="flex items-center gap-1">
        {pages.map((p, idx) =>
          p === "..." ? (
            <span
              key={`ellipsis-${idx}`}
              className="px-1.5 text-sm text-muted"
            >
              …
            </span>
          ) : (
            <button
              key={p}
              type="button"
              onClick={() => onPageChange(p)}
              aria-current={p === page ? "page" : undefined}
              className={`flex h-9 min-w-9 items-center justify-center rounded-lg px-2 text-sm font-medium transition-colors ${
                p === page
                  ? "border border-brand bg-brand text-on-brand"
                  : "border border-transparent text-muted hover:bg-surface hover:text-heading"
              }`}
            >
              {p}
            </button>
          ),
        )}
      </div>

      <button
        type="button"
        onClick={() => onPageChange(page + 1)}
        disabled={page >= totalPages}
        className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-border bg-bg px-3 text-sm font-medium text-muted transition-colors hover:border-brand hover:bg-surface hover:text-heading disabled:cursor-not-allowed disabled:opacity-40"
      >
        Next
        <ChevronRight size={15} />
      </button>
    </nav>
  );
}
