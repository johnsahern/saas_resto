import { useState, useEffect } from 'react';
import { apiClient } from '@/integrations/api/client';
import { useRestaurantId } from '@/contexts/AuthContext';

interface OrderStatistic {
  status: string;
  count: number;
}

export const useOrderStatistics = () => {
  const [statistics, setStatistics] = useState<OrderStatistic[]>([]);
  const [loading, setLoading] = useState(true);
  const restaurantId = useRestaurantId();

  useEffect(() => {
    const fetchStatistics = async () => {
      if (!restaurantId) {
        console.log('❌ Restaurant ID manquant');
        return;
      }

      console.log('🔄 Récupération des statistiques pour le restaurant:', restaurantId);
      console.log('🔑 Token actuel:', localStorage.getItem('saas_token'));

      try {
        const today = new Date();
        const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
        const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);

        const startDateISO = startOfDay.toISOString();
        const endDateISO = endOfDay.toISOString();

        console.log('📅 Dates:', { startDateISO, endDateISO });

        // Récupérer les statistiques via l'API
        const [activeResponse, billingResponse] = await Promise.all([
          apiClient.get(`/analytics/active-orders-stats?restaurant_id=${restaurantId}&start_date=${startDateISO}&end_date=${endDateISO}`),
          apiClient.get(`/analytics/billing-orders-stats?restaurant_id=${restaurantId}&start_date=${startDateISO}&end_date=${endDateISO}`)
        ]);

        console.log('📊 Réponses API:', { activeResponse, billingResponse });

        // Initialiser les statistiques avec des valeurs par défaut
        const defaultStats = {
          pending: 0,
          preparing: 0,
          ready: 0,
          served: 0,
          cancelled: 0
        };

        // Ajouter les statistiques des commandes actives
        if (activeResponse.data && Array.isArray(activeResponse.data)) {
          activeResponse.data.forEach((stat: OrderStatistic) => {
            if (stat && typeof stat === 'object' && stat.status in defaultStats) {
              defaultStats[stat.status as keyof typeof defaultStats] = stat.count;
            }
          });
        }

        // Ajouter les commandes servies
        if (billingResponse.data && Array.isArray(billingResponse.data)) {
          const servedStat = billingResponse.data.find(stat => stat.status === 'served');
          if (servedStat) {
            defaultStats.served = servedStat.count;
          }
        }

        // Convertir en format attendu
        const stats = Object.entries(defaultStats).map(([status, count]) => ({
          status,
          count
        }));

        setStatistics(stats);
      } catch (err) {
        console.error('❌ Erreur récupération statistiques:', err);
        setStatistics([]);
      } finally {
        setLoading(false);
      }
    };

    if (restaurantId) {
      fetchStatistics();

      const interval = setInterval(fetchStatistics, 30000);
      return () => clearInterval(interval);
    }
  }, [restaurantId]);

  const getStatusCount = (status: string): number => {
    const stat = statistics.find(s => s.status === status);
    return stat?.count || 0;
  };

  return { statistics, getStatusCount, loading };
};
