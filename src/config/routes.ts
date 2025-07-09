// Routes publiques
export const PUBLIC_ROUTES = {
  HOME: '/',
  OWNER_LOGIN: '/owner-login',
  MANAGER_LOGIN: '/manager-login',
  RESTAURANT_SELECTION: '/restaurant-selection',
  SAAS_REGISTRATION: '/saas-registration',
  REGISTER_OWNER: '/register-owner'
} as const;

// Routes protégées
export const PROTECTED_ROUTES = {
  DASHBOARD: '/dashboard',
  ORDERS: '/orders',
  INVENTORY: '/inventory',
  STAFF: '/staff',
  TABLES: '/tables',
  DELIVERY: '/delivery',
  ANALYTICS: '/analytics',
  SETTINGS: '/settings'
} as const;

// Routes API
export const API_ROUTES = {
  BASE: import.meta.env.VITE_API_URL || '/api',
  AUTH: {
    LOGIN: '/auth/login',
    LOGOUT: '/auth/logout',
    VALIDATE_RESTAURANT_CODE: '/auth/validate-restaurant-code',
    REGISTER_RESTAURANT: '/auth/register-restaurant'
  }
} as const; 