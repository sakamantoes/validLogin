/**
 * VALIDLOGIN — Landing page (single file) — dark marketplace design
 *
 * index.html <head> (or keep the @import in index.css):
 *   <link rel="preconnect" href="https://fonts.googleapis.com">
 *   <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=JetBrains+Mono:wght@500;600&display=swap" rel="stylesheet">
 *
 * Deps: react, framer-motion, lucide-react, react-router-dom (<Link> only; swap for <a> if unused)
 *
 * Accent: the design is built on ONE accent colour (ACCENT / ACCENT_2 below).
 * Brand blue is the default. For the orange look of the reference screenshot,
 * use the ORANGE PRESET values in the comment under the palette.
 */
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  motion, AnimatePresence, MotionConfig, useScroll, useSpring, animate, useInView,
} from "framer-motion";
import {
  Menu, X, ChevronDown, ArrowRight, ArrowUpRight, Smartphone, TrendingUp, Star,
  Check, ShieldCheck, Zap, Building2, User, Plus, Minus, KeyRound, Users, Globe2,
  Search, Wallet, Code2, Signal, Clock, MapPin, CheckCircle2,
} from "lucide-react";
import imageObject from "../utils/image";

const F = { fontFamily: "'Plus Jakarta Sans', ui-sans-serif, system-ui, sans-serif" };
const MONO = { fontFamily: "'JetBrains Mono', ui-monospace, monospace" };

/* ------------------------------ palette ------------------------------ */
const ACCENT = "#2563EB";
const ACCENT_2 = "#60A5FA";
const D_BG = "#05070D";
const D_SURFACE = "#0A0E18";
const D_SURFACE_2 = "#0F1522";
const D_BORDER = "rgba(255,255,255,0.08)";
const D_TEXT = "#F3F6FB";
const D_TEXT_SOFT = "#9AA7BD";
const D_TEXT_DIM = "#5F6B80";
/* ORANGE PRESET (matches the reference screenshot exactly):
   ACCENT "#F0561D" · ACCENT_2 "#FF8A4C" · D_BG "#0B0807" · D_SURFACE "#120D0B"
   D_SURFACE_2 "#17110F" · D_TEXT "#F5EFEA" · D_TEXT_SOFT "#A89E97" · D_TEXT_DIM "#6F655F" */
const A = (hex) => ACCENT + hex; // accent with alpha, e.g. A("22")

/* ------------------------------ data ------------------------------ */

const NAV = [
  { label: "Customer Stories", href: "#stories" },
  { label: "Resources", href: "#faq" },
  { label: "Pricing", href: "#pricing" },
];
const PRODUCTS = [
  { label: "Virtual Numbers", href: "#numbers" },
  { label: "Coverage", href: "#coverage" },
  { label: "Business Tools", href: "#pricing" },
];
const BRANDS = ["WhatsApp", "Telegram", "Instagram", "TikTok", "Facebook", "Snapchat", "X", "YouTube"];
const INBOX = [
  { f: "🇺🇸", app: "WhatsApp", code: "482 913" }, { f: "🇬🇧", app: "Telegram", code: "907 341" },
  { f: "🇳🇬", app: "Instagram", code: "158 276" }, { f: "🇩🇪", app: "TikTok", code: "630 925" },
  { f: "🇰🇪", app: "Telegram", code: "714 802" },
];
const STEPS = [
  { t: "Create your account", b: "Sign up with your email and fund your wallet in naira by transfer or card." },
  { t: "Choose what you need", b: "Pick a number by country and app, or a boost by platform, service and quantity." },
  { t: "Receive or track", b: "Your SMS code lands live in the dashboard. Boost orders show progress in real time." },
  { t: "Finish or reorder", b: "Numbers are released after use. Any order can be repeated in one tap." },
];
const APPS = ["WhatsApp", "Telegram", "Instagram", "TikTok"];
const APP_MULT = { WhatsApp: 1.4, Telegram: 1, Instagram: 1.2, TikTok: 1.1 };
const COUNTRIES = [
  { f: "🇳🇬", n: "Nigeria", d: "+234", p: 700, s: "In stock" }, { f: "🇺🇸", n: "United States", d: "+1", p: 900, s: "In stock" },
  { f: "🇬🇧", n: "United Kingdom", d: "+44", p: 1100, s: "In stock" }, { f: "🇮🇳", n: "India", d: "+91", p: 800, s: "Limited" },
  { f: "🇩🇪", n: "Germany", d: "+49", p: 1300, s: "In stock" }, { f: "🇰🇪", n: "Kenya", d: "+254", p: 1000, s: "In stock" },
];
const COVERAGE = {
  "Nigeria": { f: "🇳🇬", d: "+234", speed: "3–6s", stock: 1240, price: 700, apps: ["WhatsApp", "Telegram", "Instagram"], carriers: ["MTN", "Airtel", "Glo"], load: 18 },
  "United States": { f: "🇺🇸", d: "+1", speed: "4–8s", stock: 2310, price: 900, apps: ["WhatsApp", "Telegram", "Instagram", "TikTok"], carriers: ["AT&T", "T-Mobile", "Verizon"], load: 34 },
  "United Kingdom": { f: "🇬🇧", d: "+44", speed: "5–10s", stock: 870, price: 1100, apps: ["WhatsApp", "Telegram", "Instagram"], carriers: ["EE", "O2", "Vodafone"], load: 42 },
  "India": { f: "🇮🇳", d: "+91", speed: "6–12s", stock: 640, price: 800, apps: ["WhatsApp", "Telegram"], carriers: ["Jio", "Airtel"], load: 61 },
  "Germany": { f: "🇩🇪", d: "+49", speed: "4–9s", stock: 1120, price: 1300, apps: ["WhatsApp", "Telegram", "Instagram", "TikTok"], carriers: ["Telekom", "Vodafone", "O2"], load: 27 },
  "Kenya": { f: "🇰🇪", d: "+254", speed: "3–7s", stock: 980, price: 1000, apps: ["WhatsApp", "Telegram", "Instagram"], carriers: ["Safaricom", "Airtel"], load: 22 },
};
const RECENT = [
  { f: "🇺🇸", app: "WhatsApp", s: "delivered" }, { f: "🇬🇧", app: "Telegram", s: "delivered" },
  { f: "🇳🇬", app: "Instagram", s: "delivered" }, { f: "🇩🇪", app: "TikTok", s: "delivered" },
  { f: "🇰🇪", app: "Telegram", s: "delivered" }, { f: "🇮🇳", app: "WhatsApp", s: "delivered" },
];
const AUD = {
  Individuals: { pts: ["Pay per order, no subscription", "Private numbers, released after use", "Fund by transfer or card", "Automatic refund when a code fails"], big: "₦700", sub: "per number, from", cta: "Start as an individual" },
  Business: { pts: ["Bulk pricing from 100 numbers", "Team seats with spend limits", "REST API and webhooks", "Dedicated account manager"], big: "Custom", sub: "volume pricing", cta: "Talk to sales" },
};
const STORIES = [
  { n: "Amaka O.", r: "Agency owner, Lagos", q: "We onboard client accounts in minutes now. The refund on failed codes alone saves my team hours." },
  { n: "Tunde A.", r: "Reseller", q: "The API plugged into our panel in an afternoon. Codes arrive faster than anything I have used." },
  { n: "Sarah K.", r: "Creator", q: "I tested the boost on a small account first. Delivery was steady and nothing looked forced." },
];
const FAQS = [
  { q: "How fast do I get my code?", a: "Most codes arrive within seconds and appear live in your dashboard." },
  { q: "What if the code never arrives?", a: "Cancel the number and the amount returns to your wallet automatically." },
  { q: "Are boosts safe for my account?", a: "We never ask for your password. Orders use only your public profile link, and delivery is paced to look natural." },
  { q: "Can businesses buy in bulk?", a: "Yes. Business accounts get bulk pricing, team seats and API access." },
];

