import { useState } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import {
  Building2,
  BarChart3,
  Gauge,
  Inbox,
  Menu,
  Phone,
  Wallet,
  X,
  Users,
} from "lucide-react";
import Sidebar from "../components/Sidebar";
import useAuth from "../store/useAuth";
import { logout } from "../service/auth.js";
import ThemeToggle from "../components/ThemeToggle";

const FONT_DISPLAY = {
  fontFamily: "'Space Grotesk', ui-sans-serif, system-ui",
};

const adminNavItems = [
  { label: "Dashboard", to: "/a/dashboard", icon: Gauge },
  { label: "Company Stats", to: "/a/stats", icon: BarChart3 },
  { label: "Users Management", to: "/a/users", icon: Users },
  { label: "Services & Price Control", to: "/a/numbers", icon: Phone },
  { label: "OTP Orders", to: "/a/otp-orders", icon: Inbox },
  { label: "Payment Tracking", to: "/a/deposits", icon: Wallet },
  { label: "Manual Account", to: "/a/manual-account", icon: Building2 },
];

const adminPageTitles = {
  dashboard: "Dashboard",
  stats: "Company Stats",
  users: "Users Management",
  numbers: "Services & Price Control",
  "otp-orders": "OTP Orders",
  deposits: "Payment Tracking",
  "manual-account": "Manual Account",
  support: "Support",
};

const adminSidebarConfig = {
  navItems: adminNavItems,
  workspaceLabel: "Admin workspace",
};

const AdminLayout = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { clearAuth } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const pathSegment =
    location.pathname.split("/").filter(Boolean)[1] || "dashboard";
  const pageTitle = adminPageTitles[pathSegment] || "Dashboard";

  const clearAllTokensAndCookies = () => {
    const cookies = document.cookie.split(";");
    for (let i = 0; i < cookies.length; i++) {
      const cookie = cookies[i];
      const eqPos = cookie.indexOf("=");
      const name = eqPos > -1 ? cookie.substr(0, eqPos) : cookie;
      document.cookie = name + "=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/";
    }

    document.cookie =
      "smsWinnerToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    document.cookie = "token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    document.cookie =
      "authToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    document.cookie = "jwt=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";

    localStorage.removeItem("user");
    localStorage.removeItem("token");
    localStorage.removeItem("authToken");
    localStorage.removeItem("smswinner_token");
    localStorage.clear();

    sessionStorage.removeItem("user");
    sessionStorage.removeItem("token");
    sessionStorage.clear();

    if (window.caches) {
      caches.keys().then((names) => {
        names.forEach((name) => caches.delete(name));
      });
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.warn("Logout API failed", error);
    }

    clearAllTokensAndCookies();
    clearAuth();
    navigate("/login");
  };

  const closeMobileNav = () => setMobileOpen(false);

  return (
    <div className="min-h-screen bg-bg-subtle">
      {/* Desktop sidebar */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:left-0 lg:z-40 lg:block">
        <Sidebar
          {...adminSidebarConfig}
          onNavigate={() => {}}
          userRole="admin"
          onLogout={handleLogout}
        />
      </div>

      {/* Mobile sidebar overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            aria-label="Close menu"
            className="absolute inset-0 bg-bg transition-all duration-300"
            onClick={closeMobileNav}
          />
          <div className="relative h-full w-72">
            <Sidebar
              {...adminSidebarConfig}
              onNavigate={closeMobileNav}
              userRole="admin"
              onLogout={handleLogout}
            />
          </div>
        </div>
      )}

      <div className="relative min-h-screen min-w-0 overflow-x-hidden lg:pl-72">
        {/* Header */}
        <header className="sticky top-0 z-30 border-b border-border bg-bg">
          <div className="flex h-16 items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
            {/* Left: mobile toggle + current page title */}
            <div className="flex min-w-0 items-center gap-3">
              <button
                type="button"
                aria-label={mobileOpen ? "Close menu" : "Open menu"}
                aria-expanded={mobileOpen}
                onClick={() => setMobileOpen((v) => !v)}
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md border border-border text-muted transition-colors hover:border-brand hover:text-brand lg:hidden"
              >
                {mobileOpen ? <X size={20} /> : <Menu size={20} />}
              </button>

              <h1
                style={FONT_DISPLAY}
                className="truncate text-[16px] font-semibold tracking-tight text-heading sm:text-[18px]"
              >
                {pageTitle}
              </h1>
            </div>

            {/* Right: theme control */}
            <div className="flex items-center gap-3">
              <ThemeToggle />
            </div>
          </div>
        </header>

        <main className="min-h-[calc(100vh-4rem)] w-full min-w-0 overflow-x-hidden px-4 pb-8 pt-7 sm:px-6 lg:px-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
