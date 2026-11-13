// TermsAndConditions.jsx
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  CheckCircle,
  Globe,
  Home,
  Mail,
  Shield,
} from "lucide-react";
import ThemeToggle from "../components/ThemeToggle";
import imageObject from "../utils/image";

const FONT_DISPLAY = {
  fontFamily: "'Space Grotesk', ui-sans-serif, system-ui",
};
const FONT_MONO = { fontFamily: "'JetBrains Mono', ui-monospace, monospace" };

const BRAND = "Valid Login";
const CONTACT_EMAIL = "support@validlogin.com";
const CONTACT_SITE = "www.validlogin.com";
const LAST_UPDATED = "September 1, 2026";

/* Reusable bullet list */
function CheckList({ items }) {
  return (
    <ul className="mt-4 space-y-3">
      {items.map((item) => (
        <li
          key={item}
          className="flex items-start gap-3 text-sm leading-relaxed text-muted md:text-[15px]"
        >
          <CheckCircle className="mt-1 h-4 w-4 shrink-0 text-success" />
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}

const Para = ({ children }) => (
  <p className="text-sm leading-relaxed text-muted md:text-[15px]">
    {children}
  </p>
);

const sections = [
  {
    id: "acceptance",
    title: "Acceptance of Terms",
    body: (
      <Para>
        By accessing and using this website and our services, you agree to be
        bound by these Terms and Conditions. If you do not agree with any part
        of these terms, please do not use our services. We reserve the right to
        update these terms at any time, and your continued use constitutes
        acceptance of any changes.
      </Para>
    ),
  },
  {
    id: "services",
    title: "Description of Services",
    body: (
      <>
        <Para>
          We provide temporary phone number services for verification purposes.
          Our platform allows users to:
        </Para>
        <CheckList
          items={[
            "Rent real, carrier-verified phone numbers from multiple countries",
            "Receive SMS verification codes for various platforms",
            "Access numbers for short-term or extended rental periods",
            "Manage verifications through our dashboard",
          ]}
        />
      </>
    ),
  },
  {
    id: "responsibilities",
    title: "User Responsibilities",
    body: (
      <>
        <Para>As a user, you agree to:</Para>
        <CheckList
          items={[
            "Provide accurate and complete information when creating an account",
            "Use our services only for legitimate verification purposes",
            "Not use our services for any illegal, fraudulent, or harmful activities",
            "Maintain the security of your account credentials",
            "Notify us immediately of any unauthorized use of your account",
          ]}
        />
      </>
    ),
  },
  {
    id: "payments",
    title: "Payments and Refunds",
    body: (
      <Para>
        Our services are offered on a pay-per-use or subscription basis. All
        payments are processed securely through our payment partners. We do not
        store your payment information. Refunds may be issued at our discretion
        for failed verifications or technical issues. Please contact our support
        team for any payment-related inquiries.
      </Para>
    ),
  },
  {
    id: "intellectual-property",
    title: "Intellectual Property",
    body: (
      <Para>
        All content, features, and functionality on this platform, including but
        not limited to text, graphics, logos, and software, are the exclusive
        property of {BRAND} and are protected by copyright, trademark, and other
        intellectual property laws. You may not copy, modify, distribute, or
        create derivative works without our explicit written consent.
      </Para>
    ),
  },
  {
    id: "privacy",
    title: "Privacy Policy",
    body: (
      <Para>
        Your privacy is important to us. Please review our separate{" "}
        <Link
          to="/privacy"
          className="font-medium text-brand-text underline-offset-4 hover:underline"
        >
          Privacy Policy
        </Link>{" "}
        to understand how we collect, use, and protect your personal
        information.
      </Para>
    ),
  },
  {
    id: "liability",
    title: "Limitations of Liability",
    body: (
      <Para>
        Our services are provided "as is" without warranties of any kind. We do
        not guarantee that our services will be uninterrupted, error-free, or
        completely secure. To the fullest extent permitted by law, we shall not
        be liable for any indirect, incidental, special, consequential, or
        punitive damages arising from your use of our services.
      </Para>
    ),
  },
  {
    id: "termination",
    title: "Termination",
    body: (
      <Para>
        We reserve the right to suspend or terminate your account at any time
        for violation of these terms, illegal activities, or at our sole
        discretion. Upon termination, you must immediately cease using our
        services and any outstanding fees will become due.
      </Para>
    ),
  },
  {
    id: "governing-law",
    title: "Governing Law",
    body: (
      <Para>
        These terms shall be governed by and construed in accordance with the
        laws of the jurisdiction in which our company is registered, without
        regard to its conflict of law provisions. Any disputes arising under
        these terms shall be subject to the exclusive jurisdiction of the courts
        in that jurisdiction.
      </Para>
    ),
  },
  {
    id: "contact",
    title: "Contact Us",
    body: (
      <>
        <Para>
          If you have any questions about these Terms and Conditions, please
          contact us at:
        </Para>
        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          <a
            href={`mailto:${CONTACT_EMAIL}`}
            className="group flex items-center gap-3 rounded-xl border border-border bg-bg-subtle p-3.5 transition-colors hover:border-border-strong hover:bg-brand-soft focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
          >
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-surface text-brand-text ring-1 ring-border">
              <Mail size={16} />
            </span>
            <span style={FONT_MONO} className="truncate text-[12.5px] text-heading">
              {CONTACT_EMAIL}
            </span>
          </a>
          <div className="flex items-center gap-3 rounded-xl border border-border bg-bg-subtle p-3.5">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-surface text-brand-text ring-1 ring-border">
              <Globe size={16} />
            </span>
            <span style={FONT_MONO} className="truncate text-[12.5px] text-heading">
              {CONTACT_SITE}
            </span>
          </div>
        </div>
      </>
    ),
  },
];

const pad = (n) => String(n + 1).padStart(2, "0");

const TermsAndConditions = () => {
  const [activeId, setActiveId] = useState(sections[0].id);

  /* Highlight the section currently in view */
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible[0]) setActiveId(visible[0].target.id);
      },
      { rootMargin: "-15% 0px -70% 0px", threshold: 0 },
    );

    sections.forEach(({ id }) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

  const scrollTo = (id) => (e) => {
    e.preventDefault();
    document
      .getElementById(id)
      ?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <div className="min-h-screen bg-bg text-heading">
      <ThemeToggle className="fixed right-4 top-4 z-50" />

      {/* Background */}
      <div className="fixed inset-0 z-0">
        <div className="absolute inset-0 theme-radial" />
        <div className="absolute inset-0 theme-grid opacity-[0.06]" />
      </div>

      {/* Navigation */}
      <header className="sticky top-0 z-40 border-b border-border bg-bg/80 backdrop-blur-lg">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6 pr-16">
          <Link to="/" aria-label={`${BRAND} home`}>
            <img
              src={imageObject.Logo}
              alt={BRAND}
              className="h-10 w-auto rounded-md object-contain"
            />
          </Link>
          <Link
            to="/"
            style={FONT_DISPLAY}
            className="group inline-flex items-center gap-2 rounded-lg px-3 py-2 text-[13px] font-medium text-muted transition-colors hover:bg-brand-soft hover:text-heading focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
          >
            <Home className="h-4 w-4 transition-colors group-hover:text-brand" />
            Back to Home
          </Link>
        </div>
      </header>

      <main className="relative z-10 mx-auto max-w-6xl px-6 pb-20 pt-14 md:pt-20">
        {/* Hero */}
        <div className="mx-auto mb-14 max-w-2xl text-center md:mb-20">
          <div
            style={FONT_MONO}
            className="mb-5 inline-flex items-center gap-2 rounded-full border border-border bg-surface px-3.5 py-1.5 text-[10.5px] uppercase tracking-[0.18em] text-brand-text"
          >
            <Shield className="h-3.5 w-3.5" />
            Legal Document
          </div>
          <h1
            style={FONT_DISPLAY}
            className="text-4xl font-semibold tracking-tight md:text-5xl"
          >
            Terms &amp; <span className="text-brand-text">Conditions</span>
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-sm leading-relaxed text-muted md:text-base">
            Please read these terms carefully before using {BRAND}.
          </p>
          <p
            style={FONT_MONO}
            className="mt-5 text-[11px] uppercase tracking-wider text-muted"
          >
            Last updated · {LAST_UPDATED}
          </p>
        </div>

        <div className="grid gap-10 lg:grid-cols-[240px_minmax(0,1fr)] lg:gap-14">
          {/* Table of contents (desktop) */}
          <aside className="hidden lg:block">
            <nav aria-label="Table of contents" className="sticky top-28">
              <p
                style={FONT_MONO}
                className="mb-4 px-3 text-[10px] uppercase tracking-[0.18em] text-muted"
              >
                On this page
              </p>
              <ul className="space-y-0.5 border-l border-border">
                {sections.map((s, i) => {
                  const active = activeId === s.id;
                  return (
                    <li key={s.id}>
                      <a
                        href={`#${s.id}`}
                        onClick={scrollTo(s.id)}
                        style={FONT_DISPLAY}
                        className={`-ml-px flex items-center gap-3 border-l-2 py-2 pl-4 pr-3 text-[13px] transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand ${
                          active
                            ? "border-brand font-medium text-heading"
                            : "border-transparent text-muted hover:text-heading"
                        }`}
                      >
                        <span
                          style={FONT_MONO}
                          className={`text-[10px] ${
                            active ? "text-brand-text" : "text-muted"
                          }`}
                        >
                          {pad(i)}
                        </span>
                        <span className="truncate">{s.title}</span>
                      </a>
                    </li>
                  );
                })}
              </ul>
            </nav>
          </aside>

          {/* Sections */}
          <div className="min-w-0 space-y-5">
            {sections.map((s, i) => (
              <section
                key={s.id}
                id={s.id}
                className="scroll-mt-24 rounded-2xl border border-border bg-surface p-6 shadow-card md:p-8"
              >
                <div className="mb-4 flex items-center gap-4">
                  <span
                    style={FONT_MONO}
                    className="flex h-9 min-w-9 items-center justify-center rounded-xl bg-brand-soft px-2 text-[12px] font-medium text-brand-text"
                  >
                    {pad(i)}
                  </span>
                  <h2
                    style={FONT_DISPLAY}
                    className="text-lg font-semibold tracking-tight md:text-xl"
                  >
                    {s.title}
                  </h2>
                </div>
                <div className="md:pl-[52px]">{s.body}</div>
              </section>
            ))}

            {/* CTA */}
            <div className="pt-6 text-center">
              <Link
                to="/"
                style={FONT_DISPLAY}
                className="group inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-brand px-8 text-[13.5px] font-medium text-on-brand shadow-sm transition-all duration-200 hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 focus-visible:ring-offset-bg"
              >
                Return to Home
                <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5" />
              </Link>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 border-t border-border bg-surface px-6 py-8">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 text-xs text-muted sm:flex-row">
          <p>
            © {new Date().getFullYear()} {BRAND}. All rights reserved.
          </p>
          <div className="flex items-center gap-6">
            <Link
              to="/terms"
              className="transition-colors hover:text-brand-text"
            >
              Terms
            </Link>
            <Link
              to="/privacy"
              className="transition-colors hover:text-brand-text"
            >
              Privacy
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default TermsAndConditions;