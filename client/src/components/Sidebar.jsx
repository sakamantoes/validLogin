// components/Sidebar.jsx
import { NavLink, useNavigate } from "react-router-dom";
import { LogOut } from "lucide-react";
import useAuth from "../store/useAuth";
import imageObject from "../utils/image";

const FONT_DISPLAY = {
  fontFamily: "'Space Grotesk', ui-sans-serif, system-ui",
};

const FONT_MONO = {
  fontFamily: "'JetBrains Mono', ui-monospace, monospace",
};

export default function Sidebar({
  navItems,
  onNavigate,
  workspaceLabel = "Admin Workspace",
  userRole = "user",
  onLogout,
}) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const profile = user?.data || user || {};
  const isAdmin = userRole === "admin";

  const initial = (profile.name || profile.email || (isAdmin ? "A" : "U"))
    .slice(0, 1)
    .toUpperCase();
  const displayName =
    profile.username || profile.name || (isAdmin ? "Admin User" : "Verified User");
  const displayEmail =
    profile.email ||
    (isAdmin ? "admin@waveverify.com" : "user@waveverify.com");

  // user -> "User Workspace", admin -> provided label
  const workspaceText = userRole === "user" ? "User Workspace" : workspaceLabel;
  const roleText = isAdmin ? "Admin" : "Member";

  const handleSupportClick = (e) => {
    e.preventDefault();

    if (userRole === "admin") {
      navigate("/a/support");
      return;
    }

    if (!user) {
      navigate("/login");
      return;
    }

    const role = user?.data?.role || user?.role;
    if (role === "admin") {
      navigate("/a/support");
    } else {
      navigate("/f/support");
    }
  };

  return (
    <aside className="flex h-full w-72 shrink flex-col border-r border-border bg-surface">
      {/* Brand / workspace header */}
      <div className="flex h-24 items-center gap-3.5 border-b border-border px-6">
        <div className="relative shrink-0">
          <img
            src={imageObject.Logo}
            alt="Logo"
            className="h-12 w-12 rounded-full bg-bg-subtle object-cover ring-2 ring-brand-soft ring-offset-2 ring-offset-surface"
          />
        </div>

        <div className="min-w-0 flex-1">
          <p
            style={FONT_DISPLAY}
            className="truncate text-[15px] font-semibold leading-tight text-heading"
          >
            {workspaceText}
          </p>
          <p
            style={FONT_MONO}
            className="mt-1 flex items-center gap-1.5 truncate text-[10px] uppercase tracking-wider text-muted"
          >
            <span className="relative flex h-1.5 w-1.5 shrink-0">
              <span className="absolute inset-0 animate-ping rounded-full bg-brand opacity-40" />
              <span className="relative h-1.5 w-1.5 rounded-full bg-brand" />
            </span>
            {roleText} · Secure
          </p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-4 py-6">
        <p
          style={FONT_MONO}
          className="mb-3 px-4 text-[10px] uppercase tracking-[0.18em] text-muted"
        >
          Menu
        </p>

        <div className="space-y-1">
          {navItems.map((item) =>
            item.externalUrl ? (
              <a
                key={item.label}
                href={item.externalUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={onNavigate}
                className="group flex h-11 items-center gap-3 rounded-xl px-4 text-[13.5px] font-medium text-muted transition-all duration-200 hover:bg-brand-soft hover:text-heading focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
              >
                <item.icon
                  size={18}
                  className="shrink-0 text-muted transition-colors duration-200 group-hover:text-brand"
                />
                <span className="truncate" style={FONT_DISPLAY}>
                  {item.label}
                </span>
              </a>
            ) : (
              <NavLink
                key={item.label}
                to={item.to}
                onClick={onNavigate}
                className={({ isActive }) =>
                  `group relative flex h-11 items-center gap-3 rounded-xl px-4 text-[13.5px] font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand ${
                    isActive
                      ? "bg-brand text-on-brand shadow-sm"
                      : "text-muted hover:bg-brand-soft hover:text-heading"
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <item.icon
                      size={18}
                      className={`shrink-0 transition-colors duration-200 ${
                        isActive
                          ? "text-on-brand"
                          : "text-muted group-hover:text-brand"
                      }`}
                    />
                    <span className="truncate" style={FONT_DISPLAY}>
                      {item.label}
                    </span>
                    {isActive && (
                      <span className="ml-auto h-1.5 w-1.5 shrink-0 rounded-full bg-on-brand opacity-80" />
                    )}
                  </>
                )}
              </NavLink>
            ),
          )}
        </div>
      </nav>

      {/* Footer / profile + logout */}
      <div className="mt-auto border-t border-border p-4">
        <div className="flex items-center gap-3 rounded-2xl border border-border bg-bg-subtle p-2.5">
          <div className="relative shrink-0">
            <div
              aria-hidden="true"
              className="grid h-10 w-10 place-items-center rounded-full bg-brand text-[13px] font-semibold text-on-brand"
              style={FONT_DISPLAY}
            >
              {initial}
            </div>
            <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-bg-subtle bg-brand" />
          </div>

          <div className="min-w-0 flex-1">
            <p
              className="truncate text-[13px] font-medium leading-tight text-heading"
              style={FONT_DISPLAY}
            >
              {displayName}
            </p>
            <p
              className="mt-0.5 truncate text-[11px] leading-tight text-muted"
              style={FONT_MONO}
            >
              {displayEmail}
            </p>
          </div>
        </div>

        {onLogout && (
          <button
            onClick={onLogout}
            className="group mt-3 flex h-11 w-full items-center gap-3 rounded-xl px-4 text-[13.5px] font-medium text-body transition-colors duration-200 hover:bg-bg-subtle hover:text-heading focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
          >
            <LogOut
              size={18}
              className="shrink-0 text-muted transition-colors duration-200 group-hover:text-heading"
            />
            <span style={FONT_DISPLAY}>Sign out</span>
          </button>
        )}
      </div>
    </aside>
  );
}