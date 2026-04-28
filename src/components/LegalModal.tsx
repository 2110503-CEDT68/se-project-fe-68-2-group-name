"use client";

import { useEffect, useState } from "react";

type LegalModalType = "terms" | "privacy";

type LegalModalProps = {
  type: LegalModalType | null;
  onClose: () => void;
};

export default function LegalModal({ type, onClose }: LegalModalProps) {
  const [activeTab, setActiveTab] = useState<LegalModalType>("terms");

  useEffect(() => {
    if (type) {
      setActiveTab(type);
    }
  }, [type]);

  if (!type) return null;

  const isTerms = activeTab === "terms";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/40 px-4 backdrop-blur-sm">
      <div className="relative max-h-[88vh] w-full max-w-3xl overflow-hidden rounded-3xl border border-gray-100 bg-white text-gray-900 shadow-2xl">
        <div className="pointer-events-none absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-blue-50 to-transparent" />

        <div className="sticky top-0 z-10 border-b border-gray-100 bg-white/90 px-6 py-5 backdrop-blur-md">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-blue-500">
                CoWorkHub Legal
              </p>

              <h2 className="mt-3 text-3xl font-bold tracking-tight text-gray-900">
                {isTerms ? "Terms of Service" : "Privacy Policy"}
              </h2>

              <p className="mt-2 text-sm text-gray-400">
                Last updated: April 28, 2026
              </p>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="rounded-full border border-gray-200 bg-white px-3 py-1.5 mb-5 text-sm font-medium text-gray-500 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-500"
              aria-label="Close legal modal"
            >
              Close
            </button>
          </div>

          <div className="mt-5 grid grid-cols-2 rounded-2xl bg-gray-100 p-1">
            <button
              type="button"
              onClick={() => setActiveTab("terms")}
              className={`rounded-xl px-4 py-2 text-sm font-medium transition ${
                activeTab === "terms"
                  ? "bg-white text-blue-500 shadow-sm"
                  : "text-gray-500 hover:text-gray-900"
              }`}
            >
              Terms of Service
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("privacy")}
              className={`rounded-xl px-4 py-2 text-sm font-medium transition ${
                activeTab === "privacy"
                  ? "bg-white text-blue-500 shadow-sm"
                  : "text-gray-500 hover:text-gray-900"
              }`}
            >
              Privacy Policy
            </button>
          </div>
        </div>

        <div className="max-h-[calc(88vh-170px)] overflow-y-auto px-6 py-8">
          {isTerms ? <TermsContent /> : <PrivacyContent />}

          <div className="my-10 border-t border-gray-100 pt-6">
            <button
            type="button"
            onClick={onClose}
            className="inline-flex items-center justify-center rounded-xl bg-blue-500 px-5 py-2.5 text-sm font-medium text-white shadow transition-colors hover:bg-blue-600 hover:text-white"
            >
            I Understand
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function LegalSection({
  number,
  title,
  children,
}: {
  number: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="border-t border-gray-100 pt-6 first:border-t-0 first:pt-0">
      <div className="flex gap-4">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-50 text-xs font-semibold text-blue-500">
          {number}
        </div>

        <div>
          <h3 className="text-sm font-semibold uppercase tracking-[0.12em] text-gray-900">
            {title}
          </h3>

          <div className="mt-3 text-sm leading-7 text-gray-600">
            {children}
          </div>
        </div>
      </div>
    </section>
  );
}

