export interface LiveDotProps {
  size?: number;
  color?: string;
  live?: boolean;
  style?: React.CSSProperties;
}

/** Animated on-air status dot used in headers and badges. */
export function LiveDot(props: LiveDotProps): JSX.Element;
