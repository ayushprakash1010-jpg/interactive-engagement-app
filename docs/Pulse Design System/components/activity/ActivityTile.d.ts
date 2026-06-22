import React from 'react';

export type ActivityType = 'poll' | 'quiz' | 'wordcloud' | 'qa' | 'feedback' | 'ai';

export interface ActivityTileProps {
  icon: React.ReactNode;
  title: string;
  description?: string;
  /** Color-codes the icon chip per activity type. */
  type?: ActivityType;
  onClick?: () => void;
  style?: React.CSSProperties;
}

/** Activity picker tile for the event builder. */
export function ActivityTile(props: ActivityTileProps): JSX.Element;
