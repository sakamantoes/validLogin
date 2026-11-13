import {
  AlertCircle,
  ArrowUpRight,
  Bell,
  ChevronRight,
  CreditCard,
  Inbox,
  MessageSquareText,
  Phone,
  Plus,
  ReceiptText,
  Settings,
  ShieldCheck,
  Smartphone,
} from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import EmptyState from "../../components/ui/EmptyState.jsx";
import StatCard from "../../components/ui/StatCard.jsx";
import WalletBalanceCard from "../../components/WalletBalanceCard.jsx";
import { GetAllNotifications } from "../../service/notificationApi.js";
import { getMyOrders } from "../../service/number.js";
import useAuth from "../../store/useAuth";

const FONT_DISPLAY = {
  fontFamily: "'Space Grotesk', ui-sans-serif, system-ui",
};
const FONT_MONO = { fontFamily: "'JetBrains Mono', ui-monospace, monospace" };

const stats = [
  {
    label: "Active Orders",
    value: "6",
    change: "2 waiting",
    icon: Phone,
    iconBg: "bg-brand-soft",
    iconColor: "text-brand-text",
    changeBg: "bg-bg-subtle text-body border-border",
  },
  {
    label: "OTP Received",
    value: "0",
    change: "Total OTPs received",
    icon: MessageSquareText,
    iconBg: "bg-brand-soft",
    iconColor: "text-brand-text",
    changeBg: "bg-bg-subtle text-body border-border",
  },
];

const serviceCards = [
  {
    title: "Available Phone Numbers",
    description:
      "Buy SMS-capable numbers listed by admin for app verification.",
    meta: "More 86 countries in stock",
    icon: Smartphone,
    to: "/f/numbers",
  },
  {
    title: "OTP Inbox",
    description:
      "Receive codes from purchased numbers and track completed orders.",
    meta: "Request your OTP codes",
    icon: ShieldCheck,
    to: "/f/otp-box",
  },
];

const quickActions = [
  { label: "Buy Number", icon: Phone, to: "/f/numbers" },
  { label: "OTP Inbox", icon: Inbox, to: "/f/otp-box" },
  { label: "View Deposits", icon: CreditCard, to: "/f/deposits" },
  { label: "View Receipts", icon: ReceiptText, to: "/f/receipts" },
  { label: "Settings", icon: Settings, to: "/f/settings" },
];

const getGreeting = () => {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
};

/* Reusable card header */
function SectionHeader({ icon: Icon, title, subtitle }) {
  return (
    <div className="flex items-center gap-3">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-brand-soft text-brand-text">
        <Icon size={17} />
      </div>
      <div className="min-w-0">
        <h2
          style={FONT_DISPLAY}
          className="text-sm font-semibold leading-tight text-heading sm:text-[15px]"
        >
          {title}
        </h2>
        {subtitle && (
          <p className="mt-0.5 text-xs leading-tight text-muted">{subtitle}</p>
        )}
      </div>
    </div>
  );
}

