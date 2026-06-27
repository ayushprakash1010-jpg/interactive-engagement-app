"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowRight } from "lucide-react";

import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SurfacePanel } from "@/components/ui/surface-panel";
import { setDisplayName } from "@/lib/anon-id";
import { Eyebrow, JoinCode, Logomark } from "@/components/pulse";

export default function JoinCodePage() {
  const params = useParams<{ code: string }>();
  const router = useRouter();
  const code = (params.code ?? "").toUpperCase();

  const [name, setName] = useState("");

  const enter = () => {
    setDisplayName(name);
    router.push(`/event/${code}`);
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-surface-canvas px-4 py-8">
      <div className="absolute right-4 top-4 sm:right-6 sm:top-6">
        <ThemeToggle />
      </div>

      <div className="mx-auto w-full max-w-container-sm">
        <div className="mb-8 flex flex-col items-center text-center">
          <div className="mb-6 rounded-lg border border-border bg-surface-card p-3 shadow-sm">
            <Logomark size={44} />
          </div>
          <Eyebrow>You&apos;re joining</Eyebrow>
          <JoinCode code={code} size="lg" className="mt-2" />
          <p className="mt-4 text-base leading-7 text-ink-secondary">
            Add your name, or join anonymously.
          </p>
        </div>

        <SurfacePanel className="p-5 sm:p-6">
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
                className="h-12 rounded-lg bg-surface-raised text-base shadow-inner"
              />
            </div>
            <Button type="submit" size="xl" className="w-full">
              Join session
              <ArrowRight className="h-5 w-5" />
            </Button>
          </form>
        </SurfacePanel>
      </div>
    </main>
  );
}
