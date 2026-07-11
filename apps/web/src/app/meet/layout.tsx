import { GoogleMeetProvider } from '@/components/meet/GoogleMeetProvider';
import type { ReactNode } from 'react';

export default function MeetLayout({ children }: { children: ReactNode }) {
  return <GoogleMeetProvider>{children}</GoogleMeetProvider>;
}
