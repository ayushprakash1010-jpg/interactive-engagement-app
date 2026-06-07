'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import * as d3 from 'd3';
import cloud from 'd3-cloud';
import type { WordCloudWord } from '@/lib/wordcloud';
import { getWordCloudColor, getWordCloudFontSize } from '@/lib/wordcloud';

type LayoutWord = {
  text: string;
  weight: number;
  size: number;
  x?: number;
  y?: number;
  rotate?: number;
};

type WordCloudProps = {
  words: WordCloudWord[];
  height?: number;
  className?: string;
  emptyMessage?: string;
};

export function WordCloud({
  words,
  height = 420,
  className,
  emptyMessage = 'Waiting for responses…',
}: WordCloudProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [width, setWidth] = useState(900);
  const [layoutWords, setLayoutWords] = useState<LayoutWord[]>([]);

  useEffect(() => {
    const node = containerRef.current;
    if (!node) return;

    const updateWidth = () => {
      const nextWidth = Math.max(320, Math.floor(node.getBoundingClientRect().width));
      setWidth(nextWidth);
    };

    updateWidth();

    const observer = new ResizeObserver(() => updateWidth());
    observer.observe(node);

    return () => observer.disconnect();
  }, []);

  const sizedWords = useMemo(() => {
    if (words.length === 0) return [];

    const weights = words.map((word) => word.weight);
    const minWeight = Math.min(...weights);
    const maxWeight = Math.max(...weights);

    return words.map((word) => ({
      ...word,
      size: getWordCloudFontSize(word.weight, minWeight, maxWeight),
    }));
  }, [words]);

  useEffect(() => {
    if (sizedWords.length === 0) {
      setLayoutWords([]);
      return;
    }

    let cancelled = false;

    const layout = cloud<LayoutWord>()
      .size([width, height])
      .words(sizedWords.map((word) => ({ ...word })))
      .padding(8)
      .rotate((_, index) => (index % 5 === 0 ? 90 : 0))
      .font('Inter, sans-serif')
      .fontSize((d) => d.size)
      .on('end', (computed) => {
        if (!cancelled) {
          setLayoutWords(computed);
        }
      });

    layout.start();

    return () => {
      cancelled = true;
      layout.stop();
    };
  }, [height, sizedWords, width]);

  if (words.length === 0) {
    return (
      <div
        ref={containerRef}
        className={className}
        style={{
          minHeight: height,
          border: '1px dashed var(--color-border)',
          borderRadius: 16,
          background: 'var(--color-surface)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'var(--color-text-muted)',
          padding: 24,
          textAlign: 'center',
        }}
      >
        {emptyMessage}
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className={className}
      style={{
        minHeight: height,
        border: '1px solid var(--color-border)',
        borderRadius: 24,
        background: 'var(--color-surface)',
        padding: 12,
      }}
    >
      <svg width="100%" height={height} viewBox={`0 0 ${width} ${height}`} role="img" aria-label="Live word cloud">
        <g transform={`translate(${width / 2}, ${height / 2})`}>
          {layoutWords.map((word, index) => (
            <text
              key={`${word.text}-${index}`}
              transform={`translate(${word.x ?? 0}, ${word.y ?? 0}) rotate(${word.rotate ?? 0})`}
              textAnchor="middle"
              fontSize={word.size}
              fontWeight={700}
              fill={getWordCloudColor(index)}
              style={{ userSelect: 'none' }}
            >
              {word.text}
            </text>
          ))}
        </g>
      </svg>
    </div>
  );
}