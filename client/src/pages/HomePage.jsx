/**
 * DigiTools — Homepage
 *
 * Fonts (add to index.html <head>):
 *   <link rel="preconnect" href="https://fonts.googleapis.com">
 *   <link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;600&display=swap" rel="stylesheet">
 *
 * Dependencies: lucide-react, react-icons, framer-motion, react-router-dom
 * Tailwind: uses arbitrary values, no config changes required.
 *
 * Routing assumption:
 *   - Internal routes: /login, /signup, /numbers, /platform, etc.
 *   - Section anchors on this page: #countries, #how-it-works, #why, #faq
 */

import React, { useEffect, useMemo, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import ThemeToggle from "../components/ThemeToggle";
import SiteLogo from "../components/SiteLogo";
import {
  Menu,
  X,
  ArrowRight,
  ArrowUpRight,
  Globe2,
  ShieldCheck,
  Radio,
  Gauge,
  Users,
  FlaskConical,
  LineChart,
  Fingerprint,
  Repeat,
  ChevronDown,
  Star,
  CheckCircle2,
  Copy,
  Wifi,
  Smartphone,
  MessageSquare,
} from "lucide-react";
import { FaXTwitter, FaLinkedinIn, FaDiscord, FaGithub } from "react-icons/fa6";
import {
  motion,
  AnimatePresence,
  useMotionValue,
  useSpring,
  useTransform,
} from "framer-motion";
import imageObject from "../utils/image";

/* ---------------------------------------------------------------- */
/* Design tokens (Tailwind arbitrary values used inline)             */
/* ---------------------------------------------------------------- */

const FONT_DISPLAY = {
  fontFamily: "'Space Grotesk', ui-sans-serif, system-ui",
};
const FONT_MONO = { fontFamily: "'JetBrains Mono', ui-monospace, monospace" };

/* ---------------------------- data -------------------------------- */

const NAV_LINKS = [
  { label: "Numbers", href: "#countries" },
  { label: "How it works", href: "#how-it-works" },
  { label: "Platform", href: "#why" },
  { label: "FAQ", href: "#faq" },
];

const FEED_SEED = [
  {
    flag: "🇺🇸",
    country: "United States",
    number: "+1 202 •••• 91",
    carrier: "AT&T",
  },
  {
    flag: "🇬🇧",
    country: "United Kingdom",
    number: "+44 7700 •••• 12",
    carrier: "Vodafone",
  },
  {
    flag: "🇳🇬",
    country: "Nigeria",
    number: "+234 803 •••• 44",
    carrier: "MTN",
  },
  {
    flag: "🇮🇳",
    country: "India",
    number: "+91 98100 •••• 05",
    carrier: "Airtel",
  },
  {
    flag: "🇩🇪",
    country: "Germany",
    number: "+49 151 •••• 33",
    carrier: "Telekom",
  },
  { flag: "🇧🇷", country: "Brazil", number: "+55 11 •••• 720", carrier: "Vivo" },
  {
    flag: "🇵🇭",
    country: "Philippines",
    number: "+63 917 •••• 08",
    carrier: "Globe",
  },
  {
    flag: "🇰🇪",
    country: "Kenya",
    number: "+254 722 •••• 61",
    carrier: "Safaricom",
  },
];

const HERO_LINES = [
  {
    flag: "🇬🇧",
    country: "United Kingdom",
    carrier: "Vodafone UK",
    prefix: "+44 7700",
    tail: "12",
    route: "uk-lon-03",
  },
  {
    flag: "🇺🇸",
    country: "United States",
    carrier: "AT&T Mobility",
    prefix: "+1 202",
    tail: "91",
    route: "us-iad-07",
  },
  {
    flag: "🇳🇬",
    country: "Nigeria",
    carrier: "MTN Nigeria",
    prefix: "+234 803",
    tail: "44",
    route: "ng-los-02",
  },
  {
    flag: "🇮🇳",
    country: "India",
    carrier: "Airtel",
    prefix: "+91 98100",
    tail: "05",
    route: "in-del-11",
  },
  {
    flag: "🇩🇪",
    country: "Germany",
    carrier: "Telekom",
    prefix: "+49 151",
    tail: "33",
    route: "de-fra-05",
  },
  {
    flag: "🇧🇷",
    country: "Brazil",
    carrier: "Vivo",
    prefix: "+55 11",
    tail: "720",
    route: "br-sao-09",
  },
  {
    flag: "🇵🇭",
    country: "Philippines",
    carrier: "Globe",
    prefix: "+63 917",
    tail: "08",
    route: "ph-mnl-04",
  },
  {
    flag: "🇰🇪",
    country: "Kenya",
    carrier: "Safaricom",
    prefix: "+254 722",
    tail: "61",
    route: "ke-nbo-06",
  },
];

const STEPS = [
  {
    n: "01",
    title: "Pick a country",
    body: "Browse live coverage across 150+ countries. Compare carriers, pricing and current availability before you commit.",
  },
  {
    n: "02",
    title: "Get a number",
    body: "Claim a real, carrier-verified line. It's assigned to your account the moment payment clears — no queue.",
  },
  {
    n: "03",
    title: "Receive the code",
    body: "SMS and OTP traffic lands in your dashboard as it arrives, with delivery time logged to the millisecond.",
  },
  {
    n: "04",
    title: "Verify & continue",
    body: "Copy the code, complete verification, done. Single-use numbers are released back into the pool automatically.",
  },
];

const USE_CASES = [
  {
    icon: Fingerprint,
    title: "User verification",
    body: "Confirm new signups are backed by a real, reachable line before they reach your product.",
  },
  {
    icon: ShieldCheck,
    title: "2FA authentication",
    body: "Deliver time-sensitive codes for two-factor login flows without owning SMS infrastructure.",
  },
  {
    icon: FlaskConical,
    title: "App testing",
    body: "Run verification and messaging flows against live carriers before you ship.",
  },
  {
    icon: Globe2,
    title: "Market research",
    body: "Access phone-gated services and registration flows across markets you don't operate in yet.",
  },
  {
    icon: LineChart,
    title: "Data enrichment",
    body: "Attach verified phone metadata — carrier, region, line type — to existing records.",
  },
  {
    icon: Repeat,
    title: "Migration support",
    body: "Give users moving between platforms a stable number to re-verify identity during cutover.",
  },
];

const WHY = [
  {
    icon: ShieldCheck,
    title: "Carrier-verified",
    body: "Every number is issued by a real carrier — not a VoIP pool that gets blacklisted by Friday.",
  },
  {
    icon: Gauge,
    title: "Fast by default",
    body: "Sub-10-second median delivery, measured and published, not asserted.",
  },
  {
    icon: Globe2,
    title: "150+ countries",
    body: "Coverage deep enough that your rarest market probably isn't rare to us.",
  },
  {
    icon: Radio,
    title: "Live visibility",
    body: "Watch delivery happen. No refreshing, no polling, no guessing whether it's stuck.",
  },
  {
    icon: Users,
    title: "Built for teams",
    body: "Shared workspaces, usage limits and role-based access from day one.",
  },
  {
    icon: CheckCircle2,
    title: "No hidden fees",
    body: "The price on the number is the price you pay. Volume pricing kicks in automatically.",
  },
];

const COUNTRIES = [
  {
    flag: "🇳🇬",
    name: "Nigeria",
    dial: "+234",
    region: "Africa",
    price: "From ₦1,200",
    confidence: 99,
    stock: "In stock",
  },
  {
    flag: "🇺🇸",
    name: "United States",
    dial: "+1",
    region: "Americas",
    price: "From ₦2,300",
    confidence: 98,
    stock: "In stock",
  },
  {
    flag: "🇬🇧",
    name: "United Kingdom",
    dial: "+44",
    region: "Europe",
    price: "From ₦1,500",
    confidence: 97,
    stock: "In stock",
  },
  {
    flag: "🇮🇳",
    name: "India",
    dial: "+91",
    region: "Asia",
    price: "From ₦2,200",
    confidence: 96,
    stock: "Limited",
  },
  {
    flag: "🇩🇪",
    name: "Germany",
    dial: "+49",
    region: "Europe",
    price: "From ₦1,900",
    confidence: 98,
    stock: "In stock",
  },
  {
    flag: "🇰🇪",
    name: "Kenya",
    dial: "+254",
    region: "Africa",
    price: "From ₦5000",
    confidence: 95,
    stock: "In stock",
  },
  {
    flag: "🇧🇷",
    name: "Brazil",
    dial: "+55",
    region: "Americas",
    price: "From ₦1,200",
    confidence: 94,
    stock: "In stock",
  },
  {
    flag: "🇵🇭",
    name: "Philippines",
    dial: "+63",
    region: "Asia",
    price: "From ₦3,200",
    confidence: 96,
    stock: "In stock",
  },
];

const REGIONS = ["All", "Africa", "Europe", "Americas", "Asia"];

const TESTIMONIALS = [
  {
    name: "Amara Okoye",
    role: "Founder, Lentra",
    body: "Onboarding used to stall on phone verification. Now it clears before the user finishes reading the next screen.",
    stat: "Faster onboarding",
  },
  {
    name: "Priya Raman",
    role: "Support Lead, Fielda",
    body: "Our verification tickets dropped to almost nothing once numbers stopped bouncing between carriers.",
    stat: "Fewer support issues",
  },
  {
    name: "Tomasz Wroblewski",
    role: "Eng Manager, Northbeam",
    body: "We track delivery time as a KPI now, because it's actually consistent enough to be one.",
    stat: "Reliable OTP delivery",
  },
  {
    name: "Chidera Umeh",
    role: "Product, Sailhouse",
    body: "We expanded into four markets we'd previously written off as too small to support properly.",
    stat: "Wider coverage",
  },
];

const FAQS = [
  {
    q: "How quickly do OTPs arrive?",
    a: "Median delivery is under 10 seconds. You'll see the exact time logged against every code that lands, not an average we quote you.",
  },
  {
    q: "Are the numbers real or VoIP?",
    a: "Real, carrier-issued lines. VoIP ranges get blocked by major platforms, so we deliberately don't use them.",
  },
  {
    q: "Can one number be used more than once?",
    a: "Depends on the number type. Single-use numbers release after one verification; long-term rentals stay assigned to you for the rental period.",
  },
  {
    q: "What happens if an OTP doesn't arrive?",
    a: "You're covered by an automatic retry, and if that fails, a refund back to your balance — no ticket required.",
  },
  {
    q: "Which countries are supported?",
    a: "150+ at last count and growing weekly. Use the country grid below to check live availability before you commit.",
  },
];

/* ---------------------------- helpers ------------------------------ */

/**
 * SmartNavLink — renders a react-router <Link> for internal routes,
 * a plain <a> for hash anchors and external URLs.
 */
function SmartNavLink({ href, children, className, onClick, ...rest }) {
  const isAnchor = href?.startsWith("#");
  const isExternal =
    href?.startsWith("http") ||
    href?.startsWith("mailto:") ||
    href?.startsWith("tel:");

  if (isAnchor) {
    return (
      <a href={href} className={className} onClick={onClick} {...rest}>
        {children}
      </a>
    );
  }
  if (isExternal) {
    return (
      <a
        href={href}
        className={className}
        onClick={onClick}
        target="_blank"
        rel="noopener noreferrer"
        {...rest}
      >
        {children}
      </a>
    );
  }
  return (
    <Link to={href} className={className} onClick={onClick} {...rest}>
      {children}
    </Link>
  );
}

function useLiveFeed(seed, intervalMs = 2600) {
  const [rows, setRows] = useState(() =>
    seed.slice(0, 5).map((r, i) => ({ ...r, id: i, t: (i + 1) * 2 })),
  );
  useEffect(() => {
    let id = rows.length;
    const timer = setInterval(() => {
      setRows((prev) => {
        const next = seed[Math.floor(Math.random() * seed.length)];
        const bumped = prev.map((r) => ({ ...r, t: r.t + 2 }));
        return [{ ...next, id: id++, t: 0 }, ...bumped].slice(0, 6);
      });
    }, intervalMs);
    return () => clearInterval(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return rows;
}

function useCountUp(target, duration = 2000, startDelay = 0) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    const timer = setTimeout(() => {
      const startTime = Date.now();
      const animate = () => {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        setCount(Math.floor(eased * target));
        if (progress < 1) {
          requestAnimationFrame(animate);
        }
      };
      requestAnimationFrame(animate);
    }, startDelay);
    return () => clearTimeout(timer);
  }, [target, duration, startDelay]);
  return count;
}

function randomCode() {
  const a = [];
  for (let i = 0; i < 6; i++) a.push(String(Math.floor(Math.random() * 10)));
  return a;
}

function randomLine(exclude) {
  if (!exclude)
    return HERO_LINES[Math.floor(Math.random() * HERO_LINES.length)];
  let next = exclude;
  let guard = 0;
  while (next === exclude && guard < 20) {
    next = HERO_LINES[Math.floor(Math.random() * HERO_LINES.length)];
    guard++;
  }
  return next;
}

/* ------------------------------ nav -------------------------------- */

function Navbar() {
  const [open, setOpen] = useState(false);
  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.4 }}
      className="sticky top-0 z-50 border-b border-[#E4D9F5] bg-white/85 backdrop-blur"
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        <motion.div
          whileHover={{ scale: 1.02 }}
          transition={{ type: "spring", stiffness: 400, damping: 17 }}
        >
          <img src={imageObject.Logo} className='rounded-sm h-[70px] w-[200px]' />
        </motion.div>

        <nav className="hidden items-center gap-8 md:flex">
          {NAV_LINKS.map((l) => (
            <motion.div
              key={l.label}
              whileHover={{ y: -1 }}
              transition={{ type: "spring", stiffness: 400, damping: 17 }}
            >
              <SmartNavLink
                href={l.href}
                className="text-[14px] text-[#6E6280] transition-colors hover:text-[#1B1030]"
              >
                {l.label}
              </SmartNavLink>
            </motion.div>
          ))}
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          <ThemeToggle />
          <motion.div
            whileHover={{ scale: 1.05 }}
            transition={{ type: "spring", stiffness: 400, damping: 17 }}
          >
            <Link
              to="/login"
              className="text-[14px] text-[#6E6280] hover:text-[#1B1030]"
            >
              Sign in
            </Link>
          </motion.div>

          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            transition={{ type: "spring", stiffness: 400, damping: 17 }}
          >
            <Link
              to="/signup"
              className="flex items-center gap-1.5 rounded-md bg-[#7C3AED] px-4 py-2 text-[14px] font-medium text-white transition-colors hover:bg-[#6D28D9]"
            >
              Get a number
            </Link>
          </motion.div>
        </div>

        <button
          className="md:hidden text-[#1B1030]"
          onClick={() => setOpen((v) => !v)}
          aria-label="Toggle menu"
        >
          {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="border-t border-[#E4D9F5] px-6 py-4 md:hidden"
          >
            <div className="flex flex-col gap-4">
              {NAV_LINKS.map((l) => (
                <SmartNavLink
                  key={l.label}
                  href={l.href}
                  className="text-[14px] text-[#6E6280]"
                  onClick={() => setOpen(false)}
                >
                  {l.label}
                </SmartNavLink>
              ))}
              <Link
                to="/login"
                className="text-[14px] text-[#6E6280]"
                onClick={() => setOpen(false)}
              >
                Sign in
              </Link>
              <ThemeToggle className="self-start" />
              <Link
                to="/signup"
                className="rounded-md bg-[#7C3AED] px-4 py-2 text-center text-[14px] font-medium text-white"
                onClick={() => setOpen(false)}
              >
                Get a number
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
}

