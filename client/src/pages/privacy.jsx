// Privacy.jsx
import React from "react";
import { Link } from "react-router-dom";
import {
  Shield,
  CheckCircle,
  ArrowRight,
  Home,
  Lock,
  User,
  Eye,
  Cookie,
} from "lucide-react";
import ThemeToggle from "../components/ThemeToggle";
import SiteLogo from "../components/SiteLogo";
import imageObject from "../utils/image";

const FONT_DISPLAY = {
  fontFamily: "'Space Grotesk', ui-sans-serif, system-ui",
};
const FONT_MONO = { fontFamily: "'JetBrains Mono', ui-monospace, monospace" };

const Privacy = () => {
  return (
    <div className="landing-page relative min-h-screen overflow-hidden bg-bg text-heading">
      <ThemeToggle className="fixed right-4 top-4 z-50" />
      {/* Background grid — same as homepage hero */}
      <div
        className="pointer-events-none fixed inset-0 z-0 opacity-[0.05]"
        style={{
          backgroundImage:
            "linear-gradient(var(--brand) 1px, transparent 1px), linear-gradient(90deg, var(--brand) 1px, transparent 1px)",
          backgroundSize: "44px 44px",
        }}
      />
      {/* Purple glow — same as homepage hero */}
      <div
        className="pointer-events-none fixed -top-40 left-1/2 z-0 h-[520px] w-[900px] -translate-x-1/2 rounded-full opacity-20 blur-[110px]"
        style={{
          background: "radial-gradient(closest-side, var(--brand), transparent)",
        }}
      />

      {/* Navigation — same language as homepage Navbar */}
      <header className="sticky top-0 z-50 border-b border-border bg-bg/85 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <Link to="/" className="flex items-center gap-2.5">
            <img src={imageObject.Logo} className='h-[50px] w-[150px] rounded-sm' />
          </Link>
          <Link
            to="/"
            className="flex items-center gap-2 text-[14px] text-muted transition-colors hover:text-heading"
          >
            <Home className="h-4 w-4" />
            Back to Home
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 mx-auto max-w-4xl px-6 py-16 md:py-24">
        {/* Hero header */}
        <div className="mb-12 text-center">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-border bg-bg-subtle px-3 py-1.5">
            <Lock className="h-3.5 w-3.5 text-brand-text" />
            <span style={FONT_MONO} className="text-[12px] text-muted">
              privacy policy
            </span>
          </div>
          <h1
            style={FONT_DISPLAY}
            className="mb-4 text-[36px] font-semibold leading-tight tracking-tight text-heading sm:text-[44px] md:text-[48px]"
          >
            Privacy <span className="text-brand-text">Policy</span>
          </h1>
          <p style={FONT_MONO} className="text-[12.5px] text-muted">
            Last updated: September 1, 2026
          </p>
        </div>

        <div className="space-y-5">
          {/* Introduction */}
          <Section
            icon={Shield}
            iconTone="green"
            title="Our commitment to privacy"
          >
            <p>
              Your privacy is a priority for us. This Privacy Policy explains
              how we collect, use, disclose, and safeguard your information when
              you use our services. Please read this policy carefully. By using
              our services, you consent to the practices described herein.
            </p>
          </Section>

          {/* Information We Collect */}
          <Section icon={User} iconTone="purple" title="Information we collect">
            <p className="mb-4">
              We collect the following types of information:
            </p>
            <CheckList
              items={[
                <>
                  <strong className="text-heading">
                    Personal information:
                  </strong>{" "}
                  Name, email address, phone number, and payment information
                  when you create an account or make a purchase.
                </>,
                <>
                  <strong className="text-heading">Usage data:</strong>{" "}
                  Information about how you interact with our platform,
                  including pages visited, features used, and time spent.
                </>,
                <>
                  <strong className="text-heading">
                    Device information:
                  </strong>{" "}
                  IP address, browser type, operating system, and device
                  identifiers.
                </>,
                <>
                  <strong className="text-heading">Cookies:</strong> We use
                  cookies and similar tracking technologies to enhance your
                  experience and analyze usage patterns.
                </>,
              ]}
            />
          </Section>

          {/* How We Use Information */}
          <Section
            icon={Eye}
            iconTone="purple"
            title="How we use your information"
          >
            <p className="mb-4">
              We use the information we collect for the following purposes:
            </p>
            <CheckList
              items={[
                "To provide, maintain, and improve our services",
                "To process transactions and send related confirmations",
                "To send you updates, security alerts, and support messages",
                "To monitor and analyze usage trends and improve user experience",
                "To detect, prevent, and address technical issues or security breaches",
              ]}
            />
          </Section>

          {/* Data Sharing */}
          <Section
            icon={Shield}
            iconTone="purple"
            title="Data sharing and disclosure"
          >
            <p>
              We do not sell, trade, or rent your personal information to third
              parties. We may share your information:
            </p>
            <div className="mt-4">
              <CheckList
                items={[
                  "With trusted third-party service providers who assist in operating our platform (payment processors, hosting services, etc.)",
                  "When required by law, regulation, or legal process",
                  "To protect the rights, property, or safety of our users or the public",
                ]}
              />
            </div>
          </Section>

          {/* Data Security */}
          <Section icon={Lock} iconTone="green" title="Data security">
            <p>
              We implement appropriate technical and organizational measures to
              protect your personal information against unauthorized access,
              alteration, disclosure, or destruction. This includes encryption,
              secure data storage, and regular security audits. However, no
              method of transmission over the internet is 100% secure, and we
              cannot guarantee absolute security.
            </p>
          </Section>

          {/* Cookies */}
          <Section icon={Cookie} iconTone="purple" title="Cookies and tracking">
            <p>
              We use cookies and similar tracking technologies to enhance your
              experience, personalize content, and analyze our traffic. You can
              control cookie preferences in your browser settings. Please note
              that disabling cookies may affect the functionality of our
              platform.
            </p>
          </Section>

          {/* User Rights */}
          <Section
            icon={User}
            iconTone="purple"
            title="Your rights and choices"
          >
            <p className="mb-4">You have the right to:</p>
            <CheckList
              items={[
                "Access, update, or delete your personal information",
                "Opt-out of marketing communications",
                "Request a copy of your data in a portable format",
                "Withdraw consent at any time where we rely on your consent",
              ]}
            />
            <p className="mt-4">
              To exercise these rights, please contact us using the information
              provided below.
            </p>
          </Section>

          {/* Data Retention */}
          <Section icon={Shield} iconTone="purple" title="Data retention">
            <p>
              We retain your personal information only for as long as necessary
              to fulfill the purposes outlined in this policy, unless a longer
              retention period is required by law. We will securely delete or
              anonymize your information when it is no longer needed.
            </p>
          </Section>

          {/* Children's Privacy */}
          <Section icon={User} iconTone="purple" title="Children's privacy">
            <p>
              Our services are not intended for individuals under the age of 18.
              We do not knowingly collect personal information from children. If
              you are a parent or guardian and believe your child has provided
              us with personal information, please contact us immediately.
            </p>
          </Section>

          {/* Changes */}
          <Section
            icon={Shield}
            iconTone="purple"
            title="Changes to this policy"
          >
            <p>
              We may update this Privacy Policy from time to time to reflect
              changes in our practices or legal requirements. We will notify you
              of any significant changes by posting the new policy on this page
              and updating the "Last Updated" date. We encourage you to review
              this policy periodically.
            </p>
          </Section>

          {/* Contact */}
          <Section icon={Lock} iconTone="purple" title="Contact us">
            <p>
              If you have any questions, concerns, or requests regarding this
              Privacy Policy, please contact us at:
            </p>
            <div className="mt-4 rounded-md border border-border bg-bg-subtle p-4">
              <p style={FONT_MONO} className="text-[13px] text-heading">
                📧 privacy@waveverify.com
              </p>
              <p style={FONT_MONO} className="mt-1 text-[13px] text-heading">
                🌐 www.waveverify.com
              </p>
            </div>
          </Section>

          {/* CTA */}
          <div className="pt-6 text-center">
            <Link
              to="/"
              className="inline-flex items-center gap-2 rounded-md bg-brand px-6 py-3 text-[14px] font-medium text-on-brand transition-colors hover:bg-brand-hover"
            >
              Return to Home
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </main>

      {/* Footer — same language as homepage footer */}
      <footer className="relative z-10 mt-8 border-t border-border bg-bg px-6 py-8">
        <div className="mx-auto max-w-4xl text-center">
          <p className="text-[12.5px] text-muted">
            © {new Date().getFullYear()} DigiTools. All rights reserved.
          </p>
          <div className="mt-3 flex justify-center gap-6">
            <Link
              to="/terms"
              className="text-[13px] text-muted transition-colors hover:text-heading"
            >
              Terms
            </Link>
            <Link
              to="/Privacy"
              className="text-[13px] text-muted transition-colors hover:text-heading"
            >
              Privacy
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
};

/* ------------------------------------------------------------------ */
/* Helpers                                                             */
/* ------------------------------------------------------------------ */

/**
 * Section — a consistent card wrapper for each privacy section.
 * Matches the card language used on the homepage + Register + Login.
 */
function Section({ icon: Icon, iconTone = "purple", title, children }) {
  const toneClasses =
    iconTone === "green"
      ? "bg-success-soft text-success"
      : "bg-brand-soft text-brand-text";

  return (
    <section className="rounded-xl border border-border bg-surface p-6 shadow-card md:p-8">
      <h2
        style={FONT_DISPLAY}
        className="mb-4 flex items-center gap-3 text-[18px] font-semibold text-heading md:text-[20px]"
      >
        <span
          className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-md ${toneClasses}`}
        >
          <Icon className="h-4 w-4" />
        </span>
        {title}
      </h2>
      <div className="text-[14px] leading-relaxed text-muted md:text-[14.5px]">
        {children}
      </div>
    </section>
  );
}

/**
 * CheckList — consistent bullet list with check icons.
 */
function CheckList({ items }) {
  return (
    <ul className="space-y-3">
      {items.map((item, i) => (
        <li key={i} className="flex items-start gap-3">
          <CheckCircle className="mt-0.5 h-4 w-4 shrink-0 text-success" />
          <span className="text-[14px] leading-relaxed text-muted md:text-[14.5px]">
            {item}
          </span>
        </li>
      ))}
    </ul>
  );
}

export default Privacy;