/* ---------------------------- primitives --------------------------- */

const naira = (n) => "₦" + Math.round(n).toLocaleString("en-NG");
const rnd = () => { const s = String(Math.floor(100000 + Math.random() * 900000)); return s.slice(0, 3) + " " + s.slice(3); };

function Reveal({ children, delay = 0, className = "" }) {
  return (
    <motion.div className={className} initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }} transition={{ duration: 0.55, delay, ease: [0.22, 1, 0.36, 1] }}>
      {children}
    </motion.div>
  );
}

function Heading({ title, sub, left }) {
  return (
    <Reveal className={left ? "max-w-xl" : "mx-auto max-w-2xl text-center"}>
      <h2 className="text-[30px] font-bold leading-[1.1] tracking-tight sm:text-[42px]" style={{ ...F, color: D_TEXT }}>{title}</h2>
      {sub && <p className="mt-3 text-[15px] leading-relaxed" style={{ color: D_TEXT_SOFT }}>{sub}</p>}
    </Reveal>
  );
}

function Seg({ id, options, value, onChange }) {
  return (
    <div className="inline-flex flex-wrap gap-1 rounded-full border p-1" style={{ borderColor: D_BORDER, background: D_SURFACE }}>
      {options.map((o) => (
        <button key={o} onClick={() => onChange(o)} className="relative rounded-full px-4 py-1.5 text-[13px] font-semibold" style={{ color: value === o ? "#fff" : D_TEXT_SOFT }}>
          {value === o && <motion.span layoutId={id} className="absolute inset-0 rounded-full" style={{ background: ACCENT }} transition={{ type: "spring", stiffness: 400, damping: 32 }} />}
          <span className="relative">{o}</span>
        </button>
      ))}
    </div>
  );
}

function Count({ to, suffix = "", decimals = 0 }) {
  const ref = React.useRef(null);
  const inView = useInView(ref, { once: true });
  const [v, setV] = useState(0);
  useEffect(() => {
    if (!inView) return;
    const c = animate(0, to, { duration: 1.8, ease: "easeOut", onUpdate: setV });
    return () => c.stop();
  }, [inView, to]);
  return <span ref={ref}>{v.toLocaleString("en-NG", { minimumFractionDigits: decimals, maximumFractionDigits: decimals })}{suffix}</span>;
}

function Money({ value }) {
  const [v, setV] = useState(value);
  const prev = React.useRef(value);
  useEffect(() => {
    const c = animate(prev.current, value, { duration: 0.5, onUpdate: setV });
    prev.current = value;
    return () => c.stop();
  }, [value]);
  return <>{naira(v)}</>;
}

function Marquee({ children, reverse = false, speed = 40 }) {
  const mask = "linear-gradient(90deg,transparent,#000 6%,#000 94%,transparent)";
  return (
    <div className="overflow-hidden" style={{ maskImage: mask, WebkitMaskImage: mask }}>
      <motion.div className="flex w-max gap-4" animate={{ x: reverse ? ["-50%", "0%"] : ["0%", "-50%"] }} transition={{ duration: speed, repeat: Infinity, ease: "linear" }}>
        {children}{children}
      </motion.div>
    </div>
  );
}

/* ------------------------------- nav ------------------------------- */

function Logo() {
  return (
    <Link to="/" className="flex items-center gap-2.5 mt-[5px]">
      <img src={imageObject.Logo} alt="ValidLogin" className="h-[90px] w-[100px]" />
    </Link>
  );
}

