import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import { apiClient } from '@/integrations/api/client';
import { useRestaurantId } from '@/contexts/AuthContext';

interface RawOrder {
  id: string;
  order_number: string;
  restaurant_id: string;
  customer_name: string;
  customer_phone: string;
  customer_address: string | null;
  total_amount: number;
  status: string;
  created_at: string;
  estimated_delivery_time: string | null;
  actual_delivery_time: string | null;
  delivery_partner_id?: string | null;
  notes?: string | null;
}

export interface OnlineOrder {
  id: string;
  order_number: string;
  restaurant_id: string;
  customer_name: string;
  customer_phone: string;
  customer_address: string | null;
  total_amount: number;
  status: 'pending' | 'preparing' | 'delivering' | 'delivered' | 'canceled';
  created_at: string;
  estimated_delivery_time: string | null;
  actual_delivery_time: string | null;
  delivery_partner_id?: string | null;
  notes?: string | null;
}

const validateOrder = (rawOrder: RawOrder): OnlineOrder => {
  const validStatuses = ['pending', 'preparing', 'delivering', 'delivered', 'canceled'] as const;
  if (!validStatuses.includes(rawOrder.status as any)) {
    throw new Error(`Statut invalide pour la commande ${rawOrder.order_number}: ${rawOrder.status}`);
  }

  return {
    ...rawOrder,
    status: rawOrder.status as OnlineOrder['status'],
    notes: (rawOrder as any).notes || null,
  };
};

export const useOnlineOrders = () => {
  const queryClient = useQueryClient();
  const restaurantId = useRestaurantId();

  // Polling pour remplacer les subscriptions temps réel
  useEffect(() => {
    if (!restaurantId) return;

    const interval = setInterval(() => {
      queryClient.invalidateQueries({ queryKey: ['onlineOrders', restaurantId] });
    }, 10000); // Actualiser toutes les 10 secondes

    return () => clearInterval(interval);
  }, [queryClient, restaurantId]);

  const query = useQuery({
    queryKey: ['onlineOrders', restaurantId],
    queryFn: async (): Promise<OnlineOrder[]> => {
      if (!restaurantId) return [];

      const response = await apiClient.get(`/online-orders?restaurant_id=${restaurantId}`);

      if (response.error) {
        console.error('Error fetching online orders:', response.error);
        throw new Error(response.error || 'Impossible de charger les commandes');
      }

      return (response.data || []).map(validateOrder);
    },
    enabled: !!restaurantId,
  });

  const getOrdersByDate = (date: Date) => {
    return (query.data || []).filter(order => {
      const orderDate = new Date(order.created_at);
      return orderDate.toDateString() === date.toDateString();
    });
  };

  const getOrdersByStatus = (status: string) => {
    return (query.data || []).filter(order => order.status === status);
  };

  return {
    orders: query.data || [],
    loading: query.isLoading,
    getOrdersByDate,
    getOrdersByStatus,
  };
};