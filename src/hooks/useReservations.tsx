import { useState, useEffect } from 'react';
import { apiClient } from '@/integrations/api/client';
import { useToast } from '@/hooks/use-toast';
import { useRestaurantId } from '@/contexts/AuthContext';

export interface Reservation {
  id: string;
  customer_name: string;
  customer_phone: string;
  date: string;
  time: string;
  party_size: number;
  status: 'confirmed' | 'completed' | 'cancelled';
  notes?: string;
  created_at: string;
  restaurant_id: string;
}

export const useReservations = () => {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const restaurantId = useRestaurantId();

  const fetchReservations = async () => {
    if (!restaurantId) return;

    try {
      setLoading(true);
      const response = await apiClient.get(`/reservations?restaurant_id=${restaurantId}`);

      if (response.error) {
        throw new Error(response.error);
      }
      
      setReservations(response.data || []);
    } catch (error) {
      console.error('Erreur lors du chargement des réservations:', error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les réservations",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const createReservation = async (reservationData: Omit<Reservation, 'id' | 'created_at' | 'restaurant_id'>) => {
    if (!restaurantId) throw new Error('Restaurant ID manquant');

    try {
      const response = await apiClient.post('/reservations', {
        ...reservationData,
        restaurant_id: restaurantId
      });

      if (response.error) {
        throw new Error(response.error);
      }

      // Rafraîchir les données
      await fetchReservations();

      toast({
        title: "Succès",
        description: "Réservation créée avec succès",
      });
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la création de la réservation:', error);
      toast({
        title: "Erreur",
        description: "Impossible de créer la réservation",
        variant: "destructive",
      });
      throw error;
    }
  };

  const updateReservation = async (id: string, updates: Partial<Reservation>) => {
    if (!restaurantId) throw new Error('Restaurant ID manquant');

    try {
      const response = await apiClient.patch(`/reservations/${id}`, {
        ...updates,
        restaurant_id: restaurantId
      });

      if (response.error) {
        throw new Error(response.error);
      }

      // Rafraîchir les données
      await fetchReservations();

      toast({
        title: "Succès",
        description: "Réservation mise à jour avec succès",
      });
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la mise à jour de la réservation:', error);
      toast({
        title: "Erreur",
        description: "Impossible de mettre à jour la réservation",
        variant: "destructive",
      });
      throw error;
    }
  };

  const deleteReservation = async (id: string) => {
    if (!restaurantId) throw new Error('Restaurant ID manquant');

    try {
      const response = await apiClient.delete(`/reservations/${id}`);

      if (response.error) {
        throw new Error(response.error);
      }

      // Rafraîchir les données
      await fetchReservations();

      toast({
        title: "Succès",
        description: "Réservation supprimée avec succès",
      });
    } catch (error) {
      console.error('Erreur lors de la suppression de la réservation:', error);
      toast({
        title: "Erreur",
        description: "Impossible de supprimer la réservation",
        variant: "destructive",
      });
      throw error;
    }
  };

  useEffect(() => {
    if (restaurantId) {
      fetchReservations();
    }
  }, [restaurantId]);

  return {
    reservations,
    loading,
    createReservation,
    updateReservation,
    deleteReservation,
    refreshReservations: fetchReservations,
  };
};
