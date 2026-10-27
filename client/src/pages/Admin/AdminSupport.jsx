import React, { useState, useEffect } from "react";
import {
  MessageSquare,
  Send,
  Clock,
  CheckCircle,
  AlertCircle,
  Loader2,
  RefreshCw,
  Trash2,
  Eye,
  Reply,
  XCircle,
  Filter,
  Users,
} from "lucide-react";
import {
  getAllSupportMessages,
  getAdminSupportMessageById,
  adminReplyToMessage,
  updateSupportStatus,
  deleteSupportMessage,
  getUnreadSupportCount,
} from "../../service/supportApi.js";

const AdminSupport = () => {
  const [messages, setMessages] = useState([]);
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [replyText, setReplyText] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [unreadCount, setUnreadCount] = useState(0);
  const [pagination, setPagination] = useState({
    page: 1,
    total: 0,
    pages: 1,
  });

  const fetchMessages = async () => {
    try {
      setLoading(true);
      const params = { page: pagination.page, limit: 20 };
      if (statusFilter !== "all") {
        params.status = statusFilter;
      }
      const data = await getAllSupportMessages(params);
      setMessages(data.data || []);
      setPagination({
        page: data.page,
        total: data.total,
        pages: data.pages,
      });
    } catch (error) {
      console.log(error);
      setError("Failed to load messages");
    } finally {
      setLoading(false);
    }
  };

  const fetchUnreadCount = async () => {
    try {
      const data = await getUnreadSupportCount();
      setUnreadCount(data.data?.unread || 0);
    } catch (error) {
      console.log(error);
    }
  };

  const handleViewMessage = async (id) => {
    try {
      setLoading(true);
      const data = await getAdminSupportMessageById(id);
      setSelectedMessage(data.data);
      await fetchUnreadCount();
      await fetchMessages();
    } catch (error) {
      setError("Failed to load message details");
    } finally {
      setLoading(false);
    }
  };

  const handleSendReply = async (id) => {
    if (!replyText) {
      setError("Please enter a reply");
      return;
    }

    try {
      setLoading(true);
      await adminReplyToMessage(id, replyText);
      setSuccess("Reply sent successfully!");
      setReplyText("");
      await handleViewMessage(id);
      await fetchMessages();
      await fetchUnreadCount();
      setTimeout(() => setSuccess(""), 3000);
    } catch (error) {
      setError(error?.response?.data?.message || "Failed to send reply");
      setTimeout(() => setError(""), 3000);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (id, status) => {
    try {
      setLoading(true);
      await updateSupportStatus(id, status);
      setSuccess(`Status updated to ${status}`);
      await handleViewMessage(id);
      await fetchMessages();
      setTimeout(() => setSuccess(""), 3000);
    } catch (error) {
      setError("Failed to update status");
      setTimeout(() => setError(""), 3000);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteMessage = async (id) => {
    if (!window.confirm("Are you sure you want to delete this message?")) {
      return;
    }

    try {
      setLoading(true);
      await deleteSupportMessage(id);
      setSuccess("Message deleted successfully!");
      setSelectedMessage(null);
      await fetchMessages();
      await fetchUnreadCount();
      setTimeout(() => setSuccess(""), 3000);
    } catch (error) {
      setError("Failed to delete message");
      setTimeout(() => setError(""), 3000);
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "resolved":
        return <CheckCircle size={14} className="text-success" />;
      case "replied":
        return <Reply size={14} className="text-info" />;
      default:
        return <Clock size={14} className="text-warning" />;
    }
  };

  const getStatusBadge = (status) => {
    const styles = {
      pending: "bg-warning-soft text-warning border-warning",
      replied: "bg-info-soft text-info border-info",
      resolved: "bg-success-soft text-success border-success",
    };
    return `inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium border ${styles[status]}`;
  };

  useEffect(() => {
    fetchMessages();
    fetchUnreadCount();
  }, [pagination.page, statusFilter]);

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      {/* Hero Section */}
      <section className="slanted-page-header rounded-2xl border border-border bg-surface p-6 shadow-card sm:p-8">
        <div className="relative flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-border bg-brand px-3 py-1 text-xs font-semibold text-on-brand">
              <MessageSquare size={13} />
              Admin Support Panel
            </div>
          </div>
          <div className="flex gap-3">
            <div className="flex items-center gap-2 rounded-lg bg-surface px-3 py-2">
              <Users size={16} className="text-brand-text" />
              <span className="text-sm font-semibold text-heading">
                {unreadCount} Unread
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Row */}
      <div className="grid gap-3 sm:grid-cols-4">
        <div className="rounded-xl border border-border bg-surface p-4">
          <p className="text-xs text-muted">Total Tickets</p>
          <p className="text-2xl font-bold text-heading">{pagination.total}</p>
        </div>
        <div className="rounded-xl border border-border bg-surface p-4">
          <p className="text-xs text-muted">Pending</p>
          <p className="text-2xl font-bold text-warning">
            {messages.filter((m) => m.status === "pending").length}
          </p>
        </div>
        <div className="rounded-xl border border-border bg-surface p-4">
          <p className="text-xs text-muted">Replied</p>
          <p className="text-2xl font-bold text-info">
            {messages.filter((m) => m.status === "replied").length}
          </p>
        </div>
        <div className="rounded-xl border border-border bg-surface p-4">
          <p className="text-xs text-muted">Resolved</p>
          <p className="text-2xl font-bold text-success">
            {messages.filter((m) => m.status === "resolved").length}
          </p>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex gap-2">
          <button
            onClick={() => setStatusFilter("all")}
            className={`rounded-lg px-3 py-2 text-xs font-medium transition-all ${
              statusFilter === "all"
                ? "bg-brand text-on-brand border border-brand"
                : "bg-surface text-muted border border-border hover:bg-surface"
            }`}
          >
            All
          </button>
          <button
            onClick={() => setStatusFilter("pending")}
            className={`rounded-lg px-3 py-2 text-xs font-medium transition-all ${
              statusFilter === "pending"
                ? "bg-warning-soft text-warning border border-warning"
                : "bg-surface text-muted border border-border hover:bg-surface"
            }`}
          >
            Pending
          </button>
          <button
            onClick={() => setStatusFilter("replied")}
            className={`rounded-lg px-3 py-2 text-xs font-medium transition-all ${
              statusFilter === "replied"
                ? "bg-info-soft text-info border border-info"
                : "bg-surface text-muted border border-border hover:bg-surface"
            }`}
          >
            Replied
          </button>
          <button
            onClick={() => setStatusFilter("resolved")}
            className={`rounded-lg px-3 py-2 text-xs font-medium transition-all ${
              statusFilter === "resolved"
                ? "bg-success-soft text-success border border-success"
                : "bg-surface text-muted border border-border hover:bg-surface"
            }`}
          >
            Resolved
          </button>
          <button
            onClick={fetchMessages}
            className="rounded-lg border border-border bg-surface p-2 text-muted transition-colors hover:bg-surface"
          >
            <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
          </button>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Messages List */}
        <div className="lg:col-span-1 space-y-4">
          <div className="rounded-xl border border-border bg-surface overflow-hidden">
            <div className="border-b border-border px-4 py-3 bg-bg">
              <h2 className="text-sm font-semibold text-heading">
                Support Tickets
              </h2>
            </div>
            <div className="divide-y divide-border max-h-[600px] overflow-y-auto">
              {loading && messages.length === 0 ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-brand-text" />
                </div>
              ) : messages.length === 0 ? (
                <div className="text-center py-8">
                  <MessageSquare
                    size={32}
                    className="mx-auto text-muted mb-2"
                  />
                  <p className="text-sm text-muted">No support tickets</p>
                </div>
              ) : (
                messages.map((message) => (
                  <div
                    key={message._id}
                    onClick={() => handleViewMessage(message._id)}
                    className={`p-4 cursor-pointer transition-all hover:bg-surface ${
                      selectedMessage?._id === message._id
                        ? "bg-brand border-l-2 border-brand"
                        : ""
                    } ${!message.isReadByAdmin ? "bg-brand" : ""}`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <h3 className="text-sm font-medium text-heading truncate">
                            {message.subject}
                          </h3>
                          {!message.isReadByAdmin && (
                            <span className="h-2 w-2 rounded-full bg-brand"></span>
                          )}
                        </div>
                        <p className="text-xs text-muted mt-1">
                          {message.userName}
                        </p>
                        <p className="text-xs text-muted mt-1 line-clamp-2">
                          {message.message.substring(0, 60)}...
                        </p>
                        <div className="flex items-center gap-3 mt-2">
                          <span className={getStatusBadge(message.status)}>
                            {getStatusIcon(message.status)}
                            {message.status}
                          </span>
                          <span className="text-xs text-muted">
                            {new Date(message.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Message Details */}
        <div className="lg:col-span-2">
          {selectedMessage ? (
            <div className="rounded-xl border border-border bg-surface overflow-hidden">
              <div className="border-b border-border px-4 py-3 bg-bg flex items-center justify-between">
                <h2 className="text-sm font-semibold text-heading">
                  Ticket Details
                </h2>
                <div className="flex gap-2">
                  <select
                    value={selectedMessage.status}
                    onChange={(e) =>
                      handleUpdateStatus(selectedMessage._id, e.target.value)
                    }
                    className="rounded-lg border border-border bg-bg px-2 py-1 text-xs text-heading"
                  >
                    <option value="pending">Pending</option>
                    <option value="replied">Replied</option>
                    <option value="resolved">Resolved</option>
                  </select>
                  <button
                    onClick={() => handleDeleteMessage(selectedMessage._id)}
                    className="rounded-lg p-1 text-muted transition-colors hover:bg-brand hover:text-on-brand"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>

              <div className="p-4 space-y-4">
                {/* User Info */}
                <div className="rounded-lg border border-border bg-bg p-3">
                  <div className="flex items-center gap-2 mb-2">
                    <Users size={14} className="text-muted" />
                    <span className="text-xs text-muted">Customer Info</span>
                  </div>
                  <p className="text-sm text-heading">
                    Name: {selectedMessage.userName}
                  </p>
                  <p className="text-sm text-muted">
                    Email: {selectedMessage.userEmail}
                  </p>
                </div>

                {/* User Message */}
                <div className="rounded-lg border border-border bg-bg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-brand text-on-brand">
                        <MessageSquare size={14} />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-heading">
                          {selectedMessage.userName}
                        </p>
                        <p className="text-xs text-muted">
                          {new Date(selectedMessage.createdAt).toLocaleString()}
                        </p>
                      </div>
                    </div>
                    <span className={getStatusBadge(selectedMessage.status)}>
                      {getStatusIcon(selectedMessage.status)}
                      {selectedMessage.status}
                    </span>
                  </div>
                  <p className="text-sm text-muted mt-2 whitespace-pre-wrap">
                    {selectedMessage.message}
                  </p>
                </div>

                {/* Admin Reply */}
                {selectedMessage.adminReply && (
                  <div className="rounded-lg border border-info bg-info-soft p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-info-soft text-info">
                        <Reply size={14} />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-heading">
                          Admin Reply
                        </p>
                        <p className="text-xs text-muted">
                          {new Date(selectedMessage.updatedAt).toLocaleString()}
                        </p>
                      </div>
                    </div>
                    <p className="text-sm text-muted mt-2 whitespace-pre-wrap">
                      {selectedMessage.adminReply}
                    </p>
                  </div>
                )}

                {/* Send Reply */}
                <div className="space-y-3">
                  <label className="block text-xs font-medium text-muted">
                    Send Reply
                  </label>
                  <textarea
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    rows={4}
                    className="w-full rounded-lg border border-border bg-bg px-4 py-2 text-sm text-heading placeholder:text-muted focus:border-brand focus:outline-none focus:ring-1 focus:ring-focus-ring"
                    placeholder="Type your reply here..."
                  />
                  <button
                    onClick={() => handleSendReply(selectedMessage._id)}
                    disabled={loading}
                    className="inline-flex items-center gap-2 rounded-lg bg-brand px-4 py-2 text-sm font-semibold text-on-brand transition-colors hover:bg-brand disabled:opacity-50"
                  >
                    {loading ? (
                      <Loader2 size={16} className="animate-spin" />
                    ) : (
                      <Send size={16} />
                    )}
                    Send Reply
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="rounded-xl border border-border bg-surface p-8 text-center">
              <MessageSquare size={48} className="mx-auto text-muted mb-4" />
              <h3 className="text-lg font-semibold text-heading">
                Select a Ticket
              </h3>
              <p className="mt-1 text-sm text-muted">
                Choose a ticket from the list to view and respond
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Toast Notifications */}
      {success && (
        <div className="fixed bottom-4 right-4 z-50 flex items-center gap-2 rounded-lg border border-border bg-success-soft px-4 py-3 text-sm font-medium text-heading">
          <CheckCircle size={16} />
          {success}
        </div>
      )}

      {error && (
        <div className="fixed bottom-4 right-4 z-50 flex items-center gap-2 rounded-lg border border-border bg-brand px-4 py-3 text-sm font-medium text-on-brand">
          <AlertCircle size={16} />
          {error}
        </div>
      )}
    </div>
  );
};

export default AdminSupport;
