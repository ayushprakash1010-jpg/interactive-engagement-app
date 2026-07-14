'use client';

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';

interface PowerPointContextType {
  isPowerPoint: boolean;
  presentationId: string | null;
  presentationName: string | null;
  microsoftUserId: string | null;
  slideCount: number | null;
  error: string | null;
}

const PowerPointContext = createContext<PowerPointContextType>({
  isPowerPoint: false,
  presentationId: null,
  presentationName: null,
  microsoftUserId: null,
  slideCount: null,
  error: null,
});

export const usePowerPointApp = () => useContext(PowerPointContext);

export function PowerPointProvider({ children }: { children: ReactNode }) {
  const [isPowerPoint, setIsPowerPoint] = useState(false);
  const [presentationId, setPresentationId] = useState<string | null>(null);
  const [presentationName, setPresentationName] = useState<string | null>(null);
  const [microsoftUserId, setMicrosoftUserId] = useState<string | null>(null);
  const [slideCount, setSlideCount] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function initOffice() {
      try {
        // Office.js is loaded via CDN in the layout / HTML head
        // We wait for it to be ready using Office.onReady
        if (typeof (window as any).Office === 'undefined') {
          setError('Office.js SDK not loaded. Are you running inside PowerPoint?');
          return;
        }

        const Office = (window as any).Office;
        const info = await Office.onReady();

        // Verify we are inside PowerPoint (not Word, Excel, etc.)
        if (info.host !== Office.HostType.PowerPoint) {
          setError(`Unexpected host: ${info.host}. This add-in only works in PowerPoint.`);
          return;
        }

        setIsPowerPoint(true);

        // Get the presentation's unique document ID from the Office.js context
        // Office.context.document.url gives a path/name, not a stable ID.
        // We use Office.context.document.getFilePropertiesAsync for a stable unique ID.
        Office.context.document.getFilePropertiesAsync(
          (result: any) => {
            if (result.status === Office.AsyncResultStatus.Succeeded) {
              // url is the file path / OneDrive URL — use as unique identifier
              const fileUrl = result.value.url;
              // Create a stable hash from the URL to use as presentationId
              const stableId = btoa(fileUrl).replace(/[^a-zA-Z0-9]/g, '').substring(0, 32);
              setPresentationId(stableId || fileUrl);
              
              // Extract presentation name from URL
              const parts = fileUrl.split(/[\\/]/);
              const filename = parts[parts.length - 1] || 'Untitled Presentation';
              setPresentationName(filename.replace(/\.pptx?$/i, ''));
            }
          }
        );

        // Get slide count for context display
        Office.context.document.getSelectedDataAsync(
          Office.CoercionType.SlideRange,
          (result: any) => {
            // This is a best-effort; slide count is not critical
          }
        );

        // Try to get user info from Office identity if available
        try {
          const auth = Office.context.auth;
          if (auth && typeof auth.getAccessTokenAsync === 'function') {
            auth.getAccessTokenAsync({ allowSignInPrompt: false }, (tokenResult: any) => {
              if (tokenResult.status === Office.AsyncResultStatus.Succeeded) {
                // Decode JWT to get user OID (Microsoft user ID)
                try {
                  const payload = JSON.parse(
                    atob(tokenResult.value.split('.')[1].replace(/-/g, '+').replace(/_/g, '/'))
                  );
                  setMicrosoftUserId(payload.oid || payload.sub || null);
                } catch {
                  // Non-critical: user can still link manually
                }
              }
            });
          }
        } catch {
          // Office SSO not available; will fall back to manual linking
        }

      } catch (e: any) {
        console.warn('Not running inside PowerPoint or Office.js initialization failed:', e);
        setError(e?.message || 'Office.js initialization failed');
        setIsPowerPoint(false);
      }
    }

    initOffice();
  }, []);

  return (
    <PowerPointContext.Provider
      value={{ isPowerPoint, presentationId, presentationName, microsoftUserId, slideCount, error }}
    >
      {children}
    </PowerPointContext.Provider>
  );
}
