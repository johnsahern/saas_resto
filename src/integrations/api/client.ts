// =======================================================================
// CLIENT API MYSQL - REMPLACE SUPABASE COMPLÈTEMENT
// =======================================================================

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';

// =======================================================================
// TYPES ET INTERFACES
// =======================================================================

interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  // Propriétés pour la sélection de restaurant
  requiresRestaurantSelection?: boolean;
  restaurants?: Array<{
    id: string;
    name: string;
    slug: string;
    role: string;
  }>;
  user?: {
    id: string;
    email: string;
    first_name: string;
    last_name: string;
  };
}

interface AuthTokens {
  token: string;
  refresh_token: string;
  user: SaasUser;
  restaurant?: Restaurant;
}

interface SaasUser {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  restaurant_id?: string;
  role?: string;
  is_super_admin?: boolean;
}

interface Restaurant {
  id: string;
  name: string;
  slug?: string;
  description?: string;
  logo?: string;
  address?: string;
  phone?: string;
  email?: string;
  website?: string;
  created_at?: string;
  role?: string;
  permissions?: any;
}

// =======================================================================
// CLIENT API PRINCIPAL
// =======================================================================

class MySQLApiClient {
  private baseURL: string;
  private token: string | null = null;
  private restaurantId: string | null = null;
  private user: SaasUser | null = null;

  constructor(baseURL: string = API_BASE_URL) {
    this.baseURL = baseURL;
    console.log('🔧 Initialisation du client API');
    this.loadFromStorage();
    console.log('🔧 Client API initialisé:', {
      hasToken: !!this.token,
      hasUser: !!this.user,
      hasRestaurantId: !!this.restaurantId
    });
  }

  // =======================================================================
  // GESTION DU STOCKAGE
  // =======================================================================

  private loadFromStorage() {
    try {
      console.log('📂 === CHARGEMENT DU STOCKAGE ===');
      
      // Charger les tokens
      this.token = localStorage.getItem('saas_token');
      this.restaurantId = localStorage.getItem('saas_restaurant_id');
      
      // Charger l'utilisateur
      const userData = localStorage.getItem('saas_user');
      const restaurantData = localStorage.getItem('saas_restaurant');

      console.log('📦 Contenu du localStorage:', {
        'saas_token': this.token ? `${this.token.substring(0, 20)}...` : null,
        'saas_restaurant_id': this.restaurantId,
        'saas_user': userData ? 'Présent' : null,
        'saas_restaurant': restaurantData ? 'Présent' : null
      });

      if (userData) {
        try {
          this.user = JSON.parse(userData);
          console.log('👤 Utilisateur parsé:', this.user);
        } catch (e) {
          console.error('❌ Erreur parsing user data:', e);
          this.clearStorage();
          return;
        }
      }

      // Vérifier que toutes les données nécessaires sont présentes
      const isComplete = !!(this.token && this.user && this.restaurantId);
      console.log('✅ Données complètes:', isComplete, {
        hasToken: !!this.token,
        hasUser: !!this.user,
        hasRestaurantId: !!this.restaurantId
      });

      if (!isComplete) {
        console.warn('⚠️ Données d\'authentification incomplètes, nettoyage...');
        this.clearStorage();
        return;
      }

      console.log('✅ === CHARGEMENT RÉUSSI ===');
    } catch (error) {
      console.error('❌ Erreur lors du chargement des données:', error);
      this.clearStorage();
    }
  }

