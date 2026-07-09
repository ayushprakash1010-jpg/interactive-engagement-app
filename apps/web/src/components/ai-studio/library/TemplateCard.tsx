import * as React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter, Badge, Button } from '@/components/ui';
import { type SessionTemplate, type ActivityTemplate } from '@/lib/ai';
import { Users, Clock, Star, Play, Copy } from 'lucide-react';

interface TemplateCardProps {
  template: SessionTemplate | ActivityTemplate;
  onSelect: (template: SessionTemplate | ActivityTemplate) => void;
}

export function TemplateCard({ template, onSelect }: TemplateCardProps) {
  return (
    <Card 
      className="group hover:shadow-md transition-shadow cursor-pointer flex flex-col overflow-hidden border-border/60 hover:border-border"
      onClick={() => onSelect(template)}
    >
      <CardHeader className="pb-3 border-b bg-muted/20">
        <div className="flex justify-between items-start mb-2">
          <Badge variant={template.type === 'session' ? 'default' : 'outline'} className="capitalize">
            {template.type} Template
          </Badge>
          {template.isFavorite && <Star className="h-4 w-4 fill-amber-400 text-amber-400" />}
        </div>
        <CardTitle className="text-lg line-clamp-1 group-hover:text-primary transition-colors">
          {template.title}
        </CardTitle>
        <CardDescription className="line-clamp-2 min-h-[40px]">
          {template.description}
        </CardDescription>
      </CardHeader>
      
      <CardContent className="pt-4 pb-3 flex-1">
        <div className="flex flex-wrap gap-2 mb-4">
          {template.tags.slice(0, 3).map(tag => (
            <Badge key={tag} variant="outline" className="text-xs bg-background">
              {tag}
            </Badge>
          ))}
          {template.tags.length > 3 && (
             <Badge variant="outline" className="text-xs bg-background">+{template.tags.length - 3}</Badge>
          )}
        </div>

        <div className="flex items-center gap-4 text-xs text-muted-foreground">
          <div className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            {template.duration}
          </div>
          <div className="flex items-center gap-1">
            <Users className="h-3 w-3" />
            {template.audience}
          </div>
        </div>
      </CardContent>

      <CardFooter className="pt-0 pb-4 flex justify-between items-center border-t px-6 mt-auto">
        <div className="text-xs text-muted-foreground">
          {template.usageCount.toLocaleString()} uses
        </div>
        <Button variant="ghost" size="sm" className="h-8 gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          Preview
        </Button>
      </CardFooter>
    </Card>
  );
}
