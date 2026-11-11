// Privacy.jsx
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  CheckCircle,
  Cookie,
  Eye,
  Globe,
  Home,
  Lock,
  Mail,
  Shield,
  User,
} from "lucide-react";
import ThemeToggle from "../components/ThemeToggle";
import imageObject from "../utils/image";

const FONT_DISPLAY = {
  fontFamily: "'Space Grotesk', ui-sans-serif, system-ui",
};
const FONT_MONO = { fontFamily: "'JetBrains Mono', ui-monospace, monospace" };

const BRAND = "Valid Login";
const CONTACT_EMAIL = "privacy@validlogin.com";
const CONTACT_SITE = "www.validlogin.com";
const LAST_UPDATED = "September 1, 2026";

/* ------------------------------------------------------------------ */
/* Helpers                                                             */
/* ------------------------------------------------------------------ */

const Para = ({ children, className = "" }) => (
  <p
    className={`text-sm leading-relaxed text-muted md:text-[15px] ${className}`}
  >
    {children}
  </p>
);

function CheckList({ items }) {
  return (
    <ul className="mt-4 space-y-3">
      {items.map((item, i) => (
        <li
          key={i}
          className="flex items-start gap-3 text-sm leading-relaxed text-muted md:text-[15px]"
        >
          <CheckCircle className="mt-1 h-4 w-4 shrink-0 text-success" />
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}

const Strong = ({ children }) => (
  <strong className="font-semibold text-heading">{children}</strong>
);

/* ------------------------------------------------------------------ */
/* Content                                                             */
/* ------------------------------------------------------------------ */

const sections = [
  {
    id: "commitment",
    icon: Shield,
    tone: "success",
    title: "Our Commitment to Privacy",
    body: (
      <Para>
        Your privacy is a priority for us. This Privacy Policy explains how we
        collect, use, disclose, and safeguard your information when you use our
        services. Please read this policy carefully. By using our services, you
        consent to the practices described herein.
      </Para>
    ),
  },
  {
    id: "collection",
    icon: User,
    title: "Information We Collect",
    body: (
      <>
        <Para>We collect the following types of information:</Para>
        <CheckList
          items={[
            <>
              <Strong>Personal information:</Strong> Name, email address, phone
              number, and payment information when you create an account or
              make a purchase.
            </>,
            <>
              <Strong>Usage data:</Strong> Information about how you interact
              with our platform, including pages visited, features used, and
              time spent.
            </>,
            <>
              <Strong>Device information:</Strong> IP address, browser type,
              operating system, and device identifiers.
            </>,
            <>
              <Strong>Cookies:</Strong> We use cookies and similar tracking
              technologies to enhance your experience and analyze usage
              patterns.
            </>,
          ]}
        />
      </>
    ),
  },
  {
    id: "usage",
    icon: Eye,
    title: "How We Use Your Information",
    body: (
      <>
        <Para>
          We use the information we collect for the following purposes:
        </Para>
        <CheckList
          items={[
            "To provide, maintain, and improve our services",
            "To process transactions and send related confirmations",
            "To send you updates, security alerts, and support messages",
            "To monitor and analyze usage trends and improve user experience",
            "To detect, prevent, and address technical issues or security breaches",
          ]}
        />
      </>
    ),
  },
  {
    id: "sharing",
    icon: Shield,
    title: "Data Sharing and Disclosure",
    body: (
      <>
        <Para>
          We do not sell, trade, or rent your personal information to third
          parties. We may share your information:
        </Para>
        <CheckList
          items={[
            "With trusted third-party service providers who assist in operating our platform (payment processors, hosting services, etc.)",
            "When required by law, regulation, or legal process",
            "To protect the rights, property, or safety of our users or the public",
          ]}
        />
      </>
    ),
  },
  {
    id: "security",
    icon: Lock,
    tone: "success",
    title: "Data Security",
    body: (
      <Para>
        We implement appropriate technical and organizational measures to
        protect your personal information against unauthorized access,
        alteration, disclosure, or destruction. This includes encryption, secure
        data storage, and regular security audits. However, no method of
        transmission over the internet is 100% secure, and we cannot guarantee
        absolute security.
      </Para>
    ),
  },
  {
    id: "cookies",
    icon: Cookie,
    title: "Cookies and Tracking",
    body: (
      <Para>
        We use cookies and similar tracking technologies to enhance your
        experience, personalize content, and analyze our traffic. You can
        control cookie preferences in your browser settings. Please note that
        disabling cookies may affect the functionality of our platform.
      </Para>
    ),
  },
  {
    id: "rights",
    icon: User,
    title: "Your Rights and Choices",
    body: (
      <>
        <Para>You have the right to:</Para>
        <CheckList
          items={[
            "Access, update, or delete your personal information",
            "Opt-out of marketing communications",
            "Request a copy of your data in a portable format",
            "Withdraw consent at any time where we rely on your consent",
          ]}
        />
        <Para className="mt-4">
          To exercise these rights, please contact us using the information
          provided below.
        </Para>
      </>
    ),
  },
  {
    id: "retention",
    icon: Shield,
    title: "Data Retention",
    body: (
      <Para>
        We retain your personal information only for as long as necessary to
        fulfill the purposes outlined in this policy, unless a longer retention
        period is required by law. We will securely delete or anonymize your
        information when it is no longer needed.
      </Para>
    ),
  },
  {
    id: "children",
    icon: User,
    title: "Children's Privacy",
    body: (
      <Para>
        Our services are not intended for individuals under the age of 18. We do
        not knowingly collect personal information from children. If you are a
        parent or guardian and believe your child has provided us with personal
        information, please contact us immediately.
      </Para>
    ),
  },
  {
    id: "changes",
    icon: Shield,
    title: "Changes to This Policy",
    body: (
      <Para>
        We may update this Privacy Policy from time to time to reflect changes
        in our practices or legal requirements. We will notify you of any
        significant changes by posting the new policy on this page and updating
        the "Last Updated" date. We encourage you to review this policy
        periodically.
      </Para>
    ),
  },
  {
    id: "contact",
    icon: Mail,
    title: "Contact Us",
    body: (
      <>
        <Para>
          If you have any questions, concerns, or requests regarding this
          Privacy Policy, please contact us at:
        </Para>
        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          <a
            href={`mailto:${CONTACT_EMAIL}`}
            className="group flex items-center gap-3 rounded-xl border border-border bg-bg-subtle p-3.5 transition-colors hover:border-border-strong hover:bg-brand-soft focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
          >
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-surface text-brand-text ring-1 ring-border">
              <Mail size={16} />
            </span>
            <span
              style={FONT_MONO}
              className="truncate text-[12.5px] text-heading"
            >
              {CONTACT_EMAIL}
            </span>
          </a>
          <div className="flex items-center gap-3 rounded-xl border border-border bg-bg-subtle p-3.5">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-surface text-brand-text ring-1 ring-border">
              <Globe size={16} />
            </span>
            <span
              style={FONT_MONO}
              className="truncate text-[12.5px] text-heading"
            >
              {CONTACT_SITE}
            </span>
          </div>
        </div>
      </>
    ),
  },
];

const pad = (n) => String(n + 1).padStart(2, "0");

/* ------------------------------------------------------------------ */
/* Page                                                                */
/* ------------------------------------------------------------------ */

const Privacy = () => {
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
            <Lock className="h-3.5 w-3.5" />
            Privacy Policy
          </div>
          <h1
            style={FONT_DISPLAY}
            className="text-4xl font-semibold tracking-tight md:text-5xl"
          >
            Privacy <span className="text-brand-text">Policy</span>
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-sm leading-relaxed text-muted md:text-base">
            How {BRAND} collects, uses, and protects your information.
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
            {sections.map((s) => {
              const Icon = s.icon;
              const chip =
                s.tone === "success"
                  ? "bg-bg-subtle text-success ring-1 ring-border"
                  : "bg-brand-soft text-brand-text";

              return (
                <section
                  key={s.id}
                  id={s.id}
                  className="scroll-mt-24 rounded-2xl border border-border bg-surface p-6 shadow-card md:p-8"
                >
                  <div className="mb-4 flex items-center gap-4">
                    <span
                      className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${chip}`}
                    >
                      <Icon className="h-[18px] w-[18px]" />
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
              );
            })}

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

export default Privacy;