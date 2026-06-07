'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';

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
import { setDisplayName } from '@/lib/anon-id';

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
    <main className="flex min-h-screen items-center justify-center p-6">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle>Joining {code}</CardTitle>
          <CardDescription>
            Add your name (optional), or join anonymously.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              enter();
            }}
            className="space-y-4"
          >
            <div className="space-y-2">
              <Label htmlFor="display-name">Your name (optional)</Label>
              <Input
                id="display-name"
                placeholder="e.g. Alex"
                value={name}
                onChange={(e) => setName(e.target.value)}
                maxLength={40}
              />
            </div>
            <Button type="submit" className="w-full">
              Join event
            </Button>
          </form>
        </CardContent>
      </Card>
    </main>
  );
}