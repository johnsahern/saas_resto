
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { SystemAlert } from '@/hooks/useSystemAlerts';

interface SystemAlertsProps {
  alerts: SystemAlert[];
}

export const DashboardSystemAlerts: React.FC<SystemAlertsProps> = ({ alerts }) => {
  if (alerts.length === 0) {
    return null;
  }

  return (
    <Card className="bg-slate-800 border-slate-700">
      <CardHeader>
        <CardTitle className="text-white flex items-center space-x-2">
          <AlertTriangle className="w-5 h-5 text-orange-500" />
          <span>Alertes système ({alerts.length})</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {alerts.slice(0, 5).map(alert => (
            <div 
              key={alert.id} 
              className={cn(
                'p-3 rounded-lg border-l-4',
                alert.type === 'error' ? 'bg-red-900/20 border-red-500' :
                alert.type === 'warning' ? 'bg-orange-900/20 border-orange-500' :
                alert.type === 'success' ? 'bg-emerald-900/20 border-emerald-500' :
                'bg-blue-900/20 border-blue-500'
              )}
            >
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="text-white font-medium">{alert.title}</h4>
                  <p className="text-slate-300 text-sm">{alert.message}</p>
                  <p className="text-xs text-slate-400 mt-1">
                    {new Date(alert.created_at).toLocaleString('fr-FR')}
                  </p>
                </div>
                <span className={cn(
                  "px-2 py-1 rounded text-xs font-medium",
                  alert.priority >= 3 ? "bg-red-600 text-white" :
                  alert.priority >= 2 ? "bg-orange-600 text-white" :
                  "bg-blue-600 text-white"
                )}>
                  Priorité {alert.priority}
                </span>
              </div>
            </div>
          ))}
          {alerts.length > 5 && (
            <p className="text-slate-400 text-center text-sm">
              Et {alerts.length - 5} autres alertes...
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
