import React, { useEffect, useState } from "react";
import {
  Users as UsersIcon,
  Search,
  Filter,
  MoreVertical,
  CheckCircle,
  XCircle,
  Loader2,
  Mail,
  Phone,
  Calendar,
  Shield,
  UserCheck,
  UserX,
  Eye,
  RefreshCw,
  AlertCircle,
  Activity,
  Clock,
  MapPin,
  Smartphone,
  CreditCard,
  Wallet,
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
  Edit,
  Save,
  X,
} from "lucide-react";
import { getAllUsers, activateUser, deactivateUser } from "../../service/auth";
import { refundAndEditBalance } from "../../service/admin";

const FONT_DISPLAY = {
  fontFamily: "'Space Grotesk', ui-sans-serif, system-ui",
};

const FONT_MONO = {
  fontFamily: "'JetBrains Mono', ui-monospace, monospace",
};

export default function Users() {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedUser, setSelectedUser] = useState(null);
  const [actionLoading, setActionLoading] = useState(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Wallet edit states
  const [walletEditUser, setWalletEditUser] = useState(null);
  const [editWalletValue, setEditWalletValue] = useState("");
  const [walletUpdateLoading, setWalletUpdateLoading] = useState(false);
  const [walletEditError, setWalletEditError] = useState("");

  // ================= FETCH USERS =================
  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError("");
      const data = await getAllUsers();
      console.log("Users data:", data);

      // Handle different response structures
      const usersArray = data?.data?.users || [];
      setUsers(usersArray);
      setFilteredUsers(usersArray);
    } catch (error) {
      console.log(error);
      setError(error?.response?.data?.message || "Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  // ================= ACTIVATE USER =================
  const handleActivateUser = async (id) => {
    if (!window.confirm("Are you sure you want to activate this user?")) {
      return;
    }

    try {
      setActionLoading(id);
      setError("");
      setSuccess("");

      await activateUser(id);
      setSuccess("User activated successfully!");
      await fetchUsers(); // Refresh the list
    } catch (error) {
      console.log(error);
      setError(error?.response?.data?.message || "Failed to activate user");
    } finally {
      setActionLoading(null);
      setTimeout(() => setSuccess(""), 3000);
    }
  };

  // ================= DEACTIVATE USER =================
  const handleDeactivateUser = async (id) => {
    if (!window.confirm("Are you sure you want to deactivate this user?")) {
      return;
    }

    try {
      setActionLoading(id);
      setError("");
      setSuccess("");

      await deactivateUser(id);
      setSuccess("User deactivated successfully!");
      await fetchUsers(); // Refresh the list
    } catch (error) {
      console.log(error);
      setError(error?.response?.data?.message || "Failed to deactivate user");
    } finally {
      setActionLoading(null);
      setTimeout(() => setSuccess(""), 3000);
    }
  };

  // ================= EDIT WALLET BALANCE =================
  const handleEditWalletStart = (user) => {
    setWalletEditUser(user);
    setEditWalletValue(user.walletBalance?.toString() || "0");
    setWalletEditError("");
  };

  const handleEditWalletCancel = () => {
    setWalletEditUser(null);
    setEditWalletValue("");
    setWalletEditError("");
  };

  const handleEditWalletSave = async () => {
    const walletBalance = parseFloat(editWalletValue);

    if (isNaN(walletBalance) || walletBalance < 0) {
      setWalletEditError("Please enter a valid positive number");
      return;
    }

    try {
      setWalletUpdateLoading(true);
      setWalletEditError("");
      setSuccess("");

      await refundAndEditBalance(walletEditUser._id, walletBalance);
      setSuccess("Wallet balance updated successfully!");
      await fetchUsers(); // Refresh the list
      setWalletEditUser(null);
      setEditWalletValue("");
    } catch (error) {
      console.log(error);
      setWalletEditError(
        error?.response?.data?.message || "Failed to update wallet balance",
      );
    } finally {
      setWalletUpdateLoading(false);
      setTimeout(() => setSuccess(""), 3000);
    }
  };

  useEffect(() => {
    if (!walletEditUser) return;

    const handleKeyDown = (event) => {
      if (event.key === "Escape") handleEditWalletCancel();
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [walletEditUser]);

  // ================= FILTER USERS =================
  useEffect(() => {
    let filtered = [...users];

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(
        (user) =>
          (user.username &&
            user.username.toLowerCase().includes(searchTerm.toLowerCase())) ||
          (user.email &&
            user.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
          (user.phone && user.phone.includes(searchTerm)),
      );
    }

    // Apply status filter - FIXED: Check the actual status field
    if (statusFilter !== "all") {
      filtered = filtered.filter((user) => {
        const userStatus =
          user.status === "active" || user.isActive === true
            ? "active"
            : "inactive";
        return userStatus === statusFilter;
      });
    }

    setFilteredUsers(filtered);
  }, [searchTerm, statusFilter, users]);

  useEffect(() => {
    fetchUsers();
  }, []);

  // Stats calculations
  const totalUsers = users.length;
  const activeUsers = users.filter(
    (u) => u.status === "active" || u.isActive === true,
  ).length;
  const inactiveUsers = users.filter(
    (u) => u.status === "inactive" || u.isActive === false,
  ).length;
  const newThisMonth = users.filter((u) => {
    const createdDate = new Date(u.createdAt || u.created_at);
    const now = new Date();
    return (
      createdDate.getMonth() === now.getMonth() &&
      createdDate.getFullYear() === now.getFullYear()
    );
  }).length;

  // Wallet stats
  const totalWalletBalance = users.reduce(
    (sum, u) => sum + (u.walletBalance || 0),
    0,
  );
  const usersWithBalance = users.filter(
    (u) => (u.walletBalance || 0) > 0,
  ).length;

  const stats = [
    {
      label: "Total Users",
      value: totalUsers,
      change: "All time",
      icon: UsersIcon,
      iconBg: "bg-brand",
      iconColor: "text-brand-text",
    },
    {
      label: "Active Users",
      value: activeUsers,
      change: `${totalUsers > 0 ? ((activeUsers / totalUsers) * 100).toFixed(1) : 0}% of total`,
      icon: UserCheck,
      iconBg: "bg-success-soft",
      iconColor: "text-success",
    },
    {
      label: "Inactive Users",
      value: inactiveUsers,
      change: `${totalUsers > 0 ? ((inactiveUsers / totalUsers) * 100).toFixed(1) : 0}% of total`,
      icon: UserX,
      iconBg: "bg-warning-soft",
      iconColor: "text-warning",
    },
    {
      label: "New This Month",
      value: newThisMonth,
      change: "+" + newThisMonth + " new",
      icon: TrendingUp,
      iconBg: "bg-info-soft",
      iconColor: "text-info",
    },
  ];

  // Helper function to get user status consistently
  const getUserStatus = (user) => {
    return user.status === "active" || user.isActive === true
      ? "active"
      : "inactive";
  };

  // Helper function to format wallet balance in Naira
  const formatWalletBalance = (balance) => {
    if (balance === undefined || balance === null) return "₦0.00";
    return `₦${Number(balance).toFixed(2)}`;
  };

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      {/* Hero Section — title left, refresh right */}
      <section className="slanted-page-header rounded-2xl border border-border bg-surface p-6 shadow-card sm:p-8">
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div className="max-w-2xl">
            <div
              className="inline-flex items-center gap-2 rounded-full border border-border bg-brand px-3 py-1 text-xs font-semibold text-on-brand"
              style={FONT_MONO}
            >
              <UsersIcon size={13} />
              User Management
            </div>
            <h1
              className="mt-4 text-2xl font-bold tracking-tight text-heading sm:text-3xl"
              style={FONT_DISPLAY}
            >
              Users
            </h1>
            <p
              className="mt-2 text-sm leading-6 text-muted"
              style={FONT_MONO}
            >
              Manage accounts, balances, and access across the platform.
            </p>
          </div>
          <button
            onClick={fetchUsers}
            className="inline-flex h-11 shrink-0 items-center gap-2 rounded-xl bg-brand px-5 text-sm font-semibold text-on-brand transition-colors hover:bg-brand active:bg-brand"
            style={FONT_MONO}
          >
            <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
            Refresh
          </button>
        </div>
      </section>

      {/* Stats Cards */}
      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="group rounded-2xl border border-border bg-surface p-5 shadow-card transition-colors hover:border-border-strong"
          >
            <div className="flex items-start justify-between gap-3">
              <div
                className={`flex h-10 w-10 items-center justify-center rounded-lg ${stat.iconBg} ${stat.iconColor}`}
              >
                <stat.icon size={19} />
              </div>
              <span
                className="rounded-full border border-border bg-surface px-2.5 py-0.5 text-xs font-medium text-muted"
                style={FONT_MONO}
              >
                {stat.change}
              </span>
            </div>
            <p
              className="mt-4 text-xs font-medium uppercase tracking-widest text-muted"
              style={FONT_MONO}
            >
              {stat.label}
            </p>
            <p
              className="mt-1 text-2xl font-bold tracking-tight text-heading"
              style={FONT_DISPLAY}
            >
              {stat.value}
            </p>
          </div>
        ))}
      </section>

      {/* Additional Wallet Stats */}
      <section className="grid gap-3 sm:grid-cols-2">
        <div className="rounded-2xl border border-border bg-surface p-5 shadow-card">
          <div className="flex items-start justify-between gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-success-soft text-success">
              <Wallet size={19} />
            </div>
            <span
              className="rounded-full border border-border bg-surface px-2.5 py-0.5 text-xs font-medium text-muted"
              style={FONT_MONO}
            >
              Total Balance
            </span>
          </div>
          <p
            className="mt-4 text-xs font-medium uppercase tracking-widest text-muted"
            style={FONT_MONO}
          >
            Total Wallet Balance
          </p>
          <p
            className="mt-1 text-2xl font-bold tracking-tight text-heading"
            style={FONT_DISPLAY}
          >
            {formatWalletBalance(totalWalletBalance)}
          </p>
        </div>
        <div className="rounded-2xl border border-border bg-surface p-5 shadow-card">
          <div className="flex items-start justify-between gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-info-soft text-info">
              <UsersIcon size={19} />
            </div>
            <span
              className="rounded-full border border-border bg-surface px-2.5 py-0.5 text-xs font-medium text-muted"
              style={FONT_MONO}
            >
              {totalUsers > 0
                ? ((usersWithBalance / totalUsers) * 100).toFixed(1)
                : 0}
              % of users
            </span>
          </div>
          <p
            className="mt-4 text-xs font-medium uppercase tracking-widest text-muted"
            style={FONT_MONO}
          >
            Users with Balance
          </p>
          <p
            className="mt-1 text-2xl font-bold tracking-tight text-heading"
            style={FONT_DISPLAY}
          >
            {usersWithBalance}
          </p>
        </div>
      </section>

      {/* Search and Filter Bar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
          <input
            type="text"
            placeholder="Search users by name, email, or phone..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full rounded-lg border border-border bg-bg py-2 pl-9 pr-4 text-sm text-heading placeholder:text-muted focus:border-brand focus:outline-none focus:ring-1 focus:ring-focus-ring"
            style={FONT_MONO}
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={() => setStatusFilter("all")}
            className={`rounded-lg px-3 py-2 text-xs font-medium transition-all ${
              statusFilter === "all"
                ? "bg-brand text-on-brand border border-brand"
                : "bg-surface text-muted border border-border hover:bg-surface"
            }`}
            style={FONT_MONO}
          >
            All Users ({users.length})
          </button>
          <button
            onClick={() => setStatusFilter("active")}
            className={`rounded-lg px-3 py-2 text-xs font-medium transition-all ${
              statusFilter === "active"
                ? "bg-success-soft text-success border border-success"
                : "bg-surface text-muted border border-border hover:bg-surface"
            }`}
            style={FONT_MONO}
          >
            Active ({activeUsers})
          </button>
          <button
            onClick={() => setStatusFilter("inactive")}
            className={`rounded-lg px-3 py-2 text-xs font-medium transition-all ${
              statusFilter === "inactive"
                ? "bg-warning-soft text-warning border border-warning"
                : "bg-surface text-muted border border-border hover:bg-surface"
            }`}
            style={FONT_MONO}
          >
            Inactive ({inactiveUsers})
          </button>
        </div>
      </div>

      {/* Users Table */}
      <div className="overflow-hidden rounded-2xl border border-border bg-surface shadow-card">
        {loading ? (
          <div className="flex items-center justify-center py-12 flex-col gap-1">
            <Loader2 className="h-8 w-8 animate-spin text-brand-text" />
            <p className="text-heading text-xs" style={FONT_MONO}>
              getting all user.....
            </p>
          </div>
        ) : error ? (
          <div className="flex items-center justify-center gap-2 rounded-lg bg-brand p-4 text-on-brand m-4">
            <AlertCircle size={20} />
            {error}
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="text-center py-12">
            <UsersIcon size={48} className="mx-auto text-muted mb-4" />
            <h3
              className="text-lg font-semibold text-heading"
              style={FONT_DISPLAY}
            >
              No users found
            </h3>
            <p className="mt-1 text-sm text-muted" style={FONT_MONO}>
              {searchTerm
                ? "Try adjusting your search"
                : "No users registered yet"}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b border-border bg-bg">
                <tr>
                  <th
                    className="px-4 py-3 text-left text-xs font-medium text-muted"
                    style={FONT_MONO}
                  >
                    User
                  </th>
                  <th
                    className="px-4 py-3 text-left text-xs font-medium text-muted"
                    style={FONT_MONO}
                  >
                    Contact
                  </th>
                  <th
                    className="px-4 py-3 text-left text-xs font-medium text-muted"
                    style={FONT_MONO}
                  >
                    Wallet Balance
                  </th>
                  <th
                    className="px-4 py-3 text-left text-xs font-medium text-muted"
                    style={FONT_MONO}
                  >
                    Status
                  </th>
                  <th
                    className="px-4 py-3 text-left text-xs font-medium text-muted"
                    style={FONT_MONO}
                  >
                    Joined
                  </th>
                  <th
                    className="px-4 py-3 text-left text-xs font-medium text-muted"
                    style={FONT_MONO}
                  >
                    Role
                  </th>
                  <th
                    className="px-4 py-3 text-right text-xs font-medium text-muted"
                    style={FONT_MONO}
                  >
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredUsers.map((user) => (
                  <tr
                    key={user._id}
                    className="hover:bg-surface transition-colors cursor-pointer"
                    onClick={() => setSelectedUser(user)}
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-brand text-on-brand font-semibold">
                          {user.username
                            ? user.username.charAt(0).toUpperCase()
                            : user.email?.charAt(0).toUpperCase() || "U"}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-heading">
                            {user.username || "N/A"}
                          </p>
                          <p
                            className="text-xs text-muted"
                            style={FONT_MONO}
                          >
                            ID: {user._id?.slice(-8)}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="space-y-1">
                        <div className="flex items-center gap-1.5 text-xs text-muted">
                          <Mail size={12} />
                          <span
                            className="truncate max-w-[150px]"
                            style={FONT_MONO}
                          >
                            {user.email || "No email"}
                          </span>
                        </div>
                        <div
                          className="flex items-center gap-1.5 text-xs text-muted"
                          style={FONT_MONO}
                        >
                          <Phone size={12} />
                          {user.phone || "No phone"}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5">
                        <Wallet size={14} className="text-success/60" />
                        <span
                          className={`text-sm font-medium ${
                            (user.walletBalance || 0) > 0
                              ? "text-success"
                              : "text-muted"
                          }`}
                          style={FONT_MONO}
                        >
                          {formatWalletBalance(user.walletBalance)}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-medium ${
                          user.status === "active" || user.isActive === true
                            ? "bg-success-soft text-success border border-success"
                            : "bg-warning-soft text-warning border border-warning"
                        }`}
                        style={FONT_MONO}
                      >
                        {user.status === "active" || user.isActive === true ? (
                          <CheckCircle size={10} />
                        ) : (
                          <XCircle size={10} />
                        )}
                        {user.status === "active" || user.isActive === true
                          ? "Active"
                          : "Inactive"}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div
                        className="flex items-center gap-1.5 text-xs text-muted"
                        style={FONT_MONO}
                      >
                        <Calendar size={12} />
                        {user.createdAt || user.created_at
                          ? new Date(
                              user.createdAt || user.created_at,
                            ).toLocaleDateString()
                          : "N/A"}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5">
                        <Shield size={12} className="text-muted" />
                        <span
                          className="text-xs text-muted capitalize"
                          style={FONT_MONO}
                        >
                          {user.role || "User"}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {user.status === "active" || user.isActive === true ? (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeactivateUser(user._id);
                            }}
                            disabled={actionLoading === user._id}
                            className="rounded-lg border border-warning bg-warning-soft p-1.5 text-warning transition-colors hover:bg-warning-soft disabled:opacity-50"
                            title="Deactivate User"
                          >
                            {actionLoading === user._id ? (
                              <Loader2 size={14} className="animate-spin" />
                            ) : (
                              <UserX size={14} />
                            )}
                          </button>
                        ) : (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleActivateUser(user._id);
                            }}
                            disabled={actionLoading === user._id}
                            className="rounded-lg border border-success bg-success-soft p-1.5 text-success transition-colors hover:bg-success-soft disabled:opacity-50"
                            title="Activate User"
                          >
                            {actionLoading === user._id ? (
                              <Loader2 size={14} className="animate-spin" />
                            ) : (
                              <UserCheck size={14} />
                            )}
                          </button>
                        )}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEditWalletStart(user);
                          }}
                          className="rounded-lg border border-success bg-success-soft p-1.5 text-success transition-colors hover:bg-success-soft"
                          title="Edit Wallet Balance"
                        >
                          <Edit size={14} />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedUser(user);
                          }}
                          className="rounded-lg border border-border bg-surface p-1.5 text-muted transition-colors hover:bg-surface hover:text-heading"
                          title="View Details"
                        >
                          <Eye size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* User Details Modal */}
      {selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-bg p-4">
          <div className="relative max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-border bg-surface-raised shadow-card">
            <div className="sticky top-0 flex items-center justify-between border-b border-border bg-surface-raised p-4">
              <h2
                className="text-lg font-semibold text-heading"
                style={FONT_DISPLAY}
              >
                User Details
              </h2>
              <button
                onClick={() => setSelectedUser(null)}
                className="rounded-lg p-1 text-muted transition-colors hover:bg-surface hover:text-heading"
              >
                <XCircle size={20} />
              </button>
            </div>

            <div className="p-6 space-y-4">
              {/* User Header */}
              <div className="flex items-center gap-4">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-brand text-on-brand text-2xl font-bold">
                  {selectedUser.username
                    ? selectedUser.username.charAt(0).toUpperCase()
                    : selectedUser.email?.charAt(0).toUpperCase() || "U"}
                </div>
                <div>
                  <h3
                    className="text-xl font-bold text-heading"
                    style={FONT_DISPLAY}
                  >
                    {selectedUser.username || "N/A"}
                  </h3>
                  <p
                    className="text-sm text-muted"
                    style={FONT_MONO}
                  >
                    ID: {selectedUser._id}
                  </p>
                </div>
              </div>

              {/* User Info Grid */}
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-lg border border-border bg-bg p-3">
                  <p className="text-xs text-muted" style={FONT_MONO}>
                    Email Address
                  </p>
                  <div className="flex items-center gap-1.5 mt-1">
                    <Mail size={14} className="text-muted" />
                    <p
                      className="text-sm text-heading break-all"
                      style={FONT_MONO}
                    >
                      {selectedUser.email || "Not provided"}
                    </p>
                  </div>
                </div>
                <div className="rounded-lg border border-border bg-bg p-3">
                  <p className="text-xs text-muted" style={FONT_MONO}>
                    Phone Number
                  </p>
                  <div className="flex items-center gap-1.5 mt-1">
                    <Phone size={14} className="text-muted" />
                    <p className="text-sm text-heading" style={FONT_MONO}>
                      {selectedUser.phone || "Not provided"}
                    </p>
                  </div>
                </div>
                <div className="rounded-lg border border-border bg-bg p-3">
                  <p className="text-xs text-muted" style={FONT_MONO}>
                    Wallet Balance
                  </p>
                  <div className="flex items-center gap-1.5 mt-1">
                    <Wallet size={14} className="text-success" />
                    <p
                      className={`text-sm font-semibold ${
                        (selectedUser.walletBalance || 0) > 0
                          ? "text-success"
                          : "text-muted"
                      }`}
                      style={FONT_MONO}
                    >
                      {formatWalletBalance(selectedUser.walletBalance)}
                    </p>
                  </div>
                </div>
                <div className="rounded-lg border border-border bg-bg p-3">
                  <p className="text-xs text-muted" style={FONT_MONO}>
                    Account Status
                  </p>
                  <div className="mt-1">
                    <span
                      className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-medium ${
                        selectedUser.status === "active" ||
                        selectedUser.isActive === true
                          ? "bg-success-soft text-success"
                          : "bg-warning-soft text-warning"
                      }`}
                      style={FONT_MONO}
                    >
                      {selectedUser.status === "active" ||
                      selectedUser.isActive === true ? (
                        <CheckCircle size={10} />
                      ) : (
                        <XCircle size={10} />
                      )}
                      {selectedUser.status === "active" ||
                      selectedUser.isActive === true
                        ? "Active"
                        : "Inactive"}
                    </span>
                  </div>
                </div>
                <div className="rounded-lg border border-border bg-bg p-3">
                  <p className="text-xs text-muted" style={FONT_MONO}>
                    User Role
                  </p>
                  <div className="flex items-center gap-1.5 mt-1">
                    <Shield size={14} className="text-muted" />
                    <p
                      className="text-sm text-heading capitalize"
                      style={FONT_MONO}
                    >
                      {selectedUser.role || "User"}
                    </p>
                  </div>
                </div>
                <div className="rounded-lg border border-border bg-bg p-3">
                  <p className="text-xs text-muted" style={FONT_MONO}>
                    Member Since
                  </p>
                  <div className="flex items-center gap-1.5 mt-1">
                    <Calendar size={14} className="text-muted" />
                    <p className="text-sm text-heading" style={FONT_MONO}>
                      {selectedUser.createdAt || selectedUser.created_at
                        ? new Date(
                            selectedUser.createdAt || selectedUser.created_at,
                          ).toLocaleString()
                        : "N/A"}
                    </p>
                  </div>
                </div>
                <div className="rounded-lg border border-border bg-bg p-3">
                  <p className="text-xs text-muted" style={FONT_MONO}>
                    Last Updated
                  </p>
                  <div className="flex items-center gap-1.5 mt-1">
                    <Clock size={14} className="text-muted" />
                    <p className="text-sm text-heading" style={FONT_MONO}>
                      {selectedUser.updatedAt || selectedUser.updated_at
                        ? new Date(
                            selectedUser.updatedAt || selectedUser.updated_at,
                          ).toLocaleString()
                        : "N/A"}
                    </p>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4">
                {selectedUser.status === "active" ||
                selectedUser.isActive === true ? (
                  <button
                    onClick={() => {
                      handleDeactivateUser(selectedUser._id);
                      setSelectedUser(null);
                    }}
                    className="flex-1 rounded-lg bg-warning-soft py-2.5 text-sm font-semibold text-warning transition-colors hover:bg-warning-soft border border-warning"
                    style={FONT_MONO}
                  >
                    <UserX size={16} className="inline mr-2" />
                    Deactivate User
                  </button>
                ) : (
                  <button
                    onClick={() => {
                      handleActivateUser(selectedUser._id);
                      setSelectedUser(null);
                    }}
                    className="flex-1 rounded-lg bg-success-soft py-2.5 text-sm font-semibold text-success transition-colors hover:bg-success-soft border border-success"
                    style={FONT_MONO}
                  >
                    <UserCheck size={16} className="inline mr-2" />
                    Activate User
                  </button>
                )}
                <button
                  onClick={() => setSelectedUser(null)}
                  className="rounded-lg border border-border px-4 py-2.5 text-sm font-medium text-muted transition-colors hover:bg-surface"
                  style={FONT_MONO}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Wallet Balance Modal */}
      {walletEditUser && (
        <div
          className="fixed left-0 top-0 z-50 flex h-screen w-full items-center justify-center bg-bg p-4"
          onClick={handleEditWalletCancel}
        >
          <div
            className="w-full max-w-sm rounded-2xl border border-border bg-surface-raised p-6 shadow-card"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-success-soft text-success">
                  <Wallet size={18} />
                </div>
                <div className="min-w-0">
                  <h2
                    className="text-sm font-semibold text-heading"
                    style={FONT_DISPLAY}
                  >
                    Edit Wallet Balance
                  </h2>
                  <p
                    className="truncate text-xs text-muted"
                    style={FONT_MONO}
                  >
                    {walletEditUser.username || walletEditUser.email}
                  </p>
                </div>
              </div>
              <button
                onClick={handleEditWalletCancel}
                className="shrink-0 rounded-lg p-1 text-muted transition-colors hover:bg-surface hover:text-heading"
                aria-label="Close"
              >
                <X size={18} />
              </button>
            </div>

            <div className="mt-5">
              <label
                className="text-xs font-medium uppercase tracking-widest text-muted"
                style={FONT_MONO}
              >
                New Balance
              </label>
              <div className="mt-1.5 flex items-center gap-2 rounded-lg border border-border bg-bg px-3 py-2.5 focus-within:border-success focus-within:ring-1 focus-within:ring-success">
                <span className="text-sm text-muted" style={FONT_MONO}>
                  ₦
                </span>
                <input
                  type="number"
                  value={editWalletValue}
                  onChange={(e) => setEditWalletValue(e.target.value)}
                  className="w-full bg-transparent text-sm text-heading outline-none"
                  style={FONT_MONO}
                  autoFocus
                  step="0.01"
                  min="0"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleEditWalletSave();
                  }}
                />
              </div>
              <p className="mt-1.5 text-xs text-muted" style={FONT_MONO}>
                Current balance:{" "}
                {formatWalletBalance(walletEditUser.walletBalance)}
              </p>
            </div>

            {walletEditError && (
              <div className="mt-4 flex items-start gap-2 rounded-lg bg-brand p-3 text-sm text-on-brand">
                <AlertCircle size={16} className="mt-0.5 shrink-0" />
                {walletEditError}
              </div>
            )}

            <div className="mt-5 flex gap-3">
              <button
                onClick={handleEditWalletCancel}
                className="flex-1 rounded-lg border border-border py-2.5 text-sm font-medium text-muted transition-colors hover:bg-surface"
                style={FONT_MONO}
              >
                Cancel
              </button>
              <button
                onClick={handleEditWalletSave}
                disabled={walletUpdateLoading}
                className="flex flex-1 items-center justify-center gap-2 rounded-lg border border-success bg-success-soft py-2.5 text-sm font-semibold text-success transition-colors hover:bg-success-soft disabled:cursor-not-allowed disabled:opacity-50"
                style={FONT_MONO}
              >
                {walletUpdateLoading ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  <Save size={16} />
                )}
                Update Balance
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Success/Error Toasts */}
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
}