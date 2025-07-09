import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/integrations/api/client';
import { useRestaurantId } from '@/contexts/AuthContext';

export interface OrderItem {
  id: string;
  order_id: string;
  name: string;
  quantity: number;
  price: number;
  options?: any;
  restaurant_id: string;
}

export const useOrderItems = (orderIds: string[]) => {
  const restaurantId = useRestaurantId();

  const query = useQuery({
    queryKey: ['orderItems', orderIds, restaurantId],
    queryFn: async (): Promise<OrderItem[]> => {
      if (!orderIds.length || !restaurantId) return [];

      const response = await apiClient.get(`/order-items?restaurant_id=${restaurantId}&order_ids=${orderIds.join(',')}`);

      if (response.error) {
        console.error('Error fetching order items:', response.error);
        throw new Error(response.error || 'Impossible de charger les articles');
      }

      console.log('Order items fetched:', response.data);
      return response.data || [];
    },
    enabled: !!orderIds.length && !!restaurantId,
  });

  const getItemsForOrder = (orderId: string) => {
    return (query.data || []).filter(item => item.order_id === orderId);
  };

  return {
    orderItems: query.data || [],
    loading: query.isLoading,
    getItemsForOrder,
  };
};