import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { AdminShell } from '@/components/admin/admin-shell';
import { fetchAdminMeServer, AdminApiError } from '@/lib/admin-api';
import { FeatureFlagsClient } from './feature-flags-client';

export const metadata: Metadata = { title: 'Feature Flags | Admin' };
export const dynamic = 'force-dynamic';

export default async function FeatureFlagsPage() {
  let me;
  try {
    me = await fetchAdminMeServer();
  } catch (err) {
    if (err instanceof AdminApiError) {
      if (err.status === 401) redirect('/login');
      if (err.status === 403) redirect('/access-denied');
    }
    throw err;
  }

  return (
    <AdminShell user={me}>
      <FeatureFlagsClient />
    </AdminShell>
  );
}
