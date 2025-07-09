import { useState } from 'react';
import { apiClient } from '@/integrations/api/client';
import { useRestaurantId } from '@/contexts/AuthContext';
import { RestaurantTable } from './useRestaurantTables';

export const useTableOperations = () => {
  const [loading, setLoading] = useState(false);
  const restaurantId = useRestaurantId();

  const updateTablePosition = async (tableId: string, x: number, y: number) => {
    if (!restaurantId) return false;

    setLoading(true);
    try {
      const response = await apiClient.patch(`/tables/${tableId}`, {
        position_x: x, 
        position_y: y,
        restaurant_id: restaurantId
      });

      if (response.error) {
        console.error('Erreur lors de la mise à jour de la position:', response.error);
        throw new Error(response.error);
      }

      console.log(`Position de la table ${tableId} mise à jour: (${x}, ${y})`);
      return true;
    } catch (error) {
      console.error('Erreur dans updateTablePosition:', error);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const createTable = async (tableData: {
    table_number: number;
    capacity: number;
    status: RestaurantTable['status'];
    position_x?: number;
    position_y?: number;
  }) => {
    if (!restaurantId) return false;

    setLoading(true);
    try {
      const response = await apiClient.post('/tables', {
        ...tableData,
        position_x: tableData.position_x || Math.random() * 800 + 100,
        position_y: tableData.position_y || Math.random() * 200 + 100,
        restaurant_id: restaurantId
      });

      if (response.error) {
        console.error('Erreur lors de la création de la table:', response.error);
        throw new Error(response.error);
      }

      console.log('Table créée avec succès');
      return true;
    } catch (error) {
      console.error('Erreur dans createTable:', error);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const deleteTable = async (tableId: string) => {
    if (!restaurantId) return false;

    setLoading(true);
    try {
      const response = await apiClient.delete(`/tables/${tableId}`);

      if (response.error) {
        console.error('Erreur lors de la suppression de la table:', response.error);
        throw new Error(response.error);
      }

      console.log('Table supprimée avec succès');
      return true;
    } catch (error) {
      console.error('Erreur dans deleteTable:', error);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const updateTableStatus = async (tableId: string, status: RestaurantTable['status']) => {
    if (!restaurantId) return false;

    setLoading(true);
    try {
      const response = await apiClient.patch(`/tables/${tableId}`, {
        status,
        restaurant_id: restaurantId
      });

      if (response.error) {
        console.error('Erreur lors de la mise à jour du statut:', response.error);
        throw new Error(response.error);
      }

      console.log(`Statut de la table ${tableId} mis à jour: ${status}`);
      return true;
    } catch (error) {
      console.error('Erreur dans updateTableStatus:', error);
      return false;
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    updateTablePosition,
    createTable,
    deleteTable,
    updateTableStatus,
  };
};
