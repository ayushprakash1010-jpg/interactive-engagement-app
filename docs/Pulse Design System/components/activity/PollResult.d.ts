export interface PollResultProps {
  label: string;
  count?: number;
  total?: number;
  /** Index into the categorical data palette (bar color). */
  index?: number;
  /** Emphasize the winning option. */
  leading?: boolean;
  /** Light treatment for dark/projector surfaces. */
  inverse?: boolean;
  style?: React.CSSProperties;
}

/**
 * One live poll-result bar (label, animated fill, %, count). Stack to build a chart.
 * @startingPoint section="Activity" subtitle="Animated live poll result bar" viewport="700x150"
 */
export function PollResult(props: PollResultProps): JSX.Element;
