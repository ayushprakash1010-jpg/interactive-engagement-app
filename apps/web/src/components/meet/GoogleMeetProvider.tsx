'use client';

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from 'react';
import { meet } from '@googleworkspace/meet-addons/meet.addons';

let globalSessionPromise: Promise<any> | null = null;

interface GoogleMeetContextType {
  isMeet: boolean;
  meetingId: string | null;
  userId: string | null; // Google user ID if known
  error: string | null;
}

const GoogleMeetContext = createContext<GoogleMeetContextType>({
  isMeet: false,
  meetingId: null,
  userId: null,
  error: null,
});

export const useGoogleMeetApp = () => useContext(GoogleMeetContext);

export function GoogleMeetProvider({ children }: { children: ReactNode }) {
  const [isMeet, setIsMeet] = useState(false);
  const [meetingId, setMeetingId] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    async function initMeet() {
      try {
        // Initialize the Meet Add-on SDK
        // This will only succeed if the page is loaded inside a Google Meet iframe
        if (!globalSessionPromise) {
          globalSessionPromise = meet.addon.createAddonSession({
            cloudProjectNumber: '428100533460',
          });
        }
        const session = await globalSessionPromise;
        
        if (!mounted) return;
        setIsMeet(true);

        const client = await session.createSidePanelClient();
        
        try {
          const info = await client.getMeetingInfo();
          if (info?.meetingId) {
            setMeetingId(info.meetingId);
          }
        } catch (e) {
          // Log if meeting info is not available yet
          console.warn('Meeting info not ready', e);
        }
      } catch (e: any) {
        console.warn('Not running inside Google Meet client or SDK failed to initialize', e);
        setError(e?.message || 'Google Meet SDK initialization failed');
        setIsMeet(false);
      }
    }

    // Google Meet requires HTTPS; don't even try to init on standard localhost unless using ngrok
    if (typeof window !== 'undefined' && window.location.protocol === 'https:') {
      initMeet();
    } else {
      setError('Google Meet SDK requires HTTPS');
    }
  }, []);

  return (
    <GoogleMeetContext.Provider
      value={{ isMeet, meetingId, userId, error }}
    >
      {children}
    </GoogleMeetContext.Provider>
  );
}
