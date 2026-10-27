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

  /* ---------- strength color helpers (match homepage palette) ---------- */
  const strengthBarColor = (score) => {
    if (score <= 1) return "#DC2626"; // red-ish for weak
    if (score === 2) return "#D97706"; // amber for fair
    if (score === 3) return "#7C3AED"; // purple for good
    return "#16A34A"; // green for strong
  };

  return (
    <div className="landing-page relative min-h-screen bg-white flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 overflow-hidden">
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
            Create your account
          </h1>
          <p className="mt-2 text-[14px] text-[#6E6280]">
            Join DigiTools and get verified in seconds.
          </p>
        </div>

        {/* Form card — same border/radius language as homepage cards */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="rounded-xl border border-[#E4D9F5] bg-white p-7 shadow-[0_24px_60px_-24px_rgba(76,29,149,0.15)] sm:p-8"
        >
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Username */}
            <div>
              <label className="mb-2 block text-[13px] font-medium text-[#1B1030]">
                Username
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 h-4.5 w-4.5 -translate-y-1/2 text-[#9B948A]" />
                <input
                  type="text"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  className={`w-full rounded-md border bg-[#F7F3FD] py-3 pl-10 pr-4 text-[14px] text-[#1B1030] placeholder:text-[#9B948A] focus:bg-white focus:outline-none transition-colors ${
                    errors.username
                      ? "border-[#DC2626]"
                      : "border-[#E4D9F5] focus:border-[#7C3AED]"
                  }`}
                  placeholder="johndoe123"
                />
              </div>
              {errors.username && (
                <p className="mt-1.5 flex items-center gap-1 text-[12px] text-[#DC2626]">
                  <XCircle size={12} /> {errors.username}
                </p>
              )}
            </div>

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
                  className={`w-full rounded-md border bg-[#F7F3FD] py-3 pl-10 pr-4 text-[14px] text-[#1B1030] placeholder:text-[#9B948A] focus:bg-white focus:outline-none transition-colors ${
                    errors.email
                      ? "border-[#DC2626]"
                      : "border-[#E4D9F5] focus:border-[#7C3AED]"
                  }`}
                  placeholder="you@example.com"
                />
              </div>
              {errors.email && (
                <p className="mt-1.5 flex items-center gap-1 text-[12px] text-[#DC2626]">
                  <XCircle size={12} /> {errors.email}
                </p>
              )}
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
                  className={`w-full rounded-md border bg-[#F7F3FD] py-3 pl-10 pr-12 text-[14px] text-[#1B1030] placeholder:text-[#9B948A] focus:bg-white focus:outline-none transition-colors ${
                    errors.password
                      ? "border-[#DC2626]"
                      : "border-[#E4D9F5] focus:border-[#7C3AED]"
                  }`}
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9B948A] hover:text-[#1B1030] transition-colors"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>

              {/* Strength indicator */}
              {formData.password && (
                <div className="mt-3 space-y-3">
                  <div className="flex items-center gap-2">
                    <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-[#E4D9F5]">
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
                    <span
                      style={FONT_MONO}
                      className="text-[11px] tracking-wider"
                      // use the same color as the bar
                    >
                      <span
                        style={{
                          color: strengthBarColor(passwordStrength.score),
                        }}
                      >
                        {passwordStrength.message}
                      </span>
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-[12px]">
                    <Requirement
                      ok={passwordStrength.minLength}
                      label="8+ characters"
                    />
                    <Requirement
                      ok={
                        passwordStrength.hasUpper && passwordStrength.hasLower
                      }
                      label="Upper & lowercase"
                    />
                    <Requirement
                      ok={passwordStrength.hasNumber}
                      label="Contains number"
                    />
                    <Requirement
                      ok={passwordStrength.hasSpecial}
                      label="Special character"
                    />
                  </div>
                </div>
              )}
              {errors.password && (
                <p className="mt-1.5 text-[12px] text-[#DC2626]">
                  {errors.password}
                </p>
              )}
            </div>

            {/* Confirm Password */}
            <div>
              <label className="mb-2 block text-[13px] font-medium text-[#1B1030]">
                Confirm password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 h-4.5 w-4.5 -translate-y-1/2 text-[#9B948A]" />
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className={`w-full rounded-md border bg-[#F7F3FD] py-3 pl-10 pr-12 text-[14px] text-[#1B1030] placeholder:text-[#9B948A] focus:bg-white focus:outline-none transition-colors ${
                    errors.confirmPassword
                      ? "border-[#DC2626]"
                      : "border-[#E4D9F5] focus:border-[#7C3AED]"
                  }`}
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  aria-label={
                    showConfirmPassword ? "Hide password" : "Show password"
                  }
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9B948A] hover:text-[#1B1030] transition-colors"
                >
                  {showConfirmPassword ? (
                    <EyeOff size={18} />
                  ) : (
                    <Eye size={18} />
                  )}
                </button>
              </div>
              {errors.confirmPassword && (
                <p className="mt-1.5 text-[12px] text-[#DC2626]">
                  {errors.confirmPassword}
                </p>
              )}
            </div>

            {/* Terms checkbox */}
            <div
              className={`rounded-md border p-3 transition-colors ${
                errors.terms
                  ? "border-[#DC2626]/40 bg-[#DC2626]/5"
                  : "border-[#E4D9F5] bg-[#F7F3FD]"
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
                  className="mt-0.5 h-4.5 w-4.5 shrink-0 cursor-pointer rounded border-2 border-[#E4D9F5] text-[#7C3AED] focus:ring-[#7C3AED] focus:ring-offset-0"
                />
                <label
                  htmlFor="terms"
                  className="cursor-pointer text-[13px] leading-relaxed text-[#1B1030]"
                >
                  I agree to the{" "}
                  <button
                    type="button"
                    onClick={() => setShowTermsModal(true)}
                    className="font-medium text-[#7C3AED] hover:underline"
                  >
                    Terms & Conditions
                  </button>{" "}
                  and{" "}
                  <Link
                    to="/Privacy"
                    className="font-medium text-[#7C3AED] hover:underline"
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
                  className="mt-2 flex items-center gap-1 text-[12px] text-[#DC2626]"
                >
                  <XCircle size={12} /> {errors.terms}
                </motion.p>
              )}
            </div>

            {errors.submit && (
              <div className="rounded-md border border-[#DC2626]/20 bg-[#DC2626]/5 p-3">
                <p className="text-center text-[12.5px] text-[#DC2626]">
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
              className="flex w-full items-center justify-center gap-2 rounded-md bg-[#7C3AED] py-3 text-[14px] font-medium text-white transition-colors hover:bg-[#6D28D9] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? (
                <div className="h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
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

          {/* Login link */}
          <p className="mt-6 text-center text-[13.5px] text-[#6E6280]">
            Already have an account?{" "}
            <Link
              to="/login"
              className="font-medium text-[#7C3AED] hover:text-[#6D28D9] transition-colors"
            >
              Sign in
            </Link>
          </p>
        </motion.div>
      </motion.div>

      {/* Terms modal */}
      <AnimatePresence>
        {showTermsModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
            onClick={() => setShowTermsModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, y: 20, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.95, y: 20, opacity: 0 }}
              transition={{ type: "spring", damping: 25, stiffness: 220 }}
              className="w-full max-w-3xl overflow-hidden rounded-xl border border-[#E4D9F5] bg-white"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal header */}
              <div className="flex items-center justify-between border-b border-[#E4D9F5] p-5 sm:p-6">
                <div className="flex items-center gap-3">
                  <span className="flex h-9 w-9 items-center justify-center rounded-md bg-[#7C3AED]/10">
                    <Shield className="h-4.5 w-4.5 text-[#7C3AED]" />
                  </span>
                  <h2
                    style={FONT_DISPLAY}
                    className="text-[18px] font-semibold text-[#1B1030]"
                  >
                    Terms & Conditions
                  </h2>
                </div>
                <button
                  onClick={() => setShowTermsModal(false)}
                  aria-label="Close"
                  className="rounded-md p-2 text-[#6E6280] transition-colors hover:bg-[#F7F3FD] hover:text-[#1B1030]"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Modal body */}
              <div className="max-h-[60vh] space-y-6 overflow-y-auto p-6 text-[13.5px] leading-relaxed">
                <section>
                  <h3
                    style={FONT_DISPLAY}
                    className="mb-2 text-[15px] font-semibold text-[#1B1030]"
                  >
                    Payment for services and purchase procedure
                  </h3>
                  <ol className="list-decimal list-inside space-y-1.5 pl-1 text-[#6E6280]">
                    <li>
                      Before using the Wave Verify platform, you must top up
                      your balance;
                    </li>
                    <li>
                      All available top-up methods can be found by clicking the
                      "Top up" button;
                    </li>
                    <li>
                      The commission and minimum top-up amount depend on the
                      selected payment method;
                    </li>
                    <li>
                      Please note: funds may take up to 3 hours to be credited
                      to your balance;
                    </li>
                    <li>
                      Funds are deducted from the balance upon completion of the
                      purchase;
                    </li>
                    <li>
                      A purchase is considered completed if an OTP code has been
                      received and displayed to the user;
                    </li>
                    <li>
                      If an OTP code does not arrive for any reason, the funds
                      are returned to the balance;
                    </li>
                    <li>
                      If a code does not arrive after multiple numbers purchase,
                      Wave Verify may apply sanctions to the account;
                    </li>
                    <li>
                      To withdraw funds from your balance, send a request to
                      smswinner19@gmail.com from the email address that was used
                      to register your account. Requests are reviewed within 3
                      business days. The standard withdrawal period is 7 days.
                      In some cases, the review period for a withdrawal request
                      may take up to 4 weeks.
                    </li>
                    <li>
                      Refunds are made to the same wallet which the deposit was
                      made with.
                    </li>
                    <li>
                      A 5% fee is charged for withdrawals. If one year or more
                      has passed since the last top-up, the fee is 15%; after 2
                      years – 25%; after 3 years – 35%.
                    </li>
                  </ol>
                </section>

                <section>
                  <h3
                    style={FONT_DISPLAY}
                    className="mb-2 text-[15px] font-semibold text-[#1B1030]"
                  >
                    Cancellation and refunds
                  </h3>
                  <p className="text-[#6E6280]">
                    Cancelling a 20-minute number purchase:
                  </p>
                  <ul className="mt-2 list-disc list-inside space-y-1.5 pl-1 text-[#6E6280]">
                    <li>
                      Number cancellation becomes available after purchase. The
                      corresponding button in the activation card will become
                      active;
                    </li>
                    <li>
                      Cancellation with a refund to your balance is available if
                      no code has been received on the number;
                    </li>
                    <li>
                      Once a code has been received, the activation is
                      considered successful and the money cannot be refunded;
                    </li>
                    <li>
                      If no code arrives within 20 minutes for any reason, the
                      money is automatically returned to your balance or report
                      to customer care.
                    </li>
                  </ul>
                </section>

                <section>
                  <h3
                    style={FONT_DISPLAY}
                    className="mb-2 text-[15px] font-semibold text-[#1B1030]"
                  >
                    User agreement
                  </h3>
                  <ul className="list-disc list-inside space-y-1.5 pl-1 text-[#6E6280]">
                    <li>
                      Users can purchase virtual numbers directly from suppliers
                      through the P2P deal system.
                    </li>
                    <li>
                      By registering on the site, you agree to receive
                      promotional messages from Wave Verify. You can unsubscribe
                      at any time.
                    </li>
                    <li>
                      Using Wave Verify for any unlawful purpose is strictly
                      forbidden.
                    </li>
                    <li>
                      We are not responsible for created accounts. All actions
                      and potential blocks are the buyer's own risk.
                    </li>
                  </ul>
                </section>
              </div>

              {/* Modal footer */}
              <div className="flex justify-end gap-3 border-t border-[#E4D9F5] p-5 sm:p-6">
                <button
                  onClick={() => setShowTermsModal(false)}
                  className="rounded-md border border-[#E4D9F5] bg-white px-4 py-2 text-[13.5px] font-medium text-[#1B1030] transition-colors hover:border-[#7C3AED] hover:text-[#7C3AED]"
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
                  className="rounded-md bg-[#7C3AED] px-4 py-2 text-[13.5px] font-medium text-white transition-colors hover:bg-[#6D28D9]"
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
        <CheckCircle size={13} className="text-[#16A34A]" />
      ) : (
        <XCircle size={13} className="text-[#9B948A]" />
      )}
      <span className={ok ? "text-[#16A34A]" : "text-[#6E6280]"}>{label}</span>
    </div>
  );
}

export default Register;
