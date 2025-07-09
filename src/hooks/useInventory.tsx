import { useState, useEffect } from 'react';
import { apiClient } from '@/integrations/api/client';
import { useRestaurantId } from '@/contexts/AuthContext';

export interface InventoryItem {
  id: string;
  item_name: string;
  current_stock: number;
  min_stock: number;
  unit: string;
  cost_per_unit: number;
  supplier_id?: string;
  restaurant_id: string;
  last_updated: string;
  created_at: string;
  supplier_name?: string;
}

export const useInventory = () => {
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const restaurantId = useRestaurantId();

  const fetchInventory = async () => {
    if (!restaurantId) return;

    try {
      setLoading(true);
      const response = await apiClient.get(`/inventory?restaurant_id=${restaurantId}`);

      if (response.error) {
        throw new Error(response.error);
      }
      
      setInventory(response.data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error fetching inventory');
      console.error('Error fetching inventory:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (restaurantId) {
      fetchInventory();
    }
  }, [restaurantId]);

  const addStock = async (itemId: string, quantity: number, notes?: string) => {
    if (!restaurantId) return { success: false, error: 'Restaurant ID manquant' };

    try {
      console.log('Adding stock:', { itemId, quantity, notes });

      const response = await apiClient.post('/inventory/add-stock', {
        inventory_id: itemId, // Correction ici
        quantity,
        notes,
        restaurant_id: restaurantId
      });

      if (response.error) {
        throw new Error(response.error);
      }

      // Rafraîchir les données
      await fetchInventory();

      console.log('Stock added successfully');
      return { success: true };
    } catch (err) {
      console.error('Error adding stock:', err);
      return { success: false, error: err instanceof Error ? err.message : 'Error adding stock' };
    }
  };

  const withdrawStock = async (itemId: string, quantity: number, notes?: string) => {
    if (!restaurantId) return { success: false, error: 'Restaurant ID manquant' };

    try {
      console.log('Withdrawing stock:', { itemId, quantity, notes });

      const response = await apiClient.post('/inventory/withdraw-stock', {
        inventory_id: itemId,
        quantity,
        notes,
        restaurant_id: restaurantId
      });

      if (response.error) {
        throw new Error(response.error);
      }

      // Rafraîchir les données
      await fetchInventory();

      console.log('Stock withdrawn successfully');
      return { success: true };
    } catch (err) {
      console.error('Error withdrawing stock:', err);
      return { success: false, error: err instanceof Error ? err.message : 'Error withdrawing stock' };
    }
  };

  const updateStock = async (itemId: string, newStock: number) => {
    if (!restaurantId) return { success: false, error: 'Restaurant ID manquant' };

    try {
      const response = await apiClient.patch(`/inventory/${itemId}`, {
        current_stock: newStock,
        restaurant_id: restaurantId
      });

      if (response.error) {
        throw new Error(response.error);
      }

      // Mettre à jour localement
      setInventory(prev => prev.map(item => 
        item.id === itemId ? { ...item, current_stock: newStock, last_updated: new Date().toISOString() } : item
      ));

      return { success: true };
    } catch (err) {
      console.error('Error updating stock:', err);
      return { success: false, error: err instanceof Error ? err.message : 'Error updating stock' };
    }
  };

  const refreshInventory = async () => {
    await fetchInventory();
  };

  return { inventory, loading, error, addStock, withdrawStock, updateStock, refreshInventory };
};
