
import React from 'react';
import { cn } from '@/lib/utils';

interface DashboardHeaderProps {
  user: any;
  isDG: boolean;
  isManager: boolean;
}

export const DashboardHeader: React.FC<DashboardHeaderProps> = ({ user, isDG, isManager }) => {
  return (
    <div>
      <h2 className="text-2xl font-bold text-white mb-2">
        Tableau de bord
      </h2>
      <div className="flex items-center justify-between">
        <p className="text-slate-400">
          Bienvenue {user?.name} • {new Date().toLocaleDateString('fr-FR', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
          })}
        </p>
        <div className="flex items-center space-x-3">
          <span className={cn(
            "px-3 py-1 rounded-full text-sm font-medium",
            isDG ? "bg-emerald-600 text-white" : "bg-teal-600 text-white"
          )}>
            {user?.role}
          </span>
          <span className="text-sm text-slate-400">
            {isDG ? "Contrôle total" : isManager ? "Création • Lecture" : "Lecture seule"}
          </span>
        </div>
      </div>
    </div>
  );
};
