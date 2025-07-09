import { useState } from 'react';
import { apiClient } from '@/integrations/api/client';
import { useRestaurantId } from '@/contexts/AuthContext';

export const useOrderActions = () => {
  const [loading, setLoading] = useState(false);
  const restaurantId = useRestaurantId();

  const getNextStatus = (currentStatus: string): string => {
    const statusFlow = {
      'pending': 'preparing',
      'preparing': 'ready',
      'ready': 'served',
      'served': 'served', // Final status
      'cancelled': 'cancelled' // Cannot change
    };
    return statusFlow[currentStatus as keyof typeof statusFlow] || currentStatus;
  };

  const updateOrderStatus = async (orderId: string, currentStatus: string): Promise<{ success: boolean; isCompleted: boolean }> => {
    if (!restaurantId) return { success: false, isCompleted: false };
    
    if (currentStatus === 'served' || currentStatus === 'cancelled') {
      return { success: false, isCompleted: false }; // Cannot update final statuses
    }

    setLoading(true);
    try {
      const nextStatus = getNextStatus(currentStatus);
      // Utiliser la nouvelle route PATCH pour les commandes actives
      const response = await apiClient.patch(`/active-orders/${orderId}/status`, {
        status: nextStatus
      });
      if (response.error) {
        console.error('Error updating order status:', response.error);
        throw new Error(response.error);
      }
      return { success: true, isCompleted: nextStatus === 'served' };
    } catch (error) {
      console.error('Erreur lors de la mise à jour du statut:', error);
      return { success: false, isCompleted: false };
    } finally {
      setLoading(false);
    }
  };

  const cancelOrder = async (orderId: string): Promise<boolean> => {
    if (!restaurantId) return false;

    setLoading(true);
    try {
      console.log('Cancelling order:', orderId);
      
      const response = await apiClient.patch(`/orders/${orderId}`, {
        status: 'cancelled',
        restaurant_id: restaurantId
      });

      if (response.error) {
        console.error('Error cancelling order:', response.error);
        throw new Error(response.error);
      }
      
      console.log('Order cancelled successfully');
      return true;
    } catch (error) {
      console.error('Erreur lors de l\'annulation de la commande:', error);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const getStatusLabel = (status: string): string => {
    const labels = {
      'pending': 'En attente',
      'preparing': 'En préparation',
      'ready': 'Prêt',
      'served': 'Servi',
      'cancelled': 'Annulé'
    };
    return labels[status as keyof typeof labels] || status;
  };

  return {
    updateOrderStatus,
    cancelOrder,
    getNextStatus,
    getStatusLabel,
    loading
  };
};
