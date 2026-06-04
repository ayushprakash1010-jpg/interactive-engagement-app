import { describe, it, expect } from 'vitest';
import {
  computePollTally,
  ChoiceTally,
  RatingTally,
  OpenTally,
} from '../utils/tally.util';

const makeOptions = (labels: string[]) =>
  labels.map((label, i) => ({ id: `opt_${i}`, label }));

describe('computePollTally', () => {
  describe('single choice polls', () => {
    it('counts votes per option correctly', () => {
      const config = {
        pollType: 'single' as const,
        options: makeOptions(['Red', 'Blue', 'Green']),
      };

      const responses = [
        { selectedOptionIds: ['opt_0'] },
        { selectedOptionIds: ['opt_1'] },
        { selectedOptionIds: ['opt_1'] },
        { selectedOptionIds: ['opt_2'] },
        { selectedOptionIds: ['opt_1'] },
      ] as any[];

      const result = computePollTally(config, responses) as ChoiceTally;

      expect(result.pollType).toBe('single');
      expect(result.totalResponses).toBe(5);
      expect(result.buckets).toEqual([
        { optionId: 'opt_0', label: 'Red', count: 1 },
        { optionId: 'opt_1', label: 'Blue', count: 3 },
        { optionId: 'opt_2', label: 'Green', count: 1 },
      ]);
    });

    it('returns zero counts when there are no responses', () => {
      const config = {
        pollType: 'single' as const,
        options: makeOptions(['Red', 'Blue']),
      };

      const result = computePollTally(config, []) as ChoiceTally;

      expect(result.pollType).toBe('single');
      expect(result.totalResponses).toBe(0);
      expect(result.buckets).toEqual([
        { optionId: 'opt_0', label: 'Red', count: 0 },
        { optionId: 'opt_1', label: 'Blue', count: 0 },
      ]);
    });
  });

  describe('multiple choice polls', () => {
    it('counts each selected option across responses', () => {
      const config = {
        pollType: 'multiple' as const,
        options: makeOptions(['Apple', 'Banana', 'Orange']),
      };

      const responses = [
        { selectedOptionIds: ['opt_0', 'opt_1'] },
        { selectedOptionIds: ['opt_1'] },
        { selectedOptionIds: ['opt_0', 'opt_2'] },
      ] as any[];

      const result = computePollTally(config, responses) as ChoiceTally;

      expect(result.pollType).toBe('multiple');
      expect(result.totalResponses).toBe(3);
      expect(result.buckets).toEqual([
        { optionId: 'opt_0', label: 'Apple', count: 2 },
        { optionId: 'opt_1', label: 'Banana', count: 2 },
        { optionId: 'opt_2', label: 'Orange', count: 1 },
      ]);
    });
  });

  describe('rating polls', () => {
    it('builds a rating distribution and average', () => {
      const config = {
        pollType: 'rating' as const,
        ratingScale: 5,
      };

      const responses = [
        { ratingValue: 5 },
        { ratingValue: 4 },
        { ratingValue: 5 },
        { ratingValue: 3 },
        { ratingValue: 4 },
      ] as any[];

      const result = computePollTally(config, responses) as RatingTally;

      expect(result.pollType).toBe('rating');
      expect(result.totalResponses).toBe(5);
      expect(result.average).toBe(4.2);
      expect(result.distribution).toEqual({
        '1': 0,
        '2': 0,
        '3': 1,
        '4': 2,
        '5': 2,
      });
    });

    it('includes out-of-scale values as currently implemented', () => {
      const config = {
        pollType: 'rating' as const,
        ratingScale: 5,
      };

      const responses = [
        { ratingValue: 5 },
        { ratingValue: 99 },
        { ratingValue: 0 },
        { ratingValue: 4 },
      ] as any[];

      const result = computePollTally(config, responses) as RatingTally;

      expect(result.pollType).toBe('rating');
      expect(result.totalResponses).toBe(4);
      expect(result.average).toBe(27);
      expect(result.distribution).toEqual({
        '0': 1,
        '1': 0,
        '2': 0,
        '3': 0,
        '4': 1,
        '5': 1,
        '99': 1,
      });
    });
  });

  describe('open text polls', () => {
    it('returns non-empty text responses', () => {
      const config = {
        pollType: 'open' as const,
      };

      const responses = [
        { textValue: 'Useful' },
        { textValue: '' },
        { textValue: 'Clear' },
      ] as any[];

      const result = computePollTally(config, responses) as OpenTally;

      expect(result.pollType).toBe('open');
      expect(result.totalResponses).toBe(3);
      expect(result.texts).toEqual(['Useful', 'Clear']);
    });

    it('returns an empty array when no text responses exist', () => {
      const config = {
        pollType: 'open' as const,
      };

      const responses = [{}, { textValue: '' }] as any[];

      const result = computePollTally(config, responses) as OpenTally;

      expect(result.pollType).toBe('open');
      expect(result.totalResponses).toBe(2);
      expect(result.texts).toEqual([]);
    });
  });
});