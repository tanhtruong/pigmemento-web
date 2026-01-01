import React from 'react';

export function PrivacyPolicy() {
  return (
    <main className="mx-auto max-w-3xl px-6 py-12 text-slate-800">
      <h1 className="mb-2 text-3xl font-semibold tracking-tight">
        Privacy Policy
      </h1>
      <p className="mb-8 text-sm text-slate-500">Last updated: January 2026</p>

      <p className="mb-6 leading-relaxed">
        Pigmemento ("we", "our", or "the app") is an educational application
        designed to support visual learning in dermatology. This Privacy Policy
        explains how information is handled when you use the app.
      </p>

      <Section title="1. Purpose of the App">
        <p>
          Pigmemento is intended{' '}
          <strong className="font-medium">for educational purposes only</strong>
          . It does <strong>not</strong> provide medical advice, diagnosis, or
          treatment recommendations.
        </p>
      </Section>

      <Section title="2. Information We Collect">
        <ul className="list-disc space-y-2 pl-6">
          <li>
            An account identifier (such as an email address or hashed email), if
            account creation is enabled
          </li>
          <li>
            Usage data related to educational activity (e.g. quiz attempts,
            response times, and performance metrics)
          </li>
        </ul>
      </Section>

      <Section title="3. Information We Do Not Collect">
        <ul className="list-disc space-y-2 pl-6">
          <li>Patient data</li>
          <li>Health or medical records</li>
          <li>Photos or camera data</li>
          <li>Location data</li>
          <li>Contacts</li>
          <li>Advertising identifiers</li>
          <li>HealthKit or similar health data</li>
        </ul>
      </Section>

      <Section title="4. How Information Is Used">
        <ul className="list-disc space-y-2 pl-6">
          <li>Provide core app functionality</li>
          <li>Improve educational features</li>
          <li>Analyze aggregated and anonymized usage patterns</li>
        </ul>
        <p className="mt-4">
          We do <strong>not</strong> use personal data for advertising or
          marketing purposes.
        </p>
      </Section>

      <Section title="5. Data Sharing">
        <p>
          We do not sell, rent, or share personal data with third parties for
          marketing purposes.
        </p>
        <p className="mt-2">
          Data may be processed by trusted service providers only as required to
          operate the app (such as hosting and storage).
        </p>
      </Section>

      <Section title="6. Tracking">
        <p>
          Pigmemento does <strong>not</strong> track users across apps or
          websites owned by other companies.
        </p>
      </Section>

      <Section title="7. Data Security">
        <p>
          Reasonable technical and organizational measures are used to protect
          information against unauthorized access, loss, or misuse.
        </p>
      </Section>

      <Section title="8. Data Retention">
        <p>
          Data is retained only as long as necessary to support educational
          functionality and may be deleted upon request where applicable.
        </p>
      </Section>

      <Section title="9. Children’s Privacy">
        <p>
          Pigmemento is not intended for use by children under the age of 13.
        </p>
      </Section>

      <Section title="10. Changes to This Policy">
        <p>
          This Privacy Policy may be updated from time to time. Any changes will
          be reflected on this page.
        </p>
      </Section>

      <Section title="11. Contact">
        <p>If you have questions about this Privacy Policy, contact us at:</p>
        <a
          href="mailto:contact@pigmemento.app"
          className="mt-2 inline-block font-medium text-blue-600 hover:underline"
        >
          contact@pigmemento.app
        </a>
      </Section>
    </main>
  );
}

export default PrivacyPolicy;

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="mb-8">
      <h2 className="mb-3 text-xl font-semibold">{title}</h2>
      <div className="space-y-3 leading-relaxed">{children}</div>
    </section>
  );
}
