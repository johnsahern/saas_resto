import { useState, useEffect } from 'react';
import { apiClient } from '@/integrations/api/client';
import { useRestaurantId } from '@/contexts/AuthContext';

export interface LoyaltyReward {
  id: string;
  name: string;
  description?: string;
  points_cost: number;
  restaurant_id: string;
  image?: string;
  valid_until?: string;
  created_at: string;
}

export const useLoyaltyRewards = () => {
  const [rewards, setRewards] = useState<LoyaltyReward[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const restaurantId = useRestaurantId();

  const fetchRewards = async () => {
    if (!restaurantId) return;

    try {
      console.log('Fetching loyalty rewards...');
      const response = await apiClient.get(`/loyalty-rewards?restaurant_id=${restaurantId}`);

      if (response.error) {
        console.error('Error fetching rewards:', response.error);
        throw new Error(response.error);
      }

      console.log('Loyalty rewards fetched:', response.data);
      setRewards(response.data || []);
    } catch (err) {
      console.error('Error:', err);
      setError(err instanceof Error ? err.message : 'Error fetching rewards');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (restaurantId) {
      fetchRewards();
    }
  }, [restaurantId]);

  const addReward = async (reward: Omit<LoyaltyReward, 'id' | 'created_at' | 'restaurant_id'>) => {
    if (!restaurantId) return { success: false, error: 'Restaurant ID manquant' };

    try {
      console.log('Adding reward:', reward);
      const response = await apiClient.post('/loyalty-rewards', {
        ...reward,
        restaurant_id: restaurantId
      });

      if (response.error) {
        console.error('Error adding reward:', response.error);
        throw new Error(response.error);
      }

      console.log('Reward added:', response.data);
      // Rafraîchir les données
      await fetchRewards();
      return { success: true, data: response.data };
    } catch (error) {
      console.error('Error adding reward:', error);
      return { success: false, error };
    }
  };

  const updateReward = async (id: string, updates: Partial<LoyaltyReward>) => {
    if (!restaurantId) return { success: false, error: 'Restaurant ID manquant' };

    try {
      console.log('Updating reward:', id, updates);
      const response = await apiClient.patch(`/loyalty-rewards/${id}`, {
        ...updates,
        restaurant_id: restaurantId
      });

      if (response.error) {
        console.error('Error updating reward:', response.error);
        throw new Error(response.error);
      }

      console.log('Reward updated:', response.data);
      // Rafraîchir les données
      await fetchRewards();
      return { success: true, data: response.data };
    } catch (error) {
      console.error('Error updating reward:', error);
      return { success: false, error };
    }
  };

  const deleteReward = async (id: string) => {
    if (!restaurantId) return { success: false, error: 'Restaurant ID manquant' };

    try {
      console.log('Deleting reward:', id);
      const response = await apiClient.delete(`/loyalty-rewards/${id}`);

      if (response.error) {
        console.error('Error deleting reward:', response.error);
        throw new Error(response.error);
      }

      console.log('Reward deleted');
      // Rafraîchir les données
      await fetchRewards();
      return { success: true };
    } catch (error) {
      console.error('Error deleting reward:', error);
      return { success: false, error };
    }
  };

  return {
    rewards,
    loading,
    error,
    addReward,
    updateReward,
    deleteReward,
    refetch: fetchRewards
  };
};
