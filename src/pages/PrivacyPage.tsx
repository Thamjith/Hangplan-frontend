import { StaticDocLayout } from '../components/StaticDocLayout'

export function PrivacyPage() {
  return (
    <StaticDocLayout title="Privacy Policy">
      <p className="lp-static__updated">Last updated: May 3, 2026</p>
      <p>
        This Privacy Policy describes how HangPlan (&quot;we&quot;, &quot;us&quot;, or &quot;our&quot;) collects,
        uses, and shares information when you use our website and services (the &quot;Service&quot;). By using
        the Service, you agree to this policy. If you do not agree, do not use the Service.
      </p>
      <p className="lp-static__note">
        This document is provided for transparency and operational clarity. It is not personalized legal
        advice. For jurisdiction-specific questions, consult a qualified attorney.
      </p>

      <h2>Information we collect</h2>
      <ul>
        <li>
          <strong>Account data:</strong> name, email address, authentication provider (for example local
          credentials or Google), subscription status, and profile fields you choose to provide.
        </li>
        <li>
          <strong>Phone number (optional):</strong> if you add a phone number, we store it in international
          (E.164) form so we can associate country codes correctly. You may remove it at any time from your
          profile.
        </li>
        <li>
          <strong>Approximate location (optional):</strong> when you sign in, the Service may request a
          one-time device position from your browser (subject to your browser or OS permission). If you
          allow access, we may store latitude and longitude for future features such as location-relevant
          event suggestions. If you deny access, no coordinates are stored from that sign-in. You can clear
          stored coordinates at any time from your profile.
        </li>
        <li>
          <strong>Usage and content:</strong> events you create or join, participant lists you interact with,
          expense entries, and similar content needed to operate collaborative features.
        </li>
        <li>
          <strong>Technical data:</strong> standard server and security logs (for example IP address, user
          agent, timestamps) used to protect the Service, diagnose issues, and prevent abuse.
        </li>
      </ul>

      <h2>How we use information</h2>
      <p>We use the information above to:</p>
      <ul>
        <li>Provide, maintain, and improve the Service;</li>
        <li>Authenticate users and enforce access controls;</li>
        <li>Communicate about the Service where appropriate (for example account or security notices);</li>
        <li>Support location-aware suggestions when available, using coordinates collected as described above;</li>
        <li>Comply with law, respond to lawful requests, and protect rights and safety.</li>
      </ul>

      <h2>Legal bases (where applicable)</h2>
      <p>
        Depending on your region, we may rely on performance of a contract, legitimate interests (for
        example security and product improvement), consent (for optional phone and location fields), and
        legal obligation.
      </p>

      <h2>Sharing</h2>
      <p>
        We do not sell your personal information. We may share data with infrastructure and authentication
        providers strictly as needed to run the Service (for example hosting, email, or OAuth providers),
        subject to their terms and safeguards. We may disclose information if required by law or to protect
        HangPlan and its users.
      </p>

      <h2>Retention</h2>
      <p>
        We retain information for as long as your account is active and as needed to provide the Service,
        comply with legal obligations, resolve disputes, and enforce agreements. Optional fields are removed
        when you delete them from your profile, subject to ordinary backups and legal holds.
      </p>

      <h2>Security</h2>
      <p>
        We implement reasonable technical and organizational measures designed to protect personal data. No
        method of transmission or storage is completely secure; use the Service at your own risk within that
        reality.
      </p>

      <h2>Your choices</h2>
      <ul>
        <li>Access or update profile information (including optional phone and location) through the in-app
          profile screen;</li>
        <li>Withdraw consent for optional processing by removing your phone number or saved location from your profile, or by denying browser location on future sign-ins;</li>
        <li>Request account deletion where offered; residual copies may persist for a limited period in
          backups.</li>
      </ul>

      <h2>International transfers</h2>
      <p>
        If you access the Service from outside the country where our servers operate, your information may
        be processed in other jurisdictions with different data protection laws.
      </p>

      <h2>Children</h2>
      <p>
        The Service is not directed at children under the age where parental consent is required in their
        jurisdiction. We do not knowingly collect personal information from such children.
      </p>

      <h2>Changes</h2>
      <p>
        We may update this Privacy Policy from time to time. We will post the revised version and update the
        &quot;Last updated&quot; date. Continued use after changes constitutes acceptance where permitted by
        law.
      </p>

      <h2>Contact</h2>
      <p>
        For privacy-related requests, use the Contact page when available, or reach us through the support
        channel listed on the site.
      </p>
    </StaticDocLayout>
  )
}
