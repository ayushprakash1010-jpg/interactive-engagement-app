'use client';

import { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ServerEvents } from '@iep/types';
import { socket } from '@/lib/socket';

type FloatingEmoji = {
  id: string;
  emoji: string;
  xOffset: number;
};

export function FloatingReactions() {
  const [reactions, setReactions] = useState<FloatingEmoji[]>([]);
  
  const handleReceive = useCallback((payload: { emoji: string; anonId: string }) => {
    const id = Math.random().toString(36).substring(2, 9);
    // Random x offset between -120px and +120px from center
    const xOffset = Math.random() * 240 - 120;
    
    setReactions((prev) => [...prev, { id, emoji: payload.emoji, xOffset }]);
    
    // Auto-remove after animation (2.5s)
    setTimeout(() => {
      setReactions((prev) => prev.filter((r) => r.id !== id));
    }, 2500);
  }, []);

  useEffect(() => {
    socket.on(ServerEvents.REACTION_RECEIVE, handleReceive);
    return () => {
      socket.off(ServerEvents.REACTION_RECEIVE, handleReceive);
    };
  }, [handleReceive]);

  return (
    <div className="pointer-events-none fixed inset-0 z-[100] overflow-hidden">
      <AnimatePresence>
        {reactions.map((r) => (
          <motion.div
            key={r.id}
            initial={{ opacity: 0, y: 100, x: `calc(50vw - 50% + ${r.xOffset}px)`, scale: 0.5 }}
            animate={{ 
              opacity: [0, 1, 1, 0], 
              y: -800, 
              x: `calc(50vw - 50% + ${r.xOffset * 1.5}px)`, 
              scale: [0.5, 1.5, 1.5, 1] 
            }}
            transition={{ duration: 2.5, ease: 'easeOut' }}
            className="absolute bottom-0 text-4xl"
            style={{ left: 0 }}
          >
            {r.emoji}
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
