import { useState, useEffect } from 'react';
import { apiClient } from '@/integrations/api/client';
import { useRestaurantId } from '@/contexts/AuthContext';

export interface AnalyticsData {
  totalRevenue: number;
  totalOrders: number;
  averageTicket: number;
  customerSatisfaction: number;
  growthRate: number;
  newCustomers: number;
  salesData: Array<{
    name: string;
    ventes: number;
    commandes: number;
  }>;
  monthlyData: Array<{
    month: string;
    revenue: number;
    orders: number;
  }>;
  dishPopularity: Array<{
    name: string;
    value: number;
    color: string;
  }>;
  timeSlotData: Array<{
    slot: string;
    orders: number;
  }>;
}

export const useAnalytics = (period = 'week') => {
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const restaurantId = useRestaurantId();

  useEffect(() => {
    const fetchAnalyticsData = async () => {
      if (!restaurantId) return;

      try {
        console.log(`Fetching analytics data for period: ${period}`);
        
        // Calculer la date de début en fonction de la période
        const now = new Date();
        let startDate = new Date();
        
        switch(period) {
          case 'week':
            startDate.setDate(now.getDate() - 7);
            break;
          case 'month':
            startDate.setMonth(now.getMonth() - 1);
            break;
          case 'quarter':
            startDate.setMonth(now.getMonth() - 3);
            break;
          case 'year':
            startDate.setFullYear(now.getFullYear() - 1);
            break;
        }
        
        const startDateISO = startDate.toISOString();
        
        // Récupérer les données via l'API
        const [billingResponse, activeResponse, menuResponse] = await Promise.all([
          apiClient.get(`/analytics/billing-orders?restaurant_id=${restaurantId}&start_date=${startDateISO}`),
          apiClient.get(`/analytics/active-orders?restaurant_id=${restaurantId}`),
          apiClient.get(`/analytics/menu-items?restaurant_id=${restaurantId}`)
        ]);

        if (billingResponse.error) {
          throw new Error(billingResponse.error);
        }

        if (activeResponse.error) {
          throw new Error(activeResponse.error);
        }

        if (menuResponse.error) {
          throw new Error(menuResponse.error);
        }

        const billingOrders = billingResponse.data || [];
        const activeOrdersStats = activeResponse.data || { total_active_orders: 0, total_value: 0 };
        const menuItems = menuResponse.data || [];

        console.log('Data fetched:', { billingOrders, activeOrdersStats, menuItems });

        // Calculer les statistiques réelles
        const totalRevenue = (billingOrders || []).reduce((sum, order) => sum + (order.total_amount || 0), 0);
        const totalOrders = (billingOrders || []).length + (activeOrdersStats.total_active_orders || 0);
        const averageTicket = (billingOrders || []).length > 0 ? totalRevenue / (billingOrders || []).length : 0;

        // Créer les données de ventes des 7 derniers jours
        const last7Days = Array.from({ length: 7 }, (_, i) => {
          const date = new Date();
          date.setDate(date.getDate() - i);
          return date.toISOString().split('T')[0];
        }).reverse();

        const dayNames = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'];
        const salesData = last7Days.map((date, index) => {
          const dayOrders = (billingOrders || []).filter(order => 
            order.served_at.split('T')[0] === date
          );
          const dayRevenue = dayOrders.reduce((sum, order) => sum + order.total_amount, 0);
          
          const dayOfWeek = new Date(date).getDay();
          
          return {
            name: dayNames[dayOfWeek],
            ventes: dayRevenue,
            commandes: dayOrders.length
          };
        });

        // Créer les données mensuelles des 6 derniers mois
        const monthNames = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Jui', 'Jui', 'Aoû', 'Sep', 'Oct', 'Nov', 'Déc'];
        const monthlyData = Array.from({ length: 6 }, (_, i) => {
          const date = new Date();
          date.setMonth(date.getMonth() - i);
          const month = date.getMonth();
          const year = date.getFullYear();
          
          const monthOrders = (billingOrders || []).filter(order => {
            const orderDate = new Date(order.served_at);
            return orderDate.getMonth() === month && orderDate.getFullYear() === year;
          });
          
          const monthRevenue = monthOrders.reduce((sum, order) => sum + order.total_amount, 0);
          
          return {
            month: monthNames[month],
            revenue: monthRevenue,
            orders: monthOrders.length
          };
        }).reverse();

        // Analyser la popularité des plats à partir des commandes réelles
        const dishCount: { [key: string]: number } = {};
        (billingOrders || []).forEach(order => {
          let items = order.items;
          if (typeof items === 'string') {
            try {
              items = JSON.parse(items);
            } catch (e) {
              items = [];
            }
          }
          if (Array.isArray(items)) {
            items.forEach((item: any) => {
              if (item.name) {
                dishCount[item.name] = (dishCount[item.name] || 0) + (item.quantity || 1);
              }
            });
          }
        });

        const colors = ['#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#6B7280'];
        const sortedDishes = Object.entries(dishCount)
          .sort(([,a], [,b]) => b - a)
          .slice(0, 5);

        const dishPopularity = sortedDishes.map(([name, count], index) => ({
          name,
          value: count,
          color: colors[index] || '#6B7280'
        }));

        // Analyser l'affluence par créneaux horaires
        const timeSlots = [
          '6h-7h', '7h-8h', '8h-9h', '9h-10h', '10h-11h',
          '11h-12h', '12h-13h', '13h-14h', '14h-15h', '15h-16h', '16h-17h', '17h-18h'
        ];
        const timeSlotData = timeSlots.map(slot => {
          const [startHour] = slot.split('-')[0].split('h');
          const ordersInSlot = (billingOrders || []).filter(order => {
            const orderHour = new Date(order.served_at).getHours();
            return orderHour === parseInt(startHour);
          }).length;
          
          return {
            slot,
            orders: ordersInSlot
          };
        });

        // Calculer le taux de croissance
        const recentRevenue = salesData.slice(-3).reduce((sum, day) => sum + day.ventes, 0);
        const previousRevenue = salesData.slice(0, 3).reduce((sum, day) => sum + day.ventes, 0);
        const growthRate = previousRevenue > 0 ? ((recentRevenue - previousRevenue) / previousRevenue) * 100 : 0;

        const analytics: AnalyticsData = {
          totalRevenue,
          totalOrders: (billingOrders || []).length, // Seulement les commandes servies pour les statistiques
          averageTicket,
          customerSatisfaction: 4.8, // Valeur fixe pour l'instant
          growthRate: Math.max(0, growthRate),
          newCustomers: Math.floor((billingOrders || []).length * 0.3), // Estimation basée sur les commandes
          salesData,
          monthlyData,
          dishPopularity,
          timeSlotData
        };

        console.log('Analytics data calculated:', analytics);
        setAnalyticsData(analytics);
      } catch (err) {
        console.error('Error fetching analytics data:', err);
        setError(err instanceof Error ? err.message : 'Error fetching analytics data');
      } finally {
        setLoading(false);
      }
    };

    fetchAnalyticsData();
  }, [period, restaurantId]);

  return { analyticsData, loading, error };
};
