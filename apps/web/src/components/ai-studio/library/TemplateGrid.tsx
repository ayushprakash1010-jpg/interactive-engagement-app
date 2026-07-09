import * as React from 'react';
import { type SessionTemplate, type ActivityTemplate } from '@/lib/ai';
import { TemplateCard } from './TemplateCard';

interface TemplateGridProps {
  templates: Array<SessionTemplate | ActivityTemplate>;
  onSelect: (template: SessionTemplate | ActivityTemplate) => void;
}

export function TemplateGrid({ templates, onSelect }: TemplateGridProps) {
  if (templates.length === 0) {
    return (
      <div className="py-12 text-center text-muted-foreground border border-dashed rounded-lg">
        No templates found matching your criteria.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4">
      {templates.map(template => (
        <TemplateCard 
          key={template.id} 
          template={template} 
          onSelect={onSelect} 
        />
      ))}
    </div>
  );
}
