'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Eyebrow, Logomark } from '@/components/pulse';

export default function JoinPage() {
  const [eventCode, setEventCode] = useState('');
  const router = useRouter();

  const handleJoin = (e: React.FormEvent) => {
    e.preventDefault();
    const code = eventCode.trim().toUpperCase();
    if (!code) {
      return;
    }
    router.push(`/join/${code}`);
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-surface-canvas px-4 py-10">
      <div className="mx-auto w-full max-w-container-sm">
        <div className="mb-8 flex flex-col items-center text-center">
          <Logomark size={44} className="mb-6" />
          <Eyebrow>Live session</Eyebrow>
          <h1 className="mt-2 font-display text-3xl font-bold tracking-tight text-foreground">
            Join a live session
          </h1>
          <p className="mt-2 text-base text-ink-secondary">
            Enter the code shown on screen to take part.
          </p>
        </div>

        <form onSubmit={handleJoin} className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="event-code" className="text-ink-secondary">
              Session code
            </Label>
            <Input
              id="event-code"
              placeholder="ABC123"
              autoComplete="off"
              autoCapitalize="characters"
              value={eventCode}
              onChange={(e) => setEventCode(e.target.value.toUpperCase())}
              className="h-16 text-center font-mono text-3xl font-bold tabular-nums tracking-code"
              maxLength={6}
            />
          </div>
          <Button
            type="submit"
            size="xl"
            className="w-full"
            disabled={!eventCode.trim()}
          >
            Join
          </Button>
        </form>
      </div>
    </main>
  );
}
