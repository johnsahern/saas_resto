import { useState, useEffect } from 'react';
import { apiClient } from '@/integrations/api/client';
import { useRestaurantId } from '@/contexts/AuthContext';

export interface SystemAlert {
  id: string;
  title: string;
  message: string;
  type: string;
  priority: number;
  is_read: boolean;
  created_at: string;
  expires_at: string | null;
  restaurant_id: string;
}

export const useSystemAlerts = () => {
  const [alerts, setAlerts] = useState<SystemAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const restaurantId = useRestaurantId();

  useEffect(() => {
    const fetchSystemAlerts = async () => {
      if (!restaurantId) return;

      try {
        console.log('Fetching system alerts...');
        
        const response = await apiClient.get(`/system-alerts?restaurant_id=${restaurantId}&is_read=false`);

        if (response.error) {
          console.error('Error fetching system alerts:', response.error);
          throw new Error(response.error);
        }
        
        console.log('System alerts fetched:', response.data);
        setAlerts(response.data || []);
      } catch (err) {
        console.error('Error fetching system alerts:', err);
        setAlerts([]);
      } finally {
        setLoading(false);
      }
    };

    if (restaurantId) {
      fetchSystemAlerts();

      // Polling pour remplacer les subscriptions temps réel
      const interval = setInterval(() => {
        console.log('Refreshing system alerts...');
        fetchSystemAlerts();
      }, 60000); // Actualiser toutes les minutes

      return () => clearInterval(interval);
    }
  }, [restaurantId]);

  return { alerts, loading };
};