/* --------------------- hero signal orbit art ----------------------- */

function SignalOrbitArt() {
  return (
    <svg
      viewBox="0 0 720 720"
      className="pointer-events-none absolute -right-20 -top-24 h-[640px] w-[640px] opacity-[0.5] lg:-right-28 xl:h-[820px] xl:w-[820px] 2xl:h-[960px] 2xl:w-[960px]"
      aria-hidden
      preserveAspectRatio="xMidYMid meet"
    >
      <defs>
        <radialGradient id="orbitFade" cx="72%" cy="58%" r="62%">
          <stop offset="0%" stopColor="#C084FC" stopOpacity="0.35" />
          <stop offset="65%" stopColor="#7C3AED" stopOpacity="0.08" />
          <stop offset="100%" stopColor="#7C3AED" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="orbitRing" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#9333EA" stopOpacity="0.55" />
          <stop offset="100%" stopColor="#C084FC" stopOpacity="0.05" />
        </linearGradient>
      </defs>

      <circle cx="520" cy="420" r="360" fill="url(#orbitFade)" />

      {[
        { rx: 340, ry: 220, rot: -18, o: 0.42 },
        { rx: 280, ry: 180, rot: -18, o: 0.5 },
        { rx: 220, ry: 140, rot: -18, o: 0.55 },
        { rx: 160, ry: 102, rot: -18, o: 0.6 },
      ].map((r, i) => (
        <ellipse
          key={i}
          cx="520"
          cy="420"
          rx={r.rx}
          ry={r.ry}
          transform={`rotate(${r.rot} 520 420)`}
          fill="none"
          stroke="url(#orbitRing)"
          strokeOpacity={r.o}
          strokeWidth="1.25"
          strokeDasharray={i === 0 ? "none" : "2 7"}
        />
      ))}

      <g>
        <circle
          cx="520"
          cy="420"
          r="26"
          fill="none"
          stroke="#C084FC"
          strokeOpacity="0.35"
        />
        <circle
          cx="520"
          cy="420"
          r="14"
          fill="none"
          stroke="#9333EA"
          strokeOpacity="0.5"
        />
        <circle cx="520" cy="420" r="4" fill="#C084FC" />
      </g>

      <circle cx="220" cy="330" r="3.5" fill="#9333EA" fillOpacity="0.85" />
      <circle cx="760" cy="500" r="3.5" fill="#C084FC" fillOpacity="0.75" />
      <circle cx="620" cy="620" r="2.5" fill="#9333EA" fillOpacity="0.6" />

      <g transform="translate(596, 236)" stroke="#9333EA" fill="none">
        <path
          d="M0 24 A 24 24 0 0 1 0 -24"
          strokeOpacity="0.5"
          strokeWidth="1.5"
        />
        <path
          d="M14 34 A 34 34 0 0 1 14 -34"
          strokeOpacity="0.32"
          strokeWidth="1.5"
        />
        <path
          d="M28 44 A 44 44 0 0 1 28 -44"
          strokeOpacity="0.18"
          strokeWidth="1.5"
        />
      </g>
    </svg>
  );
}

