// src/pages/Register.jsx
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  User,
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  CheckCircle,
  XCircle,
  X,
  Shield,
  Sparkles,
  Zap,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import ThemeToggle from "../components/ThemeToggle";
import SiteLogo from "../components/SiteLogo";
import { signup } from "../service/auth";
import GoogleButton from "../components/GoogleButton";
import { toast } from "react-toastify";
import imageObject from "../utils/image";

const FONT_DISPLAY = {
  fontFamily: "'Space Grotesk', ui-sans-serif, system-ui",
};
const FONT_MONO = { fontFamily: "'JetBrains Mono', ui-monospace, monospace" };

/* Deep Ocean palette */
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
  success: "#10B981",
  error: "#EF4444",
  warning: "#F59E0B",
  purple: "#8B5CF6",
};

const Register = () => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showTermsModal, setShowTermsModal] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState({});
  const [passwordStrength, setPasswordStrength] = useState({
    score: 0,
    message: "",
    hasUpper: false,
    hasLower: false,
    hasNumber: false,
    hasSpecial: false,
    minLength: false,
  });

  const getErrorMessage = (err) =>
    err?.response?.data?.message ||
    err?.response?.data?.error ||
    err?.message ||
    "Something went wrong";

  const checkPasswordStrength = (password) => {
    const strength = {
      score: 0,
      message: "",
      hasUpper: /[A-Z]/.test(password),
      hasLower: /[a-z]/.test(password),
      hasNumber: /[0-9]/.test(password),
      hasSpecial: /[!@#$%^&*(),.?":{}|<>]/.test(password),
      minLength: password.length >= 8,
    };

    let score = 0;
    if (strength.minLength) score++;
    if (strength.hasUpper && strength.hasLower) score++;
    if (strength.hasNumber) score++;
    if (strength.hasSpecial) score++;

    let message = "";
    if (score === 0) message = "Very Weak";
    else if (score === 1) message = "Weak";
    else if (score === 2) message = "Fair";
    else if (score === 3) message = "Good";
    else if (score === 4) message = "Strong";

    setPasswordStrength({ ...strength, message, score });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });

    if (name === "password") {
      checkPasswordStrength(value);
    }

    if (errors[name]) {
      setErrors({ ...errors, [name]: "" });
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.username.trim()) {
      newErrors.username = "Username is required";
    } else if (formData.username.length < 3) {
      newErrors.username = "Username must be at least 3 characters";
    }

    if (!formData.email) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Email is invalid";
    }

    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 8) {
      newErrors.password = "Password must be at least 8 characters";
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    if (!agreedToTerms) {
      newErrors.terms =
        "You must agree to the Terms & Conditions to create an account";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);

    try {
      localStorage.removeItem("smswinner_token");
      const response = await signup(formData);

      if (response.status === 200 || response.status === 201) {
        if (response.data?.token) {
          localStorage.setItem("smswinner_token", response.data.token);
        }

        navigate("/f/dashboard", { replace: true });
      } else {
        setErrors({ submit: response.message || "Registration failed" });
      }
    } catch (error) {
      console.error("registration error: ", error);
      const message = getErrorMessage(error);
      toast.error(message);
      setErrors({ submit: message });
    } finally {
      setLoading(false);
    }
  };

  const strengthBarColor = (score) => {
    if (score <= 1) return OCEAN.error;
    if (score === 2) return OCEAN.warning;
    if (score === 3) return OCEAN.purple;
    return OCEAN.success;
  };

  return (
    <div style={{ fontFamily: "'Inter', ui-sans-serif, system-ui" }} className="relative min-h-screen bg-[#0A0E1A] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 overflow-hidden">
   

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
            className="mx-auto mb-4 inline-flex items-center justify-center rounded-sm"
          >
            <div className="relative">
              <div className="absolute inset-0 rounded-sm bg-[#06B6D4] opacity-20 blur-xl" />
              <img src={imageObject.Logo} className="relative h-[100px] w-[140px] rounded-sm object-contain mb-[-10px]" alt="Logo" />
            </div>
          </motion.div>
          <h1
            style={FONT_DISPLAY}
            className="text-[30px] font-semibold leading-tight tracking-tight text-[#F1F5F9] sm:text-[34px]"
          >
            Create your account
          </h1>
          <p className="mt-2 text-[14px] text-[#94A3B8]">
            Join Valid Login and get verified in seconds.
          </p>
        </div>

        {/* Card */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="relative overflow-hidden rounded-2xl border border-[#1E293B] bg-[#111827]/80 backdrop-blur-xl p-7 shadow-[0_32px_64px_-24px_rgba(0,0,0,0.6)] sm:p-8"
        >
          {/* Top accent line */}
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#06B6D4] to-transparent opacity-60" />

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Username */}
            <div>
              <label className="mb-2 block text-[13px] font-medium text-[#F1F5F9]">
                Username
              </label>
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#64748B]" />
                <input
                  type="text"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  className={`w-full rounded-xl border bg-[#1A2235] py-3 pl-10 pr-4 text-[14px] text-[#F1F5F9] placeholder:text-[#64748B] transition-all duration-200 focus:outline-none focus:ring-2 ${
                    errors.username
                      ? "border-[#EF4444] focus:border-[#EF4444] focus:ring-[#EF4444]/20"
                      : "border-[#1E293B] focus:border-[#06B6D4] focus:ring-[#06B6D4]/20"
                  }`}
                  placeholder="johndoe123"
                />
              </div>
              {errors.username && (
                <p className="mt-1.5 flex items-center gap-1 text-[12px] text-[#FCA5A5]">
                  <XCircle size={12} /> {errors.username}
                </p>
              )}
            </div>

            {/* Email */}
            <div>
              <label className="mb-2 block text-[13px] font-medium text-[#F1F5F9]">
                Email address
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#64748B]" />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className={`w-full rounded-xl border bg-[#1A2235] py-3 pl-10 pr-4 text-[14px] text-[#F1F5F9] placeholder:text-[#64748B] transition-all duration-200 focus:outline-none focus:ring-2 ${
                    errors.email
                      ? "border-[#EF4444] focus:border-[#EF4444] focus:ring-[#EF4444]/20"
                      : "border-[#1E293B] focus:border-[#06B6D4] focus:ring-[#06B6D4]/20"
                  }`}
                  placeholder="you@example.com"
                />
              </div>
              {errors.email && (
                <p className="mt-1.5 flex items-center gap-1 text-[12px] text-[#FCA5A5]">
                  <XCircle size={12} /> {errors.email}
                </p>
              )}
            </div>

            {/* Password */}
            <div>
              <label className="mb-2 block text-[13px] font-medium text-[#F1F5F9]">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#64748B]" />
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className={`w-full rounded-xl border bg-[#1A2235] py-3 pl-10 pr-12 text-[14px] text-[#F1F5F9] placeholder:text-[#64748B] transition-all duration-200 focus:outline-none focus:ring-2 ${
                    errors.password
                      ? "border-[#EF4444] focus:border-[#EF4444] focus:ring-[#EF4444]/20"
                      : "border-[#1E293B] focus:border-[#06B6D4] focus:ring-[#06B6D4]/20"
                  }`}
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#64748B] transition-colors hover:text-[#94A3B8]"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>

              {/* Strength indicator */}
              {formData.password && (
                <div className="mt-3 space-y-3">
                  <div className="flex items-center gap-2">
                    <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-[#1E293B]">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{
                          width: `${(passwordStrength.score / 4) * 100}%`,
                          backgroundColor: strengthBarColor(
                            passwordStrength.score,
                          ),
                        }}
                        transition={{ duration: 0.3 }}
                        className="h-full rounded-full"
                      />
                    </div>
                    <span style={FONT_MONO} className="text-[11px] tracking-wider">
                      <span style={{ color: strengthBarColor(passwordStrength.score) }}>
                        {passwordStrength.message}
                      </span>
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-[12px]">
                    <Requirement ok={passwordStrength.minLength} label="8+ characters" />
                    <Requirement
                      ok={passwordStrength.hasUpper && passwordStrength.hasLower}
                      label="Upper & lowercase"
                    />
                    <Requirement ok={passwordStrength.hasNumber} label="Contains number" />
                    <Requirement ok={passwordStrength.hasSpecial} label="Special character" />
                  </div>
                </div>
              )}
              {errors.password && (
                <p className="mt-1.5 text-[12px] text-[#FCA5A5]">
                  {errors.password}
                </p>
              )}
            </div>

            {/* Confirm Password */}
            <div>
              <label className="mb-2 block text-[13px] font-medium text-[#F1F5F9]">
                Confirm password
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#64748B]" />
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className={`w-full rounded-xl border bg-[#1A2235] py-3 pl-10 pr-12 text-[14px] text-[#F1F5F9] placeholder:text-[#64748B] transition-all duration-200 focus:outline-none focus:ring-2 ${
                    errors.confirmPassword
                      ? "border-[#EF4444] focus:border-[#EF4444] focus:ring-[#EF4444]/20"
                      : "border-[#1E293B] focus:border-[#06B6D4] focus:ring-[#06B6D4]/20"
                  }`}
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#64748B] transition-colors hover:text-[#94A3B8]"
                >
                  {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {errors.confirmPassword && (
                <p className="mt-1.5 text-[12px] text-[#FCA5A5]">
                  {errors.confirmPassword}
                </p>
              )}
            </div>

            {/* Terms checkbox */}
            <div
              className={`rounded-xl border p-3 transition-colors ${
                errors.terms
                  ? "border-[#EF4444]/40 bg-[#EF4444]/5"
                  : "border-[#1E293B] bg-[#1A2235]/50"
              }`}
            >
              <div className="flex items-start gap-3">
                <input
                  type="checkbox"
                  id="terms"
                  checked={agreedToTerms}
                  onChange={(e) => {
                    setAgreedToTerms(e.target.checked);
                    if (errors.terms) {
                      setErrors({ ...errors, terms: "" });
                    }
                  }}
                  className="mt-0.5 h-4 w-4 shrink-0 cursor-pointer rounded border-2 border-[#1E293B] bg-[#1A2235] text-[#06B6D4] focus:ring-[#06B6D4] focus:ring-offset-0 focus:ring-offset-[#111827]"
                />
                <label
                  htmlFor="terms"
                  className="cursor-pointer text-[13px] leading-relaxed text-[#94A3B8]"
                >
                  I agree to the{" "}
                  <button
                    type="button"
                    onClick={() => setShowTermsModal(true)}
                    className="font-medium text-[#06B6D4] hover:underline"
                  >
                    Terms & Conditions
                  </button>{" "}
                  and{" "}
                  <Link
                    to="/Privacy"
                    className="font-medium text-[#06B6D4] hover:underline"
                  >
                    Privacy Policy
                  </Link>
                  .
                </label>
              </div>
              {errors.terms && (
                <motion.p
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-2 flex items-center gap-1 text-[12px] text-[#FCA5A5]"
                >
                  <XCircle size={12} /> {errors.terms}
                </motion.p>
              )}
            </div>

            {errors.submit && (
              <div className="rounded-xl border border-[#EF4444]/20 bg-[#EF4444]/5 p-3">
                <p className="text-center text-[12.5px] text-[#FCA5A5]">
                  {errors.submit}
                </p>
              </div>
            )}

            {/* Submit */}
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
                  Create account <ArrowRight className="h-4 w-4" />
                </>
              )}
            </motion.button>
          </form>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-[#1E293B]" />
            </div>
            <div className="relative flex justify-center text-[11px]">
              <span
                style={FONT_MONO}
                className="bg-[#111827] px-3 tracking-widest text-[#64748B]"
              >
                OR
              </span>
            </div>
          </div>

          {/* Google */}
          <div className="flex justify-center">
            <GoogleButton />
          </div>

          {/* Login link */}
          <p className="mt-6 text-center text-[13.5px] text-[#94A3B8]">
            Already have an account?{" "}
            <Link
              to="/login"
              className="font-medium text-[#06B6D4] transition-colors hover:text-[#0891B2]"
            >
              Sign in
            </Link>
          </p>
        </motion.div>

        {/* Trust badges */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="mt-6 flex flex-wrap items-center justify-center gap-4 text-[12px] text-[#64748B]"
        >
          <span className="flex items-center gap-1.5">
            <Shield className="h-3.5 w-3.5" /> Secure signup
          </span>
          <span className="flex items-center gap-1.5">
            <Zap className="h-3.5 w-3.5" /> Instant access
          </span>
          <span className="flex items-center gap-1.5">
            <Sparkles className="h-3.5 w-3.5" /> Free to start
          </span>
        </motion.div>
      </motion.div>

      {/* Terms modal */}
      <AnimatePresence>
        {showTermsModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
            onClick={() => setShowTermsModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, y: 20, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.95, y: 20, opacity: 0 }}
              transition={{ type: "spring", damping: 25, stiffness: 220 }}
              className="w-full max-w-3xl overflow-hidden rounded-2xl border border-[#1E293B] bg-[#111827]"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal header */}
              <div className="flex items-center justify-between border-b border-[#1E293B] p-5 sm:p-6">
                <div className="flex items-center gap-3">
                  <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#06B6D4]/10">
                    <Shield className="h-4 w-4 text-[#06B6D4]" />
                  </span>
                  <h2
                    style={FONT_DISPLAY}
                    className="text-[18px] font-semibold text-[#F1F5F9]"
                  >
                    Terms & Conditions
                  </h2>
                </div>
                <button
                  onClick={() => setShowTermsModal(false)}
                  aria-label="Close"
                  className="rounded-lg p-2 text-[#64748B] transition-colors hover:bg-[#1A2235] hover:text-[#94A3B8]"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Modal body */}
              <div className="max-h-[60vh] space-y-6 overflow-y-auto p-6 text-[13.5px] leading-relaxed">
                <section>
                  <h3
                    style={FONT_DISPLAY}
                    className="mb-2 text-[15px] font-semibold text-[#F1F5F9]"
                  >
                    Payment for services and purchase procedure
                  </h3>
                  <ol className="list-decimal list-inside space-y-1.5 pl-1 text-[#94A3B8]">
                    <li>Before using the Wave Verify platform, you must top up your balance;</li>
                    <li>All available top-up methods can be found by clicking the "Top up" button;</li>
                    <li>The commission and minimum top-up amount depend on the selected payment method;</li>
                    <li>Please note: funds may take up to 3 hours to be credited to your balance;</li>
                    <li>Funds are deducted from the balance upon completion of the purchase;</li>
                    <li>A purchase is considered completed if an OTP code has been received and displayed to the user;</li>
                    <li>If an OTP code does not arrive for any reason, the funds are returned to the balance;</li>
                    <li>If a code does not arrive after multiple numbers purchase, Wave Verify may apply sanctions to the account;</li>
                    <li>To withdraw funds from your balance, send a request to smswinner19@gmail.com from the email address that was used to register your account. Requests are reviewed within 3 business days. The standard withdrawal period is 7 days. In some cases, the review period for a withdrawal request may take up to 4 weeks.</li>
                    <li>Refunds are made to the same wallet which the deposit was made with.</li>
                    <li>A 5% fee is charged for withdrawals. If one year or more has passed since the last top-up, the fee is 15%; after 2 years – 25%; after 3 years – 35%.</li>
                  </ol>
                </section>

                <section>
                  <h3
                    style={FONT_DISPLAY}
                    className="mb-2 text-[15px] font-semibold text-[#F1F5F9]"
                  >
                    Cancellation and refunds
                  </h3>
                  <p className="text-[#94A3B8]">Cancelling a 20-minute number purchase:</p>
                  <ul className="mt-2 list-disc list-inside space-y-1.5 pl-1 text-[#94A3B8]">
                    <li>Number cancellation becomes available after purchase. The corresponding button in the activation card will become active;</li>
                    <li>Cancellation with a refund to your balance is available if no code has been received on the number;</li>
                    <li>Once a code has been received, the activation is considered successful and the money cannot be refunded;</li>
                    <li>If no code arrives within 20 minutes for any reason, the money is automatically returned to your balance or report to customer care.</li>
                  </ul>
                </section>

                <section>
                  <h3
                    style={FONT_DISPLAY}
                    className="mb-2 text-[15px] font-semibold text-[#F1F5F9]"
                  >
                    User agreement
                  </h3>
                  <ul className="list-disc list-inside space-y-1.5 pl-1 text-[#94A3B8]">
                    <li>Users can purchase virtual numbers directly from suppliers through the P2P deal system.</li>
                    <li>By registering on the site, you agree to receive promotional messages from Wave Verify. You can unsubscribe at any time.</li>
                    <li>Using Wave Verify for any unlawful purpose is strictly forbidden.</li>
                    <li>We are not responsible for created accounts. All actions and potential blocks are the buyer's own risk.</li>
                  </ul>
                </section>
              </div>

              {/* Modal footer */}
              <div className="flex justify-end gap-3 border-t border-[#1E293B] p-5 sm:p-6">
                <button
                  onClick={() => setShowTermsModal(false)}
                  className="rounded-xl border border-[#1E293B] bg-[#1A2235] px-4 py-2 text-[13.5px] font-medium text-[#F1F5F9] transition-colors hover:border-[#06B6D4] hover:text-[#06B6D4]"
                >
                  Close
                </button>
                <button
                  onClick={() => {
                    setAgreedToTerms(true);
                    if (errors.terms) {
                      setErrors({ ...errors, terms: "" });
                    }
                    setShowTermsModal(false);
                  }}
                  className="rounded-xl bg-[#06B6D4] px-4 py-2 text-[13.5px] font-medium text-[#0A0E1A] transition-colors hover:bg-[#0891B2]"
                >
                  I agree
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

/* Small helper for the password requirements rows */
function Requirement({ ok, label }) {
  return (
    <div className="flex items-center gap-1.5">
      {ok ? (
        <CheckCircle size={13} className="text-[#10B981]" />
      ) : (
        <XCircle size={13} className="text-[#64748B]" />
      )}
      <span className={ok ? "text-[#10B981]" : "text-[#64748B]"}>{label}</span>
    </div>
  );
}

export default Register;