import * as React from 'react';
import HealthClient from './health-client';
import { Loader2 } from 'lucide-react';

export default function HealthPage() {
  return (
    <React.Suspense fallback={
      <div className="flex min-h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-brand" />
      </div>
    }>
      <HealthClient />
    </React.Suspense>
  );
}
