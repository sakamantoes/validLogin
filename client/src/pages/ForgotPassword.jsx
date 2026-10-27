// src/pages/ForgotPassword.jsx
import { useState } from "react";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  ArrowRight,
  Mail,
  XCircle,
  CheckCircle,
} from "lucide-react";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import ThemeToggle from "../components/ThemeToggle";
import SiteLogo from "../components/SiteLogo";
import { forgotPassword } from "../service/auth.js";
import imageObject from "../utils/image.js";

const FONT_DISPLAY = {
  fontFamily: "'Space Grotesk', ui-sans-serif, system-ui",
};
const FONT_MONO = { fontFamily: "'JetBrains Mono', ui-monospace, monospace" };

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

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

  const handleSubmit = async (e) => {
    e.preventDefault();

    const trimmedEmail = email.trim();

    if (!trimmedEmail) {
      setError("Email address is required");
      return;
    }

    if (!/\S+@\S+\.\S+/.test(trimmedEmail)) {
      setError("Enter a valid email address");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await forgotPassword({ email: trimmedEmail });

      setSubmitted(true);
      toast.success(response?.message || "Password reset request received");
    } catch (error) {
      const message = getErrorMessage(error);
      setError(message);
      toast.error(message);
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
        className="pointer-events-none absolute -top-40 left-1/2 h-130 w-225 -translate-x-1/2 rounded-full blur-[110px]"
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
            Forgot password?
          </h1>
          <p className="mt-2 text-[14px] text-[#6E6280]">
            Enter the email you used to register and we'll send a reset link.
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
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (error) setError("");
                    if (submitted) setSubmitted(false);
                  }}
                  className={`w-full rounded-md border bg-[#F7F3FD] py-3 pl-10 pr-4 text-[14px] text-[#1B1030] placeholder:text-[#9B948A] transition-colors focus:bg-white focus:outline-none ${
                    error
                      ? "border-[#DC2626]"
                      : "border-[#E4D9F5] focus:border-[#7C3AED]"
                  }`}
                  placeholder="you@example.com"
                />
              </div>
              {error && (
                <p className="mt-1.5 flex items-center gap-1 text-[12px] text-[#DC2626]">
                  <XCircle size={12} /> {error}
                </p>
              )}
            </div>

            {submitted && (
              <div className="rounded-md border border-[#16A34A]/20 bg-[#16A34A]/5 p-3">
                <p className="flex items-center justify-center gap-1.5 text-center text-[12.5px] text-[#16A34A]">
                  <CheckCircle size={13} /> If this email is registered, reset
                  instructions are on their way.
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
                  Continue <ArrowRight className="h-4 w-4" />
                </>
              )}
            </motion.button>
          </form>

          {/* Info note */}
          <p className="mt-5 text-center text-[12.5px] leading-relaxed text-[#6E6280]">
            Use the email you registered with. If you don't see the message in
            your inbox, check your spam folder. The link expires after 15
            minutes.
          </p>

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

          {/* Back to login */}
          <Link
            to="/login"
            className="flex items-center justify-center gap-2 text-[13.5px] font-medium text-[#7C3AED] transition-colors hover:text-[#6D28D9]"
          >
            <ArrowLeft size={16} />
            Back to login
          </Link>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default ForgotPassword;
