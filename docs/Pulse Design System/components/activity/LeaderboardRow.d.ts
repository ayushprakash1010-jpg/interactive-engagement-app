export interface LeaderboardRowProps {
  rank?: number;
  name?: string;
  points?: number;
  /** Highlight the current participant's row. */
  you?: boolean;
  inverse?: boolean;
  style?: React.CSSProperties;
}

/** Quiz leaderboard row with medal tints for the top 3. */
export function LeaderboardRow(props: LeaderboardRowProps): JSX.Element;
