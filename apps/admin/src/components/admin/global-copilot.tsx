'use client';

import * as React from 'react';
import { CopilotPanel, type CopilotPanelProps } from './copilot-panel';
import { fetchAdminMe } from '@/lib/admin-api';
import type { AdminMe } from '@/lib/admin-api';

export function GlobalCopilot({ pageContext }: { pageContext?: CopilotPanelProps['pageContext'] }) {
  const [me, setMe] = React.useState<AdminMe | null>(null);

  React.useEffect(() => {
    fetchAdminMe().then(setMe).catch(console.error);
  }, []);

  if (!me) return null;

  return <CopilotPanel user={me} pageContext={pageContext} />;
}
