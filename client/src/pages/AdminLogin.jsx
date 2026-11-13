import { useState } from "react";
import { motion } from "framer-motion";
import {
  ArrowRight,
  Eye,
  EyeOff,
  Lock,
  ShieldCheck,
  XCircle,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import ThemeToggle from "../components/ThemeToggle";
import SiteLogo from "../components/SiteLogo";
import { adminLogin } from "../service/admin.js";
import imageObject from "../utils/image.js";

const FONT_DISPLAY = {
  fontFamily: "'Space Grotesk', ui-sans-serif, system-ui",
};
const FONT_MONO = { fontFamily: "'JetBrains Mono', ui-monospace, monospace" };

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
    <div className="landing-page relative flex min-h-screen items-center justify-center overflow-hidden bg-bg px-4 py-12 text-body sm:px-6 lg:px-8">
      <ThemeToggle className="fixed right-4 top-4 z-50" />

      <div
        className="pointer-events-none absolute inset-0 opacity-[0.05]"
        style={{
          backgroundImage:
            "linear-gradient(var(--brand) 1px, transparent 1px), linear-gradient(90deg, var(--brand) 1px, transparent 1px)",
          backgroundSize: "44px 44px",
        }}
      />
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 0.2, scale: 1 }}
        transition={{ duration: 1.5 }}
        className="pointer-events-none absolute -top-40 left-1/2 h-130 w-225 -translate-x-1/2 rounded-full blur-[110px]"
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
        <div className="mb-8 text-center">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="mx-auto mb-3 flex items-center justify-center"
          >
            <img src={imageObject.Logo} className='h-[50px] w-[150px] rounded-sm' />
          </motion.div>
          <div className="mb-2 flex items-center justify-center gap-2 text-brand-text">
            <ShieldCheck size={18} />
            <span className="text-sm font-medium uppercase tracking-wide">
              Admin Portal
            </span>
          </div>
          <h1
            style={FONT_DISPLAY}
            className="text-[32px] font-semibold leading-tight tracking-tight text-heading sm:text-[36px]"
          >
            Welcome Back
          </h1>
          <p className="mt-2 text-[14px] text-muted">
            Sign in to your admin account
          </p>
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="rounded-xl border border-border bg-surface p-7 shadow-card sm:p-8"
        >
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="mb-2 block text-[13px] font-medium text-heading">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 h-4.5 w-4.5 -translate-y-1/2 text-muted" />
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={password}
                  onChange={(event) => {
                    setPassword(event.target.value);
                    if (error) setError("");
                  }}
                  className="w-full rounded-md border border-border bg-bg-subtle py-3 pl-10 pr-12 text-[14px] text-heading placeholder:text-muted transition-colors focus:border-brand focus:bg-surface focus:outline-none"
                  placeholder="Enter your Admin Access Password"
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((visible) => !visible)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted transition-colors hover:text-heading"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
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

            <motion.button
              type="submit"
              disabled={loading}
              whileHover={{ scale: loading ? 1 : 1.02 }}
              whileTap={{ scale: loading ? 1 : 0.98 }}
              className="flex w-full items-center justify-center gap-2 rounded-md bg-brand py-3 text-[14px] font-medium text-on-brand transition-colors hover:bg-brand-hover disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? (
                <div className="h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
              ) : (
                <>
                  Sign In <ArrowRight size={18} />
                </>
              )}
            </motion.button>
          </form>

          <p className="text-center text-[13.5px] text-muted">
            Need a user account?{" "}
            <Link
              to="/login"
              className="font-medium text-brand-text transition-colors hover:text-brand-hover"
            >
              User login
            </Link>
          </p>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default AdminLogin;
