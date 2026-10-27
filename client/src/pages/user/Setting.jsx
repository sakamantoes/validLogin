import {
  AlertTriangle,
  Bell,
  CheckCircle2,
  Copy,
  CreditCard,
  Eye,
  EyeOff,
  HelpCircle,
  Lock,
  Mail,
  Moon,
  ReceiptText,
  ShieldCheck,
  Smartphone,
  Trash2,
  User,
  Wallet,
} from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import useAuth from "../../store/useAuth.js";
import api from "../../service/api.js";

const FONT_DISPLAY = {
  fontFamily: "'Space Grotesk', ui-sans-serif, system-ui",
};

const FONT_MONO = {
  fontFamily: "'JetBrains Mono', ui-monospace, monospace",
};

const formatUserId = (id) => {
  if (!id) return "Not available";
  return `...${String(id).slice(-8)}`;
};

export default function Setting() {
  const navigate = useNavigate();
  const { user, updateUser } = useAuth();
  const profile = user?.data || user || {};
  const displayName = profile.username || profile.name || "Verified User";
  const displayEmail = profile.email || "No email on file";
  const userId = profile.id || profile._id;
  const initial = (displayName || displayEmail || "U")
    .slice(0, 1)
    .toUpperCase();

  // Username edit state
  const [isEditingUsername, setIsEditingUsername] = useState(false);
  const [newUsername, setNewUsername] = useState(displayName);
  const [updatingUsername, setUpdatingUsername] = useState(false);

  // Password change state
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [updatingPassword, setUpdatingPassword] = useState(false);

  // Simple preferences
  const [preferences, setPreferences] = useState({
    emailNotifications: true,
    darkMode: false,
    twoFactorAuth: false,
  });

  const [deleteConfirm, setDeleteConfirm] = useState("");
  const deleteReady = deleteConfirm.trim().toUpperCase() === "DELETE";

  const handleCopy = async (value, label) => {
    if (!value) {
      toast.info(`${label} is not available yet`);
      return;
    }
    try {
      await navigator.clipboard.writeText(value);
      toast.success(`${label} copied`);
    } catch {
      toast.error(`Could not copy ${label.toLowerCase()}`);
    }
  };

  const handleUpdateUsername = async () => {
    if (!newUsername.trim()) {
      toast.error("Username cannot be empty");
      return;
    }

    if (newUsername === displayName) {
      setIsEditingUsername(false);
      return;
    }

    setUpdatingUsername(true);
    try {
      const response = await api.put("/api/auth/update-username", {
        username: newUsername.trim(),
      });

      if (response.data.success) {
        toast.success("Username updated successfully");
        if (updateUser) {
          updateUser({ ...profile, username: newUsername.trim() });
        }
        setIsEditingUsername(false);
        setTimeout(() => window.location.reload(), 1000);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to update username");
      setNewUsername(displayName);
    } finally {
      setUpdatingUsername(false);
    }
  };

  const handleUpdatePassword = async () => {
    if (!passwordData.currentPassword) {
      toast.error("Current password is required");
      return;
    }

    if (!passwordData.newPassword) {
      toast.error("New password is required");
      return;
    }

    if (passwordData.newPassword.length < 6) {
      toast.error("New password must be at least 6 characters");
      return;
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error("New passwords do not match");
      return;
    }

    setUpdatingPassword(true);
    try {
      const response = await api.put("/api/auth/update-password", {
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
      });

      if (response.data.success) {
        toast.success("Password updated successfully");
        setPasswordData({
          currentPassword: "",
          newPassword: "",
          confirmPassword: "",
        });
        setShowPasswordForm(false);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to update password");
    } finally {
      setUpdatingPassword(false);
    }
  };

  const togglePreference = (key) => {
    setPreferences((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
    toast.success(`${key} preference updated`);
  };

  const handleDeletionRequest = () => {
    if (!deleteReady) {
      toast.info("Type DELETE to confirm this request");
      return;
    }
    toast.info("Account deletion request submitted");
    setDeleteConfirm("");
  };

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      {/* Page header — title on the left, badge pinned to the right. */}
      <section className="flex flex-col gap-4 rounded-2xl border border-border bg-surface px-6 py-5 shadow-card sm:flex-row sm:items-center sm:justify-between sm:px-8">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-brand text-on-brand">
            <User size={20} />
          </div>
          <div>
            <h1
              className="text-lg font-bold text-heading"
              style={FONT_DISPLAY}
            >
              Settings
            </h1>
            <p className="text-xs text-muted" style={FONT_MONO}>
              Manage your account and security preferences
            </p>
          </div>
        </div>
        <div
          className="inline-flex items-center gap-2 self-start rounded-full border border-border bg-brand px-3 py-1 text-xs font-semibold text-on-brand sm:self-auto"
          style={FONT_MONO}
        >
          <User size={13} />
          Account Settings
        </div>
      </section>

      {/* Profile Section */}
      <section className="overflow-hidden rounded-2xl border border-border bg-surface shadow-card">
        {/* Identity row */}
        <div className="flex flex-col gap-6 p-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex min-w-0 items-center gap-4">
            <div className="flex h-20 w-20 shrink-0 select-none items-center justify-center rounded-2xl bg-brand text-3xl font-bold text-on-brand">
              {initial}
            </div>
            <div className="min-w-0">
              <p
                className="text-xs font-semibold uppercase tracking-widest text-muted"
                style={FONT_MONO}
              >
                Profile
              </p>
              {isEditingUsername ? (
                <div className="mt-2 flex flex-wrap items-center gap-2">
                  <input
                    type="text"
                    value={newUsername}
                    onChange={(e) => setNewUsername(e.target.value)}
                    className="w-[200px] rounded-lg border border-border bg-bg px-3 py-2 text-lg font-bold text-heading focus:border-brand focus:outline-none focus:ring-1 focus:ring-focus-ring sm:w-[400px]"
                    style={FONT_DISPLAY}
                    autoFocus
                    disabled={updatingUsername}
                  />
                  <button
                    onClick={handleUpdateUsername}
                    disabled={updatingUsername}
                    className="rounded-lg bg-brand px-2 py-2 text-sm font-semibold text-on-brand transition-colors hover:bg-brand disabled:opacity-50"
                  >
                    {updatingUsername ? "Saving..." : "Save"}
                  </button>
                  <button
                    onClick={() => {
                      setNewUsername(displayName);
                      setIsEditingUsername(false);
                    }}
                    className="rounded-lg border border-border px-2 py-2 text-sm font-semibold text-muted transition-colors hover:bg-surface"
                  >
                    <p>X</p>
                  </button>
                </div>
              ) : (
                <div className="mt-2 flex items-center gap-2">
                  <h2
                    className="text-2xl font-bold text-heading"
                    style={FONT_DISPLAY}
                  >
                    {displayName}
                  </h2>
                  <button
                    onClick={() => setIsEditingUsername(true)}
                    className="rounded-lg p-1 text-muted transition-colors hover:bg-surface hover:text-heading"
                  >
                    <User size={14} />
                  </button>
                </div>
              )}
              <div className="mt-2 flex flex-wrap items-center gap-3 text-sm text-muted">
                <div className="flex items-center gap-1">
                  <Mail size={14} className="text-brand-text" />
                  <span className="break-all" style={FONT_MONO}>
                    {displayEmail}
                  </span>
                </div>
                <button
                  onClick={() => handleCopy(displayEmail, "Email")}
                  className="flex items-center gap-1 text-xs text-muted transition-colors hover:text-heading"
                >
                  <Copy size={12} />
                  Copy
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Status cards — separated from identity by a divider. */}
        <div className="grid gap-3 border-t border-border bg-bg p-6 sm:grid-cols-2">
          <div className="rounded-xl border border-border bg-surface p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-success bg-success-soft text-success">
                <CheckCircle2 size={17} />
              </div>
              <div>
                <p
                  className="text-xs font-medium uppercase tracking-widest text-muted"
                  style={FONT_MONO}
                >
                  Account Status
                </p>
                <p className="mt-0.5 text-sm font-semibold text-heading">
                  Verified
                </p>
              </div>
            </div>
          </div>
          <div className="rounded-xl border border-border bg-surface p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-border bg-surface text-muted">
                <ShieldCheck size={17} />
              </div>
              <div className="min-w-0">
                <p
                  className="text-xs font-medium uppercase tracking-widest text-muted"
                  style={FONT_MONO}
                >
                  User ID
                </p>
                <div className="mt-0.5 flex items-center gap-2">
                  <p
                    className="text-sm font-semibold text-heading"
                    style={FONT_MONO}
                  >
                    {formatUserId(userId)}
                  </p>
                  <button
                    onClick={() => handleCopy(userId, "User ID")}
                    className="text-muted transition-colors hover:text-heading"
                  >
                    <Copy size={12} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Change Password */}
      <section className="rounded-2xl border border-border bg-surface p-6 shadow-card">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-info-soft text-info">
            <Lock size={18} />
          </div>
          <div className="flex-1">
            <h2
              className="font-semibold text-heading"
              style={FONT_DISPLAY}
            >
              Change Password
            </h2>
            <p className="mt-1 text-sm leading-6 text-muted">
              Update your password to keep your account secure.
            </p>
          </div>
        </div>

        {!showPasswordForm ? (
          <button
            onClick={() => setShowPasswordForm(true)}
            className="mt-4 inline-flex items-center gap-2 rounded-lg border border-info bg-info-soft px-4 py-2 text-sm font-semibold text-info transition-colors hover:bg-info-soft"
          >
            <Lock size={14} />
            Change Password
          </button>
        ) : (
          <div className="mt-4 space-y-4">
            <div>
              <label
                className="mb-2 block text-xs font-semibold uppercase tracking-widest text-muted"
                style={FONT_MONO}
              >
                Current Password
              </label>
              <div className="relative">
                <input
                  type={showCurrentPassword ? "text" : "password"}
                  value={passwordData.currentPassword}
                  onChange={(e) =>
                    setPasswordData({
                      ...passwordData,
                      currentPassword: e.target.value,
                    })
                  }
                  className="w-full rounded-lg border border-border bg-bg px-4 py-2 pr-10 text-sm text-heading placeholder:text-muted focus:border-brand focus:outline-none focus:ring-1 focus:ring-focus-ring"
                  style={FONT_MONO}
                  placeholder="Enter current password"
                />
                <button
                  type="button"
                  onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-heading"
                >
                  {showCurrentPassword ? (
                    <EyeOff size={16} />
                  ) : (
                    <Eye size={16} />
                  )}
                </button>
              </div>
            </div>

            <div>
              <label
                className="mb-2 block text-xs font-semibold uppercase tracking-widest text-muted"
                style={FONT_MONO}
              >
                New Password
              </label>
              <div className="relative">
                <input
                  type={showNewPassword ? "text" : "password"}
                  value={passwordData.newPassword}
                  onChange={(e) =>
                    setPasswordData({
                      ...passwordData,
                      newPassword: e.target.value,
                    })
                  }
                  className="w-full rounded-lg border border-border bg-bg px-4 py-2 pr-10 text-sm text-heading placeholder:text-muted focus:border-brand focus:outline-none focus:ring-1 focus:ring-focus-ring"
                  style={FONT_MONO}
                  placeholder="Enter new password (min 6 characters)"
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-heading"
                >
                  {showNewPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <div>
              <label
                className="mb-2 block text-xs font-semibold uppercase tracking-widest text-muted"
                style={FONT_MONO}
              >
                Confirm New Password
              </label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  value={passwordData.confirmPassword}
                  onChange={(e) =>
                    setPasswordData({
                      ...passwordData,
                      confirmPassword: e.target.value,
                    })
                  }
                  className="w-full rounded-lg border border-border bg-bg px-4 py-2 pr-10 text-sm text-heading placeholder:text-muted focus:border-brand focus:outline-none focus:ring-1 focus:ring-focus-ring"
                  style={FONT_MONO}
                  placeholder="Confirm new password"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-heading"
                >
                  {showConfirmPassword ? (
                    <EyeOff size={16} />
                  ) : (
                    <Eye size={16} />
                  )}
                </button>
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                onClick={handleUpdatePassword}
                disabled={updatingPassword}
                className="inline-flex items-center gap-2 rounded-lg bg-brand px-4 py-2 text-sm font-semibold text-on-brand transition-colors hover:bg-brand disabled:opacity-50"
              >
                {updatingPassword ? "Updating..." : "Update Password"}
              </button>
              <button
                onClick={() => {
                  setShowPasswordForm(false);
                  setPasswordData({
                    currentPassword: "",
                    newPassword: "",
                    confirmPassword: "",
                  });
                }}
                className="rounded-lg border border-border px-4 py-2 text-sm font-semibold text-muted transition-colors hover:bg-surface"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </section>

      {/* Quick Links */}
      <section className="rounded-2xl border border-border bg-surface p-6 shadow-card">
        <h2 className="font-semibold text-heading" style={FONT_DISPLAY}>
          Quick Links
        </h2>
        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          <button
            onClick={() => navigate("/f/fund-account")}
            className="group flex items-center gap-3 rounded-xl border border-border bg-bg-subtle p-3 transition-colors hover:border-border-strong hover:bg-brand-soft"
          >
            <Wallet size={18} className="text-brand-text" />
            <span className="text-sm font-semibold text-heading">
              Fund Wallet
            </span>
          </button>
          <button
            onClick={() => navigate("/f/deposits")}
            className="group flex items-center gap-3 rounded-xl border border-border bg-bg-subtle p-3 transition-colors hover:border-border-strong hover:bg-brand-soft"
          >
            <CreditCard size={18} className="text-brand-text" />
            <span className="text-sm font-semibold text-heading">Deposits</span>
          </button>
          <button
            onClick={() => navigate("/f/receipts")}
            className="group flex items-center gap-3 rounded-xl border border-border bg-bg-subtle p-3 transition-colors hover:border-border-strong hover:bg-brand-soft"
          >
            <ReceiptText size={18} className="text-brand-text" />
            <span className="text-sm font-semibold text-heading">Receipts</span>
          </button>
        </div>
      </section>

      {/* Delete Account — icon and copy stacked at the top, form below on a
          distinct background so the destructive action reads as separate. */}
      <section className="overflow-hidden rounded-2xl border border-border bg-surface shadow-card">
        <div className="flex items-start gap-3 p-6">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-brand text-on-brand">
            <AlertTriangle size={18} />
          </div>
          <div>
            <h2 className="font-semibold text-heading" style={FONT_DISPLAY}>
              Delete Account
            </h2>
            <p className="mt-1 text-sm leading-6 text-muted">
              Permanently delete your account and all associated data.
            </p>
          </div>
        </div>

        <div className="border-t border-border bg-bg p-6">
          <label
            className="block text-xs font-semibold uppercase tracking-widest text-brand-text"
            style={FONT_MONO}
          >
            Type DELETE to confirm
          </label>
          <input
            value={deleteConfirm}
            onChange={(event) => setDeleteConfirm(event.target.value)}
            placeholder="DELETE"
            className="mt-2 h-11 w-full rounded-lg border border-border bg-surface px-3 text-sm text-heading outline-none transition-colors placeholder:text-muted focus:border-brand focus:ring-1 focus:ring-focus-ring"
            style={FONT_MONO}
          />
          <button
            onClick={handleDeletionRequest}
            disabled={!deleteReady}
            className="mt-3 inline-flex h-10 w-full items-center justify-center gap-2 rounded-lg bg-brand px-4 text-sm font-semibold text-on-brand transition-colors hover:bg-brand disabled:cursor-not-allowed disabled:bg-brand disabled:text-on-brand"
          >
            <Trash2 size={15} />
            Request Account Deletion
          </button>
        </div>
      </section>
    </div>
  );
}