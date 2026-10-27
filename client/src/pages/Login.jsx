// src/pages/Login.jsx
import { useState } from "react";
import { motion } from "framer-motion";
import { Mail, Lock, Eye, EyeOff, ArrowRight, XCircle } from "lucide-react";
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
    <div className="landing-page relative min-h-screen overflow-hidden bg-white flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <ThemeToggle className="fixed right-4 top-4 z-50" />
      {/* Background grid — same as homepage hero */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.05]"
        style={{
          backgroundImage:
            "linear-gradient(#7C3AED 1px, transparent 1px), linear-gradient(90deg, #7C3AED 1px, transparent 1px)",
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
          background: "radial-gradient(closest-side, #A855F7, transparent)",
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
            className="text-[32px] font-semibold leading-tight tracking-tight text-[#1B1030] sm:text-[36px]"
          >
            Welcome back
          </h1>
          <p className="mt-2 text-[14px] text-[#6E6280]">
            Sign in to continue to your dashboard.
          </p>
        </div>

        {/* Form card */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="rounded-xl border border-[#E4D9F5] bg-white p-7 shadow-[0_24px_60px_-24px_rgba(76,29,149,0.15)] sm:p-8"
        >
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email */}
            <div>
              <label className="mb-2 block text-[13px] font-medium text-[#1B1030]">
                Email address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 h-4.5 w-4.5 -translate-y-1/2 text-[#9B948A]" />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full rounded-md border border-[#E4D9F5] bg-[#F7F3FD] py-3 pl-10 pr-4 text-[14px] text-[#1B1030] placeholder:text-[#9B948A] transition-colors focus:border-[#7C3AED] focus:bg-white focus:outline-none"
                  placeholder="you@example.com"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="mb-2 block text-[13px] font-medium text-[#1B1030]">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 h-4.5 w-4.5 -translate-y-1/2 text-[#9B948A]" />
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full rounded-md border border-[#E4D9F5] bg-[#F7F3FD] py-3 pl-10 pr-12 text-[14px] text-[#1B1030] placeholder:text-[#9B948A] transition-colors focus:border-[#7C3AED] focus:bg-white focus:outline-none"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9B948A] transition-colors hover:text-[#1B1030]"
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
                  className="h-4 w-4 cursor-pointer rounded border-2 border-[#E4D9F5] text-[#7C3AED] focus:ring-[#7C3AED] focus:ring-offset-0"
                />
                <span className="text-[13px] text-[#6E6280]">Remember me</span>
              </label>
              <Link
                to="/forgot-password"
                className="text-[13px] font-medium text-[#7C3AED] transition-colors hover:text-[#6D28D9]"
              >
                Forgot password?
              </Link>
            </div>

            {error && (
              <div className="rounded-md border border-[#DC2626]/20 bg-[#DC2626]/5 p-3">
                <p className="flex items-center justify-center gap-1.5 text-center text-[12.5px] text-[#DC2626]">
                  <XCircle size={13} /> {error}
                </p>
              </div>
            )}

            {/* Submit */}
            <motion.button
              type="submit"
              disabled={loading}
              whileHover={{ scale: loading ? 1 : 1.02 }}
              whileTap={{ scale: loading ? 1 : 0.98 }}
              className="flex w-full items-center justify-center gap-2 rounded-md bg-[#7C3AED] py-3 text-[14px] font-medium text-white transition-colors hover:bg-[#6D28D9] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? (
                <div className="h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
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
              <div className="w-full border-t border-[#E4D9F5]" />
            </div>
            <div className="relative flex justify-center text-[12px]">
              <span
                style={FONT_MONO}
                className="bg-white px-2 tracking-wider text-[#6E6280]"
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
          <p className="mt-6 text-center text-[13.5px] text-[#6E6280]">
            Don't have an account?{" "}
            <Link
              to="/signup"
              className="font-medium text-[#7C3AED] transition-colors hover:text-[#6D28D9]"
            >
              Create one
            </Link>
          </p>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default Login;
