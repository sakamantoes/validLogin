export default function EmptyState({
  icon: Icon,
  title,
  description,
  actionLabel,
  onAction,
  className = "",
}) {
  return (
    <div
      className={`rounded-lg border border-border bg-bg px-4 py-8 text-center sm:py-10 ${className}`.trim()}
    >
      {Icon ? <Icon size={26} className="mx-auto text-muted" /> : null}
      {title ? (
        <h3 className="mt-3 text-sm font-semibold text-heading">
          {title}
        </h3>
      ) : null}
      {description ? (
        <p className="mx-auto mt-1 max-w-xs text-xs text-muted">
          {description}
        </p>
      ) : null}
      {actionLabel && onAction ? (
        <button
          type="button"
          onClick={onAction}
          className="mt-4 inline-flex h-9 items-center gap-2 rounded-lg border border-brand bg-brand px-4 text-xs font-semibold text-on-brand transition-colors hover:bg-brand hover:text-on-brand"
        >
          {actionLabel}
        </button>
      ) : null}
    </div>
  );
}
