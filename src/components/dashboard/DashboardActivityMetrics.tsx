
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar, UtensilsCrossed, Clock } from 'lucide-react';
import { useDashboardStats } from '@/hooks/useRestaurantData';

export const DashboardActivityMetrics: React.FC<{ orders: any[], billingStats: { totalOrders: number, clientsServed: number, averageTicket: number } }> = ({
  orders,
  billingStats
}) => {
  // On n'utilise plus useDashboardStats pour cette colonne
  // const { totalCommandes, clientsServis, panierMoyen, loading } = useDashboardStats();
  const pendingOrders = orders.filter(order => order.status === 'pending').length;
  const preparingOrders = orders.filter(order => order.status === 'preparing').length;
  const readyOrdersCount = orders.filter(order => order.status === 'ready').length;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card className="bg-slate-800 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white text-lg flex items-center space-x-2">
            <Calendar className="w-5 h-5 text-emerald-500" />
            <span>Activité du jour</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex justify-between items-center p-3 bg-slate-700 rounded-lg">
              <span className="text-slate-300">Commandes totales</span>
              <span className="text-white font-bold">{billingStats.totalOrders}</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-slate-700 rounded-lg">
              <span className="text-slate-300">Clients servis</span>
              <span className="text-white font-bold">{billingStats.clientsServed}</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-slate-700 rounded-lg">
              <span className="text-slate-300">Panier moyen</span>
              <span className="text-emerald-400 font-bold">{billingStats.averageTicket.toFixed(0)} FCFA</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-slate-800 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white text-lg flex items-center space-x-2">
            <Clock className="w-5 h-5 text-blue-500" />
            <span>File de commandes</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex justify-between items-center p-3 bg-slate-700 rounded-lg">
              <span className="text-slate-300">En attente</span>
              <span className="text-yellow-400 font-bold">{pendingOrders}</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-slate-700 rounded-lg">
              <span className="text-slate-300">En préparation</span>
              <span className="text-blue-400 font-bold">{preparingOrders}</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-slate-700 rounded-lg">
              <span className="text-slate-300">Prêtes</span>
              <span className="text-emerald-400 font-bold">{readyOrdersCount}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
