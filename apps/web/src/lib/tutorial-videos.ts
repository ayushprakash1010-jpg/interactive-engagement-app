// =============================================================================
// tutorial-videos.ts
// =============================================================================
// Central configuration for all Pulse tutorial videos.
//
// HOW TO ADD YOUR REAL VIDEOS WHEN READY
// ─────────────────────────────────────────────────────────────────────────────
// 1. Find the video entry below by its `id` field.
// 2. Replace the `videoUrl` with the real embed URL:
//    - YouTube:  "https://www.youtube.com/embed/VIDEO_ID"
//    - Loom:     "https://www.loom.com/embed/VIDEO_ID"
//    - Direct:   "https://your-cdn.com/path/to/video.mp4"
// 3. Replace `thumbnailUrl` with a real thumbnail image URL.
// 4. Replace `duration` with the actual runtime (e.g. "1:32").
// 5. Set `provider` to 'youtube' | 'loom' | 'mp4' | 'vimeo'.
//
// You do NOT need to touch any component files — they read from this config.
// =============================================================================

export type VideoProvider = 'youtube' | 'loom' | 'mp4' | 'vimeo' | 'guidde' | 'placeholder';

export type TutorialCategory =
  | 'getting-started'
  | 'events'
  | 'features'
  | 'ai'
  | 'analytics'
  | 'integrations';

export type TutorialVideo = {
  /** Unique identifier used to reference this video from feature pages */
  id: string;

  /** Display title shown in the UI */
  title: string;

  /** Short description shown in tutorial cards and the library */
  description: string;

  /** Human-readable duration, e.g. "1:32" — REPLACE when real video is ready */
  duration: string;

  /** Grouping category for filters in the Tutorials Library */
  category: TutorialCategory;

  /** Optional feature tag for connecting to help center guides */
  feature?: string;

  /**
   * Video hosting provider.
   * 'placeholder' means this slot has no real video yet.
   * REPLACE with 'youtube' | 'loom' | 'mp4' | 'vimeo' when the real video is ready.
   */
  provider: VideoProvider;

  /**
   * The embed or source URL for the video.
   * - YouTube: https://www.youtube.com/embed/VIDEO_ID
   * - Loom:    https://www.loom.com/embed/VIDEO_ID
   * - MP4:     https://your-cdn.com/video.mp4
   * - Placeholder: empty string or a publicly safe test embed
   *
   * ⚠️  REPLACE THIS VALUE when your real AI-generated video is ready.
   */
  videoUrl: string;

  /**
   * Thumbnail image URL displayed before the video plays.
   * Use a real screenshot of the relevant Pulse feature.
   *
   * ⚠️  REPLACE THIS VALUE with a real thumbnail when your video is ready.
   */
  thumbnailUrl: string;

  /**
   * The dashboard route this video is most relevant to.
   * Used by integration points to look up the right video for the current page.
   */
  relatedRoute?: string;

  /** Whether to show this video prominently (e.g. in hero/featured positions) */
  featured?: boolean;

  /** Sort order within its category — lower numbers appear first */
  order?: number;
};

// =============================================================================
// PLACEHOLDER EMBED URL
// This is a publicly available YouTube video used as a safe placeholder.
// Replace each entry's `videoUrl` with your real AI-generated video URL.
// =============================================================================
const PLACEHOLDER_EMBED = 'https://www.youtube.com/embed/dQw4w9WgXcQ';
const PLACEHOLDER_THUMBNAIL = 'https://img.youtube.com/vi/dQw4w9WgXcQ/hqdefault.jpg';

// =============================================================================
// TUTORIAL VIDEO LIBRARY
// =============================================================================
// To replace a placeholder with a real video:
//   1. Find the entry by `id`
//   2. Update: videoUrl, thumbnailUrl, duration, provider
//   3. Optionally: update title, description if needed
// =============================================================================

