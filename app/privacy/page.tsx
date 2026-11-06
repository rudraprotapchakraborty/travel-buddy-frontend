import type { Metadata } from "next";
import LegalPage from "@/components/LegalPage";

export const metadata: Metadata = {
  title: "Privacy Policy | Travel Buddy",
  description: "What Travel Buddy collects, why, who it is shared with and how to delete it.",
};

const CONTACT = "rudrapck@gmail.com";

export default function PrivacyPage() {
  return (
    <LegalPage
      title="Privacy Policy"
      updated="6 November 2026"
      intro="Travel Buddy helps travellers find companions and plan trips together. This page explains what information we collect, what we do with it and the choices you have. We keep it to what the service needs."
      sections={[
        {
          title: "Information we collect",
          body: (
            <>
              <p>
                <strong>Account details.</strong> Your name, email address and a password. Passwords are
                stored only as a one-way hash, never in readable form. If you sign in with Google, we receive
                your name, email address and profile picture from Google. We never see your Google password.
              </p>
              <p>
                <strong>Profile and trip content.</strong> The bio, location, interests, countries visited and
                profile photo you choose to add, plus the travel plans, join requests and reviews you post.
              </p>
              <p>
                <strong>Payments.</strong> Subscriptions are processed by Stripe. Your card details go directly
                to Stripe and are never stored on our servers. We keep a record of the plan, amount and status.
              </p>
              <p>
                <strong>Technical data.</strong> Our hosting provider and server logs record standard request
                data such as IP address, browser type and time, which we use for security and troubleshooting.
              </p>
            </>
          ),
        },
        {
          title: "How we use it",
          body: (
            <ul>
              <li>To create your account and sign you in, including emailed verification and reset codes.</li>
              <li>To show your profile and public trip plans to other travellers and match you with companions.</li>
              <li>To process subscriptions and show your verified status.</li>
              <li>To prevent abuse, enforce our Terms and keep the service secure.</li>
              <li>To contact you about your account or respond to your messages.</li>
            </ul>
          ),
        },
        {
          title: "What other people can see",
          body: (
            <p>
              Your name, photo, bio, interests, rating and reviews are visible to other signed-in users. Trip
              plans marked public are visible to everyone who is signed in; private plans are visible only to
              you. Your email address and password are never shown to other users.
            </p>
          ),
        },
        {
          title: "Who we share it with",
          body: (
            <>
              <p>We do not sell your personal information. We use these services to run Travel Buddy:</p>
              <ul>
                <li><strong>MongoDB Atlas</strong> stores account and trip data.</li>
                <li><strong>Vercel</strong> hosts the website and API.</li>
                <li><strong>Stripe</strong> processes payments.</li>
                <li><strong>Google</strong> provides optional Google sign-in.</li>
                <li><strong>Gmail (SMTP) and Resend</strong> deliver verification and password reset emails.</li>
                <li><strong>ImgBB</strong> hosts profile pictures you upload.</li>
              </ul>
              <p>We may also disclose information if the law requires it or to protect the safety of our users.</p>
            </>
          ),
        },
        {
          title: "Cookies and local storage",
          body: (
            <p>
              We store your sign-in session in your browser&apos;s local storage so you stay signed in. We do not
              use advertising or cross-site tracking cookies. Google sign-in and Stripe may set their own cookies
              when you use them.
            </p>
          ),
        },
        {
          title: "How long we keep it",
          body: (
            <p>
              We keep your information while your account is active. Verification and reset codes expire after
              10 minutes. When you delete your account, your profile, travel plans, join requests and reviews are
              removed. Payment records may be retained where needed for accounting and legal reasons.
            </p>
          ),
        },
        {
          title: "Your choices and rights",
          body: (
            <>
              <p>
                You can change your name, photo, email and password, and delete your account at any time from{" "}
                <a href="/settings">Account Settings</a>. You may also ask us to access, correct or delete the
                information we hold about you.
              </p>
              <p>
                Email <a href={`mailto:${CONTACT}`}>{CONTACT}</a> and we will respond within a reasonable time.
              </p>
            </>
          ),
        },
        {
          title: "Security",
          body: (
            <p>
              We use encrypted connections, hashed passwords, rate limits on sign-in and short-lived sessions. No
              system is perfectly secure, so please use a strong, unique password.
            </p>
          ),
        },
        {
          title: "Children",
          body: (
            <p>
              Travel Buddy is not intended for anyone under 18, and we do not knowingly collect information from
              children. If you believe a child has an account, contact us and we will remove it.
            </p>
          ),
        },
        {
          title: "Changes and contact",
          body: (
            <p>
              We may update this policy and will change the date above when we do. Questions about privacy can be
              sent to <a href={`mailto:${CONTACT}`}>{CONTACT}</a>.
            </p>
          ),
        },
      ]}
    />
  );
}
