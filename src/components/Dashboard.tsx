import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useActiveOrders, useDailySales, useRestaurantTables } from '@/hooks/useRestaurantData';
import { useSystemAlerts } from '@/hooks/useSystemAlerts';
import { usePermissions } from '@/hooks/usePermissions';
import { useBillingOrders } from '@/hooks/useBillingOrders';
import { DashboardHeader } from './dashboard/DashboardHeader';
import { DashboardStatsCards } from './dashboard/DashboardStatsCards';
import { DashboardActivityMetrics } from './dashboard/DashboardActivityMetrics';
import { DashboardSystemAlerts } from './dashboard/DashboardSystemAlerts';
import { DashboardDGSection } from './dashboard/DashboardDGSection';

export const Dashboard: React.FC = () => {
  const { user, isLoading: authLoading } = useAuth();
  const { isDG, isManager } = usePermissions();
  const { orders, loading: ordersLoading } = useActiveOrders();
  const { salesData, loading: salesLoading } = useDailySales();
  const { alerts } = useSystemAlerts();
  const { tables, loading: tablesLoading } = useRestaurantTables();
  const { billingOrders, loading: billingLoading } = useBillingOrders();

  // Obtenir la date d'aujourd'hui (UTC, sans l'heure)
  const todayDate = new Date();
  todayDate.setHours(0, 0, 0, 0);

  // Filtrer les factures du jour (même logique que la section facturation)
  const todayOrders = billingOrders.filter(order => {
    const servedAt = new Date(order.served_at);
    servedAt.setHours(0, 0, 0, 0);
    return servedAt.getTime() === todayDate.getTime();
  });

  // Calculer les stats de facturation pour le dashboard
  const billingStats = {
    totalRevenue: todayOrders.reduce((sum, order) => sum + (order.total_amount || 0), 0),
    totalOrders: todayOrders.length,
    clientsServed: todayOrders.length, // On suppose 1 client par commande
    averageTicket: todayOrders.length > 0 ? todayOrders.reduce((sum, order) => sum + (order.total_amount || 0), 0) / todayOrders.length : 0
  };

  // Obtenir la date d'hier (UTC, sans l'heure)
  const yesterdayDate = new Date(todayDate);
  yesterdayDate.setDate(todayDate.getDate() - 1);
  yesterdayDate.setHours(0, 0, 0, 0);

  // Filtrer les factures d'hier
  const yesterdayOrders = billingOrders.filter(order => {
    const servedAt = new Date(order.served_at);
    servedAt.setHours(0, 0, 0, 0);
    return servedAt.getTime() === yesterdayDate.getTime();
  });

  const ventesHier = yesterdayOrders.reduce((sum, order) => sum + (order.total_amount || 0), 0);

  // Calculer la performance
  const performance = ventesHier > 0
    ? Math.round((billingStats.totalRevenue / ventesHier) * 100)
    : 0;

  // Si l'authentification est en cours de chargement, afficher un spinner
  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Si l'utilisateur n'est pas authentifié, ne rien afficher
  if (!user) {
    return null;
  }

  const isLoading = ordersLoading || salesLoading || tablesLoading || billingLoading;

  return (
    <div className="space-y-6">
      <DashboardHeader user={user} isDG={isDG} isManager={isManager} />

      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      ) : (
        <>
          <DashboardStatsCards
            billingStats={billingStats}
            performance={performance}
            alerts={alerts}
            orders={orders}
            ordersLoading={ordersLoading}
          />

          <DashboardActivityMetrics
            billingStats={billingStats}
            orders={orders}
          />

          <DashboardSystemAlerts alerts={alerts} />

          {isDG && <DashboardDGSection orders={orders} />}
        </>
      )}
    </div>
  );
};
