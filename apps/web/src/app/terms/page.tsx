import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Terms of Service',
  description: 'Terms of Service for Pulse',
};

export default function TermsOfServicePage() {
  return (
    <main className="max-w-3xl mx-auto py-16 px-6 sm:px-12 prose dark:prose-invert">
      <h1 className="text-3xl font-bold tracking-tight mb-8">Terms of Service</h1>
      
      <p className="text-muted-foreground mb-8">
        Last updated: {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
      </p>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-4">1. Acceptance of Terms</h2>
        <p className="mb-4">
          By accessing or using the Pulse platform, you agree to be bound by these Terms of Service. 
          If you do not agree to these terms, you may not access or use the service.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-4">2. Description of Service</h2>
        <p className="mb-4">
          Pulse provides an interactive audience engagement platform that allows hosts to create live polls, Q&amp;A sessions, 
          and quizzes during presentations and meetings.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-4">3. User Conduct</h2>
        <p className="mb-4">
          You agree not to use the service to:
        </p>
        <ul className="list-disc pl-6 mb-4 space-y-2">
          <li>Upload or transmit any content that is unlawful, harmful, threatening, abusive, or offensive.</li>
          <li>Impersonate any person or entity, or falsely state your affiliation with a person or entity.</li>
          <li>Interfere with or disrupt the service or servers connected to the service.</li>
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-4">4. Intellectual Property</h2>
        <p className="mb-4">
          All content and materials available on Pulse, including but notğimiz limited to text, graphics, website name, 
          code, images, and logos are the intellectual property of Pulse and are protected by applicable copyright and trademark law.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-4">5. Disclaimer of Warranties</h2>
        <p className="mb-4">
          The service is provided on an "as is" and "as available" basis without any warranties of any kind, 
          either express or implied.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-4">6. Contact Information</h2>
        <p className="mb-4">
          If you have any questions about these Terms, please contact us at 
          <a href="mailto:questliv.support@gmail.com" className="text-blue-600 hover:underline ml-1">questliv.support@gmail.com</a>.
        </p>
      </section>
    </main>
  );
}
