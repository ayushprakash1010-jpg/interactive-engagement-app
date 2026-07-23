import * as React from 'react';
import SupportClient from './support-client';
import { Loader2 } from 'lucide-react';

export default function SupportPage() {
  return (
    <React.Suspense fallback={
      <div className="flex min-h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-brand" />
      </div>
    }>
      <SupportClient />
    </React.Suspense>
  );
}
