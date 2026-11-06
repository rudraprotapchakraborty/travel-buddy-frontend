import type { Metadata } from "next";
import LegalPage from "@/components/LegalPage";

export const metadata: Metadata = {
  title: "Terms of Service | Travel Buddy",
  description: "The rules for using Travel Buddy, including safety, payments and account deletion.",
};

const CONTACT = "rudrapck@gmail.com";

export default function TermsPage() {
  return (
    <LegalPage
      title="Terms of Service"
      updated="6 November 2026"
      intro="By creating an account or using Travel Buddy you agree to these terms. If you do not agree, please do not use the service."
      sections={[
        {
          title: "The service",
          body: (
            <p>
              Travel Buddy lets travellers publish trip plans, find companions, send join requests and leave
              reviews. We provide the platform only. We are not a travel agency and we do not organise, sell or
              guarantee any trip, accommodation or transport.
            </p>
          ),
        },
        {
          title: "Your account",
          body: (
            <ul>
              <li>You must be at least 18 years old and provide accurate information.</li>
              <li>You must verify your email address with the code we send you.</li>
              <li>Keep your password private. You are responsible for activity on your account.</li>
              <li>You may have one account and may not impersonate anyone else.</li>
            </ul>
          ),
        },
        {
          title: "Meeting people and staying safe",
          body: (
            <>
              <p>
                <strong>Travel Buddy does not check the identity or background of its users.</strong> The
                &quot;verified&quot; badge means a user has an active paid plan; it is not a background check. You
                are responsible for deciding whom to travel with.
              </p>
              <ul>
                <li>Meet in public places first and share your plans with someone you trust.</li>
                <li>Do not send money to people you have not met.</li>
                <li>Report suspicious behaviour through the Contact page.</li>
              </ul>
            </>
          ),
        },
        {
          title: "Acceptable use",
          body: (
            <>
              <p>You agree not to:</p>
              <ul>
                <li>post false, offensive, discriminatory or illegal content;</li>
                <li>harass, threaten or scam other users, or post fake reviews;</li>
                <li>scrape the service, probe it for weaknesses or interfere with its operation;</li>
                <li>use the platform for advertising or any commercial solicitation.</li>
              </ul>
              <p>We may remove content and suspend or delete accounts that break these rules.</p>
            </>
          ),
        },
        {
          title: "Your content",
          body: (
            <p>
              You keep ownership of what you post. You give Travel Buddy permission to store and display it to
              other users as part of the service. You promise you have the right to share it, including any photo
              you upload.
            </p>
          ),
        },
        {
          title: "Subscriptions and payments",
          body: (
            <p>
              Paid plans are billed through Stripe at the price shown when you subscribe. A plan grants access for
              the period you paid for. Fees are not refundable unless required by law, though you can contact us
              if something went wrong with a payment.
            </p>
          ),
        },
        {
          title: "Ending your account",
          body: (
            <p>
              You can delete your account at any time from <a href="/settings">Account Settings</a>. Deleting it
              permanently removes your profile, travel plans, requests and reviews. We may suspend or end accounts
              that break these terms.
            </p>
          ),
        },
        {
          title: "Disclaimers and liability",
          body: (
            <p>
              The service is provided &quot;as is&quot;, without promises that it will always be available or error
              free. To the extent the law allows, Travel Buddy is not liable for what happens between users, for
              trips, injuries, losses or disputes, or for indirect damages arising from your use of the service.
              Nothing here limits rights you have under the law.
            </p>
          ),
        },
        {
          title: "Changes and contact",
          body: (
            <p>
              We may update these terms and will change the date above when we do. Continuing to use the service
              means you accept the updated terms. Questions can be sent to{" "}
              <a href={`mailto:${CONTACT}`}>{CONTACT}</a>.
            </p>
          ),
        },
      ]}
    />
  );
}
