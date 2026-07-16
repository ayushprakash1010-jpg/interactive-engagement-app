import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description: 'Privacy Policy for Pulse',
};

export default function PrivacyPolicyPage() {
  return (
    <main className="max-w-3xl mx-auto py-16 px-6 sm:px-12 prose dark:prose-invert">
      <h1 className="text-3xl font-bold tracking-tight mb-8">Privacy Policy</h1>
      
      <p className="text-muted-foreground mb-8">
        Last updated: {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
      </p>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-4">1. Information We Collect</h2>
        <p className="mb-4">
          When you use Pulse, we collect the minimum amount of information necessary to provide you with our services. 
          This includes:
        </p>
        <ul className="list-disc pl-6 mb-4 space-y-2">
          <li><strong>Account Information:</strong> If you create an account, we collect your name, email address, and authentication data provided by third-party identity providers (e.g., Google, Microsoft, Zoom).</li>
          <li><strong>Event Data:</strong> Any polls, quizzes, Q&amp;A sessions, and feedback created through our platform.</li>
          <li><strong>Participant Data:</strong> Anonymous or identified responses to interactive sessions.</li>
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-4">2. How We Use Your Information</h2>
        <p className="mb-4">We use the information we collect to:</p>
        <ul className="list-disc pl-6 mb-4 space-y-2">
          <li>Provide, maintain, and improve the Pulse platform.</li>
          <li>Facilitate real-time interactions during meetings and presentations.</li>
          <li>Provide technical support and respond to user inquiries.</li>
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-4">3. Third-Party Integrations</h2>
        <p className="mb-4">
          Pulse integrates with third-party services such as Zoom, Google Meet, Microsoft Teams, and PowerPoint. 
          When you use these integrations, your data is handled in accordance with the respective privacy policies of these platforms.
          Pulse only requests the permissions strictly necessary to display our application interface within these platforms.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-4">4. Data Security</h2>
        <p className="mb-4">
          We implement appropriate technical and organizational security measures to protect your personal information 
          against unauthorized access, alteration, disclosure, or destruction.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-4">5. Contact Us</h2>
        <p className="mb-4">
          If you have any questions or concerns about this Privacy Policy, please contact us at 
          <a href="mailto:questliv.support@gmail.com" className="text-blue-600 hover:underline ml-1">questliv.support@gmail.com</a>.
        </p>
      </section>
    </main>
  );
}
