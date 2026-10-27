import { Monitor, Moon, Sun } from "lucide-react";
import { useTheme } from "../context/theme";

const options = [
  { value: "light", label: "Light theme", icon: Sun },
  { value: "dark", label: "Dark theme", icon: Moon },
  { value: "system", label: "Use system theme", icon: Monitor },
];

export default function ThemeToggle({ className = "" }) {
  const { theme, setTheme } = useTheme();

  return (
    <div
      className={`inline-flex rounded-lg border border-border bg-surface-raised p-1 text-muted shadow-card ${className}`.trim()}
      role="group"
      aria-label="Theme preference"
    >
      {options.map(({ value, label, icon: Icon }) => (
        <button
          key={value}
          type="button"
          aria-label={label}
          aria-pressed={theme === value}
          title={label}
          onClick={() => setTheme(value)}
          className={`flex h-8 w-8 items-center justify-center rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-focus-ring ${
            theme === value
              ? "bg-brand text-on-brand"
              : "text-muted hover:bg-brand-soft hover:text-on-brand"
          }`}
        >
          <Icon size={16} aria-hidden="true" />
        </button>
      ))}
    </div>
  );
}
