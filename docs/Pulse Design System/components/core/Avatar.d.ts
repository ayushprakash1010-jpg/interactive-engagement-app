export interface AvatarProps {
  name?: string;
  src?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  /** Render a neutral anonymous chip instead of initials. */
  anonymous?: boolean;
  style?: React.CSSProperties;
}

/** Participant avatar — deterministic color from name, or anonymous chip. */
export function Avatar(props: AvatarProps): JSX.Element;