export const TUTORIAL_VIDEOS: TutorialVideo[] = [
  // ── Getting Started ────────────────────────────────────────────────────────

  {
    id: 'getting-started',
    title: 'Getting Started with Pulse',
    description:
      'A quick overview of the Pulse dashboard — create an event, invite participants, and run your first interactive poll in under 2 minutes.',
    duration: '2:28',
    category: 'getting-started',
    feature: 'overview',
    provider: 'guidde',
    videoUrl: 'https://embed.app.guidde.com/playbooks/aeXzY7rCCT7zVZgYZzwjmX?mode=videoOnly',
    thumbnailUrl: '', // Uses the VideoPlayer generic fallback icon
    relatedRoute: '/dashboard',
    featured: true,
    order: 1,
  },

  // ── Events ─────────────────────────────────────────────────────────────────

  {
    id: 'create-event',
    title: 'Create Your First Event',
    description:
      'Step-by-step guide to creating an event: set a title, configure participant access, and get your shareable join code and QR.',
    duration: '1:20', // ⚠️ REPLACE with real duration
    category: 'events',
    feature: 'events',
    provider: 'placeholder', // ⚠️ REPLACE
    videoUrl: PLACEHOLDER_EMBED, // ⚠️ REPLACE
    thumbnailUrl: PLACEHOLDER_THUMBNAIL, // ⚠️ REPLACE
    relatedRoute: '/dashboard/events',
    featured: true,
    order: 1,
  },

  // ── Features ───────────────────────────────────────────────────────────────

  {
    id: 'live-poll',
    title: 'Run a Live Poll',
    description:
      'Create single-choice, multiple-choice, rating, and open-text polls. Launch them live and watch real-time results animate as votes come in.',
    duration: '1:30', // ⚠️ REPLACE
    category: 'features',
    feature: 'poll',
    provider: 'placeholder', // ⚠️ REPLACE
    videoUrl: PLACEHOLDER_EMBED, // ⚠️ REPLACE
    thumbnailUrl: PLACEHOLDER_THUMBNAIL, // ⚠️ REPLACE
    relatedRoute: '/dashboard/events',
    order: 1,
  },
  {
    id: 'interactive-quiz',
    title: 'Run an Interactive Quiz',
    description:
      'Build timed knowledge checks, reveal correct answers live, and watch the leaderboard update in real-time as participants compete.',
    duration: '1:50', // ⚠️ REPLACE
    category: 'features',
    feature: 'quiz',
    provider: 'placeholder', // ⚠️ REPLACE
    videoUrl: PLACEHOLDER_EMBED, // ⚠️ REPLACE
    thumbnailUrl: PLACEHOLDER_THUMBNAIL, // ⚠️ REPLACE
    relatedRoute: '/dashboard/events',
    order: 2,
  },
  {
    id: 'moderate-qa',
    title: 'Moderate Q&A in Real Time',
    description:
      'How to enable anonymous Q&A, review the question queue, approve or hide submissions, and mark questions as answered during a live session.',
    duration: '1:25', // ⚠️ REPLACE
    category: 'features',
    feature: 'qa',
    provider: 'placeholder', // ⚠️ REPLACE
    videoUrl: PLACEHOLDER_EMBED, // ⚠️ REPLACE
    thumbnailUrl: PLACEHOLDER_THUMBNAIL, // ⚠️ REPLACE
    relatedRoute: '/dashboard/events',
    order: 3,
  },
  {
    id: 'surveys-feedback',
    title: 'Create Surveys & Collect Feedback',
    description:
      'Build multi-step surveys and feedback forms, capture ratings and open text, then export structured responses to CSV or PDF.',
    duration: '1:40', // ⚠️ REPLACE
    category: 'features',
    feature: 'feedback',
    provider: 'placeholder', // ⚠️ REPLACE
    videoUrl: PLACEHOLDER_EMBED, // ⚠️ REPLACE
    thumbnailUrl: PLACEHOLDER_THUMBNAIL, // ⚠️ REPLACE
    relatedRoute: '/dashboard/events',
    order: 4,
  },
  {
    id: 'word-cloud',
    title: 'Word Cloud in Action',
    description:
      'Collect short free-text responses and display a live weighted word cloud that surfaces the most popular themes from your audience.',
    duration: '1:10', // ⚠️ REPLACE
    category: 'features',
    feature: 'wordcloud',
    provider: 'placeholder', // ⚠️ REPLACE
    videoUrl: PLACEHOLDER_EMBED, // ⚠️ REPLACE
    thumbnailUrl: PLACEHOLDER_THUMBNAIL, // ⚠️ REPLACE
    relatedRoute: '/dashboard/events',
    order: 5,
  },

  // ── AI ─────────────────────────────────────────────────────────────────────

  {
    id: 'ai-studio',
    title: 'Use AI Studio',
    description:
      'Describe your session in natural language and let AI Studio draft a full agenda of polls, quizzes, and Q&A activities in seconds.',
    duration: '2:00', // ⚠️ REPLACE
    category: 'ai',
    feature: 'ai-studio',
    provider: 'placeholder', // ⚠️ REPLACE
    videoUrl: PLACEHOLDER_EMBED, // ⚠️ REPLACE
    thumbnailUrl: PLACEHOLDER_THUMBNAIL, // ⚠️ REPLACE
    relatedRoute: '/dashboard/ai',
    featured: true,
    order: 1,
  },

  // ── Analytics ──────────────────────────────────────────────────────────────

  {
    id: 'analytics-reports',
    title: 'Analytics & Reports',
    description:
      'Explore engagement timelines, per-activity breakdowns, and AI-generated insights. Export full session reports to CSV and PDF.',
    duration: '1:35', // ⚠️ REPLACE
    category: 'analytics',
    feature: 'analytics',
    provider: 'placeholder', // ⚠️ REPLACE
    videoUrl: PLACEHOLDER_EMBED, // ⚠️ REPLACE
    thumbnailUrl: PLACEHOLDER_THUMBNAIL, // ⚠️ REPLACE
    relatedRoute: '/dashboard/events',
    order: 1,
  },

  // ── Integrations ───────────────────────────────────────────────────────────

  {
    id: 'integration-powerpoint-slides',
    title: 'Connect PowerPoint & Google Slides',
    description:
      'Embed live Pulse polls and Q&A directly inside your presentation slides — no tab switching, no friction for your audience.',
    duration: '2:10', // ⚠️ REPLACE
    category: 'integrations',
    feature: 'powerpoint',
    provider: 'placeholder', // ⚠️ REPLACE
    videoUrl: PLACEHOLDER_EMBED, // ⚠️ REPLACE
    thumbnailUrl: PLACEHOLDER_THUMBNAIL, // ⚠️ REPLACE
    relatedRoute: '/dashboard/integrations/powerpoint',
    order: 1,
  },
  {
    id: 'integration-google-meet',
    title: 'Google Meet Integration',
    description:
      'Use the native Google Meet Activities sidebar to run Pulse polls and Q&A without ever leaving the video call.',
    duration: '1:45', // ⚠️ REPLACE
    category: 'integrations',
    feature: 'google-meet',
    provider: 'placeholder', // ⚠️ REPLACE
    videoUrl: PLACEHOLDER_EMBED, // ⚠️ REPLACE
    thumbnailUrl: PLACEHOLDER_THUMBNAIL, // ⚠️ REPLACE
    relatedRoute: '/dashboard/integrations/google-meet',
    order: 2,
  },
  {
    id: 'integration-zoom',
    title: 'Zoom Integration',
    description:
      'Authorize Pulse with Zoom, then launch polls and Q&A directly from the Zoom Apps tray during your meeting.',
    duration: '1:50', // ⚠️ REPLACE
    category: 'integrations',
    feature: 'zoom',
    provider: 'placeholder', // ⚠️ REPLACE
    videoUrl: PLACEHOLDER_EMBED, // ⚠️ REPLACE
    thumbnailUrl: PLACEHOLDER_THUMBNAIL, // ⚠️ REPLACE
    relatedRoute: '/dashboard/integrations/zoom',
    order: 3,
  },
  {
    id: 'integration-teams',
    title: 'Microsoft Teams Integration',
    description:
      'Embed Pulse as a seamless side panel in Microsoft Teams meetings to run real-time polls without disrupting your call flow.',
    duration: '1:55', // ⚠️ REPLACE
    category: 'integrations',
    feature: 'teams',
    provider: 'placeholder', // ⚠️ REPLACE
    videoUrl: PLACEHOLDER_EMBED, // ⚠️ REPLACE
    thumbnailUrl: PLACEHOLDER_THUMBNAIL, // ⚠️ REPLACE
    relatedRoute: '/dashboard/integrations/teams',
    order: 4,
  },
];

