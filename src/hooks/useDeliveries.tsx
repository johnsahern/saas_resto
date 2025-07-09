import { useState, useEffect } from 'react';
import { apiClient } from '@/integrations/api/client';
import { useRestaurantId } from '@/contexts/AuthContext';
import { startOfDay, endOfDay } from 'date-fns';

export interface Delivery {
  id: string;
  order_id: string;
  delivery_person_id: string;
  status: string;
  fee: number;
  distance: number;
  estimated_time: number;
  actual_delivery_time: string | null;
  coordinates: any;
  notes: string | null;
  created_at: string;
  restaurant_id: string;
}

export const useDeliveries = () => {
  const [deliveries, setDeliveries] = useState<Delivery[]>([]);
  const [loading, setLoading] = useState(true);
  const restaurantId = useRestaurantId();

  useEffect(() => {
    if (restaurantId) {
      fetchDeliveries();
    }
  }, [restaurantId]);

  const fetchDeliveries = async () => {
    if (!restaurantId) return;

    try {
      console.log('Fetching deliveries...');
      
      const response = await apiClient.get(`/all-deliveries?restaurant_id=${restaurantId}`);

      if (response.error) {
        console.error('Error fetching deliveries:', response.error);
        throw new Error(response.error);
      }

      console.log('Deliveries fetched:', response.data);
      setDeliveries(response.data || []);
    } catch (err) {
      console.error('Error fetching deliveries:', err);
      setDeliveries([]);
    } finally {
      setLoading(false);
    }
  };

  const getDeliveriesByDate = (date: Date) => {
    const startOfSelectedDay = startOfDay(date);
    const endOfSelectedDay = endOfDay(date);

    return deliveries.filter(delivery => {
      const deliveryDate = new Date(delivery.created_at);
      return deliveryDate >= startOfSelectedDay && deliveryDate <= endOfSelectedDay;
    });
  };

  return { deliveries, loading, getDeliveriesByDate, refetch: fetchDeliveries };
};