/* -------------------------- hero terminal card -------------------------- */

function HeroTerminalCard() {
  const ref = useRef(null);
  const px = useMotionValue(0);
  const py = useMotionValue(0);
  const rotateX = useSpring(useTransform(py, [-0.5, 0.5], [8, -8]), {
    stiffness: 220,
    damping: 22,
  });
  const rotateY = useSpring(useTransform(px, [-0.5, 0.5], [-8, 8]), {
    stiffness: 220,
    damping: 22,
  });

  function onMove(e) {
    const rect = ref.current.getBoundingClientRect();
    px.set((e.clientX - rect.left) / rect.width - 0.5);
    py.set((e.clientY - rect.top) / rect.height - 0.5);
  }
  function onLeave() {
    px.set(0);
    py.set(0);
  }

  const [line, setLine] = useState(() => randomLine());
  const [code, setCode] = useState(() => randomCode());
  const [revealed, setRevealed] = useState(0);
  const [cycle, setCycle] = useState(0);
  const [deliverMs, setDeliverMs] = useState(4.2);

  useEffect(() => {
    const timers = [];
    const runCycle = () => {
      setLine((prev) => randomLine(prev));
      setCode(randomCode());
      setRevealed(0);

      const base = 420;
      const step = 260;

      for (let i = 0; i < 6; i++) {
        timers.push(setTimeout(() => setRevealed(i + 1), base + i * step));
      }
      timers.push(
        setTimeout(
          () => {
            setDeliverMs(Number((3.6 + Math.random() * 1.6).toFixed(1)));
            setCycle((c) => c + 1);
          },
          base + 6 * step + 400,
        ),
      );
    };

    runCycle();
    const loop = setInterval(runCycle, 6200);
    return () => {
      clearInterval(loop);
      timers.forEach(clearTimeout);
    };
  }, []);

  const routes = [
    { label: "Assigned", at: 1 },
    { label: "Routed", at: 3 },
    { label: "Delivered", at: 6 },
  ];

  /* Theme-aware tokens — resolved from the landing page CSS variables so the
     card reads correctly on both light and dark themes. */
  const theme = {
    surface: "var(--landing-surface)",
    heading: "var(--landing-heading)",
    body: "var(--landing-body)",
    border: "var(--landing-border)",
    brand: "var(--landing-brand)",
    success: "var(--landing-success)",
  };

  /* Muted variant of the body text used for secondary lines. */
  const mutedBody = `color-mix(in srgb, ${theme.body} 72%, transparent)`;
  const faintBody = `color-mix(in srgb, ${theme.body} 45%, transparent)`;
  const brandSoft = `color-mix(in srgb, ${theme.brand} 16%, transparent)`;
  const brandLine = `color-mix(in srgb, ${theme.brand} 42%, transparent)`;
  const successSoft = `color-mix(in srgb, ${theme.success} 12%, transparent)`;
  const successLine = `color-mix(in srgb, ${theme.success} 34%, transparent)`;
  const digitIdle = `color-mix(in srgb, ${theme.body} 28%, transparent)`;

  return (
    <motion.div
      ref={ref}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      style={{
        rotateX,
        rotateY,
        transformStyle: "preserve-3d",
        perspective: 1400,
        borderColor: brandLine,
        boxShadow:
          "0 30px 70px -30px color-mix(in srgb, var(--landing-brand) 45%, transparent)",
      }}
      className="relative rounded-2xl border p-2 will-change-transform"
      initial={{ x: 30, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.6, delay: 0.4 }}
    >
      <div
        className="absolute inset-0 rounded-2xl"
        style={{
          background: `linear-gradient(to bottom right, color-mix(in srgb, ${theme.brand} 14%, transparent), color-mix(in srgb, ${theme.brand} 6%, transparent), transparent)`,
        }}
      />
      <div
        className="absolute inset-0 rounded-2xl border"
        style={{ borderColor: brandLine }}
      />

      <style>{`
        @keyframes dt-scan {
          0%   { transform: translateY(-30%); opacity: 0; }
          15%  { opacity: 0.55; }
          85%  { opacity: 0.55; }
          100% { transform: translateY(430%); opacity: 0; }
        }
        @keyframes dt-pulse {
          0%, 100% { opacity: 0.35; transform: scale(0.95); }
          50%      { opacity: 1;    transform: scale(1.05); }
        }
        @keyframes dt-bar {
          0%, 100% { transform: scaleY(0.4); }
          50%      { transform: scaleY(1); }
        }
        @keyframes dt-flip {
          0%   { transform: rotateX(90deg);  opacity: 0; }
          55%  { transform: rotateX(-12deg); opacity: 1; }
          100% { transform: rotateX(0deg);   opacity: 1; }
        }
        @keyframes dt-sweep {
          0%   { transform: translateX(-120%); opacity: 0; }
          40%  { opacity: 0.9; }
          100% { transform: translateX(220%);  opacity: 0; }
        }
      `}</style>

      <div
        className="relative overflow-hidden rounded-xl"
        style={{
          transform: "translateZ(28px)",
          backgroundColor: `color-mix(in srgb, ${theme.surface} 92%, ${theme.brand} 8%)`,
        }}
      >
        <div
          aria-hidden
          className="pointer-events-none absolute -left-16 -top-20 h-56 w-56 rounded-full opacity-40 blur-3xl"
          style={{
            background: `radial-gradient(closest-side, ${theme.brand}, transparent)`,
          }}
        />

        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 top-0 h-24"
          style={{
            background: `linear-gradient(to bottom, transparent, color-mix(in srgb, ${theme.brand} 18%, transparent), transparent)`,
            animation: "dt-scan 4.4s linear infinite",
          }}
        />

        <div
          className="relative flex items-center justify-between border-b px-4 py-3 md:px-5 md:py-3.5"
          style={{ borderColor: theme.border }}
        >
          <div className="flex items-center gap-2.5">
            <span
              className="flex h-7 w-7 items-center justify-center rounded-md md:h-8 md:w-8"
              style={{
                background: `linear-gradient(135deg, color-mix(in srgb, ${theme.brand} 70%, white), ${theme.brand} 60%, color-mix(in srgb, ${theme.brand} 55%, black))`,
              }}
            >
              <Radio
                className="h-3.5 w-3.5 md:h-4 md:w-4"
                strokeWidth={2.5}
                style={{ color: "var(--landing-on-brand)" }}
              />
            </span>
            <div className="leading-tight">
              <AnimatePresence mode="wait">
                <motion.p
                  key={`carrier-${line.route}`}
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  transition={{ duration: 0.3 }}
                  style={{ ...FONT_DISPLAY, color: theme.heading }}
                  className="text-[12.5px] font-semibold md:text-[13.5px]"
                >
                  {line.carrier}
                </motion.p>
              </AnimatePresence>
              <p
                style={{ ...FONT_MONO, color: mutedBody }}
                className="text-[10px] md:text-[10.5px]"
              >
                carrier-verified line
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span className="flex items-end gap-[2px]">
              {[6, 9, 12, 15].map((h, i) => (
                <span
                  key={i}
                  className="w-[3px] rounded-sm"
                  style={{
                    height: `${h}px`,
                    transformOrigin: "bottom",
                    animation: `dt-bar 1.4s ease-in-out ${i * 0.12}s infinite`,
                    opacity: 0.55 + i * 0.15,
                    backgroundColor: theme.brand,
                  }}
                />
              ))}
            </span>
            <span className="flex items-center gap-1.5">
              <span
                className="h-1.5 w-1.5 rounded-full"
                style={{
                  backgroundColor: theme.success,
                  animation: "dt-pulse 1.6s ease-in-out infinite",
                }}
              />
              <span
                style={{ ...FONT_MONO, color: theme.success }}
                className="text-[10px] tracking-wider"
              >
                LIVE
              </span>
            </span>
          </div>
        </div>

        <div className="relative grid grid-cols-[68px_1fr] gap-0 md:grid-cols-[84px_1fr]">
          <div
            className="relative border-r px-3 py-5 md:px-4 md:py-6"
            style={{ borderColor: theme.border }}
          >
            <div
              className="absolute left-1/2 top-6 bottom-6 w-px -translate-x-1/2"
              style={{ backgroundColor: theme.border }}
            />
            <ul className="relative flex h-full flex-col justify-between gap-6">
              {routes.map((r) => {
                const reached = revealed >= r.at;
                return (
                  <li
                    key={r.label}
                    className="relative flex flex-col items-center gap-1.5"
                  >
                    <span
                      className="relative flex h-2.5 w-2.5 items-center justify-center rounded-full transition-colors duration-300"
                      style={{
                        background: reached ? theme.brand : faintBody,
                        boxShadow: reached
                          ? `0 0 0 4px ${brandSoft}`
                          : "none",
                      }}
                    />
                    <span
                      style={{
                        ...FONT_MONO,
                        color: reached ? theme.brand : mutedBody,
                      }}
                      className="text-[9px] tracking-wider transition-colors duration-300 md:text-[10px]"
                    >
                      {r.label}
                    </span>
                  </li>
                );
              })}
            </ul>
          </div>

          <div className="px-5 py-5 md:px-6 md:py-6">
            <div>
              <div className="flex items-center justify-between">
                <p
                  style={{ ...FONT_MONO, color: mutedBody }}
                  className="text-[10px] uppercase tracking-[0.22em]"
                >
                  Live number
                </p>
                <span
                  style={{ ...FONT_MONO, color: faintBody }}
                  className="text-[10px]"
                >
                  {line.country}
                </span>
              </div>
              <div className="mt-1.5 flex items-baseline gap-2">
                <span className="text-[18px] md:text-[20px]">{line.flag}</span>
                <AnimatePresence mode="wait">
                  <motion.span
                    key={`num-${line.route}`}
                    initial={{ opacity: 0, y: 6, filter: "blur(4px)" }}
                    animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                    exit={{ opacity: 0, y: -6, filter: "blur(4px)" }}
                    transition={{ duration: 0.35 }}
                    style={{ ...FONT_MONO, color: theme.heading }}
                    className="text-[17px] font-medium md:text-[20px] lg:text-[21px]"
                  >
                    {line.prefix}{" "}
                    <span style={{ color: mutedBody }}>••••</span>{" "}
                    <span style={{ color: theme.brand }}>{line.tail}</span>
                  </motion.span>
                </AnimatePresence>
              </div>
            </div>

            <div className="mt-6 md:mt-7">
              <div className="flex items-center justify-between">
                <p
                  style={{ ...FONT_MONO, color: mutedBody }}
                  className="text-[10px] uppercase tracking-[0.22em]"
                >
                  Incoming code
                </p>
                <span
                  style={{ ...FONT_MONO, color: mutedBody }}
                  className="text-[10px]"
                >
                  SMS · {String(revealed).padStart(2, "0")}/06
                </span>
              </div>

              <div className="mt-3 flex gap-2">
                {code.map((digit, i) => {
                  const shown = revealed > i;
                  return (
                    <div
                      key={`${cycle}-${i}`}
                      className="relative flex h-12 flex-1 items-center justify-center overflow-hidden rounded-md border text-[19px] font-semibold md:h-14 md:text-[22px]"
                      style={{
                        borderColor: shown ? brandLine : theme.border,
                        background: shown ? brandSoft : "transparent",
                        transformStyle: "preserve-3d",
                        animation: shown
                          ? "dt-flip 0.42s cubic-bezier(0.22,1,0.36,1) both"
                          : "none",
                      }}
                    >
                      {shown && (
                        <span
                          aria-hidden
                          className="pointer-events-none absolute inset-y-0 -left-1/2 w-1/2"
                          style={{
                            background: `linear-gradient(90deg, transparent, color-mix(in srgb, ${theme.brand} 35%, transparent), transparent)`,
                            animation: "dt-sweep 0.7s ease-out 1",
                          }}
                        />
                      )}
                      <span
                        style={{
                          ...FONT_MONO,
                          color: shown ? theme.heading : digitIdle,
                        }}
                      >
                        {shown ? digit : "•"}
                      </span>
                    </div>
                  );
                })}
              </div>

              <div className="mt-4 h-8">
                <AnimatePresence mode="wait">
                  {revealed >= 6 && (
                    <motion.div
                      key={`delivered-${cycle}`}
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -4 }}
                      transition={{ duration: 0.35 }}
                      className="flex items-center gap-2 rounded-md border px-3 py-1.5"
                      style={{
                        borderColor: successLine,
                        backgroundColor: successSoft,
                      }}
                    >
                      <CheckCircle2
                        className="h-3.5 w-3.5"
                        style={{ color: theme.success }}
                      />
                      <span
                        style={{ ...FONT_MONO, color: theme.success }}
                        className="text-[11px]"
                      >
                        Delivered in {deliverMs}s · {line.prefix.split(" ")[0]}{" "}
                        ·{" "}
                        {new Date().toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>
        </div>

        <div
          className="relative flex items-center justify-between border-t px-4 py-2.5 md:px-5 md:py-3"
          style={{ borderColor: theme.border }}
        >
          <AnimatePresence mode="wait">
            <motion.span
              key={`route-${line.route}`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              style={{ ...FONT_MONO, color: mutedBody }}
              className="text-[10px]"
            >
              route · {line.route}
            </motion.span>
          </AnimatePresence>
          <span className="flex items-center gap-1.5">
            <MessageSquare
              className="h-3 w-3"
              style={{ color: mutedBody }}
            />
            <span
              style={{ ...FONT_MONO, color: mutedBody }}
              className="text-[10px]"
            >
              sms + otp
            </span>
          </span>
        </div>
      </div>
    </motion.div>
  );
}
/* ------------------------------ hero -------------------------------- */

function Hero() {
  const feed = useLiveFeed(FEED_SEED, 2200);
  const active = feed[0];

  const countriesCount = useCountUp(150, 2000, 800);
  const deliveryRate = useCountUp(999, 2000, 1000);
  const avgDelivery = useCountUp(10, 2000, 1200);

  return (
    <section className="relative overflow-hidden bg-white">
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.05]"
        style={{
          backgroundImage:
            "linear-gradient(#7C3AED 1px, transparent 1px), linear-gradient(90deg, #7C3AED 1px, transparent 1px)",
          backgroundSize: "44px 44px",
        }}
      />
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 0.2, scale: 1 }}
        transition={{ duration: 1.5 }}
        className="pointer-events-none absolute -top-40 left-1/2 h-[520px] w-[900px] -translate-x-1/2 rounded-full opacity-20 blur-[110px]"
        style={{
          background: "radial-gradient(closest-side, #A855F7, transparent)",
        }}
      />

      <div className="relative mx-auto grid max-w-7xl gap-14 px-6 pb-20 pt-16 lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:pb-28 lg:pt-24 xl:max-w-[92rem] xl:gap-20 2xl:max-w-[105rem]">
        <motion.div
          initial={{ x: -30, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <motion.div
            className="mb-6 inline-flex items-center gap-2 rounded-full border border-[#E4D9F5] bg-[#F7F3FD] px-3 py-1.5"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.4 }}
          >
            <span className="relative flex h-1.5 w-1.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#9333EA] opacity-75" />
              <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-[#9333EA]" />
            </span>
            <span style={FONT_MONO} className="text-[12px] text-[#6E6280]">
              live across 150+ networks
            </span>
          </motion.div>

          <motion.h1
            style={FONT_DISPLAY}
            className="text-[40px] font-semibold leading-[1.08] tracking-tight text-[#1B1030] sm:text-[52px] lg:text-[58px] xl:text-[64px] 2xl:text-[72px]"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            Numbers the world answers to.
          </motion.h1>

          <motion.p
            className="mt-6 max-w-md text-[16px] leading-relaxed text-[#6E6280] xl:text-[17px]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.5 }}
          >
            Rent real, carrier-verified phone numbers. Receive OTP and SMS codes
            in seconds. Built for individuals verifying once and teams verifying
            at scale.
          </motion.p>

          <motion.div
            className="mt-9 flex flex-wrap items-center gap-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
          >
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              transition={{ type: "spring", stiffness: 400, damping: 17 }}
            >
              <Link
                to="/signup"
                className="flex items-center gap-2 rounded-md bg-[#7C3AED] px-5 py-3 text-[14px] font-medium text-white transition-colors hover:bg-[#6D28D9]"
              >
                Get your first number
                <ArrowRight className="h-4 w-4" />
              </Link>
            </motion.div>
            <motion.div
              whileHover={{ x: 3 }}
              transition={{ type: "spring", stiffness: 400, damping: 17 }}
            >
              <a
                href="#why"
                className="flex items-center gap-2 text-[14px] font-medium text-[#1B1030] transition-colors hover:text-[#7C3AED]"
              >
                Explore platform
                <ArrowUpRight className="h-4 w-4" />
              </a>
            </motion.div>
          </motion.div>

          <motion.dl
            className="mt-14 grid max-w-md grid-cols-3 gap-6 border-t border-[#E4D9F5] pt-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.8 }}
          >
            <div>
              <motion.dt
                style={FONT_DISPLAY}
                className="text-[24px] font-semibold text-[#1B1030] xl:text-[28px]"
                whileHover={{ scale: 1.05 }}
                transition={{ type: "spring", stiffness: 400, damping: 17 }}
              >
                {deliveryRate / 10}%
              </motion.dt>
              <dd className="mt-1 text-[13px] text-[#6E6280]">delivery rate</dd>
            </div>
            <div>
              <motion.dt
                style={FONT_DISPLAY}
                className="text-[24px] font-semibold text-[#1B1030] xl:text-[28px]"
                whileHover={{ scale: 1.05 }}
                transition={{ type: "spring", stiffness: 400, damping: 17 }}
              >
                &lt;{avgDelivery}s
              </motion.dt>
              <dd className="mt-1 text-[13px] text-[#6E6280]">avg. delivery</dd>
            </div>
            <div>
              <motion.dt
                style={FONT_DISPLAY}
                className="text-[24px] font-semibold text-[#1B1030] xl:text-[28px]"
                whileHover={{ scale: 1.05 }}
                transition={{ type: "spring", stiffness: 400, damping: 17 }}
              >
                {countriesCount}+
              </motion.dt>
              <dd className="mt-1 text-[13px] text-[#6E6280]">countries</dd>
            </div>
          </motion.dl>
        </motion.div>

        <div className="relative">
          <SignalOrbitArt />
          <HeroTerminalCard active={active} />
        </div>
      </div>
    </section>
  );
}

