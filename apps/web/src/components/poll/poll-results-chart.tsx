'use client';

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import { useEffect, useRef } from 'react';

export interface TallyBucket {
  optionId: string;
  label: string;
  count: number;
}

export interface ChoiceTallyResult {
  pollType: 'single' | 'multiple';
  totalResponses: number;
  buckets: TallyBucket[];
}

export interface RatingTallyResult {
  pollType: 'rating';
  totalResponses: number;
  average: number;
  distribution: Record<string, number>;
}

export interface OpenTallyResult {
  pollType: 'open';
  totalResponses: number;
  texts: string[];
}

export type PollTallyResult =
  | ChoiceTallyResult
  | RatingTallyResult
  | OpenTallyResult;

interface Props {
  tallies: PollTallyResult;
  projector?: boolean;
  /**
   * Render against a dark Pulse stage scope. Colors stay token-based, so the
   * same component works in light run-panels and the dark projector stage.
   */
  inverse?: boolean;
}

// Pulse categorical data palette (matches --data-1..--data-8 tokens).
const BAR_COLORS = [
  'var(--data-1)',
  'var(--data-2)',
  'var(--data-3)',
  'var(--data-4)',
  'var(--data-5)',
  'var(--data-6)',
  'var(--data-7)',
  'var(--data-8)',
];

export function PollResultsChart({
  tallies,
  projector = false,
  inverse = false,
}: Props) {
  const barHeight = projector ? 56 : 36;
  const fontSize = projector ? 16 : 13;
  // Semantic tokens re-map automatically inside `.pulse-stage`.
  const labelColor = 'var(--text-muted)';
  const textColor = 'var(--text-primary)';
  const gridColor = 'var(--border-default)';
  const cursorFill = inverse ? 'rgba(255,255,255,0.06)' : 'var(--surface-offset)';
  const tooltipStyle = {
    background: 'var(--surface-card)',
    border: '1px solid var(--border-default)',
    borderRadius: 8,
    color: 'var(--text-primary)',
  } as const;

  if (tallies.pollType === 'single' || tallies.pollType === 'multiple') {
    const data = tallies.buckets.map((bucket) => ({
      name: bucket.label,
      votes: bucket.count,
      optionId: bucket.optionId,
    }));

    const maxVotes = Math.max(1, ...data.map((item) => item.votes));

    return (
      <div className="w-full space-y-1">
        <p className="text-sm text-right" style={{ color: labelColor, fontSize }}>
          {tallies.totalResponses} response
          {tallies.totalResponses !== 1 ? 's' : ''}
        </p>

        <ResponsiveContainer width="100%" height={data.length * (barHeight + 16) + 24}>
          <BarChart
            data={data}
            layout="vertical"
            margin={{ top: 4, right: 48, left: 8, bottom: 4 }}
          >
            <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke={gridColor} />
            <XAxis
              type="number"
              domain={[0, maxVotes]}
              allowDecimals={false}
              tick={{ fontSize, fill: labelColor }}
              tickLine={false}
            />
            <YAxis
              type="category"
              dataKey="name"
              width={projector ? 180 : 120}
              tick={{ fontSize, fill: textColor }}
              tickLine={false}
            />
            <Tooltip
              formatter={(value) => {
                const count = typeof value === 'number' ? value : Number(value ?? 0);
                return [`${count} vote${count !== 1 ? 's' : ''}`, ''];
              }}
              cursor={{ fill: cursorFill }}
              contentStyle={tooltipStyle}
            />
            <Bar dataKey="votes" radius={[0, 4, 4, 0]} maxBarSize={barHeight}>
              {data.map((_, index) => (
                <Cell
                  key={index}
                  fill={BAR_COLORS[index % BAR_COLORS.length]}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    );
  }

  if (tallies.pollType === 'rating') {
    const data = Object.entries(tallies.distribution)
      .sort(([a], [b]) => Number(a) - Number(b))
      .map(([label, count]) => ({ name: label, votes: count }));

    return (
      <div className="w-full space-y-3">
        <div className="flex items-baseline gap-2">
          <span
            className="font-bold"
            style={{
              fontSize: projector ? 48 : 32,
              lineHeight: 1,
              color: 'var(--data-1)',
            }}
          >
            {tallies.average.toFixed(1)}
          </span>
          <span style={{ color: labelColor, fontSize }}>
            avg · {tallies.totalResponses} response
            {tallies.totalResponses !== 1 ? 's' : ''}
          </span>
        </div>

        <ResponsiveContainer width="100%" height={projector ? 180 : 120}>
          <BarChart data={data} margin={{ top: 4, right: 8, left: 0, bottom: 4 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={gridColor} />
            <XAxis
              dataKey="name"
              tick={{ fontSize, fill: textColor }}
              tickLine={false}
            />
            <YAxis
              allowDecimals={false}
              tick={{ fontSize, fill: labelColor }}
              tickLine={false}
              width={28}
            />
            <Tooltip
              formatter={(value) => {
                const count = typeof value === 'number' ? value : Number(value ?? 0);
                return [`${count}`, 'responses'];
              }}
              cursor={{ fill: cursorFill }}
              contentStyle={tooltipStyle}
            />
            <Bar
              dataKey="votes"
              fill="var(--data-1)"
              radius={[4, 4, 0, 0]}
              maxBarSize={barHeight}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    );
  }

  return (
    <OpenTextFeed
      tallies={tallies as OpenTallyResult}
      projector={projector}
      fontSize={fontSize}
    />
  );
}

function OpenTextFeed({
  tallies,
  projector,
  fontSize,
}: {
  tallies: OpenTallyResult;
  projector: boolean;
  fontSize: number;
}) {
  // Semantic tokens re-map automatically inside `.pulse-stage`.
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [tallies.texts.length]);

  const maxHeight = projector ? 420 : 260;

  return (
    <div className="w-full space-y-2">
      <p style={{ color: 'var(--text-muted)', fontSize }}>
        {tallies.totalResponses} response
        {tallies.totalResponses !== 1 ? 's' : ''}
      </p>

      <div
        className="overflow-y-auto rounded-lg border"
        style={{
          maxHeight,
          borderColor: 'var(--border-default)',
          background: 'var(--surface-sunken)',
        }}
      >
        {tallies.texts.length === 0 ? (
          <p
            className="p-4 text-center"
            style={{ color: 'var(--text-muted)', fontSize }}
          >
            Waiting for responses…
          </p>
        ) : (
          <ul
            className="divide-y"
            style={{ borderColor: 'var(--border-default)' }}
          >
            {tallies.texts.map((text, index) => (
              <li
                key={index}
                className="px-4 py-3 leading-relaxed"
                style={{ fontSize, color: 'var(--text-primary)' }}
              >
                {text}
              </li>
            ))}
          </ul>
        )}

        <div ref={bottomRef} />
      </div>
    </div>
  );
}