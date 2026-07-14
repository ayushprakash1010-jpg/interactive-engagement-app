'use client';

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
// NOTE: zoomSdk is intentionally NOT statically imported here.
// The Zoom SDK runs browser-detection code at import time that crashes in
// non-Zoom environments (PowerPoint WebView2, Google Meet, etc.).
// Dynamic import inside useEffect ensures errors are caught by try/catch.

interface ZoomContextType {
  isZoom: boolean;
  meetingId: string | null;
  userId: string | null;
  rawUserCtx: any;
  error: string | null;
}

const ZoomContext = createContext<ZoomContextType>({
  isZoom: false,
  meetingId: null,
  userId: null,
  rawUserCtx: null,
  error: null,
});

export const useZoomApp = () => useContext(ZoomContext);

export function ZoomProvider({ children }: { children: ReactNode }) {
  const [isZoom, setIsZoom] = useState(false);
  const [meetingId, setMeetingId] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [rawUserCtx, setRawUserCtx] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function initZoom() {
      try {
        // Dynamic import — any SDK-level import errors are caught here
        const { default: zoomSdk } = await import('@zoom/appssdk');

        const configResponse = await zoomSdk.config({
          capabilities: [
            'getRunningContext',
            'getMeetingContext',
            'getUserContext',
            'authorize',
            'promptAuthorize',
            'onAuthorized'
          ]
        });
        
        console.log('Zoom SDK configured', configResponse);
        setIsZoom(true);

        const ctx = await zoomSdk.getRunningContext();
        if (ctx.context === 'inMeeting' || ctx.context === 'inWebinar') {
          const meetingCtx = await zoomSdk.getMeetingContext();
          setMeetingId(meetingCtx.meetingID);
          
          const userCtx = (await zoomSdk.getUserContext()) as any;
          setRawUserCtx(userCtx);
          setUserId(userCtx.uid || userCtx.participantId);
        }
      } catch (e: any) {
        // Not running inside Zoom or SDK import/config failed — silently ignore
        console.warn('Not running inside Zoom client or SDK failed to initialize', e);
        setError(e?.message || 'Zoom SDK configuration failed');
        setIsZoom(false);
      }
    }

    initZoom();
  }, []);

  return (
    <ZoomContext.Provider value={{ isZoom, meetingId, userId, rawUserCtx, error }}>
      {children}
    </ZoomContext.Provider>
  );
}