/* --------------------------- platform stats -------------------------- */

function PlatformStats() {
  const stats = [
    { icon: Globe2, value: "2.1M+", label: "numbers issued" },
    { icon: Radio, value: "150+", label: "countries supported" },
    { icon: ShieldCheck, value: "99.9%", label: "delivery success" },
    { icon: Gauge, value: "8.4s", label: "avg. OTP delivery" },
  ];
  return (
    <motion.section
      className="border-y border-[#E4D9F5] bg-[#F7F3FD]"
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6 }}
    >
      <div className="mx-auto grid max-w-7xl grid-cols-2 gap-px overflow-hidden rounded-none bg-[#E4D9F5] lg:grid-cols-4 lg:rounded-xl lg:my-10 lg:border lg:border-[#E4D9F5] xl:max-w-[92rem] 2xl:max-w-[105rem]">
        {stats.map(({ icon: Icon, value, label }, i) => (
          <motion.div
            key={label}
            className="bg-[#F7F3FD] px-6 py-8 lg:bg-white"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: i * 0.1 }}
          >
            <Icon className="h-4.5 w-4.5 text-[#9333EA]" />
            <motion.p
              style={FONT_DISPLAY}
              className="mt-4 text-[26px] font-semibold text-[#1B1030] xl:text-[30px]"
              whileHover={{ scale: 1.02 }}
              transition={{ type: "spring", stiffness: 400, damping: 17 }}
            >
              {value}
            </motion.p>
            <p className="mt-1 text-[13px] text-[#6E6280]">{label}</p>
          </motion.div>
        ))}
      </div>
    </motion.section>
  );
}

