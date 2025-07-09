import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { apiClient, SaasUser, Restaurant } from '@/integrations/api/client';

// =======================================================================
// TYPES ET INTERFACES
// =======================================================================

export type UserRole = 'owner' | 'manager';

// Types de retour pour la fonction login
type LoginSuccessWithData = {
  success: true;
  data: {
    token: string;
    user: SaasUser;
    restaurant: Restaurant;
  };
};

type LoginRequiresSelection = {
  success: true;
  requiresRestaurantSelection: true;
  restaurants: Restaurant[];
};

type LoginError = {
  success: false;
  error: string;
};

type LoginResponse = LoginSuccessWithData | LoginRequiresSelection | LoginError;

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
  login: (email: string, password: string, role?: UserRole, restaurantCode?: string) => Promise<LoginResponse>;
  selectRestaurant: (restaurantSlug: string) => Promise<LoginResponse>;
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
  const [requiresRestaurantSelection, setRequiresRestaurantSelection] = useState(false);
  const [availableRestaurants, setAvailableRestaurants] = useState<Restaurant[]>([]);
  const [tempUserEmail, setTempUserEmail] = useState<string | null>(null);
  const [tempUserPassword, setTempUserPassword] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // =======================================================================
  // INITIALISATION AU CHARGEMENT
  // =======================================================================

  // Surveiller les changements dans localStorage
  useEffect(() => {
    const handleStorageChange = () => {
      console.log('📢 Changement détecté dans localStorage');
      checkAuthState();
    };

    // Écouter les changements dans localStorage
    window.addEventListener('storage', handleStorageChange);
    
    // Vérification initiale
    checkAuthState();

    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  const checkAuthState = () => {
    console.log('🔍 === VÉRIFICATION ÉTAT AUTH ===');
    setIsLoading(true);
    
    try {
      // Vérifier directement dans localStorage
      const token = localStorage.getItem('saas_token');
      const userData = localStorage.getItem('saas_user');
      const restaurantData = localStorage.getItem('saas_restaurant');
      const restaurantId = localStorage.getItem('saas_restaurant_id');

      console.log('📦 Données localStorage:', {
        hasToken: !!token,
        hasUserData: !!userData,
        hasRestaurantData: !!restaurantData,
        hasRestaurantId: !!restaurantId
      });

      if (token && userData && restaurantId) {
        try {
          const parsedUser = JSON.parse(userData);
          const parsedRestaurant = restaurantData ? JSON.parse(restaurantData) : null;

          console.log('✅ Données valides trouvées');
          console.log('👤 Utilisateur:', parsedUser);
          console.log('🏪 Restaurant:', parsedRestaurant);

          // FORCER le rechargement de l'apiClient avec les nouvelles données
          console.log('🔄 Rechargement forcé de l\'apiClient...');
          apiClient.reloadFromStorage();

          setUser(parsedUser);
          setRestaurant(parsedRestaurant);
          setIsAuthenticated(true);
        } catch (error) {
          console.error('❌ Erreur parsing données:', error);
          clearAuth();
        }
      } else {
        console.log('❌ Données incomplètes ou manquantes');
        clearAuth();
      }
    } catch (error) {
      console.error('❌ Erreur vérification état:', error);
      clearAuth();
    } finally {
      setIsLoading(false);
      console.log('🔍 === FIN VÉRIFICATION ===');
    }
  };

  // =======================================================================
  // FONCTIONS D'AUTHENTIFICATION
  // =======================================================================

  const login = async (
    email: string, 
    password: string, 
    role: UserRole = 'owner', 
    restaurantCode?: string
  ): Promise<LoginResponse> => {
    try {
      console.log('🔐 Tentative de connexion...', { email, role, restaurantCode });
      setIsLoading(true);

      const response = await apiClient.login(email, password, role, restaurantCode);
      console.log('🔐 Réponse login:', response);
      
      if (response.success) {
        // Cas 1: Connexion réussie avec restaurant sélectionné
        if ('data' in response && response.data) {
          console.log('✅ Connexion réussie:', response.data);
          
          // Mettre à jour l'état IMMÉDIATEMENT
          setUser(response.data.user);
          setRestaurant(response.data.restaurant || null);
          setIsAuthenticated(true);
          setRequiresRestaurantSelection(false);
          setAvailableRestaurants([]);
          setTempUserEmail(null);
          setTempUserPassword(null);
          
          console.log('🔥 État mis à jour immédiatement - isAuthenticated: true');
          
          return response as LoginSuccessWithData;
        }
        
        // Cas 2: Sélection de restaurant requise (utilisateur avec plusieurs restaurants)
        if ('requiresRestaurantSelection' in response && response.requiresRestaurantSelection && 'restaurants' in response && response.restaurants) {
          console.log('🔄 Sélection de restaurant requise:', response.restaurants);
          
          setRequiresRestaurantSelection(true);
          setAvailableRestaurants(response.restaurants);
          setTempUserEmail(email);
          setTempUserPassword(password);
          
          return response as LoginRequiresSelection;
        }
      }
      
      // Cas d'erreur
      const errorMessage = 'error' in response ? response.error : 'Erreur de connexion';
      console.error('❌ Échec de la connexion:', errorMessage);
      setIsAuthenticated(false);
      return { success: false, error: errorMessage };
    } catch (error) {
      console.error('❌ Erreur de connexion:', error);
      setIsAuthenticated(false);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Erreur inconnue lors de la connexion' 
      };
    } finally {
      setIsLoading(false);
    }
  };

  const selectRestaurant = async (restaurantSlug: string): Promise<LoginResponse> => {
    if (!tempUserEmail || !tempUserPassword) {
      return { 
        success: false, 
        error: 'Informations de connexion temporaires manquantes' 
      };
    }

    return login(tempUserEmail, tempUserPassword, 'owner', restaurantSlug);
  };

  const cancelRestaurantSelection = () => {
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
      
      if (response.success && 'data' in response && response.data) {
        console.log('✅ Restaurant changé:', response.data.restaurant);
        
        setUser(response.data.user);
        setRestaurant(response.data.restaurant || null);
        
        return true;
      } else {
        const errorMessage = 'error' in response ? response.error : 'Erreur lors du changement de restaurant';
        console.error('❌ Échec du changement de restaurant:', errorMessage);
        throw new Error(errorMessage);
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
      
      if (response.success && 'data' in response && response.data) {
        console.log('✅ Restaurants récupérés:', response.data);
        return response.data;
      } else {
        const errorMessage = 'error' in response ? response.error : 'Erreur de récupération';
        console.error('❌ Échec récupération restaurants:', errorMessage);
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
    console.log('🧹 Nettoyage de l\'authentification...');
    setUser(null);
    setRestaurant(null);
    setIsAuthenticated(false);
    setRequiresRestaurantSelection(false);
    setAvailableRestaurants([]);
    setTempUserEmail(null);
    setTempUserPassword(null);
    apiClient.clearAuth();
    console.log('✅ Authentification nettoyée');
  };

  // =======================================================================
  // VALEUR DU CONTEXTE
  // =======================================================================

  const contextValue: AuthContextType = {
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

  // Afficher le spinner pendant le chargement
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Vérifier l'authentification
  if (!isAuthenticated || !user) {
    console.log('🚫 Accès non autorisé - Redirection vers la page de connexion', { isAuthenticated, user });
    return <Navigate to="/" replace />;
  }

  // Vérifier les permissions administrateur
  if (requireAdmin && user.role !== 'owner' && !user.is_super_admin) {
    console.log('🚫 Accès administrateur requis', { role: user.role, is_super_admin: user.is_super_admin });
    return <Navigate to="/dashboard" replace />;
  }

  // Vérifier les permissions manager
  if (requireManager && user.role && !['owner', 'manager'].includes(user.role) && !user.is_super_admin) {
    console.log('🚫 Accès manager requis', { role: user.role, is_super_admin: user.is_super_admin });
    return <Navigate to="/dashboard" replace />;
  }

  // Tout est OK, afficher le contenu protégé
  console.log('✅ Accès autorisé', { role: user.role, is_super_admin: user.is_super_admin });
  return <>{children}</>;
};

export default AuthProvider;
