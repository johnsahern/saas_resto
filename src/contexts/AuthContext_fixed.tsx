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
  login: (email: string, password: string, restaurantSlug?: string) => Promise<boolean>;
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
          
          return true;
        }
        
        // Cas 2: Sélection de restaurant requise (utilisateur avec plusieurs restaurants)
        if ('requiresRestaurantSelection' in response && response.requiresRestaurantSelection && 'restaurants' in response && response.restaurants) {
          console.log('🔄 Sélection de restaurant requise:', response.restaurants);
          
          // Afficher les restaurants disponibles dans l'erreur
          const restaurantList = response.restaurants
            .map(r => `• ${r.name} (${r.role === 'owner' ? 'Propriétaire' : 'Gestionnaire'})`)
            .join('\n');

          throw new Error(
            `Vous avez accès à plusieurs restaurants :\n\n${restaurantList}\n\n` +
            'Pour accéder à un restaurant spécifique, contactez l\'administrateur système ou ' +
            'utilisez l\'interface de sélection de restaurant.'
          );
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
  };

  const isAuthenticated = !!user && apiClient.isAuthenticated();

  // =======================================================================
  // VALEUR DU CONTEXTE
  // =======================================================================

  const contextValue: AuthContextType = {
    user,
    restaurant,
    isLoading,
    isAuthenticated,
    login,
    logout,
    switchRestaurant,
    getUserRestaurants,
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
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
  return restaurant?.id || null;
};

export const useIsAdmin = () => {
  const { user } = useAuth();
  return user?.is_super_admin || user?.role === 'owner' || false;
};

export const useIsManager = () => {
  const { user } = useAuth();
  return user?.role === 'manager' || user?.role === 'owner' || user?.is_super_admin || false;
};

// =======================================================================
// COMPOSANT DE PROTECTION DES ROUTES
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
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    // Rediriger vers la page de sélection du type de connexion
    window.location.href = '/';
    return null;
  }

  if (requireAdmin && !user?.is_super_admin && user?.role !== 'owner') {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Accès refusé</h2>
          <p className="text-gray-600">Vous n'avez pas les permissions nécessaires.</p>
        </div>
      </div>
    );
  }

  if (requireManager && !useIsManager()) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Accès refusé</h2>
          <p className="text-gray-600">Accès manager requis.</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

export default AuthProvider; 