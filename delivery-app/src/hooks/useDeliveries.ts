import { useState, useEffect } from 'react';
import { apiFetch } from '../utils/api';
import { useAuthStore } from '../store/authStore';
import { useUiStore } from '../store/uiStore';

// Type Delivery basé sur la structure exacte de la base de données
export type Delivery = {
  id: string;
  delivery_person_id: string;
  order_id: string;
  status: string;
  address: string;
  created_at: string;
  updated_at: string;
  notes?: string | null; // Ajout du champ notes ici, s'il existe dans la table deliveries
};

// Type étendu qui inclut la relation commande (order)
export type DeliveryWithRelations = Delivery & {
  order?: {
    id: string;
    customer_address?: string;
    customer_name?: string;
    customer_phone?: string;
  }
};

// Statuts de livraison possibles
export const DELIVERY_STATUS = {
  PENDING: 'pending',
  ASSIGNED: 'assigned',
  IN_PROGRESS: 'in_progress',
  DELIVERED: 'delivered',
  CANCELLED: 'cancelled'
};

export const useDeliveries = () => {
  const [deliveries, setDeliveries] = useState<Delivery[]>([]);
  const [loading, setLoading] = useState(false);
  const { user } = useAuthStore();
  const { showLoading, hideLoading, showNotification } = useUiStore();

  // Fonction pour charger les livraisons
  const fetchDeliveries = async () => {
    if (!user) return;
    
    setLoading(true);
    
    try {
      // Rechercher les livraisons associées à ce livreur, triées par date de création
      const response = await apiFetch(
        `${import.meta.env.VITE_API_URL}/deliveries?delivery_person_id=${user.id}`
      );
      const result = await response.json();
      console.log('[DEBUG] Réponse API livraisons:', result);
      if (!result.success) throw new Error(result.error || 'Erreur API');
      setDeliveries(result.data || []);
    } catch (err) {
      console.error('Erreur:', err);
      showNotification('Une erreur est survenue', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Fonction pour récupérer une livraison par ID
  const getDeliveryById = async (id: string): Promise<DeliveryWithRelations | null> => {
    showLoading();
    
    try {
      // Récupérer la livraison avec les détails de la commande associée
      const response = await apiFetch(
        `${import.meta.env.VITE_API_URL}/deliveries/${id}`
      );
      const result = await response.json();
      console.log('[DEBUG] Réponse API livraison par ID:', result);
      if (!result.success) throw new Error(result.error || 'Erreur API');

      const delivery = result.data;
      // Enrichir l'objet delivery avec l'adresse client de la commande si elle existe
      // et potentiellement d'autres champs de orders si nécessaire à la racine de delivery
      const enhancedData = delivery ? {
        ...delivery,
        // L'adresse à la racine est toujours celle de la livraison (peut être un point relais)
        // L'adresse client est dans delivery.orders.customer_address
        // Si delivery.address est vide, on pourrait le remplir avec customer_address par défaut
        address: delivery.address || (delivery.order?.customer_address || '')
      } : null;
      
      return enhancedData as DeliveryWithRelations;
    } catch (err) {
      console.error('Erreur:', err);
      showNotification('Une erreur est survenue', 'error');
      return null;
    } finally {
      hideLoading();
    }
  };

  // Fonction pour mettre à jour le statut d'une livraison
  const updateDeliveryStatus = async (id: string, status: string) => {
    showLoading();
    try {
      const response = await apiFetch(
        `${import.meta.env.VITE_API_URL}/deliveries/${id}`,
        {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status: status })
        }
      );
      const result = await response.json();
      console.log('[DEBUG] Réponse API mise à jour statut:', result);
      if (!result.success) throw new Error(result.error || 'Erreur API');
      
      showNotification('Statut de la livraison mis à jour avec succès!', 'success');
      hideLoading();
      return result.data;
    } catch (err) {
      console.error('Erreur inattendue:', err);
      showNotification('Une erreur inattendue est survenue', 'error');
      hideLoading();
      return null;
    }
  };

  // Charger les livraisons au chargement
  useEffect(() => {
    if (user) {
      fetchDeliveries();
    }
  }, [user]);

  return {
    deliveries,
    loading,
    fetchDeliveries,
    getDeliveryById,
    updateDeliveryStatus,
    DELIVERY_STATUS
  };
};

// Nouvelle fonction pour charger les livraisons assignées depuis la base MySQL
export const useAssignedDeliveries = () => {
  const [deliveries, setDeliveries] = useState<Delivery[]>([]);
  const [loading, setLoading] = useState(false);
  const { user } = useAuthStore();
  const { showNotification } = useUiStore();

  const fetchAssignedDeliveries = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const response = await apiFetch(
        `${import.meta.env.VITE_API_URL}/deliveries?delivery_person_id=${user.id}`
      );
      const result = await response.json();
      console.log('[DEBUG] Réponse API livraisons assignées:', result);
      if (!result.success) throw new Error(result.error || 'Erreur API');
      setDeliveries(result.data || []);
    } catch (err) {
      showNotification('Erreur lors du chargement des livraisons assignées', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAssignedDeliveries();
    // eslint-disable-next-line
  }, [user?.id]);

  return { deliveries, loading, fetchAssignedDeliveries };
};
