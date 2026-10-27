import {
  AlertCircle,
  Bell,
  ChevronRight,
  CreditCard,
  Inbox,
  Loader2,
  MessageSquareText,
  Phone,
  ReceiptText,
  Settings,
  ShieldCheck,
  Smartphone,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import EmptyState from "../../components/ui/EmptyState.jsx";
import StatCard from "../../components/ui/StatCard.jsx";
import WalletBalanceCard from "../../components/WalletBalanceCard.jsx";
import { GetAllNotifications } from "../../service/notificationApi.js";
import { getMyOrders } from "../../service/number.js";

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

export default function Dashboard() {
  const navigate = useNavigate();
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

  return (
    <div className="mx-auto max-w-7xl px-3 py-6 sm:px-4 md:px-6">
      {/* New layout: two-column on large screens, single column on mobile */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        {/* ── Main content column ─────────────────────────────── */}
        <div className="space-y-5 lg:col-span-2">
          {/* Stats row – Wallet + Active Orders + OTP Received */}
          <section className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <WalletBalanceCard />
            {updatedStats.map((stat) => (
              <StatCard key={stat.label} {...stat} />
            ))}
          </section>

          {/* Available Services – moved to main column */}
          <section className="rounded-2xl border border-border bg-surface p-4 shadow-card sm:p-5">
            <h2 className="text-sm font-semibold text-heading sm:text-base">
              Available Services
            </h2>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {serviceCards.map((service) => (
                <button
                  key={service.title}
                  type="button"
                  onClick={() => navigate(service.to)}
                  className="group flex w-full items-start gap-3 rounded-xl border border-border bg-bg-subtle p-4 text-left transition-colors hover:border-border-strong hover:bg-brand-soft focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
                >
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-soft text-brand-text">
                    <service.icon size={20} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-heading">
                      {service.title}
                    </p>
                    <p className="mt-1 text-xs leading-5 text-muted">
                      {service.description}
                    </p>
                    <p className="mt-2 text-[11px] font-semibold uppercase tracking-widest text-muted">
                      {service.meta}
                    </p>
                  </div>
                  <ChevronRight
                    size={16}
                    className="mt-0.5 shrink-0 text-muted transition-colors group-hover:text-brand"
                  />
                </button>
              ))}
            </div>
          </section>

          {/* Recent Deposit – full width inside main column */}
          <section className="rounded-2xl border border-border bg-surface p-4 shadow-card sm:p-5">
            <h2 className="text-sm font-semibold text-heading">
              Recent Deposit
            </h2>
            <div className="mt-4 space-y-2">
              {loadingNotifications ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 size={22} className="animate-spin text-brand" />
                </div>
              ) : notificationError ? (
                <div className="flex items-center gap-2 rounded-xl border border-border bg-bg-subtle px-3 py-4 text-xs text-body sm:text-sm">
                  <AlertCircle size={14} className="shrink-0" />
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
                    className="flex flex-col gap-2 rounded-xl border border-border bg-bg-subtle px-3 py-3 transition-colors hover:bg-brand-soft sm:flex-row sm:items-center sm:gap-4"
                  >
                    <div className="flex min-w-0 items-start gap-3 sm:flex-1">
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-brand-soft text-brand-text">
                        <Bell size={14} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-xs font-medium text-heading sm:text-sm">
                          {notification.title || "Notification"}
                        </p>
                        <p className="line-clamp-2 text-xs text-muted">
                          {notification.message || "No message"}
                        </p>
                      </div>
                    </div>
                    <p className="pl-11 text-[10px] font-medium text-muted sm:shrink-0 sm:pl-0 sm:text-xs">
                      {formatNotificationDate(notification.createdAt)}
                    </p>
                  </div>
                ))
              )}
            </div>
          </section>
        </div>

        {/* ── Sidebar column – Quick Actions ──────────────────── */}
        <aside className="lg:col-span-1">
          <div className="sticky top-6 space-y-5">
            {/* Quick Actions card */}
            <div className="rounded-2xl border border-border bg-surface p-4 shadow-card sm:p-5">
              <h2 className="text-xs font-semibold uppercase tracking-widest text-muted sm:text-sm">
                Quick Actions
              </h2>
              <div className="mt-4 grid grid-cols-2 gap-3">
                {quickActions.map(({ label, icon: Icon, to }) => (
                  <button
                    key={label}
                    type="button"
                    onClick={() => navigate(to)}
                    className="flex flex-col items-center justify-center gap-2 rounded-xl border border-border bg-bg-subtle px-2 py-5 text-center transition-colors hover:border-border-strong hover:bg-brand-soft focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand active:bg-brand-soft"
                  >
                    <Icon size={18} className="text-brand-text" />
                    <span className="text-xs font-semibold leading-tight text-body">
                      {label}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}