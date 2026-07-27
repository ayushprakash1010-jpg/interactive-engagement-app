'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/use-auth';
import { organizationsApi } from '@/lib/organizations-api';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Loader2 } from 'lucide-react';

export default function OnboardingPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // If the user somehow gets here but already has an organization, redirect away
  React.useEffect(() => {
    if (user?.organizationId) {
      router.push('/dashboard');
    }
  }, [user, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Workspace name is required');
      return;
    }
    
    setLoading(true);
    setError('');
    
    try {
      await organizationsApi.create(name);
      // Hard redirect to dashboard forces Auth0 to give us a fresh session
      // (or we can bounce through login to force token refresh if needed)
      window.location.assign('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Failed to create workspace');
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-surface-canvas p-4">
      <Card className="w-full max-w-md shadow-xl bg-surface-card border-border">
        <CardHeader className="space-y-2 text-center pb-6">
          <CardTitle className="text-3xl font-bold tracking-tight text-ink">Welcome to Pulse</CardTitle>
          <CardDescription className="text-ink-muted text-base">
            Let's set up your personal workspace to get started.
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="workspace-name" className="text-sm font-semibold text-ink-secondary">
                Workspace Name
              </label>
              <Input
                id="workspace-name"
                placeholder="e.g., Acme Corp or My Personal Workspace"
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={loading}
                className="w-full"
                autoFocus
              />
              {error && <p className="text-sm font-medium text-destructive">{error}</p>}
            </div>
          </CardContent>
          <CardFooter>
            <Button 
              type="submit" 
              className="w-full font-semibold"
              size="lg"
              disabled={loading || !name.trim()}
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Creating...
                </span>
              ) : (
                'Create Workspace'
              )}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
