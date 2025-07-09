import { useState, useEffect } from 'react';
import { apiClient } from '@/integrations/api/client';
import { useRestaurantId } from '@/contexts/AuthContext';

export interface BillingOrder {
  id: string;
  order_number: string;
  customer_name: string | null;
  table_id: string | null;
  items: any[];
  total_amount: number;
  served_at: string;
  original_order_id: string | null;
  notes: string | null;
  created_at: string;
  restaurant_id: string;
}

export const useBillingOrders = () => {
  const [billingOrders, setBillingOrders] = useState<BillingOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const restaurantId = useRestaurantId();

  useEffect(() => {
    const fetchBillingOrders = async () => {
      if (!restaurantId) return;

      try {
        console.log('Fetching billing orders for today...');
        
        // Obtenir le début et la fin du jour actuel
        const today = new Date();
        const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
        const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);
        
        console.log('Date range:', startOfDay.toISOString(), 'to', endOfDay.toISOString());
        
        const response = await apiClient.get(`/billing-orders?restaurant_id=${restaurantId}&start_date=${startOfDay.toISOString()}&end_date=${endOfDay.toISOString()}`);

        if (response.error) {
          console.error('Error fetching billing orders:', response.error);
          throw new Error(response.error);
        }
        
        console.log('Billing orders fetched for today:', response.data);
        
        // Transform the data to ensure items is properly typed as an array
        const transformedData: BillingOrder[] = (response.data || []).map((order: any) => ({
          ...order,
          items: Array.isArray(order.items) ? order.items : 
                 typeof order.items === 'string' ? JSON.parse(order.items) : 
                 order.items ? [order.items] : []
        }));
        
        setBillingOrders(transformedData);
      } catch (err) {
        console.error('Error fetching billing orders:', err);
        setBillingOrders([]);
      } finally {
        setLoading(false);
      }
    };

    if (restaurantId) {
      fetchBillingOrders();

      // Polling pour remplacer les subscriptions temps réel
      const interval = setInterval(() => {
        console.log('Refreshing billing orders...');
        fetchBillingOrders();
      }, 30000); // Actualiser toutes les 30 secondes

      return () => clearInterval(interval);
    }
  }, [restaurantId]);

  return { billingOrders, loading };
};