  private saveToStorage(tokens: AuthTokens) {
    try {
      console.log('💾 Sauvegarde des données:', {
        hasToken: !!tokens.token,
        hasUser: !!tokens.user,
        hasRestaurant: !!tokens.restaurant
      });
      
      if (!tokens.token || !tokens.user || !tokens.restaurant) {
        console.error('❌ Données de token incomplètes');
        throw new Error('Données de token incomplètes');
      }

      // Sauvegarder les tokens
      localStorage.setItem('saas_token', tokens.token);
      localStorage.setItem('saas_refresh_token', tokens.refresh_token);
      
      // Enrichir l'utilisateur avec les données du restaurant
      const enrichedUser = {
        ...tokens.user,
        role: tokens.restaurant?.role,
        restaurant_id: tokens.restaurant?.id
      };
      
      // Sauvegarder l'utilisateur
      localStorage.setItem('saas_user', JSON.stringify(enrichedUser));
      
      // Sauvegarder les données du restaurant
      localStorage.setItem('saas_restaurant_id', tokens.restaurant.id);
      localStorage.setItem('saas_restaurant', JSON.stringify(tokens.restaurant));
      
      // Mettre à jour l'état interne
      this.token = tokens.token;
      this.user = enrichedUser;
      this.restaurantId = tokens.restaurant.id;

      console.log('✅ Données sauvegardées avec succès:', {
        user: this.user,
        restaurantId: this.restaurantId,
        hasToken: !!this.token
      });

      // Déclencher l'événement storage pour notifier tous les composants
      window.dispatchEvent(new StorageEvent('storage', {
        key: 'saas_token',
        newValue: tokens.token,
        storageArea: localStorage
      }));
    } catch (error) {
      console.error('❌ Erreur lors de la sauvegarde des données:', error);
      this.clearStorage();
      throw error;
    }
  }

  private clearStorage() {
    console.log('🧹 Nettoyage du stockage...');
    localStorage.removeItem('saas_token');
    localStorage.removeItem('saas_refresh_token');
    localStorage.removeItem('saas_user');
    localStorage.removeItem('saas_restaurant_id');
    localStorage.removeItem('saas_restaurant');
    this.token = null;
    this.user = null;
    this.restaurantId = null;
    console.log('✅ Stockage nettoyé');
  }

  clearAuth() {
    console.log('🧹 Nettoyage de l\'authentification (public)...');
    this.clearStorage();
  }

  // Méthode publique pour recharger depuis localStorage
  reloadFromStorage() {
    console.log('🔄 Rechargement forcé depuis localStorage...');
    this.loadFromStorage();
  }

  // =======================================================================
  // MÉTHODES HTTP DE BASE
  // =======================================================================

  private async request<T = any>(
    endpoint: string, 
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseURL}${endpoint}`;
    
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    if (this.restaurantId) {
      headers['X-Restaurant-ID'] = this.restaurantId;
    }

    try {
      console.log('🌐 Requête API:', {
        url,
        method: options.method,
        hasToken: !!this.token,
        hasRestaurantId: !!this.restaurantId,
        headers
      });

      const response = await fetch(url, {
        ...options,
        headers,
        credentials: 'include'
      });

      console.log('🌐 Réponse API:', {
        status: response.status,
        ok: response.ok,
        statusText: response.statusText
      });

      if (!response.ok) {
        if (response.status === 401) {
          console.error('🔒 Erreur d\'authentification');
          this.clearStorage();
          window.location.href = '/login';
          throw new Error('Session expirée, veuillez vous reconnecter');
        }
        throw new Error(`Erreur HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      console.log('📦 Données reçues:', data);

