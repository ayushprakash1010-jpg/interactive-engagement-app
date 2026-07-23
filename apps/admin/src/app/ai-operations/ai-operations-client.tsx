'use client';

import { useState, useEffect } from 'react';
import { fetchAiOperationsTelemetry, AiOperationsTelemetry } from '@/lib/admin-api';

export function AiOperationsClient() {
  const [telemetry, setTelemetry] = useState<AiOperationsTelemetry | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        const data = await fetchAiOperationsTelemetry();
        setTelemetry(data);
        setError(null);
      } catch (err: any) {
        setError(err.message || 'Failed to load AI operations telemetry');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (loading) {
    return <div className="p-8 text-[var(--text-secondary)]">Loading AI telemetry...</div>;
  }

  if (error) {
    return (
      <div className="p-8">
        <div className="p-4 bg-red-50 border border-red-200 text-red-600 rounded-md">
          {error}
        </div>
      </div>
    );
  }

  if (!telemetry) {
    return null;
  }

  const { summary, features } = telemetry;
  
  // Safe default formatting for average latency
  const formatLatency = (ms: number) => {
    if (!ms) return '0ms';
    return `${Math.round(ms)}ms`;
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="p-6 bg-white rounded-xl shadow-sm border border-[var(--border-default)]">
          <p className="text-sm text-[var(--text-secondary)] font-medium mb-1">Total Requests</p>
          <p className="text-3xl font-bold text-[var(--text-primary)]">{summary.totalRequests.toLocaleString()}</p>
        </div>
        <div className="p-6 bg-white rounded-xl shadow-sm border border-[var(--border-default)]">
          <p className="text-sm text-[var(--text-secondary)] font-medium mb-1">Successful</p>
          <p className="text-3xl font-bold text-green-600">{summary.successfulRequests.toLocaleString()}</p>
        </div>
        <div className="p-6 bg-white rounded-xl shadow-sm border border-[var(--border-default)]">
          <p className="text-sm text-[var(--text-secondary)] font-medium mb-1">Failed</p>
          <p className="text-3xl font-bold text-red-600">{summary.failedRequests.toLocaleString()}</p>
        </div>
        <div className="p-6 bg-white rounded-xl shadow-sm border border-[var(--border-default)]">
          <p className="text-sm text-[var(--text-secondary)] font-medium mb-1">Throttled (429)</p>
          <p className="text-3xl font-bold text-orange-500">{summary.throttledRequests.toLocaleString()}</p>
        </div>
        <div className="p-6 bg-white rounded-xl shadow-sm border border-[var(--border-default)]">
          <p className="text-sm text-[var(--text-secondary)] font-medium mb-1">Avg Latency</p>
          <p className="text-3xl font-bold text-[var(--brand)]">{formatLatency(summary.avgLatencyMs)}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Token Usage Summary */}
        <div className="lg:col-span-1 p-6 bg-white rounded-xl shadow-sm border border-[var(--border-default)]">
          <h2 className="text-lg font-semibold text-[var(--text-primary)] mb-6">Token Usage (90 Days)</h2>
          <div className="flex flex-col items-center justify-center h-48 border-[4px] border-[var(--brand-subtle)] rounded-full w-48 mx-auto">
            <p className="text-4xl font-bold text-[var(--brand)]">{summary.totalTokens.toLocaleString()}</p>
            <p className="text-sm text-[var(--text-secondary)] mt-2">Tokens</p>
          </div>
          <p className="text-sm text-[var(--text-secondary)] text-center mt-6">
            Total tokens consumed across all AI features and organizations.
          </p>
        </div>

        {/* Feature Breakdown Table */}
        <div className="lg:col-span-2 p-0 bg-white rounded-xl shadow-sm border border-[var(--border-default)] overflow-hidden">
          <div className="p-6 border-b border-[var(--border-default)]">
            <h2 className="text-lg font-semibold text-[var(--text-primary)]">Feature Breakdown</h2>
            <p className="text-sm text-[var(--text-secondary)] mt-1">AI operations grouped by feature capability</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-[var(--text-secondary)]">
              <thead className="bg-[var(--surface-subtle)] text-[var(--text-secondary)] border-b border-[var(--border-default)]">
                <tr>
                  <th className="px-6 py-4 font-medium">Feature Name</th>
                  <th className="px-6 py-4 font-medium text-right">Requests</th>
                  <th className="px-6 py-4 font-medium text-right">Tokens Used</th>
                  <th className="px-6 py-4 font-medium text-right">Avg Latency</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border-default)]">
                {features.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-8 text-center text-[var(--text-secondary)]">
                      No feature telemetry available.
                    </td>
                  </tr>
                ) : (
                  features.map((feat) => (
                    <tr key={feat.featureName} className="hover:bg-[var(--surface-subtle)] transition-colors">
                      <td className="px-6 py-4 font-medium text-[var(--text-primary)]">
                        {feat.featureName}
                      </td>
                      <td className="px-6 py-4 text-right">
                        {feat.count.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 text-right">
                        {feat.totalTokens.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 text-right">
                        {formatLatency(feat.avgLatencyMs)}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
