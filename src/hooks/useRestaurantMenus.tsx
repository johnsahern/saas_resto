import { useState, useEffect } from 'react';
import { apiClient } from '@/integrations/api/client';
import { useRestaurantId } from '@/contexts/AuthContext';

export interface RestaurantMenuItem {
  id: string;
  name: string;
  description: string | null;
  price: number;
  category: string | null;
  is_available: boolean;
  created_at: string;
  updated_at: string;
  restaurant_id: string;
}

export const useRestaurantMenus = () => {
  const [menus, setMenus] = useState<RestaurantMenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const restaurantId = useRestaurantId();

  const validateAndFormatMenuItem = (item: any): RestaurantMenuItem => {
    return {
      id: item.id || '',
      name: item.name || '',
      description: item.description || null,
      price: item.price ? Number(item.price) : 0,
      category: item.category || null,
      is_available: Boolean(item.is_available),
      created_at: item.created_at || new Date().toISOString(),
      updated_at: item.updated_at || new Date().toISOString(),
      restaurant_id: item.restaurant_id || ''
    };
  };

  const fetchMenus = async () => {
    if (!restaurantId) return;

    console.log('Fetching menus...');
    try {
      const response = await apiClient.get(`/restaurant-menus?restaurant_id=${restaurantId}`);

      console.log('API response:', response);

      if (response.error) {
        console.error('API error:', response.error);
        throw new Error(response.error);
      }
      
      // Valider et formater chaque élément du menu
      const formattedMenus = (response.data || []).map(validateAndFormatMenuItem);
      console.log('Formatted menus:', formattedMenus);
      setMenus(formattedMenus);
    } catch (error) {
      console.error('Erreur lors du chargement des menus:', error);
      setMenus([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (restaurantId) {
      fetchMenus();
    }
  }, [restaurantId]);

  const addMenuItem = async (item: Omit<RestaurantMenuItem, 'id' | 'created_at' | 'updated_at' | 'restaurant_id'>) => {
    if (!restaurantId) return { success: false, error: 'Restaurant ID manquant' };

    console.log('Adding menu item:', item);
    try {
      const response = await apiClient.post('/restaurant-menus', {
        ...item,
        restaurant_id: restaurantId
      });

      console.log('Add item response:', response);

      if (response.error) {
        console.error('Error adding item:', response.error);
        throw new Error(response.error);
      }
      
      await fetchMenus();
      return { success: true, data: response.data };
    } catch (error) {
      console.error('Erreur lors de l\'ajout du menu:', error);
      return { success: false, error };
    }
  };

  const updateMenuItem = async (id: string, updates: Partial<RestaurantMenuItem>) => {
    if (!restaurantId) return { success: false, error: 'Restaurant ID manquant' };

    console.log('Updating menu item:', id, updates);
    try {
      const response = await apiClient.patch(`/restaurant-menus/${id}`, {
        ...updates,
        restaurant_id: restaurantId
      });

      console.log('Update item response:', response);

      if (response.error) {
        console.error('Error updating item:', response.error);
        throw new Error(response.error);
      }
      
      await fetchMenus();
      return { success: true, data: response.data };
    } catch (error) {
      console.error('Erreur lors de la mise à jour du menu:', error);
      return { success: false, error };
    }
  };

  const deleteMenuItem = async (id: string) => {
    if (!restaurantId) return { success: false, error: 'Restaurant ID manquant' };

    console.log('Deleting menu item:', id);
    try {
      const response = await apiClient.delete(`/restaurant-menus/${id}`);

      console.log('Delete item response:', response);

      if (response.error) {
        console.error('Error deleting item:', response.error);
        throw new Error(response.error);
      }
      
      await fetchMenus();
      return { success: true };
    } catch (error) {
      console.error('Erreur lors de la suppression du menu:', error);
      return { success: false, error };
    }
  };

  const getMenusByCategory = () => {
    const categories = [...new Set(menus.map(item => item.category || 'Autres'))];
    return categories.map(category => ({
      category,
      items: menus
        .filter(item => (item.category || 'Autres') === category)
        .map(validateAndFormatMenuItem)
    }));
  };

  return {
    menus,
    loading,
    addMenuItem,
    updateMenuItem,
    deleteMenuItem,
    getMenusByCategory,
    refetch: fetchMenus
  };
};
