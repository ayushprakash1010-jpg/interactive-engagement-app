export interface SwitchProps {
  checked?: boolean;
  onChange?: (next: boolean) => void;
  disabled?: boolean;
  label?: string;
  size?: 'sm' | 'md';
  id?: string;
}

/** Boolean toggle for settings (e.g. anonymous Q&A, AI moderation). */
export function Switch(props: SwitchProps): JSX.Element;
