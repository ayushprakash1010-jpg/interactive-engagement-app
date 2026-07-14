'use client';

import { useEffect, useState } from 'react';
import { usePowerPointApp } from '@/components/powerpoint/PowerPointProvider';

export default function PowerPointPage() {
  const { isReady, isPowerPoint, presentationId, presentationName, microsoftUserId, error } =
    usePowerPointApp();

  const [eventCode, setEventCode] = useState('');
  const [linking, setLinking] = useState(false);
  const [connectError, setConnectError] = useState('');
  const [autoLinked, setAutoLinked] = useState(false);

  // Auto-link if we have a presentationId and the context-to-event lookup succeeds
  useEffect(() => {
    if (!isPowerPoint || !presentationId || autoLinked) return;

    async function tryAutoLink() {
      try {
        const params = new URLSearchParams({ presentationId: presentationId! });
        if (microsoftUserId) params.set('microsoftUserId', microsoftUserId);
        const res = await fetch(`/api/powerpoint/context-to-event?${params.toString()}`);
        if (res.ok) {
          const data = await res.json();
          if (data?.eventCode) {
            setAutoLinked(true);
            // Store anonymous identity tied to this presentation
            localStorage.setItem('iep-anon-id', `ppt-${presentationId}`);
            window.location.href = `/event/${data.eventCode}`;
          }
        }
      } catch {
        // No linked event yet — show manual entry UI below
      }
    }

    tryAutoLink();
  }, [isPowerPoint, presentationId, microsoftUserId, autoLinked]);

  async function handleConnect() {
    const code = eventCode.trim().toUpperCase();
    if (!code) return;
    setConnectError('');
    setLinking(true);
    try {
      const params = new URLSearchParams({
        presentationId: presentationId ?? 'unknown',
        eventCode: code,
      });
      const res = await fetch(`/api/powerpoint/link-presentation?${params.toString()}`);
      if (res.ok) {
        localStorage.setItem('iep-anon-id', `ppt-${presentationId ?? code}`);
        window.location.href = `/event/${code}`;
      } else {
        const data = await res.json().catch(() => ({}));
        setConnectError(data?.message || 'Event not found. Check your code and try again.');
      }
    } catch {
      setConnectError('Network error. Please try again.');
    } finally {
      setLinking(false);
    }
  }

  // ── Error state ──────────────────────────────────────────────────────────────
  if (error) {
    return (
      <div style={{ display: 'flex', height: '100vh', alignItems: 'center', justifyContent: 'center', padding: '24px', fontFamily: 'Segoe UI, sans-serif' }}>
        <div style={{ textAlign: 'center', maxWidth: '320px' }}>
          <div style={{ fontSize: '32px', marginBottom: '12px' }}>⚠️</div>
          <p style={{ fontWeight: 600, color: '#333', marginBottom: '8px' }}>Office SDK Error</p>
          <p style={{ fontSize: '13px', color: '#666' }}>{error}</p>
        </div>
      </div>
    );
  }

  // ── Main UI ──────────────────────────────────────────────────────────────────
  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #fff5f3 0%, #fff 100%)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px',
      fontFamily: 'Segoe UI, -apple-system, sans-serif',
    }}>
      <div style={{ width: '100%', maxWidth: '320px' }}>

        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
          <div style={{
            width: '56px', height: '56px',
            background: '#D04423',
            borderRadius: '16px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 16px',
            fontSize: '28px',
          }}>
            📊
          </div>
          <h1 style={{ fontSize: '22px', fontWeight: 700, color: '#1a1a1a', margin: '0 0 6px' }}>
            Pulse for PowerPoint
          </h1>
          <p style={{ fontSize: '13px', color: '#666', margin: 0 }}>
            Bring live polls &amp; Q&amp;A to your presentation
          </p>
        </div>

        {/* Status indicator */}
        {!isReady && (
          <div style={{
            background: '#f5f5f5', borderRadius: '10px',
            padding: '12px', textAlign: 'center',
            marginBottom: '16px', fontSize: '13px', color: '#888',
          }}>
            <span style={{ display: 'inline-block', animation: 'spin 1s linear infinite' }}>⟳</span>
            {' '}Connecting to Office...
          </div>
        )}

        {isPowerPoint && presentationName && (
          <div style={{
            background: '#fff', border: '1px solid #e5e5e5', borderRadius: '10px',
            padding: '10px 14px', marginBottom: '16px', fontSize: '13px',
          }}>
            <span style={{ color: '#888' }}>Presentation: </span>
            <span style={{ fontWeight: 600, color: '#333' }}>{presentationName}</span>
          </div>
        )}

        {/* Event code card */}
        <div style={{
          background: '#fff',
          border: '1px solid #e5e5e5',
          borderRadius: '14px',
          padding: '20px',
          boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
        }}>
          <h2 style={{ fontSize: '15px', fontWeight: 600, color: '#1a1a1a', margin: '0 0 6px' }}>
            Join a Pulse Event
          </h2>
          <p style={{ fontSize: '12px', color: '#888', margin: '0 0 16px' }}>
            Enter the event code from your Pulse dashboard to connect this presentation.
          </p>

          <input
            id="ppt-event-code-input"
            type="text"
            value={eventCode}
            onChange={(e) => setEventCode(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleConnect()}
            placeholder="e.g. 2AGLAW"
            style={{
              width: '100%',
              boxSizing: 'border-box',
              padding: '10px 14px',
              fontSize: '18px',
              fontWeight: 600,
              letterSpacing: '4px',
              textTransform: 'uppercase',
              border: '1.5px solid #e0e0e0',
              borderRadius: '8px',
              outline: 'none',
              marginBottom: '8px',
              color: '#1a1a1a',
            }}
          />

          {connectError && (
            <p style={{ fontSize: '12px', color: '#D04423', margin: '0 0 8px' }}>{connectError}</p>
          )}

          <button
            id="ppt-connect-btn"
            onClick={handleConnect}
            disabled={linking || !eventCode.trim()}
            style={{
              width: '100%',
              padding: '11px',
              background: linking || !eventCode.trim() ? '#f0a090' : '#D04423',
              color: '#fff',
              border: 'none',
              borderRadius: '8px',
              fontSize: '14px',
              fontWeight: 600,
              cursor: linking || !eventCode.trim() ? 'not-allowed' : 'pointer',
              transition: 'background 0.2s',
            }}
          >
            {linking ? 'Connecting…' : 'Connect to Event'}
          </button>
        </div>

        {/* Debug info (dev only) */}
        <div style={{ marginTop: '16px', fontSize: '11px', color: '#bbb', wordBreak: 'break-all' }}>
          <div>Office ready: {isReady ? '✓' : '…'}</div>
          <div>In PowerPoint: {isPowerPoint ? '✓' : '✗'}</div>
          <div>Presentation ID: {presentationId ?? 'n/a'}</div>
        </div>
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
