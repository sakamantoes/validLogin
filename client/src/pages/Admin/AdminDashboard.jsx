import {
  Activity,
  AlertTriangle,
  ArrowDownRight,
  ArrowUpRight,
  BarChart3,
  Check,
  CheckCircle2,
  Clock3,
  Coins,
  Copy,
  Mail,
  Phone,
  RefreshCw,
  Server,
  ShieldCheck,
  Smartphone,
  Users,
  Wallet,
} from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";
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

/* ------------------------------------------------------------------ */
/* Small building blocks                                               */
/* ------------------------------------------------------------------ */

function SectionHeader({ icon: Icon, title, subtitle, action }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <div className="flex min-w-0 items-center gap-3">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-brand-soft text-brand-text">
          <Icon size={17} />
        </div>
        <div className="min-w-0">
          <h2
            style={FONT_DISPLAY}
            className="truncate text-sm font-semibold leading-tight text-heading sm:text-[15px]"
          >
            {title}
          </h2>
          {subtitle && (
            <p className="mt-0.5 truncate text-xs leading-tight text-muted">
              {subtitle}
            </p>
          )}
        </div>
      </div>
      {action}
    </div>
  );
}

function IconButton({ onClick, disabled, spinning, label, children }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      className="inline-flex h-9 shrink-0 items-center justify-center gap-2 rounded-lg border border-border bg-bg-subtle px-3 text-xs font-medium text-body transition-colors hover:border-border-strong hover:bg-brand-soft hover:text-heading focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand disabled:cursor-not-allowed disabled:opacity-60"
      style={FONT_DISPLAY}
    >
      <RefreshCw size={13} className={spinning ? "animate-spin" : ""} />
      {children}
    </button>
  );
}

