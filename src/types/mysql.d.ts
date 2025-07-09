import { RowDataPacket, ResultSetHeader, OkPacket } from 'mysql2/promise';

export interface QueryResult<T extends RowDataPacket> {
  rows: T[];
  fields?: ResultSetHeader[];
}

export interface User extends RowDataPacket {
  id: string;
  name: string;
  email: string;
  password: string;
  role: 'owner' | 'manager';
  is_active: boolean;
  is_super_admin: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface Restaurant extends RowDataPacket {
  id: string;
  name: string;
  slug: string;
  owner_id: string;
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
  role?: 'owner' | 'manager';
}

export interface RestaurantManager extends RowDataPacket {
  id: string;
  user_id: string;
  restaurant_id: string;
  restaurant_code: string;
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
  name?: string;  // Joined from restaurants table
  slug?: string;  // Joined from restaurants table
}

export interface JWTPayload {
  userId: string;
  role: string;
  restaurantId: string;
} 