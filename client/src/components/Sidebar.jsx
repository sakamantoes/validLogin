// components/Sidebar.jsx
import { NavLink, useNavigate } from "react-router-dom";
import { LogOut } from "lucide-react";
import useAuth from "../store/useAuth";
import SiteLogo from "./SiteLogo";
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
  workspaceLabel = "Workspace",
  userRole = "user",
  onLogout,
}) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const profile = user?.data || user || {};
  const initial = (
    profile.name ||
    profile.email ||
    (userRole === "admin" ? "A" : "U")
  )
    .slice(0, 1)
    .toUpperCase();
  const displayName =
    profile.username ||
    profile.name ||
    (userRole === "admin" ? "Admin User" : "Verified User");
  const displayEmail =
    profile.email ||
    (userRole === "admin" ? "admin@waveverify.com" : "user@waveverify.com");

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
      <div className="flex h-20 items-center gap-3 border-b border-border px-6">
       <img src={imageObject.Logo} className='h-[50px] w-[150px] rounded-sm' />
        {userRole === "admin" && (
          <div className="min-w-0">
            <p
              style={FONT_MONO}
              className="truncate text-[10.5px] uppercase tracking-wider text-muted"
            >
              {workspaceLabel}
            </p>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1.5 overflow-y-auto px-4 py-6">
        {navItems.map((item) =>
          item.externalUrl ? (
            <a
              key={item.label}
              href={item.externalUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={onNavigate}
              className="group flex h-11 items-center gap-3 rounded-lg px-4 text-[13.5px] font-medium text-muted transition-all duration-150 hover:bg-brand-soft hover:text-heading"
            >
              <item.icon
                size={18}
                className="shrink-0 text-muted transition-colors duration-150 group-hover:text-brand"
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
                `group flex h-11 items-center gap-3 rounded-lg px-4 text-[13.5px] font-medium transition-all duration-150 ${
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
                    className={`shrink-0 transition-colors duration-150 ${
                      isActive
                        ? "text-on-brand"
                        : "text-muted group-hover:text-brand"
                    }`}
                  />
                  <span className="truncate" style={FONT_DISPLAY}>
                    {item.label}
                  </span>
                </>
              )}
            </NavLink>
          ),
        )}
      </nav>

      {/* Footer / logout */}
      <div className="mt-auto border-t border-border">
        <div className="border-b border-border px-4 py-5">
          <div className="flex items-center gap-3 rounded-full border border-border bg-bg-subtle py-2 pl-2 pr-4">
            <div
              aria-hidden="true"
              className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-brand text-[13px] font-semibold text-on-brand"
              style={FONT_DISPLAY}
            >
              {initial}
            </div>
            <div className="min-w-0">
              <p
                className="truncate text-[13px] font-medium leading-tight text-heading"
                style={FONT_DISPLAY}
              >
                {displayName}
              </p>
              <p
                className="truncate text-[11px] leading-tight text-muted"
                style={FONT_MONO}
              >
                {displayEmail}
              </p>
            </div>
          </div>
        </div>
        {onLogout && (
          <button
            onClick={onLogout}
            className="group flex w-full items-center gap-3 px-7 py-4 text-sm text-body transition-colors duration-150 hover:bg-bg-subtle hover:text-heading focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
          >
            <LogOut
              size={18}
              className="size-5 shrink-0 text-muted transition-colors duration-150 group-hover:text-heading"
            />
            <span style={FONT_DISPLAY}>Sign out</span>
          </button>
        )}
      </div>
    </aside>
  );
}