function SkeletonRow() {
  return (
    <div className="flex animate-pulse items-center gap-3 px-4 py-4 sm:px-5">
      <div className="h-9 w-9 shrink-0 rounded-xl bg-border" />
      <div className="flex-1 space-y-2">
        <div className="h-3 w-1/3 rounded-full bg-border" />
        <div className="h-2.5 w-1/2 rounded-full bg-border" />
      </div>
      <div className="h-8 w-16 rounded-lg bg-border" />
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Page                                                                */
/* ------------------------------------------------------------------ */

export default function AdminDashboard() {
  const navigate = useNavigate();
  const reduceMotion = useReducedMotion();
  const [totalUsers, setTotalUsers] = useState(0);
  const [loading, setLoading] = useState(true);
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [smsBowerBalance, setSmsBowerBalance] = useState(0);
  const [smsPoolBalance, setSmsPoolBalance] = useState(0);
  const [loadingBalances, setLoadingBalances] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [recentNotifications, setRecentNotifications] = useState([]);
  const [loadingNotifications, setLoadingNotifications] = useState(true);
  const [copiedId, setCopiedId] = useState(null);
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
    },
    {
      label: "Active Sessions",
      value: isLoading
        ? "..."
        : Number(total ?? activeOtpSessions.length).toLocaleString(),
      change: "Waiting for OTP",
      icon: Activity,
    },
    {
      label: "Total Revenue",
      value: `NGN ${totalRevenue.toLocaleString()}`,
      change: "+18.2% vs last month",
      icon: Coins,
    },
    {
      label: "System Health",
      value: "99.97%",
      change: "All systems operational",
      icon: Server,
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
      setLastUpdated(new Date());
    }
  };

  const fetchRecentNotifications = async () => {
    try {
      setLoadingNotifications(true);
      const response = await getRecentSystemNotifications(5);

      if (response?.success && response?.data?.notifications) {
        setRecentNotifications(response.data.notifications);
      } else if (response?.notifications) {
        // Fallback in case the structure is different
        setRecentNotifications(response.notifications);
      } else {
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

  const handleCopy = async (id, text) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedId(id);
      window.setTimeout(() => setCopiedId(null), 1500);
    } catch (error) {
      console.error("Copy failed:", error);
    }
  };

  // Update the stats array with dynamic total users
  const updatedStats = stats.map((stat) =>
    stat.label === "Total Users"
      ? { ...stat, value: loading ? "..." : totalUsers.toLocaleString() }
      : stat,
  );

  /* Gentle staggered entrance */
  const fadeUp = (i = 0) =>
    reduceMotion
      ? {}
      : {
          initial: { opacity: 0, y: 12 },
          animate: { opacity: 1, y: 0 },
          transition: {
            duration: 0.5,
            delay: i * 0.07,
            ease: [0.22, 1, 0.36, 1],
          },
        };

  const providerBalances = [
    ["SMSBower", smsBowerBalance],
    ["SMSPool", smsPoolBalance],
  ];

  return (
    <div className="mx-auto max-w-7xl space-y-5 px-3 py-6 sm:px-4 md:px-6">
      {/* ── Page header ── */}
      <motion.header
        {...fadeUp(0)}
        className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between"
      >
        <div className="min-w-0">
          <div
            style={FONT_MONO}
            className="inline-flex items-center gap-2 rounded-full border border-border bg-surface px-3 py-1 text-[10.5px] uppercase tracking-[0.18em] text-brand-text"
          >
            <ShieldCheck size={12} />
            Admin Control Panel
          </div>
          <h1
            style={FONT_DISPLAY}
            className="mt-3 text-2xl font-semibold tracking-tight text-heading sm:text-3xl"
          >
            Platform overview
          </h1>
          <p className="mt-1 text-sm text-muted">
            Users, sessions, revenue and provider health in one place.
          </p>
        </div>

        <button
          type="button"
          onClick={() => navigate("/a/users")}
          style={FONT_DISPLAY}
          className="inline-flex h-11 shrink-0 items-center justify-center gap-2 rounded-xl bg-brand px-5 text-[13.5px] font-medium text-on-brand shadow-sm transition-all duration-200 hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 focus-visible:ring-offset-surface"
        >
          <Users size={16} />
          Manage Users
        </button>
      </motion.header>

      {/* ── Stat cards ── */}
      <motion.section
        {...fadeUp(1)}
        className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4"
      >
        {updatedStats.map((stat) => (
          <div
            key={stat.label}
            className="group rounded-2xl border border-border bg-surface p-4 shadow-card transition-all duration-200 hover:-translate-y-0.5 hover:border-border-strong sm:p-5"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-soft text-brand-text transition-colors duration-200 group-hover:bg-brand group-hover:text-on-brand">
                <stat.icon size={18} />
              </div>
              <span
                style={FONT_MONO}
                className="max-w-[60%] truncate rounded-full border border-border bg-bg-subtle px-2.5 py-0.5 text-[10.5px] font-medium text-body"
              >
                {stat.change}
              </span>
            </div>
            <p
              style={FONT_MONO}
              className="mt-4 text-[10.5px] font-medium uppercase tracking-widest text-muted"
            >
              {stat.label}
            </p>
            <p
              style={FONT_DISPLAY}
              className="mt-1 truncate text-2xl font-semibold tracking-tight text-heading"
            >
              {stat.value}
            </p>
          </div>
        ))}
      </motion.section>

      {/* ── Provider balances ── */}
      <motion.section
        {...fadeUp(2)}
        className="rounded-2xl border border-border bg-surface p-4 shadow-card sm:p-6"
      >
        <SectionHeader
          icon={Wallet}
          title="Provider funding balances"
          subtitle="SMS provider wallet health"
          action={
            <IconButton
              onClick={fetchProviderBalances}
              disabled={loadingBalances}
              spinning={loadingBalances}
              label="Refresh provider balances"
            >
              <span className="hidden sm:inline">Refresh</span>
            </IconButton>
          }
        />

        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          {providerBalances.map(([label, balance]) => (
            <div
              key={label}
              className="rounded-xl border border-border bg-bg-subtle p-4"
            >
              <p
                style={FONT_MONO}
                className="text-[10.5px] font-semibold uppercase tracking-widest text-muted"
              >
                {label} balance
              </p>
              <p
                style={FONT_MONO}
                className="mt-2 text-2xl font-semibold tracking-tight text-heading sm:text-3xl"
              >
                {loadingBalances ? (
                  <span className="block h-8 w-28 animate-pulse rounded-lg bg-border" />
                ) : (
                  `$${Number(balance).toFixed(2)}`
                )}
              </p>
            </div>
          ))}
        </div>

        <div
          style={FONT_MONO}
          className="mt-5 flex flex-wrap items-center justify-between gap-2 border-t border-border pt-4 text-[11px] text-muted"
        >
          <span>
            Last updated:{" "}
            {lastUpdated ? lastUpdated.toLocaleString() : "—"}
          </span>
          <span className="inline-flex items-center gap-1.5 text-success">
            <span className="h-1.5 w-1.5 rounded-full bg-success" />
            Active
          </span>
        </div>
      </motion.section>

      {/* ── Main grid ── */}
      <section className="grid w-full grid-cols-1 gap-5 lg:grid-cols-[minmax(0,1fr)_22rem]">
        {/* Left column */}
        <div className="min-w-0 space-y-5">
          {/* Quick actions */}
          <motion.div
            {...fadeUp(3)}
            className="rounded-2xl border border-border bg-surface p-4 shadow-card sm:p-6"
          >
            <SectionHeader
              icon={Activity}
              title="Admin quick actions"
              subtitle="Jump straight to what matters"
            />
            <div className="mt-5 grid grid-cols-3 gap-3">
              {quickActions.map(({ label, icon: Icon, path }) => (
                <button
                  key={label}
                  type="button"
                  onClick={() => navigate(path)}
                  className="group flex flex-col items-center justify-center gap-3 rounded-2xl border border-border bg-bg-subtle px-2 py-4 text-center transition-all duration-200 hover:-translate-y-0.5 hover:border-border-strong hover:bg-brand-soft hover:shadow-card focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand sm:py-5"
                >
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-surface text-brand-text ring-1 ring-border transition-colors duration-200 group-hover:bg-brand group-hover:text-on-brand group-hover:ring-transparent">
                    <Icon size={18} />
                  </span>
                  <span
                    style={FONT_DISPLAY}
                    className="text-xs font-medium leading-tight text-body transition-colors group-hover:text-heading"
                  >
                    {label}
                  </span>
                </button>
              ))}
            </div>
          </motion.div>

          {/* Active sessions */}
          <motion.div
            {...fadeUp(4)}
            className="overflow-hidden rounded-2xl border border-border bg-surface shadow-card"
          >
            <div className="border-b border-border px-4 py-4 sm:px-6">
              <SectionHeader
                icon={Smartphone}
                title="Active user sessions"
                subtitle="Real-time OTP requests and number activations"
                action={
                  <IconButton
                    onClick={() => void refetch()}
                    disabled={isLoading}
                    spinning={isLoading}
                    label="Refresh active sessions"
                  >
                    <span className="hidden sm:inline">Refresh</span>
                  </IconButton>
                }
              />
            </div>

            <div className="divide-y divide-border">
              {isLoading ? (
                <div aria-busy="true">
                  {[0, 1, 2].map((i) => (
                    <SkeletonRow key={i} />
                  ))}
                </div>
              ) : activeOtpSessions.length === 0 ? (
                <div className="flex flex-col items-center gap-2 px-4 py-12 text-center sm:px-5">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-soft text-brand-text">
                    <Smartphone size={20} />
                  </div>
                  <p
                    style={FONT_DISPLAY}
                    className="text-sm font-semibold text-heading"
                  >
                    No active OTP orders
                  </p>
                  <p className="text-xs text-muted">
                    New activations will appear here in real time.
                  </p>
                </div>
              ) : (
                activeOtpSessions.map((session) => (
                  <div
                    key={session.id}
                    className="flex flex-col gap-3 px-4 py-4 transition-colors hover:bg-bg-subtle sm:flex-row sm:items-center sm:justify-between sm:gap-4 sm:px-6"
                  >
                    {/* User + number */}
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span
                          style={FONT_DISPLAY}
                          className="truncate text-sm font-semibold text-heading"
                        >
                          {session.user}
                        </span>
                        <span
                          style={FONT_MONO}
                          className="rounded-full border border-border bg-bg-subtle px-2 py-0.5 text-[10.5px] font-medium text-body"
                        >
                          {session.service}
                        </span>
                      </div>
                      <div className="mt-1.5 flex flex-wrap items-center gap-1.5 text-xs text-muted">
                        <span style={FONT_MONO} className="break-all">
                          {session.number}
                        </span>
                        <button
                          type="button"
                          aria-label="Copy number"
                          onClick={() =>
                            handleCopy(session.id, session.number)
                          }
                          className="rounded p-1 text-muted transition-colors hover:bg-brand-soft hover:text-heading focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
                        >
                          {copiedId === session.id ? (
                            <Check size={12} className="text-success" />
                          ) : (
                            <Copy size={12} />
                          )}
                        </button>
                        <span aria-hidden="true">·</span>
                        <span style={FONT_MONO}>{session.country}</span>
                      </div>
                    </div>

                    {/* Status + code */}
                    <div className="flex items-center justify-between gap-3 sm:justify-end">
                      <div
                        style={FONT_MONO}
                        className="flex items-center gap-1.5 text-[11px] font-medium"
                      >
                        {session.received ? (
                          <CheckCircle2 size={14} className="text-success" />
                        ) : (
                          <Clock3 size={14} className="text-warning" />
                        )}
                        <span
                          className={
                            session.received ? "text-success" : "text-muted"
                          }
                        >
                          {session.status}
                        </span>
                      </div>
                      <div
                        style={FONT_MONO}
                        className="shrink-0 rounded-lg border border-border bg-bg-subtle px-3 py-1.5 text-center text-sm font-semibold tracking-widest text-heading"
                      >
                        {session.time}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </motion.div>
        </div>

        {/* Right column */}
        <div className="min-w-0 space-y-5">
          {/* System inventory */}
          <motion.div
            {...fadeUp(3)}
            className="rounded-2xl border border-border bg-surface p-4 shadow-card sm:p-6"
          >
            <SectionHeader
              icon={Server}
              title="System inventory"
              subtitle="Current stock across providers"
            />
            <div className="mt-5 space-y-3">
              {serviceCards.map((service) => (
                <div
                  key={service.title}
                  className="group flex gap-3 rounded-xl border border-border bg-bg-subtle p-4 transition-all duration-200 hover:border-border-strong hover:bg-brand-soft"
                >
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-surface text-brand-text ring-1 ring-border transition-colors duration-200 group-hover:bg-brand group-hover:text-on-brand group-hover:ring-transparent">
                    <service.icon size={18} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p
                      style={FONT_DISPLAY}
                      className="text-sm font-semibold text-heading"
                    >
                      {service.title}
                    </p>
                    <p className="mt-1 text-xs leading-5 text-muted">
                      {service.description}
                    </p>
                    <div className="mt-3 flex items-center gap-2 border-t border-border pt-2.5">
                      <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-brand" />
                      <p
                        style={FONT_MONO}
                        className="truncate text-[10.5px] uppercase tracking-wider text-muted"
                      >
                        {service.meta}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Recent activity / alerts */}
          <motion.div
            {...fadeUp(4)}
            className="rounded-2xl border border-border bg-surface p-4 shadow-card sm:p-6"
          >
            <SectionHeader
              icon={AlertTriangle}
              title="Alerts & activity"
              subtitle="Latest system events"
              action={
                <button
                  type="button"
                  onClick={fetchRecentNotifications}
                  disabled={loadingNotifications}
                  aria-label="Refresh alerts"
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-border bg-bg-subtle text-muted transition-colors hover:border-border-strong hover:bg-brand-soft hover:text-heading focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <RefreshCw
                    size={13}
                    className={loadingNotifications ? "animate-spin" : ""}
                  />
                </button>
              }
            />

            <div className="mt-5 space-y-2">
              {loadingNotifications ? (
                <div className="space-y-2" aria-busy="true">
                  {[0, 1, 2].map((i) => (
                    <div
                      key={i}
                      className="flex animate-pulse items-center gap-3 rounded-xl border border-border bg-bg-subtle px-3 py-3"
                    >
                      <div className="h-8 w-8 shrink-0 rounded-lg bg-border" />
                      <div className="flex-1 space-y-2">
                        <div className="h-3 w-2/5 rounded-full bg-border" />
                        <div className="h-2.5 w-3/4 rounded-full bg-border" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : recentNotifications.length === 0 ? (
                <div className="flex flex-col items-center gap-2 py-10 text-center">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-soft text-brand-text">
                    <CheckCircle2 size={20} />
                  </div>
                  <p className="text-sm text-muted">No recent activities</p>
                </div>
              ) : (
                recentNotifications.map((notification, index) => (
                  <div
                    key={notification._id || index}
                    className="flex items-center gap-3 rounded-xl border border-border bg-bg-subtle px-3 py-2.5 transition-colors hover:border-border-strong hover:bg-brand-soft"
                  >
                    <div
                      className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${
                        notification.direction === "up"
                          ? "bg-success-soft text-success"
                          : notification.direction === "down"
                            ? "bg-brand-soft text-brand-text"
                            : "bg-warning-soft text-warning"
                      }`}
                    >
                      {notification.direction === "up" ? (
                        <ArrowUpRight size={15} />
                      ) : notification.direction === "down" ? (
                        <ArrowDownRight size={15} />
                      ) : (
                        <AlertTriangle size={15} />
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p
                        style={FONT_DISPLAY}
                        className="truncate text-[13px] font-medium text-heading"
                      >
                        {notification.title}
                      </p>
                      <p
                        style={FONT_MONO}
                        className="truncate text-[11px] text-muted"
                      >
                        {notification.detail}
                      </p>
                      {notification.user && (
                        <p
                          style={FONT_MONO}
                          className="mt-0.5 truncate text-[10.5px] text-muted"
                        >
                          User: {notification.user}
                        </p>
                      )}
                    </div>
                    <p
                      style={FONT_MONO}
                      className={`shrink-0 text-xs font-semibold tabular-nums ${
                        notification.direction === "up"
                          ? "text-success"
                          : notification.direction === "down"
                            ? "text-warning"
                            : "text-brand-text"
                      }`}
                    >
                      {notification.amount || ""}
                    </p>
                  </div>
                ))
              )}
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}