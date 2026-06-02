'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

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
    <main className="flex min-h-screen items-center justify-center p-6">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle>Join an event</CardTitle>
          <CardDescription>
            Enter the code shown on screen to take part.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleJoin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="event-code">Event code</Label>
              <Input
                id="event-code"
                placeholder="ABC123"
                autoComplete="off"
                autoCapitalize="characters"
                value={eventCode}
                onChange={(e) => setEventCode(e.target.value.toUpperCase())}
                className="text-center font-mono text-2xl tracking-[0.3em]"
                maxLength={6}
              />
            </div>
            <Button type="submit" className="w-full" disabled={!eventCode.trim()}>
              Continue
            </Button>
          </form>
        </CardContent>
      </Card>
    </main>
  );
}
