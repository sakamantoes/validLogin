// TermsAndConditions.jsx
import React from "react";
import { Link } from "react-router-dom";
import { Shield, CheckCircle, ArrowRight, Home } from "lucide-react";
import ThemeToggle from "../components/ThemeToggle";
import SiteLogo from "../components/SiteLogo";
import imageObject from "../utils/image";

const TermsAndConditions = () => {
  return (
    <div className="min-h-screen bg-bg text-heading">
      <ThemeToggle className="fixed right-4 top-4 z-50" />
      {/* Background */}
      <div className="fixed inset-0 z-0">
        <div className="absolute inset-0 theme-radial" />
        <div className="absolute inset-0 theme-grid opacity-[0.06]" />
      </div>

      {/* Navigation */}
      <header className="sticky top-0 z-50 border-b border-brand bg-bg backdrop-blur-lg">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <img src={imageObject.Logo} className="h-[50px] w-[150px] rounded-md"/>
          <Link
            to="/"
            className="text-muted hover:text-brand-text transition-colors text-sm flex items-center gap-2"
          >
            <Home className="h-4 w-4" />
            Back to Home
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 max-w-4xl mx-auto px-6 py-16 md:py-24">
        <div className="mb-12 text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-brand px-4 py-1.5 text-xs text-brand-text mb-4">
            <Shield className="h-3.5 w-3.5" />
            Legal Document
          </div>
          <h1
            className="text-4xl md:text-5xl font-bold mb-4"
            style={{ fontFamily: "Space Grotesk, sans-serif" }}
          >
            Terms & <span className="text-brand-text">Conditions</span>
          </h1>
          <p className="text-muted text-sm">Last Updated: September 1, 2026</p>
        </div>

        <div className="space-y-8">
          {/* Introduction */}
          <section className="bg-surface backdrop-blur-sm rounded-2xl border border-brand p-6 md:p-8">
            <h2
              className="text-xl font-bold mb-4 flex items-center gap-3"
              style={{ fontFamily: "Space Grotesk, sans-serif" }}
            >
              <CheckCircle className="h-5 w-5 text-success" />
              1. Acceptance of Terms
            </h2>
            <p className="text-muted leading-relaxed text-sm md:text-base">
              By accessing and using this website and our services, you agree to
              be bound by these Terms and Conditions. If you do not agree with
              any part of these terms, please do not use our services. We
              reserve the right to update these terms at any time, and your
              continued use constitutes acceptance of any changes.
            </p>
          </section>

          {/* Services */}
          <section className="bg-surface backdrop-blur-sm rounded-2xl border border-brand p-6 md:p-8">
            <h2
              className="text-xl font-bold mb-4"
              style={{ fontFamily: "Space Grotesk, sans-serif" }}
            >
              2. Description of Services
            </h2>
            <p className="text-muted leading-relaxed text-sm md:text-base mb-4">
              We provide temporary phone number services for verification
              purposes. Our platform allows users to:
            </p>
            <ul className="space-y-3 text-muted text-sm md:text-base">
              <li className="flex items-start gap-3">
                <CheckCircle className="h-4 w-4 shrink-0 text-success mt-1" />
                <span>
                  Rent real, carrier-verified phone numbers from multiple
                  countries
                </span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle className="h-4 w-4 shrink-0 text-success mt-1" />
                <span>
                  Receive SMS verification codes for various platforms
                </span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle className="h-4 w-4 shrink-0 text-success mt-1" />
                <span>
                  Access numbers for short-term or extended rental periods
                </span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle className="h-4 w-4 shrink-0 text-success mt-1" />
                <span>Manage verifications through our dashboard</span>
              </li>
            </ul>
          </section>

          {/* User Responsibilities */}
          <section className="bg-surface backdrop-blur-sm rounded-2xl border border-brand p-6 md:p-8">
            <h2
              className="text-xl font-bold mb-4"
              style={{ fontFamily: "Space Grotesk, sans-serif" }}
            >
              3. User Responsibilities
            </h2>
            <p className="text-muted leading-relaxed text-sm md:text-base mb-4">
              As a user, you agree to:
            </p>
            <ul className="space-y-3 text-muted text-sm md:text-base">
              <li className="flex items-start gap-3">
                <CheckCircle className="h-4 w-4 shrink-0 text-success mt-1" />
                <span>
                  Provide accurate and complete information when creating an
                  account
                </span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle className="h-4 w-4 shrink-0 text-success mt-1" />
                <span>
                  Use our services only for legitimate verification purposes
                </span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle className="h-4 w-4 shrink-0 text-success mt-1" />
                <span>
                  Not use our services for any illegal, fraudulent, or harmful
                  activities
                </span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle className="h-4 w-4 shrink-0 text-success mt-1" />
                <span>Maintain the security of your account credentials</span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle className="h-4 w-4 shrink-0 text-success mt-1" />
                <span>
                  Notify us immediately of any unauthorized use of your account
                </span>
              </li>
            </ul>
          </section>

          {/* Payments */}
          <section className="bg-surface backdrop-blur-sm rounded-2xl border border-brand p-6 md:p-8">
            <h2
              className="text-xl font-bold mb-4"
              style={{ fontFamily: "Space Grotesk, sans-serif" }}
            >
              4. Payments and Refunds
            </h2>
            <p className="text-muted leading-relaxed text-sm md:text-base">
              Our services are offered on a pay-per-use or subscription basis.
              All payments are processed securely through our payment partners.
              We do not store your payment information. Refunds may be issued at
              our discretion for failed verifications or technical issues.
              Please contact our support team for any payment-related inquiries.
            </p>
          </section>

          {/* Intellectual Property */}
          <section className="bg-surface backdrop-blur-sm rounded-2xl border border-brand p-6 md:p-8">
            <h2
              className="text-xl font-bold mb-4"
              style={{ fontFamily: "Space Grotesk, sans-serif" }}
            >
              5. Intellectual Property
            </h2>
            <p className="text-muted leading-relaxed text-sm md:text-base">
              All content, features, and functionality on this platform,
              including but not limited to text, graphics, logos, and software,
              are the exclusive property of Wave Verify and are protected by
              copyright, trademark, and other intellectual property laws. You
              may not copy, modify, distribute, or create derivative works
              without our explicit written consent.
            </p>
          </section>

          {/* Privacy */}
          <section className="bg-surface backdrop-blur-sm rounded-2xl border border-brand p-6 md:p-8">
            <h2
              className="text-xl font-bold mb-4"
              style={{ fontFamily: "Space Grotesk, sans-serif" }}
            >
              6. Privacy Policy
            </h2>
            <p className="text-muted leading-relaxed text-sm md:text-base">
              Your privacy is important to us. Please review our separate{" "}
              <Link to="/privacy" className="text-brand-text hover:underline">
                Privacy Policy
              </Link>
              to understand how we collect, use, and protect your personal
              information.
            </p>
          </section>

          {/* Limitations */}
          <section className="bg-surface backdrop-blur-sm rounded-2xl border border-brand p-6 md:p-8">
            <h2
              className="text-xl font-bold mb-4"
              style={{ fontFamily: "Space Grotesk, sans-serif" }}
            >
              7. Limitations of Liability
            </h2>
            <p className="text-muted leading-relaxed text-sm md:text-base">
              Our services are provided "as is" without warranties of any kind.
              We do not guarantee that our services will be uninterrupted,
              error-free, or completely secure. To the fullest extent permitted
              by law, we shall not be liable for any indirect, incidental,
              special, consequential, or punitive damages arising from your use
              of our services.
            </p>
          </section>

          {/* Termination */}
          <section className="bg-surface backdrop-blur-sm rounded-2xl border border-brand p-6 md:p-8">
            <h2
              className="text-xl font-bold mb-4"
              style={{ fontFamily: "Space Grotesk, sans-serif" }}
            >
              8. Termination
            </h2>
            <p className="text-muted leading-relaxed text-sm md:text-base">
              We reserve the right to suspend or terminate your account at any
              time for violation of these terms, illegal activities, or at our
              sole discretion. Upon termination, you must immediately cease
              using our services and any outstanding fees will become due.
            </p>
          </section>

          {/* Governing Law */}
          <section className="bg-surface backdrop-blur-sm rounded-2xl border border-brand p-6 md:p-8">
            <h2
              className="text-xl font-bold mb-4"
              style={{ fontFamily: "Space Grotesk, sans-serif" }}
            >
              9. Governing Law
            </h2>
            <p className="text-muted leading-relaxed text-sm md:text-base">
              These terms shall be governed by and construed in accordance with
              the laws of the jurisdiction in which our company is registered,
              without regard to its conflict of law provisions. Any disputes
              arising under these terms shall be subject to the exclusive
              jurisdiction of the courts in that jurisdiction.
            </p>
          </section>

          {/* Contact */}
          <section className="bg-surface backdrop-blur-sm rounded-2xl border border-brand p-6 md:p-8">
            <h2
              className="text-xl font-bold mb-4"
              style={{ fontFamily: "Space Grotesk, sans-serif" }}
            >
              10. Contact Us
            </h2>
            <p className="text-muted leading-relaxed text-sm md:text-base">
              If you have any questions about these Terms and Conditions, please
              contact us at:
            </p>
            <div className="mt-4 p-4 rounded-lg border border-brand bg-bg">
              <p className="text-heading font-mono text-sm">
                📧 support@waveverify.com
              </p>
              <p className="text-heading font-mono text-sm mt-1">
                🌐 www.waveverify.com
              </p>
            </div>
          </section>

          {/* CTA */}
          <div className="text-center pt-4">
            <Link
              to="/"
              className="inline-flex items-center gap-2 bg-brand text-on-brand px-8 py-3 rounded-lg font-medium hover:scale-105 transition-transform text-sm"
            >
              Return to Home
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 border-t border-brand bg-surface px-6 py-8 mt-8">
        <div className="mx-auto max-w-4xl text-center text-xs text-muted">
          © {new Date().getFullYear()} Wave Verify. All rights reserved.
          <div className="flex justify-center gap-6 mt-2">
            <Link
              to="/terms"
              className="hover:text-brand-text transition-colors"
            >
              Terms
            </Link>
            <Link
              to="/privacy"
              className="hover:text-brand-text transition-colors"
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
