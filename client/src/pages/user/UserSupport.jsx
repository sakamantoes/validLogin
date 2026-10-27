import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
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
  ArrowLeft,
  XCircle,
} from "lucide-react";
import {
  createSupportMessage,
  getUserSupportMessages,
  getSupportMessageById,
  addUserReply,
  deleteUserSupportMessage,
} from "../../service/supportApi";

const UserSupport = () => {
  const navigate = useNavigate();
  const [messages, setMessages] = useState([]);
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [subject, setSubject] = useState("");
  const [messageText, setMessageText] = useState("");
  const [replyText, setReplyText] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showCreateForm, setShowCreateForm] = useState(false);

  const fetchMessages = async () => {
    try {
      setLoading(true);
      const data = await getUserSupportMessages();
      setMessages(data.data || []);
    } catch (error) {
      console.log(error);
      setError("Failed to load messages");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateMessage = async (e) => {
    e.preventDefault();
    if (!subject || !messageText) {
      setError("Please fill in all fields");
      return;
    }

    try {
      setLoading(true);
      await createSupportMessage({ subject, message: messageText });
      setSuccess("Message sent successfully!");
      setSubject("");
      setMessageText("");
      setShowCreateForm(false);
      await fetchMessages();
      setTimeout(() => setSuccess(""), 3000);
    } catch (error) {
      setError(error?.response?.data?.message || "Failed to send message");
      setTimeout(() => setError(""), 3000);
    } finally {
      setLoading(false);
    }
  };

  const handleViewMessage = async (id) => {
    try {
      setLoading(true);
      const data = await getSupportMessageById(id);
      setSelectedMessage(data.data);
    } catch (error) {
      setError("Failed to load message details");
    } finally {
      setLoading(false);
    }
  };

  const handleAddReply = async (id) => {
    if (!replyText) {
      setError("Please enter a reply");
      return;
    }

    try {
      setLoading(true);
      await addUserReply(id, replyText);
      setSuccess("Reply added successfully!");
      setReplyText("");
      await handleViewMessage(id);
      await fetchMessages();
      setTimeout(() => setSuccess(""), 3000);
    } catch (error) {
      setError(error?.response?.data?.message || "Failed to add reply");
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
      await deleteUserSupportMessage(id);
      setSuccess("Message deleted successfully!");
      setSelectedMessage(null);
      await fetchMessages();
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

  const getStatusText = (status) => {
    switch (status) {
      case "resolved":
        return "Resolved";
      case "replied":
        return "Replied";
      default:
        return "Pending";
    }
  };

  useEffect(() => {
    fetchMessages();
  }, []);

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      {/* Hero Section */}
      <section className="slanted-page-header rounded-2xl border border-border bg-surface p-6 shadow-card sm:p-8">
        <div className="relative flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-border bg-brand px-3 py-1 text-xs font-semibold text-on-brand">
              <MessageSquare size={13} />
              Support Center
            </div>
          </div>
          <button
            onClick={() => setShowCreateForm(!showCreateForm)}
            className="inline-flex h-11 shrink-0 items-center gap-2 rounded-xl bg-brand px-5 text-sm font-semibold text-on-brand transition-colors hover:bg-brand"
          >
            <MessageSquare size={16} />
            New Support Ticket
          </button>
        </div>
      </section>

      {/* Create Ticket Form */}
      {showCreateForm && (
        <div className="rounded-2xl border border-border bg-surface p-6 shadow-card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-heading">
              Create New Support Ticket
            </h2>
            <button
              onClick={() => setShowCreateForm(false)}
              className="rounded-lg p-1 text-muted hover:bg-surface"
            >
              <XCircle size={20} />
            </button>
          </div>
          <form onSubmit={handleCreateMessage} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-muted mb-1.5">
                Subject *
              </label>
              <input
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="w-full rounded-lg border border-border bg-bg px-4 py-2 text-sm text-heading focus:border-brand focus:outline-none focus:ring-1 focus:ring-focus-ring"
                placeholder="Brief summary of your issue"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-muted mb-1.5">
                Message *
              </label>
              <textarea
                value={messageText}
                onChange={(e) => setMessageText(e.target.value)}
                rows={5}
                className="w-full rounded-lg border border-border bg-bg px-4 py-2 text-sm text-heading focus:border-brand focus:outline-none focus:ring-1 focus:ring-focus-ring"
                placeholder="Describe your issue in detail..."
              />
            </div>
            <div className="flex gap-3">
              <button
                type="submit"
                disabled={loading}
                className="inline-flex items-center gap-2 rounded-lg bg-brand px-4 py-2 text-sm font-semibold text-on-brand transition-colors hover:bg-brand disabled:opacity-50"
              >
                {loading ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  <Send size={16} />
                )}
                Send Message
              </button>
              <button
                type="button"
                onClick={() => setShowCreateForm(false)}
                className="rounded-lg border border-border px-4 py-2 text-sm font-medium text-muted transition-colors hover:bg-surface"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Main Grid */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Messages List */}
        <div className="lg:col-span-1 space-y-4">
          <div className="rounded-xl border border-border bg-surface overflow-hidden">
            <div className="border-b border-border px-4 py-3 bg-bg">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-semibold text-heading">
                  My Tickets
                </h2>
                <button
                  onClick={fetchMessages}
                  className="rounded-lg p-1 text-muted transition-colors hover:bg-surface"
                >
                  <RefreshCw
                    size={14}
                    className={loading ? "animate-spin" : ""}
                  />
                </button>
              </div>
            </div>
            <div className="divide-y divide-border max-h-125 overflow-y-auto">
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
                  <p className="text-xs text-muted mt-1">
                    Create a ticket to get help
                  </p>
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
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <h3 className="text-sm font-medium text-heading truncate">
                          {message.subject}
                        </h3>
                        <p className="text-xs text-muted mt-1 line-clamp-2">
                          {message.message.substring(0, 80)}...
                        </p>
                        <div className="flex items-center gap-3 mt-2">
                          <div className="flex items-center gap-1">
                            {getStatusIcon(message.status)}
                            <span className="text-xs text-muted">
                              {getStatusText(message.status)}
                            </span>
                          </div>
                          <span className="text-xs text-muted">
                            {new Date(message.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                      {message.adminReply && (
                        <div className="ml-2">
                          <Reply size={12} className="text-info" />
                        </div>
                      )}
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
                <button
                  onClick={() => handleDeleteMessage(selectedMessage._id)}
                  className="rounded-lg p-1 text-muted transition-colors hover:bg-brand hover:text-on-brand"
                >
                  <Trash2 size={14} />
                </button>
              </div>

              <div className="p-4 space-y-4">
                {/* User Message */}
                <div className="rounded-lg border border-border bg-bg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-brand text-on-brand">
                        <MessageSquare size={14} />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-heading">You</p>
                        <p className="text-xs text-muted">
                          {new Date(selectedMessage.createdAt).toLocaleString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      {getStatusIcon(selectedMessage.status)}
                      <span className="text-xs text-muted">
                        {getStatusText(selectedMessage.status)}
                      </span>
                    </div>
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
                          Support Team
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

                {/* Add Reply */}
                {selectedMessage.status !== "resolved" && (
                  <div className="space-y-3">
                    <textarea
                      value={replyText}
                      onChange={(e) => setReplyText(e.target.value)}
                      rows={3}
                      className="w-full rounded-lg border border-border bg-bg px-4 py-2 text-sm text-heading placeholder:text-muted focus:border-brand focus:outline-none focus:ring-1 focus:ring-focus-ring"
                      placeholder="Type your reply here..."
                    />
                    <button
                      onClick={() => handleAddReply(selectedMessage._id)}
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
                )}
              </div>
            </div>
          ) : (
            <div className="rounded-xl border border-border bg-surface p-8 text-center">
              <MessageSquare size={48} className="mx-auto text-muted mb-4" />
              <h3 className="text-lg font-semibold text-heading">
                Select a Ticket
              </h3>
              <p className="mt-1 text-sm text-muted">
                Choose a ticket from the list to view details
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

export default UserSupport;