      return data;
    } catch (error) {
      console.error('❌ Erreur requête API:', error);
      throw error;
    }
  }

  async get<T = any>(endpoint: string): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'GET' });
  }

  async post<T = any>(endpoint: string, data?: any): Promise<ApiResponse<T>> {
    console.log('=== REQUÊTE POST API ===');
    console.log('Endpoint:', endpoint);
    console.log('Data:', JSON.stringify(data, null, 2));
    
    const response = await this.request<T>(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    });

    console.log('=== RÉPONSE POST API ===');
    console.log('Success:', response.success);
    console.log('Data:', response.data);
    console.log('Error:', response.error);

    return response;
  }

  async put<T = any>(endpoint: string, data?: any): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async patch<T = any>(endpoint: string, data?: any): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'PATCH',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async delete<T = any>(endpoint: string): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'DELETE' });
  }

  // =======================================================================
  // AUTHENTIFICATION SAAS
  // =======================================================================

  async login(email: string, password: string, role: string = 'owner', restaurantCode?: string) {
    try {
      console.log('🔐 === API CLIENT LOGIN ===');
      console.log('📧 Email:', email);
      console.log('👤 Rôle:', role);
      console.log('🏪 Restaurant code:', restaurantCode);
      
      const response = await this.post<{
        token: string;
        refresh_token: string;
        user: SaasUser;
        restaurant?: Restaurant;
        requiresRestaurantSelection?: boolean;
        restaurants?: Restaurant[];
      }>('/auth/login', { 
        email, 
        password, 
        role,
        restaurant_code: restaurantCode 
      });

      console.log('📥 Réponse API brute:', response);

      if (response.success && response.data) {
        console.log('✅ Réponse API success = true');
        console.log('📊 Données reçues:', {
          hasToken: !!response.data.token,
          hasUser: !!response.data.user,
          hasRestaurant: !!response.data.restaurant,
          tokenPreview: response.data.token ? response.data.token.substring(0, 20) + '...' : null
        });

        if (response.data.token) {
          console.log('💾 === DÉBUT SAUVEGARDE ===');
          
          const tokensToSave = {
            token: response.data.token,
            refresh_token: response.data.refresh_token,
            user: response.data.user,
            restaurant: response.data.restaurant
          };
          
          console.log('📦 Tokens à sauvegarder:', {
            hasToken: !!tokensToSave.token,
            hasRefreshToken: !!tokensToSave.refresh_token,
            hasUser: !!tokensToSave.user,
            hasRestaurant: !!tokensToSave.restaurant
          });
          
          this.saveToStorage(tokensToSave);
          
          console.log('💾 === FIN SAUVEGARDE ===');
          
          // Vérifier immédiatement après sauvegarde
          console.log('🔍 Vérification post-sauvegarde:');
          console.log('- localStorage saas_token:', localStorage.getItem('saas_token') ? 'Présent' : 'Absent');
          console.log('- localStorage saas_user:', localStorage.getItem('saas_user') ? 'Présent' : 'Absent');
          console.log('- localStorage saas_restaurant:', localStorage.getItem('saas_restaurant') ? 'Présent' : 'Absent');
          console.log('- this.token:', !!this.token);
          console.log('- this.user:', !!this.user);
          
          // Déclencher IMMÉDIATEMENT l'événement storage pour notification
          console.log('🚨 Déclenchement immédiat de l\'événement storage...');
          setTimeout(() => {
            window.dispatchEvent(new StorageEvent('storage', {
              key: 'saas_token',
              newValue: tokensToSave.token,
              storageArea: localStorage
            }));
          }, 0);
        }

        const returnData = {
          success: true,
          data: response.data.restaurant ? {
            token: response.data.token,
            user: response.data.user,
            restaurant: response.data.restaurant
          } : null,
          requiresRestaurantSelection: response.data.requiresRestaurantSelection,
          restaurants: response.data.restaurants
        };
        
        console.log('🚀 Retour de la méthode login:', returnData);
        return returnData;
      }

      console.error('❌ API Client - Échec de connexion:', response);
      return {
        success: false,
        error: 'Erreur de connexion'
      };
    } catch (error) {
      console.error('❌ API Client - Erreur de connexion:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erreur de connexion'
      };
    }
  }

  async logout() {
    try {
      await this.post('/auth/logout');
    } catch (error) {
      console.error('Erreur lors de la déconnexion:', error);
    } finally {
      this.clearStorage();
    }
  }

  async refreshToken() {
    const refreshToken = localStorage.getItem('saas_refresh_token');
    if (!refreshToken) throw new Error('Pas de token de rafraîchissement');

    const response = await this.post<AuthTokens>('/auth/refresh', {
      refresh_token: refreshToken
    });

    if (response.success && 'data' in response && response.data) {
      this.saveToStorage(response.data);
    }

    return response;
  }

  // =======================================================================
  // GESTION DES RESTAURANTS (SAAS)
  // =======================================================================

  async registerRestaurant(data: {
    restaurant_name: string;
    restaurant_address: string;
    restaurant_phone: string;
    restaurant_email: string;
    owner_first_name: string;
    owner_last_name: string;
    owner_email: string;
    password: string;
  }) {
    return this.post<AuthTokens>('/auth/register-restaurant', data);
  }

  async getUserRestaurants() {
    return this.get<Restaurant[]>('/auth/restaurants');
  }

  async switchRestaurant(restaurantId: string) {
    const response = await this.post<AuthTokens>('/auth/switch-restaurant', {
      restaurant_id: restaurantId
    });

    if (response.success && 'data' in response && response.data) {
      this.saveToStorage(response.data);
    }

    return response;
  }

  // =======================================================================
  // MÉTHODES COMPATIBLES SUPABASE (MIGRATION FACILE)
  // =======================================================================

  from(table: string) {
    return {
      select: (columns = '*') => ({
        order: () => ({ 
          then: async (callback: any) => callback({ data: [], error: null }) 
        }),
        eq: () => ({ 
          then: async (callback: any) => callback({ data: [], error: null }) 
        }),
        then: async (callback: any) => {
          const response = await this.get(`/tables/${table}?select=${columns}`);
          callback({ data: response.data || [], error: response.success ? null : response.error });
        }
      }),

      insert: async (data: any) => {
        const response = await this.post(`/tables/${table}`, data);
        return { data: response.data, error: response.success ? null : response.error };
      },

      update: (data: any) => ({
        eq: async (column: string, value: any) => {
          const response = await this.put(`/tables/${table}?${column}=${value}`, data);
          return { data: response.data, error: response.success ? null : response.error };
        }
      }),

      delete: () => ({
        eq: async (column: string, value: any) => {
          const response = await this.delete(`/tables/${table}?${column}=${value}`);
          return { data: response.data, error: response.success ? null : response.error };
        }
      }),

      // Méthodes RPC (pour les stored procedures)
      rpc: async (functionName: string, params?: any) => {
        console.log(`RPC call: ${functionName}`, params);
        return { data: null, error: null };
      }
    };
  }

  // Méthodes utilitaires
  isAuthenticated() {
    const isAuth = !!this.token && !!this.user && !!this.restaurantId;
    console.log('🔐 Vérification authentification:', {
      hasToken: !!this.token,
      hasUser: !!this.user,
      hasRestaurantId: !!this.restaurantId,
      isAuthenticated: isAuth
    });
    return isAuth;
  }

  getCurrentUser(): SaasUser | null {
    console.log('📱 Récupération utilisateur courant:', this.user);
    return this.user;
  }

  getCurrentRestaurant(): Restaurant | null {
    const restaurantData = localStorage.getItem('saas_restaurant');
    console.log('🏪 Récupération restaurant courant:', restaurantData);
    return restaurantData ? JSON.parse(restaurantData) : null;
  }

  getRestaurantId(): string | null {
    console.log('🏪 Récupération ID restaurant:', this.restaurantId);
    return this.restaurantId;
  }

  getToken(): string | null {
    return this.token;
  }

  hasValidToken(): boolean {
    return !!this.token;
  }
}

// =======================================================================
// INSTANCE GLOBALE (COMPATIBLE AVEC L'ANCIEN CODE SUPABASE)
// =======================================================================

export const apiClient = new MySQLApiClient();

// Alias pour compatibilité avec l'ancien code Supabase
export const supabase = {
  from: (table: string) => apiClient.from(table),
  rpc: async (functionName: string, params?: any) => {
    console.log(`RPC call: ${functionName}`, params);
    return { data: null, error: null };
  },
  auth: {
    signInWithPassword: async ({ email, password }: { email: string; password: string }) => {
      const response = await apiClient.login(email, password);
      return {
        data: response.success && 'data' in response ? { user: response.data?.user } : null,
        error: response.success ? null : { message: 'error' in response ? response.error : 'Erreur de connexion' }
      };
    },
    signOut: () => apiClient.logout(),
    getUser: () => ({
      data: { user: apiClient.getCurrentUser() },
      error: null
    })
  }
};

// Exports pour la migration
export { MySQLApiClient };
export type { ApiResponse, SaasUser, Restaurant, AuthTokens };
