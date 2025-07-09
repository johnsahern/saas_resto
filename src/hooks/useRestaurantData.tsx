import { useState, useEffect } from 'react';
import { apiClient } from '@/integrations/api/client';
import { useRestaurantId as useAuthRestaurantId } from '@/contexts/AuthContext';

export interface ActiveOrder {
  id: string;
  order_number: string;
  customer_name: string | null;
  table_id: string | null;
  items: any[];
  total_amount: number;
  status: string;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface DailySalesData {
  total_revenue: number;
  total_orders: number;
  customers_served: number;
  average_order_value: number;
}

export interface RestaurantTable {
  id: string;
  table_number: number;
  capacity: number;
  status: 'available' | 'occupied' | 'reserved' | 'maintenance';
  position_x: number;
  position_y: number;
  restaurant_id?: string;
  created_at: string;
  updated_at: string;
}

// Réexporter le hook useRestaurantId
export const useRestaurantId = useAuthRestaurantId;

// =======================================================================
// HOOK POUR LES COMMANDES ACTIVES
// =======================================================================

export const useActiveOrders = () => {
  const [orders, setOrders] = useState<ActiveOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const restaurantId = useRestaurantId();

  useEffect(() => {
    if (!restaurantId) {
      setLoading(false);
      return;
    }

    const fetchActiveOrders = async () => {
      try {
        console.log('📊 Récupération des commandes actives...');
        
        const response = await apiClient.get(`/active-orders?restaurant_id=${restaurantId}`);
        
        if (!response.error) {
          console.log('✅ Commandes actives récupérées:', response.data);
          setOrders(response.data || []);
        } else {
          console.error('❌ Erreur commandes actives:', response.error);
          setOrders([]);
        }
      } catch (err) {
        console.error('❌ Erreur récupération commandes actives:', err);
        setOrders([]);
      } finally {
        setLoading(false);
      }
    };

    fetchActiveOrders();

    // Polling pour les mises à jour en temps réel (toutes les 3 secondes)
    const pollingId = setInterval(fetchActiveOrders, 3000);

    return () => {
      clearInterval(pollingId);
    };
  }, [restaurantId]);

  return { orders, loading };
};

// =======================================================================
// HOOK POUR LES VENTES QUOTIDIENNES
// =======================================================================

export const useDailySales = () => {
  const [salesData, setSalesData] = useState<DailySalesData>({
    total_revenue: 0,
    total_orders: 0,
    customers_served: 0,
    average_order_value: 0
  });
  const [loading, setLoading] = useState(true);
  const restaurantId = useRestaurantId();

  useEffect(() => {
    if (!restaurantId) {
      setLoading(false);
      return;
    }

    const fetchDailySales = async () => {
      try {
        console.log('📈 Récupération des ventes quotidiennes...');
        
        // Récupérer les ventes du jour depuis daily_sales
        const response = await apiClient.get(`/daily-sales?restaurant_id=${restaurantId}`);
        
        if (!response.error && response.data && response.data.length > 0) {
          const latestSales = response.data[response.data.length - 1];
          console.log('✅ Ventes quotidiennes récupérées:', latestSales);
          
          setSalesData({
            total_revenue: latestSales.total_revenue || 0,
            total_orders: latestSales.total_orders || 0,
            customers_served: latestSales.customers_served || 0,
            average_order_value: latestSales.average_order_value || 0
          });
        } else {
          console.log('ℹ️ Aucune donnée de ventes trouvée');
          setSalesData({
            total_revenue: 0,
            total_orders: 0,
            customers_served: 0,
            average_order_value: 0
          });
        }
      } catch (err) {
        console.error('❌ Erreur récupération ventes:', err);
        setSalesData({
          total_revenue: 0,
          total_orders: 0,
          customers_served: 0,
          average_order_value: 0
        });
      } finally {
        setLoading(false);
      }
    };

    fetchDailySales();

    // Polling pour les mises à jour (toutes les 30 secondes pour les stats)
    const pollingId = setInterval(fetchDailySales, 30000);

    return () => {
      clearInterval(pollingId);
    };
  }, [restaurantId]);

  return { salesData, loading };
};

// =======================================================================
// HOOK POUR LES TABLES DE RESTAURANT
// =======================================================================

export const useRestaurantTables = () => {
  const [tables, setTables] = useState<RestaurantTable[]>([]);
  const [loading, setLoading] = useState(true);
  const restaurantId = useRestaurantId();

  useEffect(() => {
    if (!restaurantId) {
      setLoading(false);
      return;
    }

    const fetchTables = async () => {
      try {
        if (!restaurantId) {
          console.warn('⚠️  Pas de restaurant ID');
          return;
        }

        console.log('🪑 Récupération des tables du restaurant...');
        const response = await apiClient.get(`/tables?restaurant_id=${restaurantId}`);
        
        if (response.success && response.data) {
          console.log('✅ Tables récupérées:', response.data);
          setTables(response.data);
        } else {
          console.error('❌ Erreur récupération tables:', response.error);
          setTables([]);
        }
      } catch (error) {
        console.error('❌ Erreur récupération tables:', error);
        setTables([]);
      } finally {
        setLoading(false);
      }
    };

    fetchTables();

    // Polling pour les mises à jour (toutes les 10 secondes)
    const pollingId = setInterval(fetchTables, 10000);

    return () => {
      clearInterval(pollingId);
    };
  }, [restaurantId]);

  return { tables, loading };
};

// =======================================================================
// HOOKS UTILITAIRES
// =======================================================================

// Hook pour récupérer une table spécifique
export const useTableById = (tableId: string) => {
  const { tables } = useRestaurantTables();
  return tables.find(table => table.id === tableId) || null;
};

// Hook pour récupérer les tables par statut
export const useTablesByStatus = (status: RestaurantTable['status']) => {
  const { tables } = useRestaurantTables();
  return tables.filter(table => table.status === status);
};

// Hook pour les statistiques de tables
export const useTableStats = () => {
  const { tables } = useRestaurantTables();
  
  const stats = {
    total: tables.length,
    available: tables.filter(t => t.status === 'available').length,
    occupied: tables.filter(t => t.status === 'occupied').length,
    reserved: tables.filter(t => t.status === 'reserved').length,
    maintenance: tables.filter(t => t.status === 'maintenance').length,
  };

  return stats;
};

export const useDashboardStats = () => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    ventesDuJour: 0,
    ventesHier: 0,
    performance: 0,
    totalCommandes: 0,
    clientsServis: 0,
    panierMoyen: 0,
    commandesServies: 0
  });
  const restaurantId = useRestaurantId();

  useEffect(() => {
    if (!restaurantId) {
      setLoading(false);
      return;
    }
    const fetchStats = async () => {
      setLoading(true);
      try {
        // Dates du jour et d'hier
        const today = new Date();
        const yesterday = new Date();
        yesterday.setDate(today.getDate() - 1);
        const format = d => d.toISOString().slice(0, 10);
        const dateToday = format(today);
        const dateYesterday = format(yesterday);

        // 1. Ventes du jour (billing_orders)
        const respToday = await apiClient.get(`/billing-orders?restaurant_id=${restaurantId}&date=${dateToday}`);
        const ordersToday = (respToday.data || []).filter(o => o.served_at && o.served_at.startsWith(dateToday));
        const ventesDuJour = ordersToday.reduce((sum, o) => sum + (o.total_amount || 0), 0);
        const clientsServis = new Set(ordersToday.map(o => o.customer_phone || o.customer_name)).size;
        const panierMoyen = ordersToday.length > 0 ? ventesDuJour / ordersToday.length : 0;

        // 2. Ventes d'hier (billing_orders)
        const respYesterday = await apiClient.get(`/billing-orders?restaurant_id=${restaurantId}&date=${dateYesterday}`);
        const ordersYesterday = (respYesterday.data || []).filter(o => o.served_at && o.served_at.startsWith(dateYesterday));
        const ventesHier = ordersYesterday.reduce((sum, o) => sum + (o.total_amount || 0), 0);

        // 3. Performance
        const performance = ventesHier > 0 ? Math.round((ventesDuJour / ventesHier) * 100) : 0;

        // 4. Activité du jour (toutes commandes)
        const respAll = await apiClient.get(`/orders?restaurant_id=${restaurantId}&date=${dateToday}`);
        const allOrders = respAll.data?.orders || [];
        const totalCommandes = allOrders.length;

        setStats({
          ventesDuJour,
          ventesHier,
          performance,
          totalCommandes,
          clientsServis,
          panierMoyen,
          commandesServies: ordersToday.length
        });
      } catch (err) {
        setStats({ ventesDuJour: 0, ventesHier: 0, performance: 0, totalCommandes: 0, clientsServis: 0, panierMoyen: 0, commandesServies: 0 });
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, [restaurantId]);

  return { ...stats, loading };
};
