import { Request } from "express";

// =======================================================================
// TYPES DE BASE
// =======================================================================

export interface SaasUser {
  id: string;
  email: string;
  password_hash: string;
  first_name: string;
  last_name: string;
  is_super_admin?: boolean;
  restaurant_id?: string;
  role?: string;
  created_at?: Date;
  updated_at?: Date;
}

export interface Restaurant {
  id: string;
  name: string;
  slug: string;
  description?: string;
  address?: string;
  phone?: string;
  email?: string;
  created_at?: Date;
  updated_at?: Date;
}

export interface RestaurantUser {
  user_id: string;
  restaurant_id: string;
  role: string;
  permissions?: any;
  is_active: boolean;
  created_at?: Date;
  updated_at?: Date;
}

// =======================================================================
// TYPES DE REQUÊTES
// =======================================================================

export interface LoginRequest {
  email: string;
  password: string;
  restaurant_slug?: string;
}

export interface RegisterRestaurantRequest {
  restaurant_name: string;
  restaurant_address: string;
  restaurant_phone: string;
  restaurant_email: string;
  owner_first_name: string;
  owner_last_name: string;
  owner_email: string;
  password: string;
}

// =======================================================================
// TYPES DE RÉPONSES
// =======================================================================

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface AuthResponse {
  token: string;
  refresh_token: string;
  user: {
    id: string;
    email: string;
    first_name: string;
    last_name: string;
  };
  restaurant?: {
    id: string;
    name: string;
    slug: string;
    role: string;
  };
}

// =======================================================================
// TYPES D'AUTHENTIFICATION
// =======================================================================

export interface TokenPayload {
  userId: string;
  email: string;
  is_super_admin?: boolean;
  restaurant_id?: string;
  role?: string;
}

export interface User {
  id: string;
  email?: string; // optionnel pour les livreurs
  restaurant_id: string;
  role: string;
  is_super_admin?: boolean;
  userId?: string;
  delivery_person_id?: string; // pour les livreurs
}

export interface AuthenticatedRequest extends Request {
  user?: User;
}

export interface OrderItem {
  id?: string;
  order_id: string;
  menu_item_id?: string;
  name: string;
  price: number;
  quantity: number;
  options?: Record<string, any>;
  notes?: string;
  restaurant_id: string;
}

export interface Order {
  id: string;
  restaurant_id: string;
  order_number: string;
  table_id?: string;
  customer_name?: string;
  notes?: string;
  items: string; // JSON string of items
  total_amount: number;
  status: string;
  created_at: string;
  updated_at: string;
}
