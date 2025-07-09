
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart3 } from 'lucide-react';
import { DashboardRecentOrders } from './DashboardRecentOrders';

interface DGSectionProps {
  orders: any[];
}

export const DashboardDGSection: React.FC<DGSectionProps> = ({ orders }) => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card className="bg-slate-800 border-slate-700 hover:border-emerald-500/50 transition-colors">
        <CardHeader>
          <CardTitle className="text-white">Performances hebdomadaires</CardTitle>
          <CardDescription className="text-slate-400">
            Évolution des ventes sur 7 jours
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-64 flex items-center justify-center text-slate-400 bg-gradient-to-br from-emerald-900/10 to-teal-900/10 rounded-lg border border-emerald-500/20">
            <div className="text-center">
              <BarChart3 className="w-12 h-12 text-emerald-500 mx-auto mb-2" />
              <p>Graphique des ventes (intégration Recharts à venir)</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <DashboardRecentOrders orders={orders} />
    </div>
  );
};
