import { TeamsProvider } from '@/components/teams/TeamsProvider';
import type { ReactNode } from 'react';

export default function TeamsLayout({ children }: { children: ReactNode }) {
  return <TeamsProvider>{children}</TeamsProvider>;
}
