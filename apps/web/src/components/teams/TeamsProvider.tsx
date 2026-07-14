'use client';

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from 'react';

interface TeamsContextType {
  isTeams: boolean;
  meetingId: string | null;
  userId: string | null; // AAD Object ID
  userPrincipalName: string | null;
  tenantId: string | null;
  rawCtx: any;
  error: string | null;
}

const TeamsContext = createContext<TeamsContextType>({
  isTeams: false,
  meetingId: null,
  userId: null,
  userPrincipalName: null,
  tenantId: null,
  rawCtx: null,
  error: null,
});

export const useTeamsApp = () => useContext(TeamsContext);

export function TeamsProvider({ children }: { children: ReactNode }) {
  const [isTeams, setIsTeams] = useState(false);
  const [meetingId, setMeetingId] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [userPrincipalName, setUserPrincipalName] = useState<string | null>(null);
  const [tenantId, setTenantId] = useState<string | null>(null);
  const [rawCtx, setRawCtx] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function initTeams() {
      try {
        // Dynamically import Teams JS SDK to avoid SSR issues
        const { app, meeting } = await import('@microsoft/teams-js');

        await app.initialize();

        const ctx = await app.getContext();
        setRawCtx(ctx);
        setIsTeams(true);

        // Meeting info
        if (ctx.meeting?.id) {
          setMeetingId(ctx.meeting.id);
        }

        // User info — AAD Object ID and UPN
        if (ctx.user?.id) {
          setUserId(ctx.user.id);
        }
        if (ctx.user?.userPrincipalName) {
          setUserPrincipalName(ctx.user.userPrincipalName);
        }
        if (ctx.user?.tenant?.id) {
          setTenantId(ctx.user.tenant.id);
        }
      } catch (e: any) {
        console.warn('Not running inside Microsoft Teams client or SDK failed to initialize', e);
        setError(e?.message || 'Teams SDK initialization failed');
        setIsTeams(false);
      }
    }

    initTeams();
  }, []);

  return (
    <TeamsContext.Provider
      value={{ isTeams, meetingId, userId, userPrincipalName, tenantId, rawCtx, error }}
    >
      {children}
    </TeamsContext.Provider>
  );
}
