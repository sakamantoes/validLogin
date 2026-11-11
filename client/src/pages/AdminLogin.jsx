// src/pages/AdminLogin.jsx
import { useState } from "react";
import { motion } from "framer-motion";
import {
  ArrowRight,
  Eye,
  EyeOff,
  Lock,
  ShieldCheck,
  Shield,
  XCircle,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import ThemeToggle from "../components/ThemeToggle";
import { adminLogin } from "../service/admin.js";
import imageObject from "../utils/image.js";

const FONT_DISPLAY = {
  fontFamily: "'Space Grotesk', ui-sans-serif, system-ui",
};
const FONT_MONO = { fontFamily: "'JetBrains Mono', ui-monospace, monospace" };

/* Deep Ocean palette — shared with Login.jsx */
const OCEAN = {
  bg: "#0A0E1A",
  surface: "#111827",
  surface2: "#1A2235",
  border: "#1E293B",
  text: "#F1F5F9",
  textSoft: "#94A3B8",
  textDim: "#64748B",
  accent: "#06B6D4",
  accentHover: "#0891B2",
  accentGlow: "rgba(6,182,212,0.15)",
  success: "#10B981",
  error: "#EF4444",
};

const AdminLogin = () => {
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const getErrorMessage = (err) =>
    err?.response?.data?.message ||
    err?.response?.data?.error ||
    err?.message ||
    "Something went wrong";

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!password.trim()) {
      setError("Please enter your password");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await adminLogin({ password: password.trim() });

      if (response.status === 200 || response.status === 201) {
        toast.success("Admin login successful");
        navigate("/a/dashboard", { replace: true });
      } else {
        const message = response.message || "Invalid Credentials";
        toast.error(message);
        setError(message);
      }
    } catch (err) {
      console.error("admin login error:", err);
      const message = getErrorMessage(err);
      toast.error(message);
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{ fontFamily: "'Inter', ui-sans-serif, system-ui" }}
      className="landing-page relative flex min-h-screen items-center justify-center overflow-hidden bg-[#0A0E1A] px-4 py-12 sm:px-6 lg:px-8"
    >
      <ThemeToggle className="fixed right-4 top-4 z-50" />

      {/* Animated gradient orbs */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.4 }}
        transition={{ duration: 2 }}
        className="pointer-events-none absolute -top-32 -left-32 h-[600px] w-[600px] rounded-full blur-[140px]"
        style={{ background: "radial-gradient(closest-side, #06B6D4, transparent)" }}
      />
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.25 }}
        transition={{ duration: 2, delay: 0.3 }}
        className="pointer-events-none absolute -bottom-40 -right-32 h-[500px] w-[500px] rounded-full blur-[120px]"
        style={{ background: "radial-gradient(closest-side, #8B5CF6, transparent)" }}
      />

      {/* Subtle grid */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage: `linear-gradient(${OCEAN.accent} 1px, transparent 1px), linear-gradient(90deg, ${OCEAN.accent} 1px, transparent 1px)`,
          backgroundSize: "60px 60px",
        }}
      />

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="relative z-10 w-full max-w-[420px]"
      >
        {/* Logo + Heading */}
        <div className="mb-8 text-center">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="mx-auto mb-4 inline-flex items-center justify-center"
          >
            <div className="relative">
              <div className="absolute inset-0 rounded-xl bg-[#06B6D4] opacity-20 blur-xl" />
              <img
                src={imageObject.Logo}
                alt="Logo"
                className="relative h-[70px] w-[140px] rounded-sm object-contain"
              />
            </div>
          </motion.div>

          <div className="mb-2 flex items-center justify-center gap-2 text-[#06B6D4]">
            <ShieldCheck size={16} />
            <span
              style={FONT_MONO}
              className="text-[11px] font-medium uppercase tracking-[0.18em]"
            >
              Admin Portal
            </span>
          </div>

          <h1
            style={FONT_DISPLAY}
            className="text-[30px] font-semibold leading-tight tracking-tight text-[#F1F5F9] sm:text-[34px]"
          >
            Welcome back
          </h1>
          <p className="mt-2 text-[14px] text-[#94A3B8]">
            Sign in to your admin account
          </p>
        </div>

        {/* Card */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="relative overflow-hidden rounded-2xl border border-[#1E293B] bg-[#111827]/80 p-7 shadow-[0_32px_64px_-24px_rgba(0,0,0,0.6)] backdrop-blur-xl sm:p-8"
        >
          {/* Top accent line */}
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#06B6D4] to-transparent opacity-60" />

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="mb-2 block text-[13px] font-medium text-[#F1F5F9]">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#64748B]" />
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={password}
                  onChange={(event) => {
                    setPassword(event.target.value);
                    if (error) setError("");
                  }}
                  className="w-full rounded-xl border border-[#1E293B] bg-[#1A2235] py-3 pl-10 pr-12 text-[14px] text-[#F1F5F9] placeholder:text-[#64748B] transition-all duration-200 focus:border-[#06B6D4] focus:bg-[#1A2235] focus:outline-none focus:ring-2 focus:ring-[#06B6D4]/20"
                  placeholder="Enter your Admin Access Password"
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((visible) => !visible)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#64748B] transition-colors hover:text-[#94A3B8]"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {error && (
              <motion.div
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-xl border border-[#EF4444]/20 bg-[#EF4444]/5 p-3"
              >
                <p className="flex items-center justify-center gap-1.5 text-center text-[12.5px] text-[#FCA5A5]">
                  <XCircle size={13} /> {error}
                </p>
              </motion.div>
            )}

            <motion.button
              type="submit"
              disabled={loading}
              whileHover={{ scale: loading ? 1 : 1.02 }}
              whileTap={{ scale: loading ? 1 : 0.98 }}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#06B6D4] py-3 text-[14px] font-semibold text-[#0A0E1A] transition-all duration-200 hover:bg-[#0891B2] disabled:cursor-not-allowed disabled:opacity-60"
              style={{ boxShadow: "0 8px 24px -8px rgba(6,182,212,0.5)" }}
            >
              {loading ? (
                <div className="h-5 w-5 animate-spin rounded-full border-2 border-[#0A0E1A]/30 border-t-[#0A0E1A]" />
              ) : (
                <>
                  Sign in <ArrowRight className="h-4 w-4" />
                </>
              )}
            </motion.button>
          </form>

          <p className="mt-6 text-center text-[13.5px] text-[#94A3B8]">
            Need a user account?{" "}
            <Link
              to="/login"
              className="font-medium text-[#06B6D4] transition-colors hover:text-[#0891B2]"
            >
              User login
            </Link>
          </p>
        </motion.div>

        {/* Trust badge */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="mt-6 flex items-center justify-center gap-2 text-[12px] text-[#64748B]"
        >
          <Shield className="h-3.5 w-3.5" />
          <span>Restricted area · Authorized personnel only</span>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default AdminLogin;