/* --------------------------- live activity ---------------------------- */

function LiveActivity() {
  const feed = useLiveFeed(FEED_SEED, 2400);
  return (
    <motion.section
      className="bg-white py-20"
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6 }}
    >
      <div className="mx-auto max-w-4xl px-6 xl:max-w-5xl">
        <motion.div
          className="mb-8 flex items-end justify-between"
          initial={{ y: -20, opacity: 0 }}
          whileInView={{ y: 0, opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <div>
            <h2
              style={FONT_DISPLAY}
              className="text-[26px] font-semibold text-[#1B1030] xl:text-[30px]"
            >
              The network, live
            </h2>
            <p className="mt-2 text-[14px] text-[#6E6280]">
              A real slice of verification traffic moving across the platform
              right now.
            </p>
          </div>
        </motion.div>

        <motion.div
          className="overflow-hidden rounded-lg border border-[#3B2465] bg-[#170B2E]"
          initial={{ y: 30, opacity: 0 }}
          whileInView={{ y: 0, opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <div className="flex items-center gap-2 border-b border-white/10 px-4 py-2.5">
            <span className="h-2 w-2 rounded-full bg-[#34D399]" />
            <span style={FONT_MONO} className="text-[11px] text-[#B9A9D9]">
              live_feed.log
            </span>
          </div>
          <ul style={FONT_MONO} className="divide-y divide-white/10">
            {feed.map((row, index) => (
              <motion.li
                key={row.id}
                className="flex items-center justify-between px-4 py-3 text-[12.5px] transition-colors"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
              >
                <span className="flex items-center gap-2.5 text-[#F5F0FF]">
                  <span>{row.flag}</span>
                  <span className="text-[#B9A9D9]">{row.country}</span>
                  <span>{row.number}</span>
                </span>
                <span className="flex items-center gap-4">
                  <span className="hidden text-[#B9A9D9] sm:inline">
                    {row.carrier}
                  </span>
                  <motion.span
                    className="text-[#C084FC]"
                    key={`time-${row.id}`}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.2 }}
                  >
                    {row.t === 0 ? "now" : `${row.t}s ago`}
                  </motion.span>
                </span>
              </motion.li>
            ))}
          </ul>
        </motion.div>
      </div>
    </motion.section>
  );
}

