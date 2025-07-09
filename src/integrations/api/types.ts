// =======================================================================
// TYPES POUR L'API MYSQL
// =======================================================================

export interface Restaurant {
  id: string;
  name: string;
  slug: string;
  email: string;
  phone: string;
  address: string;
  description?: string;
  logo?: string;
  website?: string;
  whatsapp_number?: string;
  status: 'active' | 'suspended' | 'pending';
  subscription_plan: 'basic' | 'premium' | 'enterprise';
  subscription_expires_at?: string;
  created_at: string;
  updated_at: string;
}

export interface RestaurantUser {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  phone?: string;
  avatar?: string;
  role: 'owner' | 'admin' | 'manager' | 'employee' | 'waiter' | 'chef';
  restaurant_id?: string;
}

export interface RestaurantTable {
  id: string;
  restaurant_id: string;
  table_number: number;
  capacity: number;
  status: 'available' | 'occupied' | 'reserved' | 'maintenance';
  position_x?: number;
  position_y?: number;
  created_at: string;
  updated_at: string;
}

export interface MenuItem {
  id: string;
  restaurant_id: string;
  category_id?: string;
  name: string;
  description?: string;
  price: number;
  cost_price?: number;
  image?: string;
  is_available: boolean;
  allergens?: string[];
  ingredients?: string[];
  preparation_time: number;
  options?: any;
  created_at: string;
  updated_at: string;
}

export interface Order {
  id: string;
  restaurant_id: string;
  order_number: string;
  table_id?: string;
  customer_name?: string;
  customer_phone?: string;
  customer_address?: string;
  status: 'pending' | 'confirmed' | 'preparing' | 'ready' | 'served' | 'cancelled';
  type: 'dine-in' | 'takeaway' | 'delivery';
  total_amount: number;
  tax_amount: number;
  discount_amount: number;
  notes?: string;
  estimated_delivery_time?: string;
  actual_delivery_time?: string;
  created_by?: string;
  created_at: string;
  updated_at: string;
  items?: OrderItem[];
}

export interface OrderItem {
  id: string;
  order_id: string;
  menu_item_id?: string;
  name: string;
  price: number;
  quantity: number;
  options?: any;
  notes?: string;
  created_at: string;
}

export interface Reservation {
  id: string;
  restaurant_id: string;
  customer_name: string;
  customer_phone: string;
  customer_email?: string;
  reservation_date: string;
  reservation_time: string;
  party_size: number;
  table_id?: string;
  status: 'pending' | 'confirmed' | 'seated' | 'completed' | 'cancelled' | 'no-show';
  notes?: string;
  special_requests?: string;
  created_at: string;
  updated_at: string;
}

export interface StaffMember {
  id: string;
  restaurant_id: string;
  user_id?: string;
  employee_number: string;
  first_name: string;
  last_name: string;
  position: string;
  department?: string;
  phone?: string;
  email?: string;
  address?: string;
  hire_date: string;
  salary?: number;
  hourly_rate?: number;
  shift_type: 'morning' | 'afternoon' | 'evening' | 'night' | 'flexible';
  status: 'active' | 'inactive' | 'terminated';
  emergency_contact_name?: string;
  emergency_contact_phone?: string;
  avatar_url?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface InventoryItem {
  id: string;
  restaurant_id: string;
  item_name: string;
  category?: string;
  current_stock: number;
  minimum_stock: number;
  maximum_stock?: number;
  unit: string;
  cost_per_unit: number;
  supplier_id?: string;
  last_updated: string;
  created_at: string;
}

export interface LoyaltyCustomer {
  id: string;
  restaurant_id: string;
  name: string;
  phone: string;
  email?: string;
  points: number;
  total_spent: number;
  last_visit?: string;
  created_at: string;
  updated_at: string;
}

export interface AuthResponse {
  token: string;
  refresh_token: string;
  user: {
    id: string;
    email: string;
    first_name: string;
    last_name: string;
    avatar?: string;
  };
  restaurant?: {
    id: string;
    name: string;
    slug: string;
    role: string;
    permissions?: any;
  };
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}