function Navbar() {
  const [open, setOpen] = useState(false);
  const [prod, setProd] = useState(false);
  const [sc, setSc] = useState(false);
  useEffect(() => {
    const f = () => setSc(window.scrollY > 12);
    f();
    window.addEventListener("scroll", f, { passive: true });
    return () => window.removeEventListener("scroll", f);
  }, []);
  return (
    <header className="sticky top-0 z-50 backdrop-blur-xl transition-all h-[100px]" style={{ background: sc ? "rgba(5,7,13,0.85)" : "rgba(5,7,13,0.5)", borderBottom: `1px solid ${sc ? D_BORDER : "transparent"}` }}>
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-5 md:grid md:grid-cols-[1fr_auto_1fr]">
        <Logo />
        <nav style={F} className="hidden items-center gap-8 text-[13.5px] md:flex">
          <div className="relative" onMouseEnter={() => setProd(true)} onMouseLeave={() => setProd(false)}>
            <button className="flex items-center gap-1 font-medium transition-colors hover:text-white" style={{ color: D_TEXT_SOFT }}>
              Products <ChevronDown className={`h-3.5 w-3.5 transition-transform ${prod ? "rotate-180" : ""}`} />
            </button>
            <AnimatePresence>
              {prod && (
                <motion.ul initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 6 }} transition={{ duration: 0.15 }}
                  className="absolute left-0 top-full w-52 rounded-2xl border p-1.5 shadow-xl" style={{ borderColor: D_BORDER, background: D_SURFACE }}>
                  {PRODUCTS.map((p) => (
                    <li key={p.label}><a href={p.href} className="block rounded-xl px-3 py-2 text-[13px] font-medium transition-colors hover:bg-white/5" style={{ color: D_TEXT }}>{p.label}</a></li>
                  ))}
                </motion.ul>
              )}
            </AnimatePresence>
          </div>
          {NAV.map((l) => <a key={l.label} href={l.href} className="font-medium transition-colors hover:text-white" style={{ color: D_TEXT_SOFT }}>{l.label}</a>)}
        </nav>
        <div style={F} className="hidden items-center justify-end gap-5 md:flex">
          <Link to="/login" className="text-[13.5px] font-medium transition-colors hover:text-white" style={{ color: D_TEXT_SOFT }}>Sign in</Link>
          <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}>
            <Link to="/signup" className="rounded-full px-5 py-2 text-[13px] font-semibold text-white" style={{ background: ACCENT }}>Get Started</Link>
          </motion.div>
        </div>
        <button className="md:hidden" onClick={() => setOpen((v) => !v)} aria-label="Toggle menu" style={{ color: D_TEXT }}>
          {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>
      <AnimatePresence>
        {open && (
          <motion.div initial={{ height: 0 }} animate={{ height: "auto" }} exit={{ height: 0 }} className="overflow-hidden border-t md:hidden" style={{ borderColor: D_BORDER, background: D_SURFACE }}>
            <div style={F} className="flex flex-col gap-4 px-5 py-5 text-[14px] font-medium">
              {[...PRODUCTS, ...NAV].map((l) => <a key={l.label} href={l.href} onClick={() => setOpen(false)} style={{ color: D_TEXT }}>{l.label}</a>)}
              <Link to="/signup" className="rounded-full py-2.5 text-center text-white" style={{ background: ACCENT }}>Get Started</Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}

/* ------------------------------- hero ------------------------------ */

function WalletPanel() {
  const [tab, setTab] = useState("WhatsApp");
  const [code, setCode] = useState("482 913");
  useEffect(() => { const t = setInterval(() => setCode(rnd()), 3600); return () => clearInterval(t); }, []);
  return (
    <div className="relative mx-auto w-full max-w-[460px] lg:mx-0 lg:ml-auto">
      <motion.div
        initial={{ opacity: 0, y: 30, rotateY: -18 }} animate={{ opacity: 1, y: 0, rotateY: -8 }} whileHover={{ rotateY: 0, rotateX: 0 }}
        transition={{ duration: 0.8, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
        style={{ transformPerspective: 1200, rotateX: 3, background: `linear-gradient(160deg,${D_SURFACE_2},${D_BG})`, border: `1px solid ${D_BORDER}`, boxShadow: `0 40px 90px -40px ${A("99")}` }}
        className="rounded-[28px] p-5"
      >
        <p className="flex items-center gap-2 text-[13px] font-semibold" style={{ color: D_TEXT }}>
          <Wallet className="h-4 w-4" style={{ color: ACCENT_2 }} />Naira wallet
        </p>
        <p className="mt-1 text-[10.5px] font-semibold tracking-wide" style={{ color: D_TEXT_DIM }}>Fund by transfer or card. Refunds land here instantly.</p>

        <div className="relative mt-4 overflow-hidden rounded-2xl p-5" style={{ background: `linear-gradient(135deg,${ACCENT},${ACCENT_2})` }}>
          <div className="pointer-events-none absolute -right-8 -top-8 h-32 w-32 rounded-full bg-white/15 blur-xl" />
          <p className="relative text-[11px] font-medium text-white/80">Naira wallet</p>
          <p className="relative mt-1 text-[30px] font-extrabold leading-none text-white">₦<Count to={125000} /></p>
          <div className="relative mt-6 flex items-end justify-between">
            <p className="text-[11px] text-white/80">Fund by transfer or card.</p>
            <span className="flex items-center gap-1 rounded-full bg-black/25 px-3 py-1.5 text-[11px] font-semibold text-white backdrop-blur"><Plus className="h-3 w-3" />Transfer</span>
          </div>
        </div>

        <div className="mt-4 flex gap-2">
          {APPS.slice(0, 3).map((a) => (
            <button key={a} onClick={() => setTab(a)} className="rounded-full border px-3 py-1.5 text-[11px] font-semibold transition-colors"
              style={{ borderColor: tab === a ? ACCENT_2 : D_BORDER, background: tab === a ? A("22") : "transparent", color: tab === a ? D_TEXT : D_TEXT_SOFT }}>{a}</button>
          ))}
        </div>

        <div className="mt-3 rounded-2xl border p-3.5" style={{ borderColor: D_BORDER, background: D_BG }}>
          <p className="text-[11px]" style={{ color: D_TEXT_SOFT }}>New number · <span style={{ ...MONO, color: D_TEXT }}>+1 202 555 0191</span></p>
          <div className="mt-2 flex items-center justify-between">
            <AnimatePresence mode="wait">
              <motion.span key={code + tab} style={{ ...MONO, color: D_TEXT }} className="text-[18px] font-semibold tracking-[0.14em]"
                initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.2 }}>{code}</motion.span>
            </AnimatePresence>
            <span className="flex items-center gap-1 rounded-full px-2 py-1 text-[10px] font-bold" style={{ background: "rgba(52,211,153,0.12)", color: "#34D399" }}><Check className="h-3 w-3" />Received</span>
          </div>
        </div>
        <div className="h-14" />
      </motion.div>

      <motion.div className="absolute -right-3 -top-5 sm:-right-5" initial={{ opacity: 0, scale: 0.6, rotate: 0 }} animate={{ opacity: 1, scale: 1, rotate: 12 }} transition={{ duration: 0.6, delay: 0.9 }}>
        <motion.span animate={{ y: [0, -8, 0] }} transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
          className="flex h-14 w-14 items-center justify-center rounded-2xl border-[3px] border-white" style={{ background: `linear-gradient(135deg,${ACCENT_2},${ACCENT})`, boxShadow: `0 20px 40px -12px ${A("99")}` }}>
          <KeyRound className="h-6 w-6 text-white" strokeWidth={2.5} />
        </motion.span>
      </motion.div>

      <motion.div className="absolute -bottom-2 right-2 sm:-right-4" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 1.1 }}>
        <motion.div animate={{ y: [0, -6, 0] }} transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
          className="flex items-center gap-3 rounded-2xl border px-4 py-3 backdrop-blur" style={{ borderColor: D_BORDER, background: "rgba(15,21,34,0.9)", boxShadow: "0 24px 50px -20px rgba(0,0,0,0.8)" }}>
          <span className="flex h-9 w-9 items-center justify-center rounded-full" style={{ background: A("26") }}><CheckCircle2 className="h-5 w-5" style={{ color: ACCENT_2 }} /></span>
          <span><span className="block text-[12.5px] font-bold" style={{ color: D_TEXT }}>Received</span><span className="block text-[10.5px]" style={{ color: D_TEXT_SOFT }}>Codes land the second they are sent.</span></span>
        </motion.div>
      </motion.div>
    </div>
  );
}

