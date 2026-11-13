// src/pages/Login.jsx
import { useState } from "react";
import { motion } from "framer-motion";
import { Mail, Lock, Eye, EyeOff, ArrowRight, XCircle, Shield, Sparkles } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import ThemeToggle from "../components/ThemeToggle";
import SiteLogo from "../components/SiteLogo";
import GoogleButton from "../components/GoogleButton.jsx";
import { login } from "../service/auth.js";
import { toast } from "react-toastify";
import imageObject from "../utils/image.js";

const FONT_DISPLAY = {
  fontFamily: "'Space Grotesk', ui-sans-serif, system-ui",
};
const FONT_MONO = { fontFamily: "'JetBrains Mono', ui-monospace, monospace" };

const Login = () => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    rememberMe: false,
  });
  const [error, setError] = useState("");

  const getErrorMessage = (err) =>
    err?.response?.data?.message ||
    err?.response?.data?.error ||
    err?.message ||
    "Something went wrong";

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });
    if (error) setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.email || !formData.password) {
      setError("Please fill in all fields");
      return;
    }

    setLoading(true);

    try {
      localStorage.removeItem("smswinner_token");
      const data = {
        email: formData.email.trim(),
        password: formData.password.trim(),
      };
      const response = await login(data);

      if (response.status === 200 || response.status === 201) {
        const user = response.data?.data || response.data;
        localStorage.setItem("smswinner_token", user.token);
        navigate("/f/dashboard", { replace: true });
      } else {
        toast.error(response.message || "Invalid Credentials");
        setError(response.message || "Invalid Credentials");
      }
    } catch (error) {
      console.error("login error: ", error);
      const message = getErrorMessage(error);
      toast.error(message);
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ fontFamily: "'Inter', ui-sans-serif, system-ui" }} className="relative min-h-screen bg-bg text-body flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 overflow-hidden">
      <ThemeToggle className="fixed right-4 top-4 z-50" />

      {/* Animated gradient orbs */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.4 }}
        transition={{ duration: 2 }}
        className="pointer-events-none absolute -top-32 -left-32 h-[600px] w-[600px] rounded-full blur-[140px]"
        style={{ background: "radial-gradient(closest-side, var(--brand), transparent)" }}
      />
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.25 }}
        transition={{ duration: 2, delay: 0.3 }}
        className="pointer-events-none absolute -bottom-40 -right-32 h-[500px] w-[500px] rounded-full blur-[120px]"
        style={{ background: "radial-gradient(closest-side, var(--brand-hover), transparent)" }}
      />

      {/* Subtle grid */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage: `linear-gradient(var(--brand) 1px, transparent 1px), linear-gradient(90deg, var(--brand) 1px, transparent 1px)`,
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
              <div className="absolute inset-0 rounded-xl bg-brand opacity-20 blur-xl" />
              <img src={imageObject.Logo} className="relative h-[100px] w-[140px] rounded-sm object-contain mb-[-10px] " alt="Logo" />
            </div>
          </motion.div>
          <h1
            style={FONT_DISPLAY}
            className="text-[30px] font-semibold leading-tight tracking-tight text-heading sm:text-[34px]"
          >
            Welcome back
          </h1>
          <p className="mt-2 text-[14px] text-muted">
            Sign in to continue to your dashboard.
          </p>
        </div>

        {/* Card */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="relative overflow-hidden rounded-2xl border border-border bg-surface-raised p-7 shadow-card sm:p-8"
        >
          {/* Top accent line */}
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-brand to-transparent opacity-60" />

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email */}
            <div>
              <label className="mb-2 block text-[13px] font-medium text-heading">
                Email address
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full rounded-xl border border-border bg-bg-subtle py-3 pl-10 pr-4 text-[14px] text-heading placeholder:text-muted transition-all duration-200 focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20"
                  placeholder="you@example.com"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="mb-2 block text-[13px] font-medium text-heading">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full rounded-xl border border-border bg-bg-subtle py-3 pl-10 pr-12 text-[14px] text-heading placeholder:text-muted transition-all duration-200 focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/20"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted transition-colors hover:text-heading"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* Remember + Forgot */}
            <div className="flex items-center justify-between">
              <label className="flex cursor-pointer items-center gap-2">
                <input
                  type="checkbox"
                  name="rememberMe"
                  checked={formData.rememberMe}
                  onChange={handleChange}
                  className="h-4 w-4 cursor-pointer rounded border-2 border-border bg-bg-subtle text-brand focus:ring-brand focus:ring-offset-0"
                />
                <span className="text-[13px] text-muted">Remember me</span>
              </label>
              <Link
                to="/forgot-password"
                className="text-[13px] font-medium text-brand-text transition-colors hover:text-brand-hover"
              >
                Forgot password?
              </Link>
            </div>

            {error && (
              <motion.div
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-xl border border-danger/20 bg-danger-soft p-3"
              >
                <p className="flex items-center justify-center gap-1.5 text-center text-[12.5px] text-danger">
                  <XCircle size={13} /> {error}
                </p>
              </motion.div>
            )}

            {/* Submit */}
            <motion.button
              type="submit"
              disabled={loading}
              whileHover={{ scale: loading ? 1 : 1.02 }}
              whileTap={{ scale: loading ? 1 : 0.98 }}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-brand py-3 text-[14px] font-semibold text-on-brand transition-all duration-200 hover:bg-brand-hover disabled:cursor-not-allowed disabled:opacity-60"
              style={{ boxShadow: "0 8px 24px -8px rgba(6,182,212,0.5)" }}
            >
              {loading ? (
                <div className="h-5 w-5 animate-spin rounded-full border-2 border-on-brand/30 border-t-on-brand" />
              ) : (
                <>
                  Sign in <ArrowRight className="h-4 w-4" />
                </>
              )}
            </motion.button>
          </form>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border" />
            </div>
            <div className="relative flex justify-center text-[11px]">
              <span
                style={FONT_MONO}
                className="bg-surface-raised px-3 tracking-widest text-muted"
              >
                OR
              </span>
            </div>
          </div>

          {/* Google */}
          <div className="flex justify-center">
            <GoogleButton />
          </div>

          {/* Register link */}
          <p className="mt-6 text-center text-[13.5px] text-muted">
            Don't have an account?{" "}
            <Link
              to="/signup"
              className="font-medium text-brand-text transition-colors hover:text-brand-hover"
            >
              Create one
            </Link>
          </p>
        </motion.div>

        {/* Trust badge */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="mt-6 flex items-center justify-center gap-2 text-[12px] text-muted"
        >
          <Shield className="h-3.5 w-3.5" />
          <span>Protected by enterprise-grade security</span>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default Login;