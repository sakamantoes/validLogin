import { useState } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import {
  CreditCard,
  Gauge,
  Inbox,
  Menu,
  Phone,
  ReceiptText,
  Settings,
  X,
} from "lucide-react";
import Sidebar from "../components/Sidebar";
import useAuth from "../store/useAuth";
import { logout } from "../service/auth.js";
import NotificationBell from "../components/NotificationBell";
import ThemeToggle from "../components/ThemeToggle";

const FONT_DISPLAY = {
  fontFamily: "'Space Grotesk', ui-sans-serif, system-ui",
};

const userNavItems = [
  { label: "Dashboard", to: "/f/dashboard", icon: Gauge },
  { label: "Numbers and Services", to: "/f/numbers", icon: Phone },
  { label: "OTP Inbox", to: "/f/otp-box", icon: Inbox },
  { label: "Deposits History", to: "/f/deposits", icon: CreditCard },
  { label: "View Receipts", to: "/f/receipts", icon: ReceiptText },
  { label: "Settings", to: "/f/settings", icon: Settings },
];

const userPageTitles = {
  dashboard: "Dashboard",
  "fund-account": "Fund Account",
  numbers: "Buy Number",
  "otp-box": "OTP Inbox",
  deposits: "Deposits History",
  receipts: "View Receipts",
  settings: "Settings",
  support: "Support",
};

const userSidebarConfig = {
  navItems: userNavItems,
  workspaceLabel: "User workspace",
};

const UserLayout = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { clearAuth } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const pathSegment =
    location.pathname.split("/").filter(Boolean)[1] || "dashboard";
  const pageTitle = userPageTitles[pathSegment] || "Dashboard";

  const clearAllTokensAndCookies = () => {
    const cookies = document.cookie.split(";");
    for (let i = 0; i < cookies.length; i++) {
      const cookie = cookies[i];
      const eqPos = cookie.indexOf("=");
      const name = eqPos > -1 ? cookie.substr(0, eqPos) : cookie;
      document.cookie = name + "=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/";
      document.cookie =
        name +
        "=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/;domain=" +
        window.location.hostname;
    }

    document.cookie =
      "smsWinnerToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    document.cookie = "token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    document.cookie =
      "authToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    document.cookie = "jwt=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    document.cookie =
      "refreshToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";

    localStorage.removeItem("user");
    localStorage.removeItem("token");
    localStorage.removeItem("authToken");
    localStorage.removeItem("smsWinnerToken");
    localStorage.removeItem("persist:root");
    localStorage.clear();

    sessionStorage.removeItem("user");
    sessionStorage.removeItem("token");
    sessionStorage.removeItem("authToken");
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
          {...userSidebarConfig}
          userRole="user"
          supportLabel="Support"
          onNavigate={() => {}}
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
              {...userSidebarConfig}
              userRole="user"
              supportLabel="Support"
              onNavigate={closeMobileNav}
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

            {/* Right: theme + notifications */}
            <div className="flex items-center gap-3">
              <ThemeToggle />
              <NotificationBell />
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

export default UserLayout;