/* ---------------------------- how it works ---------------------------- */

function HowItWorks() {
  return (
    <motion.section
      id="how-it-works"
      className="bg-[#F7F3FD] py-24"
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6 }}
    >
      <div className="mx-auto max-w-7xl px-6 xl:max-w-[92rem] 2xl:max-w-[105rem]">
        <motion.div
          className="max-w-lg"
          initial={{ x: -30, opacity: 0 }}
          whileInView={{ x: 0, opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2
            style={FONT_DISPLAY}
            className="text-[32px] font-semibold text-[#1B1030] xl:text-[38px]"
          >
            How it works
          </h2>
          <p className="mt-3 text-[15px] text-[#6E6280]">
            Four steps between you and a verified account. No approval queue, no
            manual review.
          </p>
        </motion.div>

        <div className="mt-14 grid gap-px overflow-hidden rounded-xl border border-[#E4D9F5] bg-[#E4D9F5] sm:grid-cols-2 lg:grid-cols-4">
          {STEPS.map((s, i) => (
            <motion.div
              key={s.n}
              className="bg-white p-7"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              whileHover={{ y: -4, transition: { duration: 0.2 } }}
            >
              <span style={FONT_MONO} className="text-[13px] text-[#9333EA]">
                {s.n}
              </span>
              <h3
                style={FONT_DISPLAY}
                className="mt-4 text-[17px] font-semibold text-[#1B1030]"
              >
                {s.title}
              </h3>
              <p className="mt-2.5 text-[13.5px] leading-relaxed text-[#6E6280]">
                {s.body}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.section>
  );
}

/* ------------------------------ use cases ------------------------------ */

function UseCases() {
  return (
    <motion.section
      className="bg-white py-24"
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6 }}
    >
      <div className="mx-auto max-w-7xl px-6 xl:max-w-[92rem] 2xl:max-w-[105rem]">
        <motion.div
          className="max-w-lg"
          initial={{ x: -30, opacity: 0 }}
          whileInView={{ x: 0, opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2
            style={FONT_DISPLAY}
            className="text-[32px] font-semibold text-[#1B1030] xl:text-[38px]"
          >
            Built for how you'll actually use it
          </h2>
        </motion.div>

        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {USE_CASES.map(({ icon: Icon, title, body }, i) => (
            <motion.div
              key={title}
              className="rounded-lg border border-[#E4D9F5] bg-[#F7F3FD] p-6 transition-colors hover:border-[#7C3AED]/50"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.08 }}
              whileHover={{ y: -4, scale: 1.01, transition: { duration: 0.2 } }}
            >
              <Icon className="h-5 w-5 text-[#9333EA]" />
              <h3
                style={FONT_DISPLAY}
                className="mt-4 text-[15.5px] font-semibold text-[#1B1030]"
              >
                {title}
              </h3>
              <p className="mt-2 text-[13.5px] leading-relaxed text-[#6E6280]">
                {body}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.section>
  );
}

/* ---------------------------- why choose us ---------------------------- */

function WhyChooseUs() {
  return (
    <motion.section
      id="why"
      className="bg-[#F7F3FD] py-24"
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6 }}
    >
      <div className="mx-auto max-w-7xl px-6 xl:max-w-[92rem] 2xl:max-w-[105rem]">
        <motion.div
          className="max-w-lg"
          initial={{ x: -30, opacity: 0 }}
          whileInView={{ x: 0, opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2
            style={FONT_DISPLAY}
            className="text-[32px] font-semibold text-[#1B1030] xl:text-[38px]"
          >
            Why teams choose DigiTools
          </h2>
        </motion.div>

        <div className="mt-12 grid gap-x-8 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
          {WHY.map(({ icon: Icon, title, body }, i) => (
            <motion.div
              key={title}
              className="flex gap-4"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.08 }}
            >
              <Icon className="mt-0.5 h-5 w-5 shrink-0 text-[#9333EA]" />
              <div>
                <h3
                  style={FONT_DISPLAY}
                  className="text-[15px] font-semibold text-[#1B1030]"
                >
                  {title}
                </h3>
                <p className="mt-1.5 text-[13.5px] leading-relaxed text-[#6E6280]">
                  {body}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.section>
  );
}

/* ------------------------------ countries ------------------------------- */

function SignalBars({ confidence }) {
  const bars = Math.round((confidence / 100) * 4);
  return (
    <span className="flex items-end gap-[2px]">
      {[1, 2, 3, 4].map((i) => (
        <span
          key={i}
          className="w-[3px] rounded-sm"
          style={{
            height: `${i * 3 + 3}px`,
            backgroundColor: i <= bars ? "#9333EA" : "#E4D9F5",
          }}
        />
      ))}
    </span>
  );
}

function Countries() {
  const [region, setRegion] = useState("All");
  const filtered = useMemo(
    () =>
      region === "All"
        ? COUNTRIES
        : COUNTRIES.filter((c) => c.region === region),
    [region],
  );

  return (
    <motion.section
      id="countries"
      className="bg-white py-24"
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6 }}
    >
      <div className="mx-auto max-w-7xl px-6 xl:max-w-[92rem] 2xl:max-w-[105rem]">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <motion.div
            className="max-w-lg"
            initial={{ x: -30, opacity: 0 }}
            whileInView={{ x: 0, opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2
              style={FONT_DISPLAY}
              className="text-[32px] font-semibold text-[#1B1030] xl:text-[38px]"
            >
              Pick a network
            </h2>
            <p className="mt-3 text-[15px] text-[#6E6280]">
              Prices shown are for illustration. Live pricing is confirmed at
              checkout.
            </p>
          </motion.div>

          <motion.div
            className="flex flex-wrap gap-2"
            initial={{ opacity: 0, y: -10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: 0.2 }}
          >
            {REGIONS.map((r) => (
              <motion.button
                key={r}
                onClick={() => setRegion(r)}
                className={`rounded-md border px-3.5 py-1.5 text-[13px] transition-colors ${
                  region === r
                    ? "border-[#7C3AED] bg-[#7C3AED]/10 text-[#7C3AED]"
                    : "border-[#E4D9F5] text-[#6E6280] hover:text-[#1B1030]"
                }`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                transition={{ type: "spring", stiffness: 400, damping: 17 }}
              >
                {r}
              </motion.button>
            ))}
          </motion.div>
        </div>

        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {filtered.map((c, i) => (
            <motion.div
              key={c.name}
              className="flex flex-col justify-between rounded-lg border border-[#E4D9F5] bg-[#F7F3FD] p-5"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.05 }}
              whileHover={{
                y: -4,
                borderColor: "#7C3AED",
                transition: { duration: 0.2 },
              }}
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-[22px] text-gray-500">{c.flag}</span>
                  <SignalBars confidence={c.confidence} />
                </div>
                <h3
                  style={FONT_DISPLAY}
                  className="mt-3 text-[15.5px] font-semibold text-[#1B1030]"
                >
                  {c.name}
                </h3>
                <p
                  style={FONT_MONO}
                  className="mt-0.5 text-[12.5px] text-[#6E6280]"
                >
                  {c.dial} · {c.region}
                </p>

                <div className="mt-4 flex items-center justify-between text-[12.5px]">
                  <span className="text-[#1B1030]">{c.price}</span>
                  <span
                    className={
                      c.stock === "In stock"
                        ? "text-[#16A34A]"
                        : "text-[#D97706]"
                    }
                  >
                    {c.stock}
                  </span>
                </div>
                <p className="mt-1 text-[11.5px] text-[#6E6280]">
                  {c.confidence}% confidence
                </p>
              </div>

              <motion.div
                whileHover={{
                  scale: 1.02,
                  backgroundColor: "rgba(124,58,237,0.05)",
                }}
                whileTap={{ scale: 0.95 }}
                transition={{ type: "spring", stiffness: 400, damping: 17 }}
              >
                <Link
                  to={`/numbers/${encodeURIComponent(c.name.toLowerCase().replace(/\s+/g, "-"))}`}
                  className="mt-5 flex w-full items-center justify-center gap-1.5 rounded-md border border-[#E4D9F5] bg-white py-2 text-[13px] font-medium text-[#1B1030] transition-colors hover:border-[#7C3AED] hover:text-[#7C3AED]"
                >
                  Get number
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </motion.div>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.section>
  );
}

/* ----------------------------- testimonials ----------------------------- */

function Testimonials() {
  return (
    <motion.section
      className="bg-[#F7F3FD] py-24"
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6 }}
    >
      <div className="mx-auto max-w-7xl px-6 xl:max-w-[92rem] 2xl:max-w-[105rem]">
        <motion.h2
          style={FONT_DISPLAY}
          className="max-w-lg text-[32px] font-semibold text-[#1B1030] xl:text-[38px]"
          initial={{ x: -30, opacity: 0 }}
          whileInView={{ x: 0, opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          Teams running on DigiTools
        </motion.h2>

        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {TESTIMONIALS.map((t, i) => (
            <motion.div
              key={t.name}
              className="flex flex-col rounded-lg border border-[#E4D9F5] bg-white p-6"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.1 }}
              whileHover={{
                y: -4,
                borderColor: "#7C3AED",
                transition: { duration: 0.2 },
              }}
            >
              <div className="flex gap-0.5">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className="h-3.5 w-3.5 fill-[#9333EA] text-[#9333EA]"
                  />
                ))}
              </div>
              <p className="mt-4 flex-1 text-[13.5px] leading-relaxed text-[#1B1030]">
                "{t.body}"
              </p>
              <div className="mt-5 border-t border-[#E4D9F5] pt-4">
                <p className="text-[13px] font-medium text-[#1B1030]">
                  {t.name}
                </p>
                <p className="mt-0.5 text-[12px] text-[#6E6280]">{t.role}</p>
                <p
                  style={FONT_MONO}
                  className="mt-2 text-[11px] text-[#7C3AED]"
                >
                  {t.stat}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.section>
  );
}

/* --------------------------------- faq ---------------------------------- */

function FAQ() {
  const [openIdx, setOpenIdx] = useState(0);
  return (
    <motion.section
      id="faq"
      className="bg-white py-24"
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6 }}
    >
      <div className="mx-auto max-w-3xl px-6">
        <motion.h2
          style={FONT_DISPLAY}
          className="text-[32px] font-semibold text-[#1B1030] xl:text-[38px]"
          initial={{ x: -30, opacity: 0 }}
          whileInView={{ x: 0, opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          Questions, answered
        </motion.h2>

        <div className="mt-10 divide-y divide-[#E4D9F5] border-y border-[#E4D9F5]">
          {FAQS.map((f, i) => {
            const isOpen = openIdx === i;
            return (
              <motion.div
                key={f.q}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.3, delay: i * 0.05 }}
              >
                <button
                  onClick={() => setOpenIdx(isOpen ? -1 : i)}
                  className="flex w-full items-center justify-between py-5 text-left"
                >
                  <motion.span
                    className="text-[15px] font-medium text-[#1B1030]"
                    whileHover={{ x: 3 }}
                    transition={{ type: "spring", stiffness: 400, damping: 17 }}
                  >
                    {f.q}
                  </motion.span>
                  <motion.div
                    animate={{ rotate: isOpen ? 180 : 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <ChevronDown className="h-4 w-4 shrink-0 text-[#6E6280]" />
                  </motion.div>
                </button>
                <AnimatePresence>
                  {isOpen && (
                    <motion.p
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.3 }}
                      className="pb-5 pr-8 text-[14px] leading-relaxed text-[#6E6280]"
                    >
                      {f.a}
                    </motion.p>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>
      </div>
    </motion.section>
  );
}

/* ------------------------------- final cta ------------------------------- */

function FinalCTA() {
  return (
    <motion.section
      className="relative overflow-hidden bg-[#F7F3FD] py-24"
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6 }}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        whileInView={{ opacity: 0.25, scale: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 1.5 }}
        className="pointer-events-none absolute left-1/2 top-0 h-[300px] w-[700px] -translate-x-1/2 rounded-full opacity-25 blur-[110px]"
        style={{
          background: "radial-gradient(closest-side, #A855F7, transparent)",
        }}
      />
      <div className="relative mx-auto max-w-3xl px-6 text-center">
        <motion.h2
          style={FONT_DISPLAY}
          className="text-[34px] font-semibold leading-tight text-[#1B1030] sm:text-[42px] xl:text-[48px]"
          initial={{ y: 20, opacity: 0 }}
          whileInView={{ y: 0, opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          Get a number. Get verified. Get moving.
        </motion.h2>
        <motion.p
          className="mt-4 text-[15px] text-[#6E6280]"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          Set up takes under a minute. Your first verification can happen right
          after.
        </motion.p>
        <motion.div
          className="mt-9 flex flex-wrap items-center justify-center gap-4"
          initial={{ y: 20, opacity: 0 }}
          whileInView={{ y: 0, opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            transition={{ type: "spring", stiffness: 400, damping: 17 }}
          >
            <Link
              to="/signup"
              className="flex items-center gap-2 rounded-md bg-[#7C3AED] px-6 py-3 text-[14px] font-medium text-white transition-colors hover:bg-[#6D28D9]"
            >
              Get your first number
              <ArrowRight className="h-4 w-4" />
            </Link>
          </motion.div>
          <motion.div
            whileHover={{ x: 3 }}
            transition={{ type: "spring", stiffness: 400, damping: 17 }}
          >
            <a
              href="#countries"
              className="text-[14px] font-medium text-[#1B1030] hover:text-[#7C3AED]"
            >
              Explore numbers
            </a>
          </motion.div>
        </motion.div>
      </div>
    </motion.section>
  );
}

/* --------------------------------- footer --------------------------------- */

function Footer() {
  const columns = [
    {
      title: "Product",
      links: [
        { label: "Numbers", href: "#countries" },
        { label: "Platform", href: "#why" },
        { label: "How it works", href: "#how-it-works" },
      ],
    },
    {
      title: "Company",
      links: [
        { label: "About", href: "/about" },
        { label: "FAQ", href: "#faq" },
        { label: "Support", href: "/support" },
      ],
    },
    {
      title: "Legal",
      links: [
        { label: "Terms of service", href: "/terms" },
        { label: "Privacy policy", href: "/Privacy" }
      ],
    },
  ];
  const socials = [
    { Icon: FaXTwitter, label: "X", href: "https://x.com/" },
    {
      Icon: FaLinkedinIn,
      label: "LinkedIn",
      href: "https://www.linkedin.com/",
    },
    { Icon: FaDiscord, label: "Discord", href: "https://discord.com/" },
    { Icon: FaGithub, label: "GitHub", href: "https://github.com/" },
  ];

  return (
    <motion.footer
      className="border-t border-[#E4D9F5] bg-white"
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6 }}
    >
      <div className="mx-auto max-w-7xl px-6 py-16 xl:max-w-[92rem] 2xl:max-w-[105rem]">
        <div className="grid gap-12 lg:grid-cols-[1.4fr_1fr_1fr_1fr]">
          <div>
            <motion.div
              className="flex items-center gap-2.5"
              whileHover={{ scale: 1.02 }}
              transition={{ type: "spring", stiffness: 400, damping: 17 }}
            >
              <Link to="/" className="flex items-center gap-2.5">
               
            <img src={imageObject.Logo} className='rounded-sm h-[50px] w-[150px]' />
               
              </Link>
            </motion.div>
            <p className="mt-4 max-w-xs text-[13.5px] leading-relaxed text-[#6E6280]">
              Carrier-verified phone numbers for verification, testing and
              identity flows — delivered in seconds, visible the whole way.
            </p>
            <div className="mt-6 flex gap-3">
              {socials.map(({ Icon, label, href }) => (
                <motion.a
                  key={label}
                  href={href}
                  aria-label={label}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex h-8 w-8 items-center justify-center rounded-md border border-[#E4D9F5] text-[#6E6280] transition-colors hover:border-[#7C3AED] hover:text-[#7C3AED]"
                  whileHover={{ scale: 1.1, y: -2 }}
                  transition={{ type: "spring", stiffness: 400, damping: 17 }}
                >
                  <Icon className="h-3.5 w-3.5" />
                </motion.a>
              ))}
            </div>
          </div>

          {columns.map((col) => (
            <div key={col.title}>
              <h4 className="text-[13px] font-medium text-[#1B1030]">
                {col.title}
              </h4>
              <ul className="mt-4 space-y-3">
                {col.links.map((l) => (
                  <li key={l.label}>
                    <motion.div
                      whileHover={{ x: 3 }}
                      transition={{
                        type: "spring",
                        stiffness: 400,
                        damping: 17,
                      }}
                    >
                      <SmartNavLink
                        href={l.href}
                        className="text-[13.5px] text-[#6E6280] hover:text-[#1B1030]"
                      >
                        {l.label}
                      </SmartNavLink>
                    </motion.div>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-14 flex flex-col gap-3 border-t border-[#E4D9F5] pt-6 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-[12.5px] text-[#6E6280]">
            © {new Date().getFullYear()} DigiTools. All rights reserved.
          </p>
        </div>
      </div>
    </motion.footer>
  );
}

/* -------------------------------- page -------------------------------- */

export default function DigiToolsHomepage() {
  const location = useLocation();
  const navigate = useNavigate();

  // Handle hash scrolling on initial load / when hash changes
  useEffect(() => {
    if (location.hash) {
      const id = location.hash.replace("#", "");
      const el = document.getElementById(id);
      if (el) {
        setTimeout(() => {
          el.scrollIntoView({ behavior: "smooth", block: "start" });
        }, 100);
      }
    }
  }, [location]);

  // Intercept in-page hash clicks for smooth scroll + URL update
  useEffect(() => {
    const handleHashClick = (e) => {
      const target = e.target.closest('a[href^="#"]');
      if (!target) return;
      const hash = target.getAttribute("href");
      if (!hash || hash === "#") return;
      const id = hash.replace("#", "");
      const el = document.getElementById(id);
      if (el) {
        e.preventDefault();
        el.scrollIntoView({ behavior: "smooth", block: "start" });
        // Update the URL without triggering a full navigation
        window.history.replaceState(null, "", hash);
      }
    };
    document.addEventListener("click", handleHashClick);
    return () => document.removeEventListener("click", handleHashClick);
  }, []);

  return (
    <div className="landing-page bg-white">
      <Navbar />
      <Hero />
      <PlatformStats />
      <LiveActivity />
      <HowItWorks />
      <UseCases />
      <WhyChooseUs />
      <Countries />
      <Testimonials />
      <FAQ />
      <FinalCTA />
      <Footer />
    </div>
  );
}
