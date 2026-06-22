export interface JoinCodeProps {
  code?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  /** Show a copy button; receives the code string. */
  onCopy?: (code: string) => void;
  /** Light text for dark/projector surfaces. */
  inverse?: boolean;
  style?: React.CSSProperties;
}

/**
 * Big mono join code for headers and the projector screen.
 * @startingPoint section="Activity" subtitle="Mono join code with copy" viewport="700x160"
 */
export function JoinCode(props: JoinCodeProps): JSX.Element;
