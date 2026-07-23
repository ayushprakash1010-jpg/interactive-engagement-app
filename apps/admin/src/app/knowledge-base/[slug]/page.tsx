'use client';

import * as React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ChevronLeft, Loader2, Save, Trash2, Eye, Edit3 } from 'lucide-react';
import { fetchKnowledgeArticle, updateKnowledgeArticle, deleteKnowledgeArticle } from '@/lib/admin-api';
import type { KnowledgeArticleDetail } from '@/lib/admin-api';
import ReactMarkdown from 'react-markdown';

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

export default function ArticleDetailPage({ params }: { params: { slug: string } }) {
  const router = useRouter();
  const originalSlug = params.slug;

  const [article, setArticle] = React.useState<KnowledgeArticleDetail | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  const [isEditing, setIsEditing] = React.useState(false);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [isDeleting, setIsDeleting] = React.useState(false);

  // Form state
  const [title, setTitle] = React.useState('');
  const [slug, setSlug] = React.useState('');
  const [category, setCategory] = React.useState('');
  const [tags, setTags] = React.useState('');
  const [summary, setSummary] = React.useState('');
  const [content, setContent] = React.useState('');
  const [status, setStatus] = React.useState('DRAFT');

  React.useEffect(() => {
    setLoading(true);
    fetchKnowledgeArticle(originalSlug)
      .then((data) => {
        setArticle(data);
        setTitle(data.title);
        setSlug(data.slug);
        setCategory(data.category);
        setTags(data.tags.join(', '));
        setSummary(data.summary);
        setContent(data.content);
        setStatus(data.status);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [originalSlug]);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    const tagArray = tags ? tags.split(',').map((t) => t.trim()).filter(Boolean) : [];

    try {
      const updated = await updateKnowledgeArticle(originalSlug, {
        title,
        slug,
        category,
        tags: tagArray,
        summary,
        content,
        status,
      });
      setArticle(updated);
      setIsEditing(false);
      if (updated.slug !== originalSlug) {
        router.replace(`/knowledge-base/${updated.slug}`);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this article?')) return;
    setIsDeleting(true);
    try {
      await deleteKnowledgeArticle(originalSlug);
      router.push('/knowledge-base');
    } catch (err: any) {
      setError(err.message);
      setIsDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-surface-canvas">
        <Loader2 className="h-6 w-6 animate-spin text-ink-muted" />
      </div>
    );
  }

  if (error && !article) {
    return (
      <div className="flex h-screen items-center justify-center bg-surface-canvas text-destructive">
        {error || 'Article not found'}
      </div>
    );
  }

  if (!article) return null;

  return (
    <div className="min-h-screen bg-surface-canvas pb-20">
      {error && (
        <div className="p-4 bg-red-50 text-red-600 border border-red-200 text-sm">
          {error}
        </div>
      )}
      
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
              <h1 className="font-semibold text-foreground truncate max-w-md">{article.title}</h1>
              <p className="text-xs text-ink-muted">{article.status} • {article.category}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {isEditing ? (
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="inline-flex items-center gap-2 rounded-lg border bg-surface-card px-4 py-2 text-sm font-semibold text-foreground hover:bg-surface-raised transition-colors"
              >
                <Eye className="h-4 w-4" />
                Cancel Edit
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setIsEditing(true)}
                className="inline-flex items-center gap-2 rounded-lg border bg-surface-card px-4 py-2 text-sm font-semibold text-foreground hover:bg-surface-raised transition-colors"
              >
                <Edit3 className="h-4 w-4" />
                Edit Article
              </button>
            )}
            
            <button
              type="button"
              onClick={handleDelete}
              disabled={isDeleting}
              className="inline-flex items-center gap-2 rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-2 text-sm font-semibold text-destructive hover:bg-destructive/20 transition-colors disabled:opacity-50"
            >
              {isDeleting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
              Delete
            </button>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-4xl px-6 py-8">
        {isEditing ? (
          <form onSubmit={handleUpdate} className="space-y-6">
            <div className="flex justify-end mb-4">
               <button
                type="submit"
                disabled={isSubmitting}
                className="inline-flex items-center gap-2 rounded-lg bg-brand px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-brand/90 disabled:opacity-50"
              >
                {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                Save Changes
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-1.5">
                <label htmlFor="title" className="text-sm font-medium text-foreground">Title</label>
                <input
                  id="title"
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full rounded-lg border bg-surface px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand/40"
                />
              </div>
              <div className="space-y-1.5">
                <label htmlFor="slug" className="text-sm font-medium text-foreground">URL Slug</label>
                <input
                  id="slug"
                  type="text"
                  required
                  pattern="[a-z0-9-]+"
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  className="w-full rounded-lg border bg-surface px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand/40 font-mono"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-1.5">
                <label htmlFor="category" className="text-sm font-medium text-foreground">Category</label>
                <select
                  id="category"
                  required
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full rounded-lg border bg-surface px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand/40"
                >
                  <option value="">Select a category...</option>
                  {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div className="space-y-1.5">
                <label htmlFor="status" className="text-sm font-medium text-foreground">Status</label>
                <select
                  id="status"
                  required
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="w-full rounded-lg border bg-surface px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand/40"
                >
                  <option value="DRAFT">Draft</option>
                  <option value="PUBLISHED">Published</option>
                  <option value="ARCHIVED">Archived</option>
                </select>
              </div>
            </div>

            <div className="space-y-1.5">
              <label htmlFor="tags" className="text-sm font-medium text-foreground">Tags (comma-separated)</label>
              <input
                id="tags"
                type="text"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                className="w-full rounded-lg border bg-surface px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand/40"
              />
            </div>

            <div className="space-y-1.5">
              <label htmlFor="summary" className="text-sm font-medium text-foreground">Summary</label>
              <textarea
                id="summary"
                required
                rows={2}
                value={summary}
                onChange={(e) => setSummary(e.target.value)}
                className="w-full rounded-lg border bg-surface px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand/40 resize-y"
              />
            </div>

            <div className="space-y-1.5">
              <label htmlFor="content" className="text-sm font-medium text-foreground">Content (Markdown supported)</label>
              <textarea
                id="content"
                required
                rows={15}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="w-full rounded-lg border bg-surface px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand/40 resize-y font-mono"
              />
            </div>
          </form>
        ) : (
          <div className="space-y-8">
            <div className="bg-surface-card border rounded-xl p-6 shadow-sm">
              <div className="flex gap-2 mb-4">
                {article.tags.map((tag) => (
                  <span key={tag} className="bg-surface-raised px-2 py-1 rounded text-xs font-medium text-ink-secondary">
                    #{tag}
                  </span>
                ))}
              </div>
              <h2 className="text-2xl font-bold mb-2">{article.title}</h2>
              <p className="text-ink-secondary mb-8 text-lg">{article.summary}</p>
              
              <div className="prose dark:prose-invert max-w-none">
                <ReactMarkdown>{article.content}</ReactMarkdown>
              </div>
            </div>

            <div className="bg-surface-raised border rounded-xl p-4 text-xs text-ink-muted">
              <div>Created: {new Date(article.createdAt || Date.now()).toLocaleString()}</div>
              <div>Last Updated: {new Date(article.updatedAt || Date.now()).toLocaleString()}</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
