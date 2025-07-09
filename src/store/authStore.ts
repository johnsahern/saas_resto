import { create } from 'zustand';
import { apiFetch } from '../utils/api';
import { Location, extractLocationFromDeliveryPerson } from '../utils/locationUtils';

export interface User {
  id: string;
  email: string;
  name?: string;
  phone?: string;
  available?: boolean;
  current_location?: any; // Format GeoJSON stocké dans Supabase
  restaurant_id?: string; // Ajouté pour permettre l'accès au nom du restaurant
}

export interface AuthState {
  user: User | null;
  location: Location | null;
  isAvailable: boolean;
  setUser: (user: User | null) => void;
  logout: () => Promise<void>;
  updateLocation: (lat: number, lng: number) => void;
  setAvailability: (isAvailable: boolean) => Promise<boolean>;
  subscribeToAvailabilityChanges: () => void;
  unsubscribeFromAvailabilityChanges: () => void;
}

// Variable pour stocker la référence à la souscription
let availabilitySubscription: any = null;

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  location: null,
  isAvailable: false,
  
  setUser: (user) => {
    console.log('[DEBUG] setUser appelé avec:', user);
    // Extraire les coordonnées du format géospatial si disponibles
    const location = user ? extractLocationFromDeliveryPerson(user) : null;
    
    set({ 
      user,
      location,
      isAvailable: user?.available || false
    });
    
    // Activer la souscription en temps réel après connexion
    if (user) {
      get().subscribeToAvailabilityChanges();
    }
  },
  
  logout: async () => {
    // Désactiver la souscription avant la déconnexion
    get().unsubscribeFromAvailabilityChanges();
    
    await apiFetch(
      `${import.meta.env.VITE_API_URL}/delivery-persons/${get().user?.id}/status`,
      {
        method: 'PATCH',
        body: JSON.stringify({ available: false })
      }
    );
    localStorage.removeItem('delivery_person_id');
    localStorage.removeItem('delivery_token'); // <-- suppression du token JWT
    set({ user: null, location: null, isAvailable: false });
  },
  
  updateLocation: (lat, lng) => {
    const newLocation = { lat, lng };
    
    // Ne mettre à jour que le champ location, sans toucher à l'utilisateur
    // pour éviter une boucle infinie de mises à jour
    set((state) => ({
      ...state,
      location: newLocation,
      // Nous ne mettons PAS À JOUR user ici pour éviter les boucles infinies
      // Lors de la mise à jour vers Supabase, on enverra les coordonnées actuelles
    }));
  },
  
  setAvailability: async (isAvailable) => {
    try {
      const { user } = get();
      if (!user) return false;
      const response = await apiFetch(
        `${import.meta.env.VITE_API_URL}/delivery-persons/${user.id}/status`,
        {
          method: 'PATCH',
          body: JSON.stringify({ available: isAvailable })
        }
      );
      const result = await response.json();
      if (!result.success) throw new Error(result.error || 'Erreur API');
      set((state) => ({ 
        ...state, 
        isAvailable,
        user: { ...user, available: isAvailable }
      }));
      return true;
    } catch (error) {
      console.error('Erreur lors de la mise à jour de la disponibilité:', error);
      return false;
    }
  },
  
  // Fonction pour s'abonner aux changements en temps réel
  subscribeToAvailabilityChanges: () => {
    const { user } = get();
    if (!user) return;
    
    // Annuler toute souscription existante
    get().unsubscribeFromAvailabilityChanges();
    
    // Créer une nouvelle souscription
    availabilitySubscription = apiFetch(
      `${import.meta.env.VITE_API_URL}/delivery-persons/${user.id}/status`,
      {
        method: 'PATCH',
        body: JSON.stringify({ available: true })
      }
    )
      .then(response => response.json())
      .then(result => {
        if (result.success) {
          set(state => ({
            ...state,
            isAvailable: true,
            user: { ...user, available: true }
          }));
        } else {
          console.error('Erreur lors de la souscription aux changements de disponibilité:', result.error);
        }
      })
      .catch(error => {
        console.error('Erreur lors de la souscription aux changements de disponibilité:', error);
      });
  },
  
  // Fonction pour se désabonner
  unsubscribeFromAvailabilityChanges: () => {
    if (availabilitySubscription) {
      // Pour désactiver la souscription, on envoie une requête PATCH avec available: false
      apiFetch(
        `${import.meta.env.VITE_API_URL}/delivery-persons/${get().user?.id}/status`,
        {
          method: 'PATCH',
          body: JSON.stringify({ available: false })
        }
      )
        .then(response => response.json())
        .then(result => {
          if (result.success) {
            set(state => ({
              ...state,
              isAvailable: false,
              user: { ...get().user!, available: false }
            }));
          } else {
            console.error('Erreur lors de la désactivation de la souscription:', result.error);
          }
        })
        .catch(error => {
          console.error('Erreur lors de la désactivation de la souscription:', error);
        });
      availabilitySubscription = null;
    }
  }
})); 