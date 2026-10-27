// src/components/ProtectedRoute.jsx
import { useEffect, useState } from "react";
import { Navigate, Outlet } from "react-router-dom";
import { motion } from "framer-motion";
import { getAuthUser } from "../service/auth.js";
import useAuth from "../store/useAuth.js";
import { ShieldCheck } from "lucide-react";
import SiteLogo from "./SiteLogo";

const FONT_DISPLAY = {
  fontFamily: "'Space Grotesk', ui-sans-serif, system-ui",
};
const FONT_MONO = { fontFamily: "'JetBrains Mono', ui-monospace, monospace" };

/* Minimum time the loader stays visible, even if auth resolves instantly */
const MIN_LOADER_MS = 1800;

export default function ProtectedRoute({ role, children }) {
  const { user, status, setStatus, setAuthUser, clearAuth } = useAuth();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const checkUser = async () => {
      setStatus("checking");
      setIsChecking(true);

      const startedAt = Date.now();

      try {
        const res = await getAuthUser();

        if (res.status === 200 || res.status === 201) {
          setAuthUser(res.data);
        } else {
          clearAuth();
        }
      } catch (error) {
        console.error("fetching user data: ", error);
        clearAuth();
      } finally {
        if (isMounted) {
          // Ensure the loader stays on screen for at least MIN_LOADER_MS
          const elapsed = Date.now() - startedAt;
          const remaining = Math.max(0, MIN_LOADER_MS - elapsed);
          setTimeout(() => {
            if (isMounted) setIsChecking(false);
          }, remaining);
        }
      }
    };

    checkUser();

    return () => {
      isMounted = false;
    };
  }, [clearAuth, setAuthUser, setStatus]);

  /* ---------- Loading state ---------- */
  if (isChecking || status === "checking") {
    return (
      <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-bg-subtle">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 0.2, scale: 1 }}
          transition={{ duration: 1.6, ease: "easeOut" }}
          className="pointer-events-none absolute left-1/2 top-0 h-40 w-40 -translate-x-1/2 rounded-full bg-brand-soft"
        />

        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: "easeOut" }}
          className="relative z-10 flex flex-col items-center"
        >
          {/* Logo mark */}
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="mb-8"
          >
            <SiteLogo />
          </motion.div>

          {/* Spinner card */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.15, ease: "easeOut" }}
            className="w-80 rounded-2xl border border-border bg-surface p-6 shadow-card"
          >
            <div className="flex items-center gap-3">
              {/* Dual-ring spinner — slowed down */}
              <span className="relative flex h-9 w-9 shrink-0 items-center justify-center">
                <motion.span
                  animate={{ rotate: 360 }}
                  transition={{
                    duration: 2.6,
                    repeat: Infinity,
                    ease: "linear",
                  }}
                  className="absolute inset-0 rounded-full border-2 border-border border-t-brand border-r-brand"
                />
                <motion.span
                  animate={{ rotate: -360 }}
                  transition={{
                    duration: 3.8,
                    repeat: Infinity,
                    ease: "linear",
                  }}
                  className="absolute inset-1 rounded-full border-2 border-border"
                />
                {/* Soft pulse behind the icon */}
                <motion.span
                  animate={{
                    scale: [0.9, 1.15, 0.9],
                    opacity: [0.35, 0.7, 0.35],
                  }}
                  transition={{
                    duration: 2.2,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                  className="absolute inset-2 rounded-full bg-brand-soft"
                />
                <ShieldCheck
                  className="relative h-3.5 w-3.5 text-brand"
                  strokeWidth={2.5}
                />
              </span>

              <div className="min-w-0 flex-1">
                <p
                  style={FONT_DISPLAY}
                  className="text-[14px] font-semibold text-heading"
                >
                  Getting things ready
                </p>
                <p className="mt-0.5 text-[12px] text-muted">
                  Verifying your session…
                </p>
              </div>
            </div>

            {/* Indeterminate progress bar — slower sweep */}
            <div className="mt-5 h-1 overflow-hidden rounded-full bg-bg-subtle">
              <motion.div
                animate={{ x: ["-40%", "140%"] }}
                transition={{
                  duration: 2.4,
                  repeat: Infinity,
                  ease: "easeInOut",
                  repeatDelay: 0.2,
                }}
                className="h-full w-1/3 rounded-full bg-brand"
              />
            </div>

            {/* Mono hint — animated dots for a "tick" feel */}
            <p
              style={FONT_MONO}
              className="mt-4 flex items-center justify-center gap-1 text-center text-[10.5px] tracking-wider text-muted"
            >
              <span>establishing secure connection</span>
              {[0, 1, 2].map((i) => (
                <motion.span
                  key={i}
                  animate={{ opacity: [0.2, 1, 0.2] }}
                  transition={{
                    duration: 1.6,
                    repeat: Infinity,
                    delay: i * 0.25,
                    ease: "easeInOut",
                  }}
                >
                  .
                </motion.span>
              ))}
            </p>
          </motion.div>

          {/* Decorative dots below card — slower, calmer */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="mt-6 flex items-center gap-1.5"
          >
            {[0, 1, 2].map((i) => (
              <motion.span
                key={i}
                animate={{ opacity: [0.25, 1, 0.25], scale: [0.85, 1, 0.85] }}
                transition={{
                  duration: 2.2,
                  repeat: Infinity,
                  delay: i * 0.28,
                  ease: "easeInOut",
                }}
                className="h-1.5 w-1.5 rounded-full bg-brand"
              />
            ))}
          </motion.div>
        </motion.div>
      </div>
    );
  }

  /* ---------- Auth guard ---------- */
  if (status === "unauthenticated" || !user) {
    return <Navigate to="/login" replace />;
  }

  const authUser = user?.data || user;

  if (role && authUser?.role !== role) {
    return <Navigate to="/login" replace />;
  }

  return children || <Outlet />;
}
