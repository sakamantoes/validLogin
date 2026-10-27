import {
  Activity,
  ArrowDownRight,
  ArrowUpRight,
  CheckCircle2,
  Clock3,
  Copy,
  Mail,
  Phone,
  RefreshCw,
  ShieldCheck,
  Smartphone,
  Wallet,
  Users,
  BarChart3,
  AlertTriangle,
  Server,
  UserCheck,
  CoinsIcon,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import { getAllUsers } from "../../service/auth";
import { getPlatformDeposits, getSmsPoolBalance } from "../../service/admin";
import { getSmsBowerBalance } from "../../service/number";
import useActiveOtp from "../../hooks/useActiveOtp.js";
import { getRecentSystemNotifications } from "../../service/notificationApi";

const FONT_DISPLAY = {
  fontFamily: "'Space Grotesk', ui-sans-serif, system-ui",
};

const FONT_MONO = {
  fontFamily: "'JetBrains Mono', ui-monospace, monospace",
};

const formatSessionTime = (value) => {
  if (!value) return "N/A";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "N/A";

  return date.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
};

const serviceCards = [
  {
    title: "Available Numbers Stock",
    description: "Manage SMS-capable numbers inventory across 86 countries.",
    meta: "Over 12,847 numbers available",
    icon: Smartphone,
  },
  {
    title: "Email Accounts Stock",
    description: "Monitor virtual email inventory and bulk purchase orders.",
    meta: "Over 3,421 emails in stock",
    icon: Mail,
  },
];

const quickActions = [
  { label: "Manage Users", icon: Users, path: "/a/users" },
  { label: "View Support", icon: BarChart3, path: "/a/support" },
  { label: "Add Numbers", icon: Phone, path: "/a/numbers" },
];

const parseBalanceValue = (response) => {
  if (response?.data?.balance !== undefined) {
    return Number(response.data.balance) || 0;
  }

  if (response?.balance && typeof response.balance === "string") {
    const match = response.balance.match(/[\d.]+/);
    return match ? Number(match[0]) || 0 : 0;
  }

  if (response?.balance?.balance !== undefined) {
    return Number(response.balance.balance) || 0;
  }

  if (response?.balance !== undefined && typeof response.balance !== "object") {
    return Number(response.balance) || 0;
  }

  return 0;
};

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [totalUsers, setTotalUsers] = useState(0);
  const [loading, setLoading] = useState(true);
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [smsBowerBalance, setSmsBowerBalance] = useState(0);
  const [smsPoolBalance, setSmsPoolBalance] = useState(0);
  const [loadingBalances, setLoadingBalances] = useState(true);
  const [recentNotifications, setRecentNotifications] = useState([]);
  const [loadingNotifications, setLoadingNotifications] = useState(true);
  const { isLoading, otpOrder, total, refetch } = useActiveOtp();

  const activeOtpSessions = useMemo(() => {
    const orders = Array.isArray(otpOrder) ? otpOrder : [];

    return orders.slice(0, 5).map((order) => {
      const user = order.userId;
      const username =
        typeof user === "object"
          ? user?.username || user?.email
          : order.username || order.email;
      const received = Boolean(order.otpCode);

      return {
        id: order._id || order.activationId || order.phoneNumber,
        user: username || "Unknown user",
        service: String(order.service || "OTP").toUpperCase(),
        country: order.country || "N/A",
        number: order.phoneNumber || "N/A",
        status: received ? "Code received" : "Waiting for OTP",
        time: received
          ? order.otpCode
          : formatSessionTime(order.purchasedAt || order.createdAt),
        received,
      };
    });
  }, [otpOrder]);

  const stats = [
    {
      label: "Total Users",
      value: "0",
      change: "+124 this month",
      icon: Users,
      iconBg: "bg-brand",
      iconColor: "text-on-brand",
      changeBg: "bg-bg-subtle text-body border-border",
    },
    {
      label: "Active Sessions",
      value: isLoading
        ? "..."
        : Number(total ?? activeOtpSessions.length).toLocaleString(),
      change: "Waiting for OTP",
      icon: Activity,
      iconBg: "bg-brand-soft",
      iconColor: "text-on-brand",
      changeBg: "bg-bg-subtle text-body border-border",
    },
    {
      label: "Total Revenue",
      value: `NGN ${totalRevenue.toLocaleString()}`,
      change: "+18.2% vs last month",
      icon: CoinsIcon,
      iconBg: "bg-surface",
      iconColor: "text-muted",
      changeBg: "bg-surface text-muted border-border",
    },
    {
      label: "System Health",
      value: "99.97%",
      change: "All systems operational",
      icon: Server,
      iconBg: "bg-brand",
      iconColor: "text-on-brand",
      changeBg: "bg-bg-subtle text-body border-border",
    },
  ];

  const fetchTotalUsers = async () => {
    try {
      setLoading(true);
      const response = await getAllUsers();
      const users =
        response.data?.users || response.users || response.data || [];
      const userCount = Array.isArray(users) ? users.length : 0;
      setTotalUsers(userCount);
    } catch (error) {
      console.error("Error fetching users:", error);
      setTotalUsers(0);
    } finally {
      setLoading(false);
    }
  };

  const fetchRevenue = async () => {
    try {
      const response = await getPlatformDeposits();
      const deposits = response?.data || [];
      const revenue = deposits
        .filter((deposit) => deposit.status?.toUpperCase() === "SUCCESS")
        .reduce((sum, deposit) => sum + Number(deposit.amount || 0), 0);
      setTotalRevenue(revenue);
    } catch (error) {
      console.error(error);
    }
  };

  const fetchProviderBalances = async () => {
    try {
      setLoadingBalances(true);
      const [bowerResponse, poolResponse] = await Promise.all([
        getSmsBowerBalance(),
        getSmsPoolBalance(),
      ]);

      setSmsBowerBalance(parseBalanceValue(bowerResponse));
      setSmsPoolBalance(parseBalanceValue(poolResponse));
    } catch (error) {
      console.error("Error fetching provider balances:", error);
      setSmsBowerBalance(0);
      setSmsPoolBalance(0);
    } finally {
      setLoadingBalances(false);
    }
  };

  const fetchRecentNotifications = async () => {
    try {
      setLoadingNotifications(true);
      const response = await getRecentSystemNotifications(5);
      console.log("Recent notifications response:", response);

      // Fix: Access the nested notifications array properly
      if (response?.success && response?.data?.notifications) {
        setRecentNotifications(response.data.notifications);
      } else if (response?.notifications) {
        // Fallback in case the structure is different
        setRecentNotifications(response.notifications);
      } else {
        console.log("No notifications found in response structure");
        setRecentNotifications([]);
      }
    } catch (error) {
      console.error("Error fetching recent notifications:", error);
      setRecentNotifications([]);
    } finally {
      setLoadingNotifications(false);
    }
  };

  useEffect(() => {
    const timer = window.setTimeout(() => {
      fetchTotalUsers();
      fetchRevenue();
      fetchProviderBalances();
      fetchRecentNotifications();
    }, 0);

    return () => window.clearTimeout(timer);
  }, []);

  // Update the stats array with dynamic total users
  const updatedStats = stats.map((stat) =>
    stat.label === "Total Users"
      ? { ...stat, value: loading ? "..." : totalUsers.toLocaleString() }
      : stat,
  );

  return (
    <div className="mx-auto max-w-7xl space-y-4 sm:space-y-6 px-3 sm:px-4 md:px-6">
      {/* ── Hero banner ── */}
      <section className="slanted-page-header rounded-2xl border border-border bg-surface p-4 shadow-card sm:p-6 md:p-8">
        <div className="relative flex flex-col gap-4 sm:gap-6 md:flex-row md:items-end md:justify-between">
          <div className="max-w-2xl">
            <div
              className="inline-flex items-center gap-2 rounded-full border border-border bg-brand px-2 py-0.5 text-xs font-semibold text-on-brand sm:px-3 sm:py-1"
              style={FONT_MONO}
            >
              <ShieldCheck size={11} className="sm:w-3.25 sm:h-3.25" />
              Admin Control Panel
            </div>
          </div>
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
            <button
              type="button"
              onClick={() => navigate("/a/users")}
              className="inline-flex h-9 sm:h-11 shrink-0 items-center justify-center gap-2 rounded-lg sm:rounded-xl bg-brand px-3 sm:px-5 text-xs sm:text-sm font-semibold text-on-brand transition-colors hover:bg-brand active:bg-brand"
              style={FONT_DISPLAY}
            >
              <Users size={14} className="sm:w-4 sm:h-4" />
              <span className="hidden xs:inline">Manage Users</span>
              <span className="xs:hidden">Users</span>
            </button>
            {/* <button
              type="button"
              onClick={() => navigate("/a/reports")}
              className="inline-flex h-9 sm:h-11 shrink-0 items-center justify-center gap-2 rounded-lg sm:rounded-xl border border-border px-3 sm:px-5 text-xs sm:text-sm font-semibold text-heading transition-colors hover:bg-surface"
            >
              <BarChart3 size={14} className="sm:w-4 sm:h-4" />
              <span className="hidden xs:inline">Analytics</span>
              <span className="xs:hidden">Reports</span>
            </button> */}
          </div>
        </div>
      </section>

      {/* ── Provider Balance Cards ── */}
      <section className="rounded-2xl border border-border bg-surface p-4 shadow-card sm:p-6">
        <div className="relative flex flex-col gap-5">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="flex h-12 w-12 items-center justify-center rounded-full border border-border bg-brand sm:h-16 sm:w-16">
              <Wallet size={24} className="sm:w-8 sm:h-8 text-on-brand" />
            </div>
            <div className="flex-1">
              <p
                className="text-xs sm:text-sm font-semibold uppercase text-muted"
                style={FONT_MONO}
              >
                Provider Funding Balances
              </p>
              <p
                className="text-xs sm:text-sm font-semibold uppercase tracking-widest text-brand-text"
                style={FONT_MONO}
              >
                SMS provider wallet health
              </p>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                {[
                  ["SMSBower", smsBowerBalance],
                  ["SMSPool", smsPoolBalance],
                ].map(([label, balance]) => (
                  <div
                    key={label}
                    className="rounded-xl border border-border bg-bg p-4"
                  >
                    <p
                      className="text-xs font-semibold uppercase tracking-widest text-muted"
                      style={FONT_MONO}
                    >
                      {label} balance
                    </p>
                    <h2
                      className="mt-1 text-2xl font-bold text-heading tracking-tight sm:text-3xl"
                      style={FONT_MONO}
                    >
                      {loadingBalances ? (
                        <span className="inline-flex items-center gap-2 text-base text-muted">
                          <RefreshCw size={18} className="animate-spin" />
                          Loading...
                        </span>
                      ) : (
                        `$${Number(balance).toFixed(2)}`
                      )}
                    </h2>
                  </div>
                ))}
              </div>
            </div>
            <button
              type="button"
              onClick={fetchProviderBalances}
              disabled={loadingBalances}
              className="inline-flex items-center gap-2 rounded-lg border border-border bg-brand px-4 py-2 text-sm font-semibold text-on-brand transition-colors hover:bg-brand-hover disabled:opacity-50"
              style={FONT_DISPLAY}
            >
              <RefreshCw
                size={14}
                className={loadingBalances ? "animate-spin" : ""}
              />
              Refresh Balance
            </button>
          </div>
        </div>
        <div
          className="mt-4 flex items-center justify-between border-t border-border pt-3 text-xs text-muted"
          style={FONT_MONO}
        >
          <span>Last updated: {new Date().toLocaleString()}</span>
          <span className="text-success">● Active</span>
        </div>
      </section>

      {/* ── Stat cards ── */}
      <section className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {updatedStats.map((stat) => (
          <div
            key={stat.label}
            className="group rounded-2xl border border-border bg-surface p-4 shadow-card transition-colors hover:border-border-strong sm:p-5"
          >
            <div className="flex items-start justify-between gap-2 sm:gap-3">
              <div
                className={`flex h-8 w-8 sm:h-10 sm:w-10 items-center justify-center rounded-lg ${stat.iconBg} ${stat.iconColor}`}
              >
                <stat.icon size={16} className="sm:w-4.75 sm:h-4.75" />
              </div>
              <span
                className={`rounded-full border px-2 py-0.5 text-xs sm:text-xs font-medium text-center ${stat.changeBg}`}
                style={FONT_MONO}
              >
                {stat.change}
              </span>
            </div>
            <p
              className="mt-3 sm:mt-4 text-xs sm:text-xs font-medium uppercase tracking-widest text-muted"
              style={FONT_MONO}
            >
              {stat.label}
            </p>
            <p
              className="mt-1 text-xl sm:text-2xl font-bold tracking-tight text-heading"
              style={FONT_DISPLAY}
            >
              {stat.value}
            </p>
          </div>
        ))}
      </section>

      {/* ── Main grid ── */}
      <section className="w-full grid gap-4 sm:gap-5 grid-cols-1 md:grid-cols-[minmax(0,1fr)_22rem]">
        {/* Left column */}
        <div className="space-y-4 sm:space-y-5">
          {/* Quick actions */}
          <div className="rounded-2xl border border-border bg-surface p-4 shadow-card sm:p-5">
            <h2
              className="text-xs sm:text-sm font-semibold uppercase tracking-widest text-muted"
              style={FONT_MONO}
            >
              Admin Quick Actions
            </h2>
            <div className="mt-3 sm:mt-4 grid grid-cols-2 gap-2 sm:gap-3 xs:grid-cols-4">
              {quickActions.map(({ label, icon: Icon, path }) => (
                <button
                  key={label}
                  type="button"
                  onClick={() => navigate(path)}
                  className="group flex flex-col items-center justify-center gap-1.5 rounded-xl border border-border bg-bg-subtle px-2 py-3 text-center transition-colors hover:border-border-strong hover:bg-brand-soft sm:gap-2 sm:py-5"
                >
                  <Icon
                    size={16}
                    className="text-heading transition-colors group-hover:text-on-brand sm:w-5 sm:h-5"
                  />
                  <span
                    className="text-xs sm:text-xs font-semibold text-muted text-center leading-tight transition-colors group-hover:text-on-brand"
                    style={FONT_MONO}
                  >
                    {label}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Active sessions monitoring */}
          <div className="overflow-hidden rounded-2xl border border-border bg-surface shadow-card">
            <div className="flex flex-col justify-between gap-3 border-b border-border px-4 py-3 sm:flex-row sm:items-center sm:px-5 sm:py-4">
              <div>
                <h2
                  className="text-sm sm:text-base font-semibold text-heading"
                  style={FONT_DISPLAY}
                >
                  Active User Sessions
                </h2>
                <p
                  className="mt-0.5 text-xs sm:text-xs text-muted"
                  style={FONT_MONO}
                >
                  Real-time OTP requests and number activations
                </p>
              </div>
              <div className="flex gap-2">
                <button
                  className="flex items-center gap-1 rounded-lg border border-border px-2 py-1 text-xs font-semibold text-heading transition-colors hover:bg-bg-subtle"
                  style={FONT_MONO}
                >
                  <UserCheck size={11} className="sm:w-3.25 sm:h-3.25" />
                  <span className="hidden xs:inline">Filter</span>
                </button>
                <button
                  type="button"
                  onClick={() => void refetch()}
                  disabled={isLoading}
                  className="flex items-center gap-1 rounded-lg border border-border px-2 py-1 text-xs font-semibold text-heading transition-colors hover:bg-bg-subtle disabled:cursor-not-allowed disabled:opacity-60"
                  style={FONT_MONO}
                >
                  <RefreshCw
                    size={11}
                    className={`sm:w-3.25 sm:h-3.25 ${isLoading ? "animate-spin" : ""}`}
                  />
                  <span className="hidden xs:inline">Refresh</span>
                </button>
              </div>
            </div>

            <div className="divide-y divide-border">
              {isLoading ? (
                <div className="flex items-center justify-center gap-2 px-4 sm:px-5 py-10 text-sm text-muted">
                  <RefreshCw size={16} className="animate-spin" />
                </div>
              ) : activeOtpSessions.length === 0 ? (
                <div className="px-4 sm:px-5 py-10 text-center text-sm text-muted">
                  No active OTP orders right now.
                </div>
              ) : (
                activeOtpSessions.map((session) => (
                  <div
                    key={session.id}
                    className="flex flex-col gap-2 px-4 sm:px-5 py-3 sm:py-4 hover:bg-surface transition-all"
                  >
                    {/* User + service */}
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                        <span
                          className="text-sm sm:text-base font-semibold text-heading"
                          style={FONT_DISPLAY}
                        >
                          {session.user}
                        </span>
                        <span
                          className="rounded-full border border-border bg-bg-subtle px-1.5 py-0.5 text-xs font-medium text-body"
                          style={FONT_MONO}
                        >
                          {session.service}
                        </span>
                      </div>
                      <div className="mt-1 flex flex-wrap items-center gap-1 text-xs sm:text-sm text-muted">
                        <span className="break-all" style={FONT_MONO}>
                          {session.number}
                        </span>
                        <button
                          aria-label="Copy number"
                          className="rounded p-0.5 text-muted transition-colors hover:text-muted"
                        >
                          <Copy size={11} className="sm:w-3.25 sm:h-3.25" />
                        </button>
                      </div>
                      <div
                        className="mt-0.5 text-xs sm:text-xs text-muted"
                        style={FONT_MONO}
                      >
                        {session.country}
                      </div>
                    </div>

                    {/* Status and code row */}
                    <div className="flex items-center justify-between gap-3 mt-1">
                      <div className="flex items-center gap-1.5 text-xs sm:text-xs font-medium">
                        {session.received ? (
                          <CheckCircle2
                            size={12}
                            className="sm:w-3.5 sm:h-3.5 text-success"
                          />
                        ) : (
                          <Clock3
                            size={12}
                            className="sm:w-3.5 sm:h-3.5 text-warning"
                          />
                        )}
                        <span
                          className={
                            session.received ? "text-success" : "text-muted"
                          }
                          style={FONT_MONO}
                        >
                          {session.status}
                        </span>
                      </div>
                      <div
                        className="shrink-0 rounded-lg border border-border bg-bg-subtle px-2 py-1.5 text-center text-xs font-bold tracking-widest text-heading sm:px-3 sm:py-2 sm:text-sm"
                        style={FONT_MONO}
                      >
                        {session.time}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Right column */}
        <div className="space-y-4 sm:space-y-5">
          {/* System inventory */}
          <div className="rounded-2xl border border-border bg-surface p-4 shadow-card sm:p-5">
            <h2
              className="text-sm sm:text-base font-semibold text-heading"
              style={FONT_DISPLAY}
            >
              System Inventory
            </h2>
            <div className="mt-3 sm:mt-4 space-y-2.5">
              {serviceCards.map((service) => (
                <div
                  key={service.title}
                  className="group flex gap-3 rounded-xl border border-border bg-bg-subtle p-3 transition-colors hover:border-border-strong hover:bg-brand-soft sm:p-4"
                >
                  <div className="flex h-8 w-8 sm:h-9 sm:w-9 shrink-0 items-center justify-center rounded-lg bg-brand text-on-brand transition-colors group-hover:bg-brand">
                    <service.icon size={16} className="sm:w-4.5 sm:h-4.5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p
                      className="text-xs sm:text-sm font-semibold text-heading"
                      style={FONT_DISPLAY}
                    >
                      {service.title}
                    </p>
                    <p className="mt-0.5 text-xs sm:text-xs leading-4 sm:leading-5 text-muted">
                      {service.description}
                    </p>
                    <p
                      className="mt-1 text-xs sm:text-xs font-semibold uppercase tracking-widest text-muted"
                      style={FONT_MONO}
                    >
                      {service.meta}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recent activity / alerts */}
          <div className="rounded-2xl border border-border bg-surface p-4 shadow-card sm:p-5">
            <div className="flex items-center justify-between">
              <h2
                className="text-sm sm:text-base font-semibold text-heading"
                style={FONT_DISPLAY}
              >
                System Alerts & Activity
              </h2>
              <button
                onClick={fetchRecentNotifications}
                disabled={loadingNotifications}
                className="text-warning hover:text-warning transition-colors"
              >
                <RefreshCw
                  size={12}
                  className={`sm:w-3.5 sm:h-3.5 ${loadingNotifications ? "animate-spin" : ""}`}
                />
              </button>
            </div>

            <div className="mt-3 sm:mt-4 space-y-1">
              {loadingNotifications ? (
                <div className="flex justify-center py-8">
                  <RefreshCw size={24} className="animate-spin text-muted" />
                </div>
              ) : recentNotifications.length === 0 ? (
                <div className="text-center py-8 text-muted text-sm">
                  No recent activities
                </div>
              ) : (
                recentNotifications.map((notification, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-2 rounded-xl border border-border bg-bg-subtle px-2 py-2 transition-colors hover:bg-brand-soft sm:gap-3 sm:py-2.5"
                  >
                    <div
                      className={`flex h-7 w-7 sm:h-8 sm:w-8 shrink-0 items-center justify-center rounded-lg ${
                        notification.direction === "up"
                          ? "bg-success-soft text-success"
                          : notification.direction === "down"
                            ? "bg-brand text-on-brand"
                            : "bg-warning-soft text-warning"
                      }`}
                    >
                      {notification.direction === "up" ? (
                        <ArrowUpRight
                          size={13}
                          className="sm:w-3.75 sm:h-3.75"
                        />
                      ) : notification.direction === "down" ? (
                        <ArrowDownRight
                          size={13}
                          className="sm:w-3.75 sm:h-3.75"
                        />
                      ) : (
                        <AlertTriangle
                          size={13}
                          className="sm:w-3.75 sm:h-3.75"
                        />
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p
                        className="truncate text-xs sm:text-sm font-medium text-heading"
                        style={FONT_DISPLAY}
                      >
                        {notification.title}
                      </p>
                      <p
                        className="truncate text-xs sm:text-xs text-muted"
                        style={FONT_MONO}
                      >
                        {notification.detail}
                      </p>
                      {notification.user && (
                        <p
                          className="text-xs sm:text-xs text-muted mt-0.5"
                          style={FONT_MONO}
                        >
                          User: {notification.user}
                        </p>
                      )}
                    </div>
                    <p
                      className={`shrink-0 text-xs sm:text-xs font-semibold tabular-nums ${
                        notification.direction === "up"
                          ? "text-success"
                          : notification.direction === "down"
                            ? "text-warning"
                            : "text-brand-text"
                      }`}
                      style={FONT_MONO}
                    >
                      {notification.amount || ""}
                    </p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}