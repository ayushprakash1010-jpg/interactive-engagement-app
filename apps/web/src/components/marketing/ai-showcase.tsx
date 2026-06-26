'use client';

import * as React from 'react';
import { AIComposer, AISummaryCard } from '@/components/pulse';

const SUGGESTIONS = [
  'Kickoff for a 200-person all-hands',
  'Intro stats lecture, 50 students',
  'Product webinar with live Q&A',
];

/**
 * Marketing demo of the "describe it, Pulse drafts it" AI flow. The summary
 * is a static mock - the design is wired, the model is not (see DS caveats).
 */
export function AIShowcase() {
  const [value, setValue] = React.useState('');
  const [loading, setLoading] = React.useState(false);
  const [drafted, setDrafted] = React.useState(false);

  const generate = () => {
    setLoading(true);
    setDrafted(false);
    window.setTimeout(() => {
      setLoading(false);
      setDrafted(true);
    }, 1100);
  };

  return (
    <div className="grid items-start gap-6 lg:grid-cols-2">
      <AIComposer
        value={value}
        onChange={setValue}
        onGenerate={generate}
        loading={loading}
        suggestions={SUGGESTIONS}
      />
      {loading ? (
        <AISummaryCard title="Drafting your session" shimmer />
      ) : drafted ? (
        <AISummaryCard
          title="Pulse drafted 4 activities"
          themes={[
            { label: 'Icebreaker poll - "Where are you joining from?"' },
            { label: "Word cloud - one word for today's goal" },
            { label: 'Live Q&A with upvoting' },
            { label: 'Closing pulse-check rating' },
          ]}
          footnote="A first draft you own - edit, reorder, or remove anything before you go live."
        />
      ) : (
        <AISummaryCard
          title="What you'll get"
          body="Describe your session and Pulse drafts a runnable agenda - polls, a word cloud, Q&A, and a closing rating - ready to edit before you go live."
          themes={[
            { label: 'Live answer summaries', count: undefined },
            { label: 'Theme clustering for open text' },
            { label: 'Suggested follow-up questions' },
          ]}
          footnote="AI is a fast first draft you own - never autonomous."
        />
      )}
    </div>
  );
}
