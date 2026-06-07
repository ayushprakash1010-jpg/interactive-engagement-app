export type WordCloudWord = {
  text: string;
  weight: number;
};

export function normalizeWordCloudInput(input: string): string[] {
  return Array.from(
    new Set(
      input
        .split(/[,\n]/g)
        .map((word) => word.trim().toLowerCase())
        .filter(Boolean),
    ),
  );
}

export function limitWordCloudWords(words: string[], maxWords: number): string[] {
  return words.slice(0, Math.max(0, maxWords));
}

export function getWordCloudFontSize(
  weight: number,
  minWeight: number,
  maxWeight: number,
): number {
  if (maxWeight <= minWeight) {
    return 28;
  }

  const ratio = (weight - minWeight) / (maxWeight - minWeight);
  return Math.round(24 + ratio * 52);
}

export function getWordCloudColor(index: number): string {
  const palette = [
    'var(--color-primary)',
    'var(--color-blue)',
    'var(--color-purple)',
    'var(--color-orange)',
    'var(--color-gold)',
    'var(--color-success)',
  ];

  return palette[index % palette.length] ?? 'var(--color-primary)';
}