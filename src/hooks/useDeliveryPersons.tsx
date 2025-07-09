import { useState, useEffect } from 'react';
import { apiClient } from '@/integrations/api/client';
import { useRestaurantId } from '@/contexts/AuthContext';

export interface DeliveryPerson {
  id: string;
  name: string;
  phone: string;
  available: boolean;
  rating: number | null;
  current_location: any;
  restaurant_id: string;
}

export const useDeliveryPersons = () => {
  const [deliveryPersons, setDeliveryPersons] = useState<DeliveryPerson[]>([]);
  const [loading, setLoading] = useState(true);
  const restaurantId = useRestaurantId();

  useEffect(() => {
    if (restaurantId) {
      fetchDeliveryPersons();
    }
  }, [restaurantId]);

  const fetchDeliveryPersons = async () => {
    if (!restaurantId) return;
    
    try {
      console.log('Fetching delivery persons...');
      
      const response = await apiClient.get(`/delivery-persons?restaurant_id=${restaurantId}`);
      
      if (response.error) {
        console.error('Error fetching delivery persons:', response.error);
        throw new Error(response.error);
      }

      console.log('Delivery persons fetched:', response.data);
      setDeliveryPersons(response.data || []);
    } catch (err) {
      console.error('Error fetching delivery persons:', err);
      setDeliveryPersons([]);
    } finally {
      setLoading(false);
    }
  };

  const getAvailableDeliveryPersons = () => {
    return deliveryPersons.filter(person => person.available);
  };

  const addDeliveryPerson = async (personData: Omit<DeliveryPerson, 'id' | 'restaurant_id'>) => {
    if (!restaurantId) return null;

    try {
      const response = await apiClient.post('/delivery-persons', {
        ...personData,
        restaurant_id: restaurantId
      });

      if (response.error) {
        throw new Error(response.error);
      }

      // Refetch the data to update the list
      await fetchDeliveryPersons();
      return response.data;
    } catch (err) {
      console.error('Error adding delivery person:', err);
      throw err;
    }
  };

  const updateDeliveryPerson = async (id: string, updates: Partial<DeliveryPerson>) => {
    if (!restaurantId) return null;

    try {
      const response = await apiClient.patch(`/delivery-persons/${id}`, updates);

      if (response.error) {
        throw new Error(response.error);
      }

      // Refetch the data to update the list
      await fetchDeliveryPersons();
      return response.data;
    } catch (err) {
      console.error('Error updating delivery person:', err);
      throw err;
    }
  };

  const deleteDeliveryPerson = async (id: string) => {
    if (!restaurantId) return;

    try {
      const response = await apiClient.delete(`/delivery-persons/${id}`);

      if (response.error) {
        throw new Error(response.error);
      }

      // Refetch the data to update the list
      await fetchDeliveryPersons();
    } catch (err) {
      console.error('Error deleting delivery person:', err);
      throw err;
    }
  };

  return { 
    deliveryPersons, 
    loading, 
    getAvailableDeliveryPersons, 
    addDeliveryPerson,
    updateDeliveryPerson,
    deleteDeliveryPerson,
    refetch: fetchDeliveryPersons 
  };
};
