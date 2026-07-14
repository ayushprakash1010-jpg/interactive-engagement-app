'use client';

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';

interface PowerPointContextType {
  isReady: boolean;
  isPowerPoint: boolean;
  presentationId: string | null;
  presentationName: string | null;
  microsoftUserId: string | null;
  error: string | null;
}

const PowerPointContext = createContext<PowerPointContextType>({
  isReady: false,
  isPowerPoint: false,
  presentationId: null,
  presentationName: null,
  microsoftUserId: null,
  error: null,
});

export const usePowerPointApp = () => useContext(PowerPointContext);

export function PowerPointProvider({ children }: { children: ReactNode }) {
  const [isReady, setIsReady] = useState(false);
  const [isPowerPoint, setIsPowerPoint] = useState(false);
  const [presentationId, setPresentationId] = useState<string | null>(null);
  const [presentationName, setPresentationName] = useState<string | null>(null);
  const [microsoftUserId, setMicrosoftUserId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Only run on client side
    const Office = (window as any).Office;

    if (!Office) {
      // Office.js not yet loaded — wait up to 5s for it to appear
      let attempts = 0;
      const interval = setInterval(() => {
        attempts++;
        const OfficeNow = (window as any).Office;
        if (OfficeNow) {
          clearInterval(interval);
          initOffice(OfficeNow);
        } else if (attempts > 50) {
          clearInterval(interval);
          setError('Office.js did not load. Please open this add-in from inside PowerPoint.');
          setIsReady(true);
        }
      }, 100);
      return () => clearInterval(interval);
    } else {
      initOffice(Office);
    }

    function initOffice(Office: any) {
      try {
        // Use callback form of onReady — works in all Office.js versions including Office 2016
        Office.onReady((info: { host: string; platform: string }) => {
          setIsReady(true);

          if (info.host !== 'PowerPoint') {
            setError(`Wrong host: "${info.host}". This add-in only works in PowerPoint.`);
            return;
          }

          setIsPowerPoint(true);

          // Get file properties (presentation URL = stable ID)
          try {
            Office.context.document.getFilePropertiesAsync(
              (result: any) => {
                if (result.status === 'succeeded' || result.status === Office.AsyncResultStatus?.Succeeded) {
                  const fileUrl: string = result.value?.url || '';
                  if (fileUrl) {
                    // Stable hash from file URL
                    const stableId = btoa(encodeURIComponent(fileUrl))
                      .replace(/[^a-zA-Z0-9]/g, '')
                      .substring(0, 32);
                    setPresentationId(stableId);

                    const parts = fileUrl.split(/[\\/]/);
                    const filename = parts[parts.length - 1] || 'Untitled';
                    setPresentationName(filename.replace(/\.pptx?$/i, ''));
                  }
                }
              }
            );
          } catch {
            // Non-critical — user can still enter event code manually
          }
        });
      } catch (e: any) {
        setError('Office.js initialization failed: ' + (e?.message || String(e)));
        setIsReady(true);
      }
    }
  }, []);

  return (
    <PowerPointContext.Provider
      value={{ isReady, isPowerPoint, presentationId, presentationName, microsoftUserId, error }}
    >
      {children}
    </PowerPointContext.Provider>
  );
}
