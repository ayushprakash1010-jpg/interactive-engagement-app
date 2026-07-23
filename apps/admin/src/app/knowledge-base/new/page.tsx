'use client';

import * as React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ChevronLeft, Loader2, Save } from 'lucide-react';
import { adminFetch } from '@/lib/admin-api';

const CATEGORIES = [
  'Account & Authentication',
  'Events',
  'Integrations',
  'AI Studio',
  'Feature Flags',
  'Organizations',
  'Billing & Plans',
  'Troubleshooting',
  'System Operations',
  'Other',
];

export default function NewArticlePage() {
  const router = useRouter();

  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    const tagsStr = formData.get('tags') as string;
    const tags = tagsStr ? tagsStr.split(',').map((t) => t.trim()).filter(Boolean) : [];

    const payload = {
      title: formData.get('title'),
      slug: formData.get('slug'),
      category: formData.get('category'),
      summary: formData.get('summary'),
      content: formData.get('content'),
      status: formData.get('status'),
      tags,
    };

    try {
      await adminFetch('knowledge', {
        method: 'POST',
        body: JSON.stringify(payload),
      });
      router.push('/knowledge-base');
    } catch (err: any) {
      setError(err.message);
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-surface-canvas pb-20">
      <form onSubmit={handleSubmit}>
        <div className="border-b bg-surface-card sticky top-0 z-10 shadow-sm">
          <div className="mx-auto max-w-4xl px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link
                href="/knowledge-base"
                className="inline-flex h-8 w-8 items-center justify-center rounded-md border text-ink-secondary hover:bg-surface-raised transition-colors"
              >
                <ChevronLeft className="h-4 w-4" />
              </Link>
              <div>
                <h1 className="font-semibold text-foreground">Create New Article</h1>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <select
                name="status"
                defaultValue="DRAFT"
                className="rounded-lg border bg-surface-card px-3 py-1.5 text-sm font-medium shadow-sm focus:outline-none focus:ring-2 focus:ring-brand"
              >
                <option value="DRAFT">Draft</option>
                <option value="PUBLISHED">Published</option>
              </select>
              <button
                type="submit"
                disabled={isSubmitting}
                className="inline-flex items-center gap-2 rounded-lg bg-brand px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-brand/90 disabled:opacity-50"
              >
                {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                Save Article
              </button>
            </div>
          </div>
        </div>

        <div className="mx-auto max-w-4xl px-6 py-8 space-y-6">
          {error && (
            <div className="p-4 bg-red-50 text-red-600 border border-red-200 rounded-xl text-sm">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-1.5">
              <label htmlFor="title" className="text-sm font-medium text-foreground">Title</label>
              <input
                id="title"
                name="title"
                type="text"
                required
                className="w-full rounded-lg border bg-surface px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand/40"
              />
            </div>
            <div className="space-y-1.5">
              <label htmlFor="slug" className="text-sm font-medium text-foreground">URL Slug</label>
              <input
                id="slug"
                name="slug"
                type="text"
                required
                pattern="[a-z0-9-]+"
                title="Only lowercase letters, numbers, and hyphens"
                className="w-full rounded-lg border bg-surface px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand/40 font-mono"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-1.5">
              <label htmlFor="category" className="text-sm font-medium text-foreground">Category</label>
              <select
                id="category"
                name="category"
                required
                className="w-full rounded-lg border bg-surface px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand/40"
              >
                <option value="">Select a category...</option>
                {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div className="space-y-1.5">
              <label htmlFor="tags" className="text-sm font-medium text-foreground">Tags (comma-separated)</label>
              <input
                id="tags"
                name="tags"
                type="text"
                placeholder="e.g. login, sso, error"
                className="w-full rounded-lg border bg-surface px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand/40"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label htmlFor="summary" className="text-sm font-medium text-foreground">Summary</label>
            <textarea
              id="summary"
              name="summary"
              required
              rows={2}
              className="w-full rounded-lg border bg-surface px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand/40 resize-y"
            />
          </div>

          <div className="space-y-1.5">
            <label htmlFor="content" className="text-sm font-medium text-foreground flex items-center justify-between">
              <span>Content (Markdown supported)</span>
            </label>
            <textarea
              id="content"
              name="content"
              required
              rows={15}
              className="w-full rounded-lg border bg-surface px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand/40 resize-y font-mono"
            />
          </div>
        </div>
      </form>
    </div>
  );
}