function Ticker() {
  const items = [
    ...COUNTRIES.map((c) => ({ k: c.n, l: `${c.f} ${c.n}`, p: naira(c.p) })),
    ...BRANDS.map((b) => ({ k: b, l: b, p: null })),
  ];
  return (
    <div className="mx-auto max-w-6xl px-5">
      <div className="flex items-center gap-4 overflow-hidden rounded-2xl border px-4 py-3" style={{ borderColor: D_BORDER, background: D_SURFACE }}>
        <span className="flex shrink-0 items-center gap-2 text-[11px] font-bold tracking-widest" style={{ color: D_TEXT_SOFT }}>
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[#34D399]" />LIVE
        </span>
        <div className="min-w-0 flex-1">
          <Marquee speed={45}>
            {items.map((it) => (
              <span key={it.k} className="flex items-center gap-2 whitespace-nowrap text-[12.5px] font-medium" style={{ color: D_TEXT }}>
                {it.l}{it.p && <span style={{ ...MONO, color: D_TEXT_DIM }}>{it.p}</span>}
                <span className="ml-2" style={{ color: D_BORDER }}>|</span>
              </span>
            ))}
          </Marquee>
        </div>
      </div>
    </div>
  );
}

function Hero() {
  return (
    <section className="relative overflow-hidden" style={{ ...F, background: D_BG }}>
      <div className="pointer-events-none absolute -right-40 -top-20 h-[560px] w-[560px] rounded-full opacity-40 blur-[120px]" style={{ background: `radial-gradient(closest-side,${ACCENT},transparent)` }} />
      <div className="relative mx-auto grid max-w-6xl items-center gap-14 px-5 pb-16 pt-14 lg:grid-cols-[1.05fr_1fr] lg:pb-24 lg:pt-20">
        <div>
          <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            className="text-[42px] font-bold leading-[1.04] tracking-[-0.035em] sm:text-[62px]" style={{ color: D_TEXT }}>
            Virtual Numbers & Social<br /><span style={{ color: ACCENT_2 }}>Growth Right Away</span>
          </motion.h1>
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.6, delay: 0.2 }}
            className="mt-6 max-w-md text-[15px] leading-relaxed" style={{ color: D_TEXT_SOFT }}>
            From first signup to thousands of followers, buy verified numbers and social media accounts for your personal and business accounts, instantly.
          </motion.p>
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.35 }} className="mt-8 flex flex-wrap items-center gap-3">
            <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
              <Link to="/signup" className="flex items-center gap-5 rounded-2xl px-5 py-3.5 text-[14px] font-semibold text-white" style={{ background: ACCENT, boxShadow: `0 14px 30px -12px ${A("AA")}` }}>
                Buy a Number
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-white/20"><ArrowUpRight className="h-4 w-4" /></span>
              </Link>
            </motion.div>
            <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
              <a href="#coverage" className="block rounded-2xl border px-6 py-3.5 text-[14px] font-semibold transition-colors hover:bg-white/5" style={{ borderColor: D_BORDER, color: D_TEXT }}>View Coverage</a>
            </motion.div>
          </motion.div>
          <motion.ul initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.6, delay: 0.55 }} className="mt-8 flex flex-wrap gap-x-6 gap-y-2 text-[12px]" style={{ color: D_TEXT_DIM }}>
            {[[ShieldCheck, "Refund if a code fails"], [Users, "Private, single-use numbers"], [Globe2, "50+ countries available"]].map(([I, t]) => (
              <li key={t} className="flex items-center gap-1.5"><I className="h-3.5 w-3.5" style={{ color: ACCENT_2 }} />{t}</li>
            ))}
          </motion.ul>
        </div>
        <WalletPanel />
      </div>
      <Ticker />
      <div className="h-10" />
    </section>
  );
}

/* --------------------------- services list ------------------------- */