function TermsContent() {
  return (
    <div className="space-y-8">
      <div className="rounded-2xl border border-blue-100 bg-blue-50/60 p-5">
        <p className="text-sm leading-7 text-gray-600">
          These Terms of Service explain how users may access and use CoWorkHub,
          including account registration, coworking space reservations,
          comments, ratings, reactions, and administrator-managed platform
          features.
        </p>
      </div>

      <LegalSection number="1" title="Acceptance of Terms">
        <p>
          By creating an account or using CoWorkHub, you agree to use the
          platform responsibly and follow these Terms of Service.
        </p>
      </LegalSection>

      <LegalSection number="2" title="Account Responsibility">
        <p>
          You are responsible for keeping your account information accurate and
          your password secure. You must not use another person&apos;s account,
          share your account for unauthorized use, or attempt to bypass platform
          security.
        </p>
      </LegalSection>

      <LegalSection number="3" title="Reservations">
        <p>
          Users may create, view, edit, or delete reservations through the
          platform. Reservation details such as date, time, capacity, coworking
          space, and total cost should be checked carefully before confirmation.
        </p>
      </LegalSection>

      <LegalSection number="4" title="User Conduct">
        <p>
          Users must not post harmful, abusive, misleading, spammy, illegal, or
          disruptive content through comments, reviews, reactions, reports, or
          custom emoji uploads.
        </p>
      </LegalSection>

      <LegalSection number="5" title="Comments and Reactions">
        <p>
          Comments, ratings, and reactions should be used to share honest
          feedback. CoWorkHub may remove or moderate content that violates
          community standards or affects platform safety.
        </p>
      </LegalSection>

      <LegalSection number="6" title="Administrator Rights">
        <p>
          Administrators may manage coworking spaces, reservations, comments,
          reports, blocked users, and custom emojis to maintain platform quality
          and prevent misuse.
        </p>
      </LegalSection>

      <LegalSection number="7" title="Service Availability">
        <p>
          CoWorkHub may not always be available due to maintenance, updates,
          technical problems, external service issues, or other events outside
          the platform&apos;s control.
        </p>
      </LegalSection>

      <LegalSection number="8" title="Changes to Terms">
        <p>
          We may update these Terms of Service when needed. Continued use of
          CoWorkHub after updates means you accept the revised terms.
        </p>
      </LegalSection>
    </div>
  );
}

function PrivacyContent() {
  return (
    <div className="space-y-8">
      <div className="rounded-2xl border border-blue-100 bg-blue-50/60 p-5">
        <p className="text-sm leading-7 text-gray-600">
          This Privacy Policy explains what information CoWorkHub collects, how
          that information is used, and how platform data is handled while users
          browse, register, reserve coworking spaces, and interact with comments
          or reactions.
        </p>
      </div>

      <LegalSection number="1" title="Information We Collect">
        <p>
          CoWorkHub collects information needed to create and manage your
          account, including your name, email address, phone number, and
          password. We may also store reservation details such as selected
          coworking space, booking date, number of people, and total cost.
        </p>
      </LegalSection>

      <LegalSection number="2" title="How We Use Your Information">
        <p>
          We use your information to register your account, authenticate login,
          manage reservations, display your profile, and support platform
          features such as comments, ratings, reports, and custom emojis.
        </p>
      </LegalSection>

      <LegalSection number="3" title="Comments and Reviews">
        <p>
          If you leave comments, ratings, reactions, or reports, that content may
          be stored and shown inside the platform. Administrators may review,
          moderate, delete, block, or manage this content to keep the community
          safe and respectful.
        </p>
      </LegalSection>

      <LegalSection number="4" title="Data Protection">
        <p>
          We aim to protect your personal data from unauthorized access, misuse,
          or loss. However, no online service is completely secure, so users
          should keep their password private and avoid sharing account
          credentials.
        </p>
      </LegalSection>

      <LegalSection number="5" title="Sharing of Information">
        <p>
          We do not sell your personal information. Your information may be
          accessed by authorized administrators only when needed to operate the
          coworking reservation service or enforce platform rules.
        </p>
      </LegalSection>

      <LegalSection number="6" title="Your Choices">
        <p>
          You may update supported account information through your profile. If
          you want your account or personal information removed, please contact
          the platform administrator.
        </p>
      </LegalSection>

      <LegalSection number="7" title="Changes to This Policy">
        <p>
          We may update this Privacy Policy when the app changes. Continued use
          of CoWorkHub after updates means you accept the revised policy.
        </p>
      </LegalSection>
    </div>
  );
}