// src/pages/ResetPassword.jsx
import { useState } from "react";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Eye,
  EyeOff,
  Lock,
  XCircle,
} from "lucide-react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import ThemeToggle from "../components/ThemeToggle";
import SiteLogo from "../components/SiteLogo";
import { resetPassword } from "../service/auth.js";
import imageObject from "../utils/image.js";

const FONT_DISPLAY = {
  fontFamily: "'Space Grotesk', ui-sans-serif, system-ui",
};
const FONT_MONO = { fontFamily: "'JetBrains Mono', ui-monospace, monospace" };

const ResetPassword = () => {
  const navigate = useNavigate();
  const { token } = useParams();
  const [formData, setFormData] = useState({
    newPassword: "",
    confirmPassword: "",
  });
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [updated, setUpdated] = useState(false);

  const getErrorMessage = (err) => {
    const message = err?.response?.data?.message;

    if (typeof message === "object") {
      return Object.values(message).find(Boolean) || "Something went wrong";
    }

    return (
      message ||
      err?.response?.data?.error ||
      err?.message ||
      "Something went wrong"
    );
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (error) setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!token) {
      setError("Password reset token is missing");
      return;
    }

    if (!formData.newPassword) {
      setError("New password is required");
      return;
    }

    if (formData.newPassword.length < 8) {
      setError("Password must be at least 8 characters long");
      return;
    }

    if (formData.newPassword !== formData.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await resetPassword(token, formData);

      setUpdated(true);
      setFormData({
        newPassword: "",
        confirmPassword: "",
      });
      toast.success(response?.message || "Password reset successfully");

      setTimeout(() => {
        navigate("/login", { replace: true });
      }, 1500);
    } catch (error) {
      const message = getErrorMessage(error);
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="landing-page relative min-h-screen overflow-hidden bg-bg text-body flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <ThemeToggle className="fixed right-4 top-4 z-50" />
      {/* Background grid — same as homepage hero */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.05]"
        style={{
          backgroundImage:
            "linear-gradient(var(--brand) 1px, transparent 1px), linear-gradient(90deg, var(--brand) 1px, transparent 1px)",
          backgroundSize: "44px 44px",
        }}
      />
      {/* Purple glow — same as homepage hero */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 0.2, scale: 1 }}
        transition={{ duration: 1.5 }}
        className="pointer-events-none absolute -top-40 left-1/2 h-[520px] w-[900px] -translate-x-1/2 rounded-full blur-[110px]"
        style={{
          background: "radial-gradient(closest-side, var(--brand), transparent)",
        }}
      />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative z-10 w-full max-w-md"
      >
        {/* Header */}
        <div className="mb-8 text-center">
          <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.5 }}
                    className="mx-auto mb-3 flex items-center justify-center"
                  >
                    <img src={imageObject.Logo} className='h-[50px] w-[150px] rounded-sm' />
                  </motion.div>
          <h1
            style={FONT_DISPLAY}
            className="text-[32px] font-semibold leading-tight tracking-tight text-heading sm:text-[36px]"
          >
            Set a new password
          </h1>
          <p className="mt-2 text-[14px] text-muted">
            Choose a strong password you haven't used before.
          </p>
        </div>

        {/* Form card */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="rounded-xl border border-border bg-surface p-7 shadow-card sm:p-8"
        >
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* New password */}
            <div>
              <label className="mb-2 block text-[13px] font-medium text-heading">
                New password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 h-4.5 w-4.5 -translate-y-1/2 text-muted" />
                <input
                  type={showNewPassword ? "text" : "password"}
                  name="newPassword"
                  value={formData.newPassword}
                  onChange={handleChange}
                  className={`w-full rounded-md border bg-bg-subtle py-3 pl-10 pr-12 text-[14px] text-heading placeholder:text-muted transition-colors focus:bg-surface focus:outline-none ${
                    error
                      ? "border-danger"
                      : "border-border focus:border-brand"
                  }`}
                  placeholder="Enter new password"
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword((value) => !value)}
                  aria-label={
                    showNewPassword ? "Hide password" : "Show password"
                  }
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted transition-colors hover:text-heading"
                >
                  {showNewPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* Confirm password */}
            <div>
              <label className="mb-2 block text-[13px] font-medium text-heading">
                Confirm password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 h-4.5 w-4.5 -translate-y-1/2 text-muted" />
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className={`w-full rounded-md border bg-bg-subtle py-3 pl-10 pr-12 text-[14px] text-heading placeholder:text-muted transition-colors focus:bg-surface focus:outline-none ${
                    error
                      ? "border-danger"
                      : "border-border focus:border-brand"
                  }`}
                  placeholder="Confirm new password"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword((value) => !value)}
                  aria-label={
                    showConfirmPassword ? "Hide password" : "Show password"
                  }
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted transition-colors hover:text-heading"
                >
                  {showConfirmPassword ? (
                    <EyeOff size={18} />
                  ) : (
                    <Eye size={18} />
                  )}
                </button>
              </div>
            </div>

            {error && (
              <div className="rounded-md border border-danger/20 bg-danger-soft p-3">
                <p className="flex items-center justify-center gap-1.5 text-center text-[12.5px] text-danger">
                  <XCircle size={13} /> {error}
                </p>
              </div>
            )}

            {updated && (
              <div className="rounded-md border border-success/20 bg-success-soft p-3">
                <p className="flex items-center justify-center gap-2 text-center text-[12.5px] text-success">
                  <CheckCircle2 size={14} />
                  Password updated. Redirecting to login...
                </p>
              </div>
            )}

            <motion.button
              type="submit"
              disabled={loading || updated}
              whileHover={{ scale: loading || updated ? 1 : 1.02 }}
              whileTap={{ scale: loading || updated ? 1 : 0.98 }}
              className="flex w-full items-center justify-center gap-2 rounded-md bg-brand py-3 text-[14px] font-medium text-on-brand transition-colors hover:bg-brand-hover disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? (
                <div className="h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
              ) : (
                <>
                  Update password <ArrowRight className="h-4 w-4" />
                </>
              )}
            </motion.button>
          </form>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border" />
            </div>
            <div className="relative flex justify-center text-[12px]">
              <span
                style={FONT_MONO}
                className="bg-surface px-2 tracking-wider text-muted"
              >
                OR
              </span>
            </div>
          </div>

          {/* Back to login */}
          <Link
            to="/login"
            className="flex items-center justify-center gap-2 text-[13.5px] font-medium text-muted transition-colors hover:text-brand-text"
          >
            <ArrowLeft size={16} />
            Back to login
          </Link>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default ResetPassword;
