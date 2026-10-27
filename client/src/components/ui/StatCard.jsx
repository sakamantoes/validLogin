const FONT_DISPLAY = {
  fontFamily: "'Space Grotesk', ui-sans-serif, system-ui",
};
const FONT_MONO = { fontFamily: "'JetBrains Mono', ui-monospace, monospace" };

export default function StatCard({
  label,
  value,
  change,
  icon: Icon,
  iconBg = "bg-brand-soft",
  iconColor = "text-brand-text",
  changeBg = "bg-bg-subtle text-body border-border",
}) {
  return (
    <div className="group rounded-2xl border border-border bg-surface p-5 shadow-card transition-colors hover:border-border-strong">
      <div className="flex items-start justify-between gap-3">
        {Icon ? (
          <div
            className={`flex h-10 w-10 items-center justify-center rounded-xl ${iconBg} ${iconColor}`}
          >
            <Icon size={19} />
          </div>
        ) : null}
        {change ? (
          <span
            style={FONT_MONO}
            className={`rounded-full border px-2.5 py-0.5 text-xs font-medium shadow-none ${changeBg}`}
          >
            {change}
          </span>
        ) : null}
      </div>
      <p
        style={FONT_DISPLAY}
        className="mt-4 text-xs font-medium uppercase tracking-widest text-muted"
      >
        {label}
      </p>
      <p
        style={FONT_DISPLAY}
        className="mt-1 min-w-[4ch] text-2xl font-bold tabular-nums tracking-tight text-heading"
      >
        {value}
      </p>
    </div>
  );
}
