import * as React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui';
import { Button } from '@/components/ui';
import { Badge } from '@/components/ui';
import { type SessionTemplate, type ActivityTemplate } from '@/lib/ai';
import { Star, Clock, Users, Zap, LayoutTemplate } from 'lucide-react';
import { AgendaTimeline } from '../AgendaTimeline';

interface TemplatePreviewModalProps {
  template: SessionTemplate | ActivityTemplate | null;
  onClose: () => void;
  onInsert: (template: SessionTemplate | ActivityTemplate) => void;
}

export function TemplatePreviewModal({ template, onClose, onInsert }: TemplatePreviewModalProps) {
  if (!template) return null;

  const isSession = template.type === 'session';

  return (
    <Dialog open={!!template} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto">
        <DialogHeader className="mb-4">
          <div className="flex items-center gap-3 mb-2">
            <Badge variant={isSession ? 'default' : 'outline'} className="capitalize">
              {template.type} Template
            </Badge>
            {template.isFavorite && <Star className="h-4 w-4 fill-amber-400 text-amber-400" />}
            <span className="text-xs text-muted-foreground ml-auto">
              v{template.version} • {template.usageCount.toLocaleString()} uses
            </span>
          </div>
          <DialogTitle className="text-2xl">{template.title}</DialogTitle>
          <DialogDescription className="text-base mt-2">
            {template.description}
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="bg-muted/30 p-3 rounded-lg flex flex-col gap-1">
            <span className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Duration</span>
            <div className="flex items-center gap-2 font-medium">
              <Clock className="h-4 w-4 text-indigo-500" />
              {template.duration}
            </div>
          </div>
          <div className="bg-muted/30 p-3 rounded-lg flex flex-col gap-1">
            <span className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Audience</span>
            <div className="flex items-center gap-2 font-medium">
              <Users className="h-4 w-4 text-emerald-500" />
              {template.audience}
            </div>
          </div>
          {isSession && (
            <div className="bg-muted/30 p-3 rounded-lg flex flex-col gap-1">
              <span className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Engagement</span>
              <div className="flex items-center gap-2 font-medium">
                <Zap className="h-4 w-4 text-amber-500" />
                {(template as SessionTemplate).plan.estimatedEngagement}% Expected
              </div>
            </div>
          )}
        </div>

        {isSession && (
          <div className="mb-6 space-y-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <LayoutTemplate className="h-5 w-5" />
              Agenda Preview
            </h3>
            <div className="border rounded-lg bg-card p-4">
              <AgendaTimeline agenda={(template as SessionTemplate).plan.agenda} />
            </div>
          </div>
        )}

        {!isSession && (
          <div className="mb-6 border rounded-lg bg-card p-6 flex flex-col items-center justify-center text-center">
            <Badge variant="outline" className="mb-3 text-sm px-3 py-1">{(template as ActivityTemplate).activity.type}</Badge>
            <h4 className="text-lg font-medium mb-2">{(template as ActivityTemplate).activity.title}</h4>
            <p className="text-muted-foreground">{(template as ActivityTemplate).activity.description}</p>
          </div>
        )}

        <div className="mt-6 border-t pt-4 flex justify-end gap-2">
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={() => onInsert(template)}>Insert into Plan</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