// =============================================================================
// Helper utilities
// =============================================================================

/** Get all videos in a specific category, sorted by `order` */
export function getVideosByCategory(category: TutorialCategory): TutorialVideo[] {
  return TUTORIAL_VIDEOS.filter((v) => v.category === category).sort(
    (a, b) => (a.order ?? 99) - (b.order ?? 99),
  );
}

/** Look up a single video by its id */
export function getVideoById(id: string): TutorialVideo | undefined {
  return TUTORIAL_VIDEOS.find((v) => v.id === id);
}

/** Get the tutorial video that best matches a feature slug (e.g. 'poll', 'quiz') */
export function getVideoByFeature(feature: string): TutorialVideo | undefined {
  return TUTORIAL_VIDEOS.find((v) => v.feature === feature);
}

/** Get the tutorial video associated with the current dashboard route */
export function getVideoByRoute(route: string): TutorialVideo | undefined {
  return TUTORIAL_VIDEOS.find((v) => v.relatedRoute === route);
}

/** Get featured videos for prominent placements (hero, welcome cards) */
export function getFeaturedVideos(): TutorialVideo[] {
  return TUTORIAL_VIDEOS.filter((v) => v.featured).sort(
    (a, b) => (a.order ?? 99) - (b.order ?? 99),
  );
}

/** All available category labels for filter tabs */
export const TUTORIAL_CATEGORY_LABELS: Record<TutorialCategory, string> = {
  'getting-started': 'Getting Started',
  events: 'Events',
  features: 'Features',
  ai: 'AI Studio',
  analytics: 'Analytics',
  integrations: 'Integrations',
};
