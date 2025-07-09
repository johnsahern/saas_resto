import { useState, useEffect } from 'react';
import { apiClient } from '@/integrations/api/client';
import { useRestaurantId } from '@/contexts/AuthContext';
import type { AnalyticsData } from './useAnalytics';

/**
 * Calcule les métriques d'analyse pour les commandes en ligne (table `orders`)
 * et récupère les plats populaires et l'affluence par créneaux depuis order_items.
 * L'interface renvoyée est la même que celle de `useAnalytics` afin de pouvoir
 * réutiliser les mêmes composants graphiques.
 */
export const useOnlineAnalytics = (period: 'day' | 'week' | 'month' | 'quarter' | 'year' = 'week') => {
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const restaurantId = useRestaurantId();

  useEffect(() => {
    const fetchData = async () => {
      if (!restaurantId) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        // Calcul de la date de début selon la période
        const now = new Date();
        let startDate = new Date();

        switch (period) {
          case 'day':
            startDate.setDate(now.getDate() - 1);
            break;
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

        const startISO = startDate.toISOString();
        console.log('[DEBUG] startISO envoyé à l\'API:', startISO);

        // Récupération des données en parallèle
        const [ordersResponse, dishesResponse, timeSlotsResponse] = await Promise.all([
          // Données des commandes
          apiClient.get(`/analytics/online-orders?restaurant_id=${restaurantId}&start_date=${startISO}`),
          // Plats populaires
          apiClient.get(`/analytics/popular-dishes?restaurant_id=${restaurantId}&start_date=${startISO}`),
          // Affluence par créneaux
          apiClient.get(`/analytics/time-slots?restaurant_id=${restaurantId}&start_date=${startISO}`)
        ]);

        const orders = ordersResponse.data || [];
        const popularDishes = dishesResponse.data || [];
        const timeSlots = timeSlotsResponse.data || [];

        // Mapping adapté à la structure reçue
        // Exemple de structure : { average_order_value, date, total_orders, total_revenue }
        // Conversion des valeurs en nombres car MySQL peut retourner des strings
        const totalRevenue = (orders || []).reduce((s, o: any) => s + Number(o.total_revenue || 0), 0);
        const totalOrders = (orders || []).reduce((s, o: any) => s + Number(o.total_orders || 0), 0);
        const averageTicket = totalOrders ? totalRevenue / totalOrders : 0;

        // Génération des données de ventes compatibles avec AnalyticsData
        const last7Days = Array.from({ length: 7 }, (_, i) => {
          const date = new Date();
          date.setDate(date.getDate() - i);
          return date.toISOString().split('T')[0];
        }).reverse();

        const dayNames = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'];
        const salesData = last7Days.map((date) => {
          const found = (orders || []).find((o: any) => o.date === date);
          const dayOfWeek = new Date(date).getDay();
          
          return {
            name: dayNames[dayOfWeek],
            ventes: found ? Number(found.total_revenue || 0) : 0,
            commandes: found ? Number(found.total_orders || 0) : 0,
          };
        });

        // Génération des données mensuelles
        const monthNames = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Jui', 'Jui', 'Aoû', 'Sep', 'Oct', 'Nov', 'Déc'];
        const monthlyData = Array.from({ length: 6 }, (_, i) => {
          const date = new Date();
          date.setMonth(date.getMonth() - i);
          const month = date.getMonth();
          const year = date.getFullYear();
          
          // Filtrer les commandes de ce mois
          const monthOrders = (orders || []).filter((o: any) => {
            const orderDate = new Date(o.date);
            return orderDate.getMonth() === month && orderDate.getFullYear() === year;
          });
          
          const monthRevenue = monthOrders.reduce((sum, order) => sum + Number(order.total_revenue || 0), 0);
          const monthOrdersCount = monthOrders.reduce((sum, order) => sum + Number(order.total_orders || 0), 0);
          
          return {
            month: monthNames[month],
            revenue: monthRevenue,
            orders: monthOrdersCount
          };
        }).reverse();

        const result: AnalyticsData = {
          totalRevenue,
          totalOrders,
          averageTicket,
          customerSatisfaction: 4.8, // Valeur fixe pour l'instant
          growthRate: 0, // Pas de calcul de croissance pour l'instant
          newCustomers: Math.floor(totalOrders * 0.3), // Estimation
          salesData,
          monthlyData,
          dishPopularity: popularDishes,
          timeSlotData: timeSlots
        };

        console.log('[DEBUG] AnalyticsData générée:', result);
        setAnalyticsData(result);

      } catch (err) {
        console.error('Erreur lors de la récupération des analytics:', err);
        setError('Erreur lors de la récupération des données');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [period, restaurantId]);

  return { analyticsData, loading, error };
};
