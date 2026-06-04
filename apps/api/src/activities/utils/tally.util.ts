// apps/api/src/activities/utils/tally.util.ts
import { ResponseDocument } from '../../responses/response.schema';

/** One bar / bucket in a choice or rating tally */
export interface TallyBucket {
  optionId: string;
  label: string;
  count: number;
}

/** Result shape for single / multiple choice polls */
export interface ChoiceTally {
  pollType: 'single' | 'multiple';
  totalResponses: number;
  buckets: TallyBucket[];
}

/** Result shape for rating polls */
export interface RatingTally {
  pollType: 'rating';
  totalResponses: number;
  average: number;
  distribution: Record<string, number>;
}

/** Result shape for open-text polls */
export interface OpenTally {
  pollType: 'open';
  totalResponses: number;
  texts: string[];
}

export type PollTally = ChoiceTally | RatingTally | OpenTally;

interface PollOption {
  id: string;
  label: string;
}

interface PollConfig {
  pollType: 'single' | 'multiple' | 'rating' | 'open';
  options?: PollOption[];
  ratingScale?: number;
}

/**
 * Pure function — no Mongoose, no side effects.
 * Computes the tally for a poll activity from its raw response documents.
 * Designed to be called after every new response and in unit tests.
 */
export function computePollTally(
  config: PollConfig,
  responses: Pick<
    ResponseDocument,
    'selectedOptionIds' | 'textValue' | 'ratingValue'
  >[],
): PollTally {
  const { pollType } = config;

  if (pollType === 'single' || pollType === 'multiple') {
    const options = config.options ?? [];
    const countMap = new Map<string, number>(options.map((o) => [o.id, 0]));

    for (const r of responses) {
      for (const optId of r.selectedOptionIds ?? []) {
        countMap.set(optId, (countMap.get(optId) ?? 0) + 1);
      }
    }

    const buckets: TallyBucket[] = options.map((o) => ({
      optionId: o.id,
      label: o.label,
      count: countMap.get(o.id) ?? 0,
    }));

    return {
      pollType,
      totalResponses: responses.length,
      buckets,
    } satisfies ChoiceTally;
  }

  if (pollType === 'rating') {
    const scale = config.ratingScale ?? 5;
    const distribution: Record<string, number> = {};

    for (let i = 1; i <= scale; i++) {
      distribution[String(i)] = 0;
    }

    let sum = 0;
    let totalResponses = 0;

    for (const r of responses) {
      if (r.ratingValue != null) {
        const key = String(r.ratingValue);
        distribution[key] = (distribution[key] ?? 0) + 1;
        sum += r.ratingValue;
        totalResponses += 1;
      }
    }

    return {
      pollType: 'rating',
      totalResponses,
      average:
        totalResponses > 0
          ? Math.round((sum / totalResponses) * 100) / 100
          : 0,
      distribution,
    } satisfies RatingTally;
  }

  return {
    pollType: 'open',
    totalResponses: responses.length,
    texts: responses.map((r) => r.textValue ?? '').filter(Boolean),
  } satisfies OpenTally;
}