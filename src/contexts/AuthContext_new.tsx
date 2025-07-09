import React, { createContext, useContext, useEffect, useState } from 'react';
import { apiClient, SaasUser, Restaurant } from '@/integrations/api/client';

// =======================================================================
// TYPES ET INTERFACES
// =======================================================================

export type UserRole = 'owner' | 'manager';

interface AuthContextType {
  user: SaasUser | null;
  restaurant: Restaurant | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  // États pour la sélection de restaurant
  requiresRestaurantSelection: boolean;
  availableRestaurants: Restaurant[];
  tempUserEmail: string | null;
  tempUserPassword: string | null;
  login: (email: string, password: string, restaurantSlug?: string) => Promise<boolean>;
  selectRestaurant: (restaurantSlug: string) => Promise<boolean>;
  cancelRestaurantSelection: () => void;
  logout: () => Promise<void>;
  switchRestaurant: (restaurantId: string) => Promise<boolean>;
  getUserRestaurants: () => Promise<Restaurant[]>;
}

// =======================================================================
// CONTEXTE D'AUTHENTIFICATION
// =======================================================================

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth doit être utilisé dans un AuthProvider');
  }
  return context;
};

// =======================================================================
// PROVIDER D'AUTHENTIFICATION
// =======================================================================

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<SaasUser | null>(null);
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  // États pour la sélection de restaurant
  const [requiresRestaurantSelection, setRequiresRestaurantSelection] = useState(false);
  const [availableRestaurants, setAvailableRestaurants] = useState<Restaurant[]>([]);
  const [tempUserEmail, setTempUserEmail] = useState<string | null>(null);
  const [tempUserPassword, setTempUserPassword] = useState<string | null>(null);

  // =======================================================================
  // INITIALISATION AU CHARGEMENT
  // =======================================================================

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        console.log('🔐 Initialisation de l\'authentification...');
        
        // Vérifier si l'utilisateur est connecté
        const currentUser = apiClient.getCurrentUser();
        const currentRestaurant = apiClient.getCurrentRestaurant();
        
        if (currentUser && apiClient.isAuthenticated()) {
          console.log('✅ Utilisateur trouvé:', currentUser);
          setUser(currentUser);
          setRestaurant(currentRestaurant);
        } else {
          console.log('❌ Aucun utilisateur authentifié');
          clearAuth();
        }
      } catch (error) {
        console.error('❌ Erreur lors de l\'initialisation:', error);
        clearAuth();
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, []);

  // =======================================================================
  // FONCTIONS D'AUTHENTIFICATION
  // =======================================================================

  const login = async (email: string, password: string, restaurantSlug?: string): Promise<boolean> => {
    try {
      console.log('🔐 Tentative de connexion...', { email, restaurantSlug });
      setIsLoading(true);

      const response = await apiClient.login(email, password, restaurantSlug);
      
      if (response.success) {
        // Cas 1: Connexion réussie avec restaurant sélectionné
        if ('data' in response && response.data) {
          console.log('✅ Connexion réussie:', response.data.user);
          
          setUser(response.data.user);
          setRestaurant(response.data.restaurant || null);
          
          // Nettoyer les états de sélection
          setRequiresRestaurantSelection(false);
          setAvailableRestaurants([]);
          setTempUserEmail(null);
          setTempUserPassword(null);
          
          return true;
        }
        
        // Cas 2: Sélection de restaurant requise (utilisateur avec plusieurs restaurants)
        if ('requiresRestaurantSelection' in response && response.requiresRestaurantSelection && 'restaurants' in response && response.restaurants) {
          console.log('🔄 Sélection de restaurant requise:', response.restaurants);
          
          // Stocker les informations pour la sélection ultérieure
          setRequiresRestaurantSelection(true);
          setAvailableRestaurants(response.restaurants);
          setTempUserEmail(email);
          setTempUserPassword(password);
          
          // Ne pas se connecter automatiquement - attendre la sélection de l'utilisateur
          return false; // Retourner false pour indiquer que la sélection est requise
        }
      }
      
      if ('error' in response && response.error) {
        console.error('❌ Échec de la connexion:', response.error);
        throw new Error(response.error || 'Erreur de connexion');
      } else {
        console.error('❌ Échec de la connexion: Réponse inattendue', response);
        throw new Error('Erreur de connexion');
      }
    } catch (error) {
      console.error('❌ Erreur de connexion:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const selectRestaurant = async (restaurantSlug: string): Promise<boolean> => {
    if (!tempUserEmail || !tempUserPassword) {
      throw new Error('Aucune session de connexion en cours');
    }

    try {
      console.log('🎯 Sélection du restaurant:', restaurantSlug);
      setIsLoading(true);

      // Effectuer la connexion avec le restaurant sélectionné
      const success = await login(tempUserEmail, tempUserPassword, restaurantSlug);
      
      return success;
    } catch (error) {
      console.error('❌ Erreur lors de la sélection du restaurant:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const cancelRestaurantSelection = () => {
    console.log('❌ Annulation de la sélection de restaurant');
    setRequiresRestaurantSelection(false);
    setAvailableRestaurants([]);
    setTempUserEmail(null);
    setTempUserPassword(null);
  };

  const logout = async (): Promise<void> => {
    try {
      console.log('🚪 Déconnexion...');
      setIsLoading(true);
      
      await apiClient.logout();
      clearAuth();
      
      console.log('✅ Déconnexion réussie');
    } catch (error) {
      console.error('❌ Erreur lors de la déconnexion:', error);
      // Forcer la déconnexion même en cas d'erreur
      clearAuth();
    } finally {
      setIsLoading(false);
    }
  };

  const switchRestaurant = async (restaurantId: string): Promise<boolean> => {
    try {
      console.log('🔄 Changement de restaurant...', restaurantId);
      setIsLoading(true);

      const response = await apiClient.switchRestaurant(restaurantId);
      
      if (response.success && response.data) {
        console.log('✅ Restaurant changé:', response.data.restaurant);
        
        setUser(response.data.user);
        setRestaurant(response.data.restaurant || null);
        
        return true;
      } else {
        console.error('❌ Échec du changement de restaurant:', response.error);
        throw new Error(response.error || 'Erreur lors du changement de restaurant');
      }
    } catch (error) {
      console.error('❌ Erreur changement restaurant:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const getUserRestaurants = async (): Promise<Restaurant[]> => {
    try {
      console.log('📋 Récupération des restaurants...');
      
      const response = await apiClient.getUserRestaurants();
      
      if (response.success && response.data) {
        console.log('✅ Restaurants récupérés:', response.data);
        return response.data;
      } else {
        console.error('❌ Échec récupération restaurants:', response.error);
        return [];
      }
    } catch (error) {
      console.error('❌ Erreur récupération restaurants:', error);
      return [];
    }
  };

  // =======================================================================
  // FONCTIONS UTILITAIRES
  // =======================================================================

  const clearAuth = () => {
    setUser(null);
    setRestaurant(null);
    setRequiresRestaurantSelection(false);
    setAvailableRestaurants([]);
    setTempUserEmail(null);
    setTempUserPassword(null);
  };

  const isAuthenticated = !!user && apiClient.isAuthenticated();

  // =======================================================================
  // VALEUR DU CONTEXTE
  // =======================================================================

  const value: AuthContextType = {
    user,
    restaurant,
    isLoading,
    isAuthenticated,
    requiresRestaurantSelection,
    availableRestaurants,
    tempUserEmail,
    tempUserPassword,
    login,
    selectRestaurant,
    cancelRestaurantSelection,
    logout,
    switchRestaurant,
    getUserRestaurants,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// =======================================================================
// HOOKS UTILITAIRES
// =======================================================================

export const useCurrentUser = () => {
  const { user } = useAuth();
  return user;
};

export const useCurrentRestaurant = () => {
  const { restaurant } = useAuth();
  return restaurant;
};

export const useRestaurantId = () => {
  const { restaurant } = useAuth();
  return restaurant?.id;
};

export const useIsAdmin = () => {
  const { user } = useAuth();
  return user?.role === 'owner' || user?.is_super_admin;
};

export const useIsManager = () => {
  const { user } = useAuth();
  return user?.role === 'manager' || user?.role === 'owner' || user?.is_super_admin;
};

// =======================================================================
// COMPOSANT DE PROTECTION DE ROUTE
// =======================================================================

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAdmin?: boolean;
  requireManager?: boolean;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  requireAdmin = false, 
  requireManager = false 
}) => {
  const { isAuthenticated, isLoading, user } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    // Rediriger vers la page de sélection du type de connexion
    window.location.href = '/';
    return null;
  }

  if (requireAdmin && user?.role !== 'owner' && !user?.is_super_admin) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600">Accès refusé</h1>
          <p className="text-gray-600">Vous n'avez pas les permissions nécessaires.</p>
        </div>
      </div>
    );
  }

  if (requireManager && !['manager', 'owner'].includes(user?.role || '') && !user?.is_super_admin) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600">Accès refusé</h1>
          <p className="text-gray-600">Vous n'avez pas les permissions nécessaires.</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}; 