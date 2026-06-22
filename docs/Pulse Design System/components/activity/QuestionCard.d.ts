export interface QuestionCardProps {
  text: string;
  author?: string;
  votes?: number;
  voted?: boolean;
  onUpvote?: () => void;
  status?: 'pending' | 'approved';
  answered?: boolean;
  inverse?: boolean;
  style?: React.CSSProperties;
}

/** Audience Q&A card with upvote pill and moderation state. */
export function QuestionCard(props: QuestionCardProps): JSX.Element;
