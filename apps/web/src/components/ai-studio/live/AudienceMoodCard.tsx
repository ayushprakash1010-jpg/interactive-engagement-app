import * as React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui';
import { Smile, Meh, Frown, Sparkles, HelpCircle, AlertCircle, Compass } from 'lucide-react';
import { type AudienceMood } from '@/lib/ai';

const moodConfig = {
  Positive: { icon: Smile, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
  Neutral: { icon: Meh, color: 'text-blue-500', bg: 'bg-blue-500/10' },
  Negative: { icon: Frown, color: 'text-red-500', bg: 'bg-red-500/10' },
  Excited: { icon: Sparkles, color: 'text-amber-500', bg: 'bg-amber-500/10' },
  Confused: { icon: HelpCircle, color: 'text-purple-500', bg: 'bg-purple-500/10' },
  Frustrated: { icon: AlertCircle, color: 'text-red-600', bg: 'bg-red-600/10' },
  Curious: { icon: Compass, color: 'text-indigo-500', bg: 'bg-indigo-500/10' },
};

export function AudienceMoodCard({ mood }: { mood: AudienceMood }) {
  const config = moodConfig[mood.primary] || moodConfig.Neutral;
  const Icon = config.icon;

  return (
    <Card className="border-border/50 shadow-sm">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-semibold">Audience Mood</CardTitle>
      </CardHeader>
      <CardContent className="pt-2 flex items-center gap-4">
        <div className={`h-12 w-12 rounded-full ${config.bg} flex items-center justify-center shrink-0`}>
          <Icon className={`h-6 w-6 ${config.color}`} />
        </div>
        <div>
          <p className="text-lg font-bold">{mood.primary}</p>
          <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
            Trend: 
            <span className={`font-medium ${
              mood.trend === 'Improving' ? 'text-emerald-500' :
              mood.trend === 'Declining' ? 'text-red-500' :
              'text-foreground'
            }`}>{mood.trend}</span>
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
