// components/NotificationBell.jsx
import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  Bell,
  CheckCheck,
  Trash2,
  Loader2,
  Mail,
  AlertCircle,
  CheckCircle2,
  Info,
  XCircle,
  Clock,
  ArrowLeft,
} from "lucide-react";
import { useNotifications } from "../service/notificationApi.js";

const FONT_DISPLAY = {
  fontFamily: "'Space Grotesk', ui-sans-serif, system-ui",
};
const FONT_MONO = { fontFamily: "'JetBrains Mono', ui-monospace, monospace" };

const NotificationBell = () => {
  const navigate = useNavigate();
  const {
    notifications,
    unreadCount,
    loading,
    fetchNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification,
  } = useNotifications();

  const [isOpen, setIsOpen] = useState(false);
  const [showAllNotifications, setShowAllNotifications] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      fetchNotifications();
    }
  }, [isOpen]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
        setShowAllNotifications(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Icon + color mapping (matches homepage palette)
  const getNotificationIcon = (type) => {
    switch (type?.toLowerCase()) {
      case "success":
        return <CheckCircle2 size={16} className="text-success" />;
      case "error":
        return <XCircle size={16} className="text-danger" />;
      case "warning":
        return <AlertCircle size={16} className="text-warning" />;
      case "info":
        return <Info size={16} className="text-brand" />;
      default:
        return <Mail size={16} className="text-muted" />;
    }
  };

  const getIconBg = (type) => {
    switch (type?.toLowerCase()) {
      case "success":
        return "bg-success-soft";
      case "error":
        return "bg-danger-soft";
      case "warning":
        return "bg-warning-soft";
      case "info":
        return "bg-brand-soft";
      default:
        return "bg-bg-subtle";
    }
  };

  const handleMarkAsRead = async (id) => {
    await markAsRead(id);
    if (showAllNotifications) {
      fetchNotifications();
    }
  };

  const handleMarkAllAsRead = async () => {
    await markAllAsRead();
    if (showAllNotifications) {
      fetchNotifications();
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this notification?")) {
      await deleteNotification(id);
    }
  };

  const handleBellClick = () => {
    if (showAllNotifications) {
      setShowAllNotifications(false);
    }
    setIsOpen(!isOpen);
  };

  const handleViewAll = () => setShowAllNotifications(true);
  const handleBack = () => setShowAllNotifications(false);

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Button — matches the mobile menu button style */}
      <button
        onClick={handleBellClick}
        className="relative flex h-10 w-10 items-center justify-center rounded-md border border-border text-muted transition-colors hover:border-brand hover:text-brand focus:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring/40"
        aria-label={`Notifications${unreadCount > 0 ? ` (${unreadCount} unread)` : ""}`}
        aria-expanded={isOpen}
      >
        <Bell size={18} />
        {unreadCount > 0 && (
          <span className="absolute -right-1 -top-1 flex h-4.5 min-w-4.5 items-center justify-center rounded-full bg-brand px-1 text-[10px] font-semibold text-on-brand ring-2 ring-surface">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute right-0 z-9999 mt-2 w-95 max-w-[calc(100vw-2rem)] origin-top-right animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="overflow-hidden rounded-xl border border-border bg-surface shadow-card">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-border bg-bg-subtle px-4 py-3">
              <div className="flex items-center gap-2">
                {showAllNotifications ? (
                  <button
                    onClick={handleBack}
                    aria-label="Back to recent"
                    className="rounded-md p-1 text-muted transition-colors hover:bg-surface hover:text-heading"
                  >
                    <ArrowLeft size={16} />
                  </button>
                ) : (
                  <Bell size={16} className="text-brand" />
                )}
                <h3
                  style={FONT_DISPLAY}
                  className="text-[14px] font-semibold text-heading"
                >
                  {showAllNotifications ? "All Notifications" : "Notifications"}
                </h3>
                {unreadCount > 0 && (
                  <span
                    style={FONT_MONO}
                    className="rounded-full bg-brand-soft px-1.5 py-0.5 text-[10px] font-medium tracking-wide text-brand-text"
                  >
                    {showAllNotifications
                      ? `${unreadCount} unread`
                      : `${unreadCount} new`}
                  </span>
                )}
              </div>
              {unreadCount > 0 && (
                <button
                  onClick={handleMarkAllAsRead}
                  className="flex items-center gap-1 rounded-md px-2 py-1 text-[11px] font-medium text-muted transition-colors hover:bg-surface hover:text-brand"
                >
                  <CheckCheck size={12} />
                  Mark all read
                </button>
              )}
            </div>

            {/* Notifications List */}
            <div
              className={`overflow-y-auto transition-all duration-500 ease-in-out ${
                showAllNotifications ? "max-h-150" : "max-h-100"
              }`}
            >
              {loading ? (
                <div className="flex items-center justify-center py-10">
                  <Loader2 size={22} className="animate-spin text-brand" />
                </div>
              ) : notifications.length === 0 ? (
                <div className="flex flex-col items-center justify-center px-4 py-10 text-center">
                  <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-bg-subtle">
                    <Bell size={20} className="text-muted" />
                  </div>
                  <p
                    style={FONT_DISPLAY}
                    className="text-[13.5px] font-medium text-heading"
                  >
                    No notifications
                  </p>
                  <p className="mt-1 text-[12px] text-muted">
                    You're all caught up.
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-border">
                  {notifications.map((notification, index) => (
                    <div
                      key={notification._id}
                      className={`group relative animate-in slide-in-from-left fade-in px-4 py-3 transition-colors hover:bg-bg-subtle ${
                        !notification.read ? "bg-brand-soft" : ""
                      }`}
                      style={{
                        animationDelay: showAllNotifications
                          ? `${index * 50}ms`
                          : "0ms",
                        animationDuration: "300ms",
                      }}
                    >
                      <div className="flex gap-3">
                        {/* Icon */}
                        <div
                          className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-md ${getIconBg(
                            notification.type,
                          )}`}
                        >
                          {getNotificationIcon(notification.type)}
                        </div>

                        {/* Content */}
                        <div className="min-w-0 flex-1">
                          <div className="flex items-start justify-between gap-2">
                            <h4
                              className={`text-[13px] font-medium leading-snug ${
                                !notification.read
                                  ? "text-heading"
                                  : "text-muted"
                              }`}
                            >
                              {notification.title}
                            </h4>
                            <button
                              onClick={() => handleDelete(notification._id)}
                              aria-label="Delete notification"
                              className="rounded p-0.5 text-muted opacity-0 transition-opacity hover:text-danger group-hover:opacity-100"
                            >
                              <Trash2 size={12} />
                            </button>
                          </div>
                          <p className="mt-0.5 line-clamp-2 text-[12px] leading-relaxed text-muted">
                            {notification.message}
                          </p>
                          <div className="mt-1.5 flex items-center gap-3">
                            <div
                              style={FONT_MONO}
                              className="flex items-center gap-1 text-[10px] tracking-wide text-muted"
                            >
                              <Clock size={10} />
                              {new Date(
                                notification.createdAt,
                              ).toLocaleString()}
                            </div>
                            {!notification.read && (
                              <button
                                onClick={() =>
                                  handleMarkAsRead(notification._id)
                                }
                                className="text-[10px] font-medium text-brand transition-colors hover:text-brand-hover hover:underline"
                              >
                                Mark as read
                              </button>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Unread indicator */}
                      {!notification.read && (
                        <span className="absolute left-0 top-1/2 h-1.5 w-1.5 -translate-y-1/2 rounded-full bg-brand" />
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Footer */}
            {notifications.length > 0 && (
              <div className="border-t border-border bg-bg-subtle px-4 py-2.5">
                {!showAllNotifications ? (
                  <button
                    onClick={handleViewAll}
                    className="w-full text-center text-[12px] font-medium text-brand transition-colors hover:text-brand-hover"
                  >
                    View all notifications ({notifications.length})
                  </button>
                ) : (
                  <div
                    style={FONT_MONO}
                    className="flex items-center justify-between text-[10.5px] tracking-wide text-muted"
                  >
                    <span>Total: {notifications.length}</span>
                    <span>Unread: {unreadCount}</span>
                    <button
                      onClick={handleBack}
                      className="font-medium text-brand transition-colors hover:text-brand-hover"
                    >
                      Show less
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationBell;
