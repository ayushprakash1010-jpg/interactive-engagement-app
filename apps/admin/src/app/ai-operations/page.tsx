import { Metadata } from 'next';
import { AiOperationsClient } from './ai-operations-client';

export const metadata: Metadata = {
  title: 'AI Operations | Pulse Admin',
};

export default function AiOperationsPage() {
  return (
    <div className="max-w-[1200px] mx-auto w-full p-8 pb-24">
      <div className="mb-8 border-b border-[var(--border-default)] pb-6">
        <h1 className="text-3xl font-bold tracking-tight text-[var(--text-primary)]">
          AI Operations & Telemetry
        </h1>
        <p className="mt-2 text-lg text-[var(--text-secondary)]">
          Monitor system-wide AI usage, latency, and costs across all organizations.
        </p>
      </div>
      
      <div className="mt-8">
        <AiOperationsClient />
      </div>
    </div>
  );
}
