"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SurfacePanel } from "@/components/ui/surface-panel";
import { Eyebrow, Logomark } from "@/components/pulse";

export default function JoinPage() {
  const [eventCode, setEventCode] = useState("");
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
    <main className="flex min-h-screen flex-col items-center justify-center bg-surface-canvas px-4 py-8">
      <div className="mx-auto w-full max-w-container-sm">
        <div className="mb-8 flex flex-col items-center text-center">
          <div className="mb-6 rounded-lg border border-border bg-surface-card p-3 shadow-sm">
            <Logomark size={44} />
          </div>
          <Eyebrow>Live session</Eyebrow>
          <h1 className="mt-3 font-display text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Join a live session
          </h1>
          <p className="mt-3 text-base leading-7 text-ink-secondary">
            Enter the code shown on screen to take part.
          </p>
        </div>

        <SurfacePanel className="p-5 sm:p-6">
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
                className="h-16 rounded-lg bg-surface-raised text-center font-mono text-3xl font-bold uppercase tabular-nums tracking-code shadow-inner"
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
              <ArrowRight className="h-5 w-5" />
            </Button>
          </form>
        </SurfacePanel>
      </div>
    </main>
  );
}