export default function Dashboard() {
  const navigate = useNavigate();
  const reduceMotion = useReducedMotion();
  const { user } = useAuth();
  const profile = user?.data || user || {};
  const firstName = (profile.username || profile.name || "").split(" ")[0];

  const [recentNotifications, setRecentNotifications] = useState([]);
  const [loadingNotifications, setLoadingNotifications] = useState(true);
  const [notificationError, setNotificationError] = useState("");

  const [otpReceivedCount, setOtpReceivedCount] = useState(0);
  const [loadingOtp, setLoadingOtp] = useState(true);
  const [activeOrdersCount, setActiveOrdersCount] = useState(0);

  const fetchOrdersForStats = async () => {
    try {
      setLoadingOtp(true);
      const response = await getMyOrders();
      const orders = response?.data || [];

      const receivedOtps = orders.filter(
        (order) =>
          order.status === "OTP_RECEIVED" || order.status === "COMPLETED",
      ).length;

      const activeOrders = orders.filter(
        (order) => order.status === "WAITING_FOR_SMS",
      ).length;

      setOtpReceivedCount(receivedOtps);
      setActiveOrdersCount(activeOrders);
    } catch (error) {
      console.error("Error fetching orders for stats:", error);
      setOtpReceivedCount(0);
      setActiveOrdersCount(0);
    } finally {
      setLoadingOtp(false);
    }
  };

  useEffect(() => {
    const fetchRecentNotifications = async () => {
      try {
        setLoadingNotifications(true);
        setNotificationError("");

        const response = await GetAllNotifications(1, 5, false);
        setRecentNotifications(response?.data?.notifications || []);
      } catch (err) {
        console.error("Failed to fetch recent notifications:", err);
        setNotificationError(
          err?.response?.data?.message || "Failed to load notifications",
        );
      } finally {
        setLoadingNotifications(false);
      }
    };

    void fetchRecentNotifications();
    void fetchOrdersForStats();
  }, []);

  const formatNotificationDate = (value) => {
    if (!value) return "N/A";

    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "N/A";

    return date.toLocaleString(undefined, {
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  };

  const updatedStats = stats.map((stat) => {
    if (stat.label === "OTP Received") {
      return {
        ...stat,
        value: loadingOtp ? "..." : otpReceivedCount.toLocaleString(),
        change: `${(
          (otpReceivedCount / (otpReceivedCount + (loadingOtp ? 1 : 1))) *
            100 || 0
        ).toFixed(1)}% success`,
      };
    }
    if (stat.label === "Active Orders") {
      return {
        ...stat,
        value: loadingOtp ? "..." : activeOrdersCount.toLocaleString(),
        change:
          activeOrdersCount === 1
            ? "1 waiting"
            : `${activeOrdersCount} waiting`,
      };
    }
    return stat;
  });

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

  return (
    <div className="mx-auto max-w-7xl px-3 py-6 sm:px-4 md:px-6">
      {/* ── Page header ─────────────────────────────────────── */}
      <motion.header
        {...fadeUp(0)}
        className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between"
      >
        <div className="min-w-0">
          <p
            style={FONT_MONO}
            className="text-[10.5px] uppercase tracking-[0.18em] text-muted"
          >
            {new Date().toLocaleDateString(undefined, {
              weekday: "long",
              month: "long",
              day: "numeric",
            })}
          </p>
          <h1
            style={FONT_DISPLAY}
            className="mt-1.5 truncate text-2xl font-semibold tracking-tight text-heading sm:text-3xl"
          >
            {getGreeting()}
            {firstName ? `, ${firstName}` : ""}
          </h1>
          <p className="mt-1 text-sm text-muted">
            Here's what's happening with your numbers today.
          </p>
        </div>

        <button
          type="button"
          onClick={() =>
            navigate("/f/fund-account", { state: { from: "/f/dashboard" } })
          }
          style={FONT_DISPLAY}
          className="group inline-flex h-11 shrink-0 items-center justify-center gap-2 rounded-xl bg-brand px-5 text-[13.5px] font-medium text-on-brand shadow-sm transition-all duration-200 hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 focus-visible:ring-offset-surface"
        >
          <Plus size={16} />
          Fund Account
        </button>
      </motion.header>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        {/* ── Main content column ─────────────────────────────── */}
        <div className="space-y-5 lg:col-span-2">
          {/* Stats row */}
          <motion.section
            {...fadeUp(1)}
            className="grid grid-cols-1 gap-3 sm:grid-cols-3"
          >
            <WalletBalanceCard />
            {updatedStats.map((stat) => (
              <StatCard key={stat.label} {...stat} />
            ))}
          </motion.section>

          {/* Available Services */}
          <motion.section
            {...fadeUp(2)}
            className="rounded-2xl border border-border bg-surface p-4 shadow-card sm:p-6"
          >
            <SectionHeader
              icon={ShieldCheck}
              title="Available Services"
              subtitle="Everything you need for verification"
            />
            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              {serviceCards.map((service) => (
                <button
                  key={service.title}
                  type="button"
                  onClick={() => navigate(service.to)}
                  className="group relative flex w-full flex-col overflow-hidden rounded-2xl border border-border bg-bg-subtle p-5 text-left transition-all duration-200 hover:-translate-y-0.5 hover:border-border-strong hover:bg-brand-soft hover:shadow-card focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-surface text-brand-text ring-1 ring-border transition-colors duration-200 group-hover:bg-brand group-hover:text-on-brand group-hover:ring-transparent">
                      <service.icon size={20} />
                    </div>
                    <ArrowUpRight
                      size={18}
                      className="text-muted transition-all duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-brand"
                    />
                  </div>

                  <p
                    style={FONT_DISPLAY}
                    className="mt-5 text-[15px] font-semibold text-heading"
                  >
                    {service.title}
                  </p>
                  <p className="mt-1.5 text-xs leading-5 text-muted">
                    {service.description}
                  </p>

                  <div className="mt-4 flex items-center gap-2 border-t border-border pt-3">
                    <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-brand" />
                    <p
                      style={FONT_MONO}
                      className="truncate text-[10.5px] uppercase tracking-wider text-muted"
                    >
                      {service.meta}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          </motion.section>

          {/* Recent Deposit */}
          <motion.section
            {...fadeUp(3)}
            className="rounded-2xl border border-border bg-surface p-4 shadow-card sm:p-6"
          >
            <SectionHeader
              icon={Bell}
              title="Recent Deposit"
              subtitle="Your latest account activity"
            />

            <div className="mt-5 space-y-2">
              {loadingNotifications ? (
                <div className="space-y-2" aria-busy="true">
                  {[0, 1, 2].map((i) => (
                    <div
                      key={i}
                      className="flex animate-pulse items-center gap-3 rounded-xl border border-border bg-bg-subtle px-3 py-3"
                    >
                      <div className="h-9 w-9 shrink-0 rounded-xl bg-border" />
                      <div className="flex-1 space-y-2">
                        <div className="h-3 w-1/3 rounded-full bg-border" />
                        <div className="h-2.5 w-2/3 rounded-full bg-border" />
                      </div>
                      <div className="hidden h-2.5 w-16 rounded-full bg-border sm:block" />
                    </div>
                  ))}
                </div>
              ) : notificationError ? (
                <div className="flex items-center gap-2.5 rounded-xl border border-border bg-bg-subtle px-4 py-4 text-xs text-body sm:text-sm">
                  <AlertCircle size={15} className="shrink-0 text-muted" />
                  <span>{notificationError}</span>
                </div>
              ) : recentNotifications.length === 0 ? (
                <EmptyState
                  icon={Bell}
                  title="No recent deposits"
                  description="Fund your account to see deposits here."
                  actionLabel="Fund Account"
                  onAction={() =>
                    navigate("/f/fund-account", {
                      state: { from: "/f/dashboard" },
                    })
                  }
                />
              ) : (
                recentNotifications.map((notification) => (
                  <div
                    key={notification._id}
                    className="group flex flex-col gap-2 rounded-xl border border-border bg-bg-subtle px-3.5 py-3 transition-all duration-200 hover:border-border-strong hover:bg-brand-soft sm:flex-row sm:items-center sm:gap-4"
                  >
                    <div className="flex min-w-0 items-start gap-3 sm:flex-1 sm:items-center">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-surface text-brand-text ring-1 ring-border transition-colors duration-200 group-hover:ring-transparent">
                        <Bell size={15} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p
                          style={FONT_DISPLAY}
                          className="truncate text-xs font-semibold text-heading sm:text-[13px]"
                        >
                          {notification.title || "Notification"}
                        </p>
                        <p className="mt-0.5 line-clamp-2 text-xs text-muted">
                          {notification.message || "No message"}
                        </p>
                      </div>
                    </div>
                    <p
                      style={FONT_MONO}
                      className="pl-12 text-[10px] uppercase tracking-wider text-muted sm:shrink-0 sm:pl-0"
                    >
                      {formatNotificationDate(notification.createdAt)}
                    </p>
                  </div>
                ))
              )}
            </div>
          </motion.section>
        </div>

        {/* ── Sidebar column – Quick Actions ──────────────────── */}
        <aside className="lg:col-span-1">
          <motion.div {...fadeUp(2)} className="sticky top-6 space-y-5">
            <div className="rounded-2xl border border-border bg-surface p-4 shadow-card sm:p-6">
              <SectionHeader
                icon={ChevronRight}
                title="Quick Actions"
                subtitle="Jump straight to what matters"
              />
              <div className="mt-5 grid grid-cols-2 gap-3">
                {quickActions.map(({ label, icon: Icon, to }, index) => (
                  <button
                    key={label}
                    type="button"
                    onClick={() => navigate(to)}
                    className={`group flex flex-col items-center justify-center gap-3 rounded-2xl border border-border bg-bg-subtle px-2 py-5 text-center transition-all duration-200 hover:-translate-y-0.5 hover:border-border-strong hover:bg-brand-soft hover:shadow-card focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand active:translate-y-0 ${
                      index === quickActions.length - 1 &&
                      quickActions.length % 2 === 1
                        ? "col-span-2"
                        : ""
                    }`}
                  >
                    <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-surface text-brand-text ring-1 ring-border transition-colors duration-200 group-hover:bg-brand group-hover:text-on-brand group-hover:ring-transparent">
                      <Icon size={18} />
                    </span>
                    <span
                      style={FONT_DISPLAY}
                      className="text-xs font-medium leading-tight text-body group-hover:text-heading"
                    >
                      {label}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        </aside>
      </div>
    </div>
  );
}