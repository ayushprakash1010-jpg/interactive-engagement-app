'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { setDisplayName } from '@/lib/anon-id';
import { Eyebrow, JoinCode, Logomark } from '@/components/pulse';

export default function JoinCodePage() {
  const params = useParams<{ code: string }>();
  const router = useRouter();
  const code = (params.code ?? '').toUpperCase();

  const [name, setName] = useState('');

  const enter = () => {
    setDisplayName(name);
    router.push(`/event/${code}`);
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-surface-canvas px-4 py-10">
      <div className="mx-auto w-full max-w-container-sm">
        <div className="mb-8 flex flex-col items-center text-center">
          <Logomark size={44} className="mb-6" />
          <Eyebrow>You&apos;re joining</Eyebrow>
          <JoinCode code={code} size="lg" className="mt-2" />
          <p className="mt-3 text-base text-ink-secondary">
            Add your name, or join anonymously.
          </p>
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            enter();
          }}
          className="space-y-5"
        >
          <div className="space-y-2">
            <Label htmlFor="display-name" className="text-ink-secondary">
              Your name (optional)
            </Label>
            <Input
              id="display-name"
              placeholder="e.g. Alex"
              value={name}
              onChange={(e) => setName(e.target.value)}
              maxLength={40}
              className="h-12 text-base"
            />
          </div>
          <Button type="submit" size="xl" className="w-full">
            Join session
          </Button>
        </form>
      </div>
    </main>
  );
}