function Inbox() {
  const [n, setN] = useState(4);
  useEffect(() => { const t = setInterval(() => setN((v) => v + 1), 2400); return () => clearInterval(t); }, []);
  const rows = [0, 1, 2, 3].map((i) => ({ ...INBOX[(((n - i) % 5) + 5) % 5], id: n - i }));
  return (
    <ul className="space-y-2">
      <AnimatePresence initial={false}>
        {rows.map((r, i) => (
          <motion.li layout key={r.id} initial={{ opacity: 0, y: -18, scale: 0.97 }} animate={{ opacity: 1 - i * 0.18, y: 0, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
            transition={{ type: "spring", stiffness: 300, damping: 28 }} className="flex items-center justify-between rounded-2xl border px-4 py-3" style={{ borderColor: D_BORDER, background: D_SURFACE_2 }}>
            <span className="flex items-center gap-3"><span className="text-[20px]">{r.f}</span>
              <span><span className="block text-[13px] font-semibold" style={{ color: D_TEXT }}>{r.app}</span><span className="block text-[11px]" style={{ color: D_TEXT_SOFT }}>{i === 0 ? "just now" : `${i * 2 + 1}s ago`}</span></span></span>
            <span className="flex items-center gap-2">
              <span style={{ ...MONO, color: D_TEXT }} className="text-[15px] font-semibold tracking-[0.12em]">{r.code}</span>
              {i === 0 && <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[#34D399]" />}
            </span>
          </motion.li>
        ))}
      </AnimatePresence>
    </ul>
  );
}

function GrowthChart() {
  return (
    <div>
      <p className="text-[34px] font-extrabold leading-none" style={{ color: D_TEXT }}>+312%</p>
      <p className="mt-1 text-[12.5px] font-semibold" style={{ color: D_TEXT_SOFT }}>followers in 30 days</p>
      <svg viewBox="0 0 300 110" className="mt-4 w-full max-w-md" aria-hidden>
        <defs><linearGradient id="vlg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor={ACCENT} stopOpacity="0.4" /><stop offset="1" stopColor={ACCENT} stopOpacity="0" /></linearGradient></defs>
        <path d="M0 100 C40 96 60 80 90 78 S140 60 170 48 S230 30 300 8 L300 110 L0 110Z" fill="url(#vlg)" />
        <motion.path d="M0 100 C40 96 60 80 90 78 S140 60 170 48 S230 30 300 8" fill="none" stroke={ACCENT_2} strokeWidth="2.5" strokeLinecap="round" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 1.4, ease: "easeOut" }} />
      </svg>
    </div>
  );
}

const ROWS = [
  { icon: Smartphone, title: "Live OTP inbox", desc: "Codes land the second they are sent. No refreshing.", body: () => <Inbox /> },
  { icon: TrendingUp, title: "Social growth", desc: "+312% followers in 30 days", body: () => <GrowthChart /> },
  { icon: Wallet, title: "Naira wallet", desc: "Fund by transfer or card. Refunds land here instantly.", body: () => (
    <div><p className="text-[30px] font-extrabold" style={{ color: D_TEXT }}>₦<Count to={125000} /></p>
      <div className="mt-3 flex gap-2">{["Transfer", "Card"].map((t) => <span key={t} className="rounded-full border px-3 py-1 text-[11px] font-semibold" style={{ borderColor: D_BORDER, color: D_TEXT }}>{t}</span>)}</div></div>
  ) },
  { icon: Globe2, title: "50+ countries", desc: "Pick a destination to check delivery speed, live stock and the carriers we use.", body: () => (
    <div className="grid max-w-sm grid-cols-6 gap-2">{["🇺🇸","🇬🇧","🇳🇬","🇮🇳","🇩🇪","🇰🇪","🇧🇷","🇫🇷","🇿🇦","🇨🇦","🇦🇺","🇹🇷"].map((f) => <span key={f} className="text-[24px]">{f}</span>)}</div>
  ) },
];

function Services() {
  const [open, setOpen] = useState(0);
  return (
    <section id="why" className="relative py-20 sm:py-28" style={{ ...F, background: D_BG }}>
      <div className="relative mx-auto max-w-5xl px-5">
        <Heading title="Everything between you and a verified account" sub="Numbers, growth and billing in one wallet, with every step visible while it happens." />
        <Reveal className="mx-auto mt-10 grid max-w-3xl grid-cols-3 gap-4 text-center">
          {[{ v: 50, s: "+", l: "countries" }, { v: 8, s: "s", l: "avg. code delivery" }, { v: 99.9, s: "%", l: "delivery success", d: 1 }].map((x) => (
            <div key={x.l}><p className="text-[28px] font-extrabold sm:text-[40px]" style={{ color: D_TEXT }}><Count to={x.v} suffix={x.s} decimals={x.d || 0} /></p><p className="text-[12px]" style={{ color: D_TEXT_SOFT }}>{x.l}</p></div>
          ))}
        </Reveal>
        <Reveal className="mt-12 overflow-hidden rounded-3xl border" >
          <div className="divide-y" style={{ background: D_SURFACE, borderColor: D_BORDER }}>
            {ROWS.map(({ icon: Icon, title, desc, body }, i) => {
              const o = open === i;
              return (
                <div key={title} style={{ borderColor: D_BORDER }}>
                  <button onClick={() => setOpen(o ? -1 : i)} aria-expanded={o} className="flex w-full items-center gap-4 px-5 py-4 text-left transition-colors hover:bg-white/[0.03] sm:px-6">
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border" style={{ borderColor: A("44"), background: A("1A") }}><Icon className="h-[18px] w-[18px]" style={{ color: ACCENT_2 }} /></span>
                    <span className="min-w-0 flex-1"><span className="block text-[15px] font-bold" style={{ color: D_TEXT }}>{title}</span><span className="block truncate text-[12.5px]" style={{ color: D_TEXT_SOFT }}>{desc}</span></span>
                    <motion.span animate={{ rotate: o ? 90 : 0 }} style={{ color: D_TEXT_DIM }}><ArrowUpRight className="h-4 w-4" /></motion.span>
                  </button>
                  <AnimatePresence initial={false}>
                    {o && (
                      <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.3 }} className="overflow-hidden">
                        <div className="px-5 pb-6 pt-1 sm:px-6 sm:pl-[76px]">{body()}</div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>
        </Reveal>
      </div>
    </section>
  );
}

/* ---------------------------- how it works ------------------------- */

function How() {
  const ref = React.useRef(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 65%", "end 55%"] });
  const fill = useSpring(scrollYProgress, { stiffness: 100, damping: 25 });
  return (
    <section className="py-20 sm:py-28" style={{ ...F, background: D_SURFACE }}>
      <div className="mx-auto grid max-w-6xl gap-12 px-5 lg:grid-cols-[1fr_1.2fr]">
        <div className="lg:sticky lg:top-28 lg:self-start">
          <Heading left title="Up and running in four steps" sub="No approval queue and no manual review. Most people place their first order in under five minutes." />
          <Reveal delay={0.1} className="mt-7"><Link to="/signup" className="inline-flex items-center gap-2 rounded-2xl px-5 py-3 text-[13px] font-semibold text-white" style={{ background: ACCENT }}>Create free account <ArrowRight className="h-4 w-4" /></Link></Reveal>
        </div>
        <div ref={ref} className="relative pl-14">
          <div className="absolute bottom-3 left-[19px] top-3 w-px" style={{ background: D_BORDER }} />
          <motion.div className="absolute bottom-3 left-[19px] top-3 w-px origin-top" style={{ scaleY: fill, background: ACCENT }} />
          {STEPS.map((s, i) => (
            <Reveal key={s.t} className="relative pb-12 last:pb-0">
              <span className="absolute -left-14 top-0 flex h-10 w-10 items-center justify-center rounded-full border-2 text-[14px] font-bold" style={{ borderColor: ACCENT, color: ACCENT_2, background: D_SURFACE }}>{i + 1}</span>
              <h3 className="text-[19px] font-bold" style={{ color: D_TEXT }}>{s.t}</h3>
              <p className="mt-1.5 max-w-md text-[14.5px] leading-relaxed" style={{ color: D_TEXT_SOFT }}>{s.b}</p>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ------------------------- number marketplace ---------------------- */

function Numbers() {
  const [app, setApp] = useState("WhatsApp");
  const [q, setQ] = useState("");
  const list = COUNTRIES.filter((c) => c.n.toLowerCase().includes(q.toLowerCase()) || c.d.includes(q));
  return (
    <section id="numbers" className="py-20 sm:py-28" style={{ ...F, background: D_BG }}>
      <div className="mx-auto max-w-5xl px-5">
        <Heading title="Pick an app, pick a country" sub="Sample prices shown. Live pricing is confirmed at checkout." />
        <Reveal className="mt-8 flex flex-col items-center justify-between gap-4 sm:flex-row">
          <Seg id="vl-app" options={APPS} value={app} onChange={setApp} />
          <label className="flex w-full items-center gap-2 rounded-full border px-4 py-2 sm:w-64" style={{ borderColor: D_BORDER, background: D_SURFACE }}>
            <Search className="h-4 w-4" style={{ color: D_TEXT_SOFT }} />
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search country or code" className="w-full bg-transparent text-[13px] outline-none" style={{ color: D_TEXT }} />
          </label>
        </Reveal>
        <motion.div layout className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <AnimatePresence mode="popLayout">
            {list.map((c) => (
              <motion.div layout key={c.n} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} whileHover={{ y: -4, borderColor: A("77") }}
                className="flex items-center justify-between rounded-2xl border p-4" style={{ borderColor: D_BORDER, background: D_SURFACE }}>
                <div className="flex items-center gap-3">
                  <span className="text-[28px]">{c.f}</span>
                  <div><p className="text-[14px] font-semibold" style={{ color: D_TEXT }}>{c.n}</p>
                    <p className="flex items-center gap-1.5 text-[12px]" style={{ color: D_TEXT_SOFT }}><span style={MONO}>{c.d}</span>
                      <span className={`h-1.5 w-1.5 rounded-full ${c.s === "In stock" ? "bg-[#16A34A]" : "bg-[#D97706]"}`} />{c.s}</p></div>
                </div>
                <div className="text-right">
                  <p className="text-[14px] font-bold" style={{ color: D_TEXT }}><Money value={c.p * APP_MULT[app]} /></p>
                  <Link to="/signup" className="mt-1 inline-flex items-center gap-1 text-[12px] font-semibold" style={{ color: ACCENT_2 }}>Buy <ArrowUpRight className="h-3 w-3" /></Link>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
        {list.length === 0 && <p className="mt-8 text-center text-[14px]" style={{ color: D_TEXT_SOFT }}>No country matches "{q}". Try a different name or dial code.</p>}
      </div>
    </section>
  );
}

/* ---------------------------- coverage & speed --------------------- */

function Coverage() {
  const [country, setCountry] = useState("United States");
  const c = COVERAGE[country];
  const [tick, setTick] = useState(0);
  useEffect(() => { const t = setInterval(() => setTick((v) => v + 1), 3000); return () => clearInterval(t); }, []);
  const recent = [0, 1, 2].map((i) => RECENT[(tick + i) % RECENT.length]);
  return (
    <section id="coverage" className="py-20 sm:py-28" style={{ ...F, background: D_SURFACE }}>
      <div className="mx-auto max-w-5xl px-5">
        <Heading title="See exactly what you get, by country" sub="Pick a destination to check delivery speed, live stock and the carriers we use. No surprises at checkout." />
        <Reveal className="mt-10 flex flex-wrap justify-center gap-2">
          {Object.keys(COVERAGE).map((k) => (
            <button key={k} onClick={() => setCountry(k)} className="rounded-full border px-4 py-2 text-[13px] font-semibold transition-all"
              style={{ borderColor: country === k ? ACCENT_2 : D_BORDER, background: country === k ? A("22") : D_SURFACE_2, color: country === k ? D_TEXT : D_TEXT_SOFT }}>
              <span className="mr-1.5">{COVERAGE[k].f}</span>{k}
            </button>
          ))}
        </Reveal>
        <Reveal delay={0.08} className="mt-8">
          <div className="grid overflow-hidden rounded-[28px] border md:grid-cols-[1.3fr_1fr]" style={{ borderColor: D_BORDER, background: D_BG }}>
            <div className="p-7 sm:p-8">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-[36px]">{c.f}</span>
                  <div>
                    <p className="text-[20px] font-bold" style={{ color: D_TEXT }}>{country}</p>
                    <p className="text-[13px]" style={{ color: D_TEXT_SOFT }}><span style={MONO}>{c.d}</span> · {c.carriers.join(" · ")}</p>
                  </div>
                </div>
                <span className="flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-bold" style={{ background: "rgba(52,211,153,0.12)", color: "#34D399" }}>
                  <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[#34D399]" />ONLINE
                </span>
              </div>
              <div className="mt-7 grid grid-cols-3 gap-4">
                <div>
                  <p className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide" style={{ color: D_TEXT_DIM }}><Clock className="h-3 w-3" />Speed</p>
                  <p className="mt-1 text-[22px] font-extrabold" style={{ color: D_TEXT }}>{c.speed}</p>
                  <p className="text-[11px]" style={{ color: D_TEXT_SOFT }}>SMS delivery</p>
                </div>
                <div>
                  <p className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide" style={{ color: D_TEXT_DIM }}><Signal className="h-3 w-3" />Stock</p>
                  <p className="mt-1 text-[22px] font-extrabold" style={{ color: D_TEXT }}><Count to={c.stock} /></p>
                  <p className="text-[11px]" style={{ color: D_TEXT_SOFT }}>numbers ready</p>
                </div>
                <div>
                  <p className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide" style={{ color: D_TEXT_DIM }}><Zap className="h-3 w-3" />From</p>
                  <p className="mt-1 text-[22px] font-extrabold" style={{ color: D_TEXT }}><Money value={c.price} /></p>
                  <p className="text-[11px]" style={{ color: D_TEXT_SOFT }}>per number</p>
                </div>
              </div>
              <div className="mt-7">
                <div className="mb-2 flex items-center justify-between text-[12px] font-semibold" style={{ color: D_TEXT_SOFT }}>
                  <span>Network load</span><span style={{ ...MONO, color: c.load > 50 ? "#F59E0B" : "#34D399" }}>{c.load}%</span>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full" style={{ background: D_BORDER }}>
                  <motion.div className="h-full rounded-full" initial={{ width: 0 }} animate={{ width: `${c.load}%` }} transition={{ duration: 0.6, ease: "easeOut" }}
                    style={{ background: c.load > 50 ? "linear-gradient(90deg,#F59E0B,#FBBF24)" : `linear-gradient(90deg,${ACCENT},${ACCENT_2})` }} />
                </div>
              </div>
              <div className="mt-7 flex flex-wrap gap-2">
                {c.apps.map((a) => <span key={a} className="rounded-full border px-3 py-1 text-[11.5px] font-semibold" style={{ borderColor: D_BORDER, color: D_TEXT }}>{a}</span>)}
              </div>
            </div>
            <div className="relative flex flex-col justify-between overflow-hidden p-7 sm:p-8" style={{ background: `linear-gradient(160deg,${A("55")},${D_BG})` }}>
              <div className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white/10 blur-2xl" />
              <div className="relative">
                <p className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-widest" style={{ color: D_TEXT }}><MapPin className="h-3 w-3" />Recent deliveries</p>
                <ul className="mt-4 space-y-2">
                  <AnimatePresence initial={false} mode="popLayout">
                    {recent.map((r, i) => (
                      <motion.li layout key={`${r.f}-${r.app}-${tick + i}`} initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1 - i * 0.25, x: 0 }} exit={{ opacity: 0, x: -12 }}
                        transition={{ type: "spring", stiffness: 300, damping: 30 }} className="flex items-center justify-between rounded-xl border border-white/10 bg-white/[0.06] px-3 py-2">
                        <span className="flex items-center gap-2"><span className="text-[16px]">{r.f}</span><span className="text-[12px] font-semibold text-white">{r.app}</span></span>
                        <span className="flex items-center gap-1 text-[10.5px] font-bold text-[#34D399]"><Check className="h-3 w-3" />{r.s}</span>
                      </motion.li>
                    ))}
                  </AnimatePresence>
                </ul>
              </div>
              <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} className="relative mt-6">
                <Link to="/signup" className="block rounded-2xl py-3 text-center text-[13px] font-bold text-white" style={{ background: ACCENT }}>Buy a {country} number</Link>
              </motion.div>
            </div>
          </div>
        </Reveal>
        <Reveal delay={0.14} className="mt-4">
          <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-[12px]" style={{ color: D_TEXT_DIM }}>
            <span className="flex items-center gap-1.5"><ShieldCheck className="h-3.5 w-3.5" />Refund if a code fails</span>
            <span className="flex items-center gap-1.5"><Users className="h-3.5 w-3.5" />Private, single-use numbers</span>
            <span className="flex items-center gap-1.5"><Globe2 className="h-3.5 w-3.5" />50+ countries available</span>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

/* ------------------------ individuals vs business ------------------ */

function Audience() {
  const [a, setA] = useState("Individuals");
  const d = AUD[a];
  return (
    <section id="pricing" className="py-20 sm:py-28" style={{ ...F, background: D_BG }}>
      <div className="mx-auto max-w-5xl px-5">
        <Heading title="Made for one account or one hundred" />
        <Reveal className="mt-8 flex justify-center"><Seg id="vl-aud" options={Object.keys(AUD)} value={a} onChange={setA} /></Reveal>
        <AnimatePresence mode="wait">
          <motion.div key={a} initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.25 }}
            className="mt-8 grid overflow-hidden rounded-[28px] border md:grid-cols-[1.2fr_1fr]" style={{ borderColor: D_BORDER, background: D_SURFACE }}>
            <ul className="space-y-4 p-8">
              {d.pts.map((p) => (
                <li key={p} className="flex items-center gap-3 text-[15px] font-medium" style={{ color: D_TEXT }}>
                  <span className="flex h-6 w-6 items-center justify-center rounded-full" style={{ background: A("26") }}><Check className="h-3.5 w-3.5" style={{ color: ACCENT_2 }} /></span>{p}
                </li>
              ))}
            </ul>
            <div className="flex flex-col items-start justify-center gap-1 p-8" style={{ background: D_SURFACE_2, color: D_TEXT }}>
              {a === "Individuals" ? <User className="h-5 w-5" style={{ color: ACCENT_2 }} /> : <Building2 className="h-5 w-5" style={{ color: ACCENT_2 }} />}
              <p className="mt-3 text-[12.5px]" style={{ color: D_TEXT_SOFT }}>{d.sub}</p>
              <p className="text-[44px] font-extrabold leading-none">{d.big}</p>
              <Link to="/signup" className="mt-6 inline-flex items-center gap-2 rounded-2xl px-5 py-3 text-[13px] font-bold text-white" style={{ background: ACCENT }}>{d.cta}<ArrowRight className="h-4 w-4" /></Link>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </section>
  );
}

/* ----------------------------- stories + faq ----------------------- */

function StoryCard({ s }) {
  return (
    <figure className="w-[300px] shrink-0 rounded-3xl border p-6 sm:w-[340px]" style={{ borderColor: D_BORDER, background: D_SURFACE }}>
      <div className="flex gap-0.5">{[0, 1, 2, 3, 4].map((i) => <Star key={i} className="h-3.5 w-3.5" style={{ fill: ACCENT_2, color: ACCENT_2 }} />)}</div>
      <blockquote className="mt-4 text-[14.5px] leading-relaxed" style={{ color: D_TEXT }}>{s.q}</blockquote>
      <figcaption className="mt-5 flex items-center gap-3">
        <span className="flex h-9 w-9 items-center justify-center rounded-xl text-[13px] font-bold text-white" style={{ background: ACCENT }}>{s.n[0]}</span>
        <span><span className="block text-[13px] font-semibold" style={{ color: D_TEXT }}>{s.n}</span><span className="block text-[11.5px]" style={{ color: D_TEXT_SOFT }}>{s.r}</span></span>
      </figcaption>
    </figure>
  );
}

function Stories() {
  const row1 = [...STORIES, ...STORIES];
  const row2 = [...STORIES].reverse().concat([...STORIES].reverse());
  return (
    <section id="stories" className="overflow-hidden py-20 sm:py-28" style={{ ...F, background: D_SURFACE }}>
      <div className="mx-auto max-w-6xl px-5">
        <Reveal className="flex flex-wrap items-end justify-between gap-6">
          <div>
            <p className="text-[11px] font-bold tracking-[0.2em]" style={{ color: ACCENT_2 }}>CUSTOMER STORIES</p>
            <h2 className="mt-3 text-[34px] font-bold leading-[1.08] tracking-tight sm:text-[48px]" style={{ color: D_TEXT }}>Trusted by people who<br /><span style={{ color: ACCENT_2 }}>ship daily</span></h2>
          </div>
          <p className="max-w-[220px] text-[12.5px] leading-relaxed" style={{ color: D_TEXT_SOFT }}>Sample testimonials. Replace with real customer quotes before launch.</p>
        </Reveal>
      </div>
      <div className="mt-12 space-y-4">
        <Marquee speed={55}>{row1.map((s, i) => <StoryCard key={`a${i}`} s={s} />)}</Marquee>
        <Marquee speed={60} reverse>{row2.map((s, i) => <StoryCard key={`b${i}`} s={s} />)}</Marquee>
      </div>
    </section>
  );
}

function FAQ() {
  const [open, setOpen] = useState(0);
  return (
    <section id="faq" className="py-20 sm:py-28" style={{ ...F, background: D_BG }}>
      <div className="mx-auto max-w-2xl px-5">
        <Heading title="Questions, answered" />
        <div className="mt-10 space-y-3">
          {FAQS.map((f, i) => {
            const o = open === i;
            return (
              <motion.div layout key={f.q} className="rounded-2xl border px-6" style={{ borderColor: o ? ACCENT : D_BORDER, background: D_SURFACE }}>
                <button onClick={() => setOpen(o ? -1 : i)} className="flex w-full items-center justify-between py-5 text-left" aria-expanded={o}>
                  <span className="text-[15px] font-semibold" style={{ color: D_TEXT }}>{f.q}</span>
                  {o ? <Minus className="h-4 w-4" style={{ color: ACCENT_2 }} /> : <Plus className="h-4 w-4" style={{ color: D_TEXT_SOFT }} />}
                </button>
                <AnimatePresence initial={false}>
                  {o && <motion.p initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.25 }}
                    className="overflow-hidden text-[14px] leading-relaxed" style={{ color: D_TEXT_SOFT }}><span className="block pb-5">{f.a}</span></motion.p>}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

/* ------------------------------ cta + footer ----------------------- */

function CTA() {
  return (
    <section className="px-5 pb-20 pt-4" style={{ ...F, background: D_BG }}>
      <Reveal>
        <div className="relative mx-auto grid max-w-6xl items-center gap-8 overflow-hidden rounded-[28px] px-7 py-14 sm:px-12 md:grid-cols-[1.4fr_1fr]" style={{ background: `linear-gradient(120deg,${ACCENT},${ACCENT_2})` }}>
          <KeyRound className="pointer-events-none absolute -right-6 -top-10 h-[320px] w-[320px] rotate-12 text-white opacity-[0.12]" strokeWidth={1.5} />
          <div className="relative">
            <p className="text-[11px] font-bold tracking-[0.2em] text-white/80">GET STARTED</p>
            <h2 className="mt-3 text-[32px] font-bold leading-[1.08] tracking-tight text-white sm:text-[46px]">Your first number or boost is minutes away</h2>
            <p className="mt-3 max-w-md text-[15px] text-white/85">Create a free account, fund your wallet, and place your first order today.</p>
          </div>
          <div className="relative flex flex-wrap items-center gap-3 md:justify-end">
            <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}>
              <Link to="/signup" className="block rounded-2xl px-6 py-3.5 text-[14px] font-bold text-white" style={{ background: D_BG }}>Create free account</Link>
            </motion.div>
            <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}>
              <a href="#coverage" className="block rounded-2xl border border-white/50 px-6 py-3.5 text-[14px] font-bold text-white">View Coverage</a>
            </motion.div>
          </div>
        </div>
      </Reveal>
    </section>
  );
}

function Footer() {
  const cols = [
    { t: "Product", l: [["Numbers", "#numbers"], ["Coverage", "#coverage"], ["Pricing", "#pricing"]] },
    { t: "Company", l: [["Customer stories", "#stories"], ["FAQ", "#faq"], ["Support", "/support"]] },
    { t: "Legal", l: [["Terms", "/terms"], ["Privacy", "/privacy"]] },
  ];
  return (
    <footer className="border-t" style={{ ...F, background: D_BG, borderColor: D_BORDER }}>
      <div className="mx-auto grid max-w-6xl gap-10 px-5 py-14 md:grid-cols-[1.5fr_1fr_1fr_1fr]">
        <div><Logo /><p className="mt-4 max-w-xs text-[13.5px] leading-relaxed" style={{ color: D_TEXT_SOFT }}>Verified virtual numbers and social media growth for individuals and businesses.</p></div>
        {cols.map((c) => (
          <div key={c.t}><h4 className="text-[11px] font-bold tracking-[0.2em]" style={{ color: D_TEXT_DIM }}>{c.t.toUpperCase()}</h4>
            <ul className="mt-4 space-y-3">{c.l.map(([l, h]) => (
              <li key={l}>{h.startsWith("#") ? <a href={h} className="text-[13.5px] transition-colors hover:text-white" style={{ color: D_TEXT_SOFT }}>{l}</a> : <Link to={h} className="text-[13.5px] transition-colors hover:text-white" style={{ color: D_TEXT_SOFT }}>{l}</Link>}</li>
            ))}</ul></div>
        ))}
      </div>
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-2 border-t px-5 py-5 text-[12.5px] sm:flex-row" style={{ color: D_TEXT_DIM, borderColor: D_BORDER }}>
        <span>© {new Date().getFullYear()} VALIDLOGIN. All rights reserved.</span>
        <span className="flex gap-5"><Link to="/privacy" className="hover:text-white">Privacy</Link><Link to="/terms" className="hover:text-white">Terms</Link></span>
      </div>
    </footer>
  );
}

/* -------------------------------- page ----------------------------- */

export default function ValidLoginMarketplace() {
  const { scrollYProgress } = useScroll();
  const bar = useSpring(scrollYProgress, { stiffness: 120, damping: 30 });
  return (
    <MotionConfig reducedMotion="user">
      <div style={{ ...F, scrollBehavior: "smooth", background: D_BG }}>
        <motion.div className="fixed inset-x-0 top-0 z-[60] h-[2px] origin-left" style={{ scaleX: bar, background: ACCENT_2 }} />
        <Navbar />
        <Hero />
        <Services />
        <How />
        <Numbers />
        <Coverage />
        <Audience />
        <Stories />
        <FAQ />
        <CTA />
        <Footer />
      </div>
    </MotionConfig>
  );
}