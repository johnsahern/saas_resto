
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, Users, UtensilsCrossed, DollarSign, AlertTriangle, Clock, Target } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useDashboardStats } from '@/hooks/useRestaurantData';

interface StatsCardsProps {
  billingStats: {
    totalRevenue: number;
    totalOrders: number;
    clientsServed: number;
    averageTicket: number;
  };
  performance: number;
  tables?: any[];
  tablesLoading?: boolean;
  orders: any[];
  ordersLoading: boolean;
  alerts: any[];
}

export const DashboardStatsCards: React.FC<StatsCardsProps> = ({
  billingStats,
  performance,
  orders,
  ordersLoading,
  alerts
}) => {
  // On n'utilise plus useDashboardStats pour la colonne 'Ventes du jour'
  // const { ventesDuJour, ventesHier, performance, panierMoyen, clientsServis, commandesServies, loading } = useDashboardStats();
  const activeOrdersCount = orders.filter(order => order.status === 'pending' || order.status === 'preparing').length;
  const readyOrdersCount = orders.filter(order => order.status === 'ready').length;
  const criticalAlerts = alerts.filter(alert => alert.priority >= 3).length;
  const pendingOrders = orders.filter(order => order.status === 'pending').length;
  const preparingOrders = orders.filter(order => order.status === 'preparing').length;

  const stats = [
    {
      title: 'Ventes du jour',
      value: `${billingStats.totalRevenue.toFixed(0)} FCFA`,
      change: billingStats.totalOrders ? `${billingStats.totalOrders} commandes` : 'Aucune vente',
      trend: billingStats.totalRevenue > 0 ? 'up' : 'neutral',
      icon: DollarSign,
      description: `Panier moyen: ${billingStats.averageTicket.toFixed(0)} FCFA`,
      gradient: 'from-emerald-500 to-teal-500',
      details: `${billingStats.clientsServed} clients servis`
    },
    {
      title: 'Commandes actives',
      value: ordersLoading ? '...' : activeOrdersCount.toString(),
      change: `${readyOrdersCount} prêtes`,
      trend: activeOrdersCount > 5 ? 'warning' : 'neutral',
      icon: Clock,
      description: `${pendingOrders} en attente, ${preparingOrders} en cours`,
      gradient: 'from-blue-500 to-indigo-500',
      details: 'Cuisine active'
    },
    {
      title: 'Performance',
      value: billingStats.totalRevenue > 0 ? `${performance}%` : 'Pas de comparaison',
      change: billingStats.totalRevenue > 0 ? (performance > 100 ? 'Excellente journée' : performance > 80 ? 'Bonne activité' : 'Journée calme') : 'Pas de comparaison',
      trend: performance > 100 ? 'up' : performance > 80 ? 'neutral' : 'down',
      icon: Target,
      description: billingStats.totalRevenue > 0 ? `Comparé à hier (${performance}%)` : 'Pas de ventes hier',
      gradient: 'from-purple-500 to-pink-500',
      details: 'Basé sur ventes'
    }
  ];
  if (criticalAlerts > 0) {
    stats.push({
      title: 'Alertes critiques',
      value: criticalAlerts.toString(),
      change: criticalAlerts > 0 ? 'Attention requise' : 'Aucune alerte',
      trend: criticalAlerts > 0 ? 'warning' : 'up',
      icon: AlertTriangle,
      description: 'Priorité haute',
      gradient: 'from-orange-500 to-red-500',
      details: `${alerts.length - criticalAlerts} autres alertes`
    });
  }
  return (
    <div className="w-full flex justify-center">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-4xl w-full">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card key={index} className="bg-slate-800 border-slate-700 hover:border-emerald-500/50 transition-all duration-200 hover:shadow-lg hover:shadow-emerald-500/10">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-slate-200">
                  {stat.title}
                </CardTitle>
                <div className={`p-2 rounded-lg bg-gradient-to-r ${stat.gradient}`}>
                  <Icon className="h-4 w-4 text-white" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-white mb-1">{stat.value}</div>
                <p className="text-xs text-slate-400 flex items-center mb-2">
                  <span className={cn(
                    'inline-flex items-center text-xs font-medium mr-1',
                    stat.trend === 'up' ? 'text-emerald-500' :
                    stat.trend === 'warning' ? 'text-orange-500' : 
                    stat.trend === 'down' ? 'text-red-500' : 'text-slate-400'
                  )}>
                    {stat.trend === 'up' && <TrendingUp className="w-3 h-3 mr-1" />}
                    {stat.trend === 'warning' && <AlertTriangle className="w-3 h-3 mr-1" />}
                    {stat.change}
                  </span>
                </p>
                <p className="text-xs text-slate-500">{stat.description}</p>
                {stat.details && (
                  <p className="text-xs text-slate-600 mt-1">{stat.details}</p>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};
