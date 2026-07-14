"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowRight, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SurfacePanel } from "@/components/ui/surface-panel";
import { setDisplayName } from "@/lib/anon-id";
import { Eyebrow, JoinCode, Logomark } from "@/components/pulse";
import { API_URL } from "@/lib/api";

export default function JoinCodePage() {
  const params = useParams<{ code: string }>();
  const router = useRouter();
  const code = (params.code ?? "").toUpperCase();

  const [name, setName] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [requiresName, setRequiresName] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    // In HTTPS context (Zoom App), direct calls to http://localhost:4000 are
    // blocked as Mixed Content. Use the Next.js public proxy route instead.
    const isHttps = typeof window !== 'undefined' && window.location.protocol === 'https:';
    const lookupUrl = isHttps
      ? `/api/public-proxy/events/lookup/${code}`
      : `${API_URL}/events/lookup/${code}`;

    fetch(lookupUrl)
      .then(async (res) => {
        if (!mounted) return;
        if (!res.ok) {
          setError("Event not found");
          setIsLoading(false);
          return;
        }
        const data = await res.json();
        setRequiresName(data.settings?.participantNames ?? false);
        setIsLoading(false);
      })
      .catch(() => {
        if (!mounted) return;
        setError("Failed to load event");
        setIsLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, [code]);

  const enter = () => {
    if (requiresName && !name.trim()) return;
    setDisplayName(name.trim());
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
          {isLoading ? (
            <div className="flex h-[200px] items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-ink-tertiary" />
            </div>
          ) : error ? (
            <div className="flex h-[200px] flex-col items-center justify-center space-y-4">
              <p className="text-center font-medium text-red-500">{error}</p>
              <Button variant="outline" onClick={() => router.push("/")}>
                Go back
              </Button>
            </div>
          ) : (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                enter();
              }}
              className="space-y-5"
            >
              <div className="space-y-2">
                <Label htmlFor="display-name" className="text-ink-secondary">
                  Your name {requiresName ? "" : "(optional)"}
                </Label>
                <Input
                  id="display-name"
                  placeholder="e.g. Alex"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  maxLength={40}
                  required={requiresName}
                  className="h-12 rounded-lg bg-surface-raised text-base shadow-inner"
                />
              </div>
              <Button type="submit" size="xl" className="w-full">
                Join session
                <ArrowRight className="h-5 w-5" />
              </Button>
            </form>
          )}
        </SurfacePanel>
      </div>
    </main>
  );
}
