'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';

const EMOJIS = ['❤️', '👏', '💡', '😂'];

export function ReactionBar({ onReact }: { onReact: (emoji: string) => void }) {
  // Simple throttle to prevent completely spamming the UI locally
  const [lastReactTime, setLastReactTime] = useState(0);

  const handleReact = (emoji: string) => {
    const now = Date.now();
    if (now - lastReactTime < 150) return; // limit local clicks
    setLastReactTime(now);
    onReact(emoji);
  };

  return (
    <div className="mx-auto mt-6 flex w-fit items-center gap-2 rounded-full border border-border bg-surface-card p-2 shadow-sm">
      {EMOJIS.map((emoji) => (
        <motion.button
          key={emoji}
          type="button"
          onClick={() => handleReact(emoji)}
          whileTap={{ scale: 0.8 }}
          className="flex h-12 w-12 items-center justify-center rounded-full text-2xl transition-colors hover:bg-surface-sunken"
        >
          {emoji}
        </motion.button>
      ))}
    </div>
  );
}
