import * as React from 'react';
import { type SmartAlert } from '@/lib/ai';
import { AlertCircle, Info, X, AlertTriangle } from 'lucide-react';

export function AlertCenter({ alerts }: { alerts: SmartAlert[] }) {
  const [dismissed, setDismissed] = React.useState<Set<string>>(new Set());

  const handleDismiss = (id: string) => {
    setDismissed(prev => new Set(prev).add(id));
  };

  const visibleAlerts = alerts.filter(a => !a.isDismissed && !dismissed.has(a.id));

  if (visibleAlerts.length === 0) return null;

  return (
    <div className="flex flex-col gap-2">
      {visibleAlerts.map(alert => (
        <div 
          key={alert.id}
          className={`flex items-start gap-3 p-3 rounded-md border text-sm relative ${
            alert.type === 'critical' ? 'bg-red-50 border-red-200 text-red-900 dark:bg-red-950/50 dark:border-red-900 dark:text-red-200' :
            alert.type === 'warning' ? 'bg-amber-50 border-amber-200 text-amber-900 dark:bg-amber-950/50 dark:border-amber-900 dark:text-amber-200' :
            'bg-blue-50 border-blue-200 text-blue-900 dark:bg-blue-950/50 dark:border-blue-900 dark:text-blue-200'
          }`}
        >
          {alert.type === 'critical' && <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />}
          {alert.type === 'warning' && <AlertTriangle className="h-5 w-5 shrink-0 mt-0.5" />}
          {alert.type === 'info' && <Info className="h-5 w-5 shrink-0 mt-0.5" />}
          
          <div className="flex-1 pr-6">
            <p className="font-medium leading-tight">{alert.message}</p>
          </div>
          
          <button 
            onClick={() => handleDismiss(alert.id)}
            className="absolute top-2 right-2 p-1 rounded-sm opacity-70 hover:opacity-100 hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      ))}
    </div>
  );
}
