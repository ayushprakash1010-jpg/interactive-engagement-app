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
}

const BAR_COLORS = [
  '#01696f',
  '#4f98a3',
  '#6daa45',
  '#d19900',
  '#da7101',
  '#006494',
  '#7a39bb',
  '#a12c7b',
];

export function PollResultsChart({ tallies, projector = false }: Props) {
  const barHeight = projector ? 56 : 36;
  const fontSize = projector ? 16 : 13;
  const labelColor = 'var(--color-text-muted, #6b7280)';

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
            <CartesianGrid strokeDasharray="3 3" horizontal={false} />
            <XAxis
              type="number"
              domain={[0, maxVotes]}
              allowDecimals={false}
              tick={{ fontSize }}
              tickLine={false}
            />
            <YAxis
              type="category"
              dataKey="name"
              width={projector ? 180 : 120}
              tick={{ fontSize, fill: 'var(--color-text, #1f2937)' }}
              tickLine={false}
            />
            <Tooltip
              formatter={(value) => {
                const count = typeof value === 'number' ? value : Number(value ?? 0);
                return [`${count} vote${count !== 1 ? 's' : ''}`, ''];
              }}
              cursor={{ fill: 'var(--color-surface-offset, #f3f0ec)' }}
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
              color: 'var(--color-primary, #01696f)',
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
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis
              dataKey="name"
              tick={{ fontSize, fill: 'var(--color-text, #1f2937)' }}
              tickLine={false}
            />
            <YAxis
              allowDecimals={false}
              tick={{ fontSize }}
              tickLine={false}
              width={28}
            />
            <Tooltip
              formatter={(value) => {
                const count = typeof value === 'number' ? value : Number(value ?? 0);
                return [`${count}`, 'responses'];
              }}
              cursor={{ fill: 'var(--color-surface-offset, #f3f0ec)' }}
            />
            <Bar
              dataKey="votes"
              fill="#01696f"
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
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [tallies.texts.length]);

  const maxHeight = projector ? 420 : 260;

  return (
    <div className="w-full space-y-2">
      <p style={{ color: 'var(--color-text-muted)', fontSize }}>
        {tallies.totalResponses} response
        {tallies.totalResponses !== 1 ? 's' : ''}
      </p>

      <div
        className="overflow-y-auto rounded-lg border"
        style={{
          maxHeight,
          borderColor: 'var(--color-border, #d4d1ca)',
          background: 'var(--color-surface, #f9f8f5)',
        }}
      >
        {tallies.texts.length === 0 ? (
          <p
            className="p-4 text-center"
            style={{ color: 'var(--color-text-muted)', fontSize }}
          >
            Waiting for responses…
          </p>
        ) : (
          <ul
            className="divide-y"
            style={{ borderColor: 'var(--color-divider, #dcd9d5)' }}
          >
            {tallies.texts.map((text, index) => (
              <li
                key={index}
                className="px-4 py-3 leading-relaxed"
                style={{ fontSize, color: 'var(--color-text)' }}
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