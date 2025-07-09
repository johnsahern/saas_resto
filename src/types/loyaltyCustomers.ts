
export interface LoyaltyCustomer {
  id: string;
  name: string;
  phone: string;
  email?: string;
  points: number;
  total_spent: number;
  restaurant_id?: string;
  created_at: string;
  last_visit?: string;
}

export interface AddCustomerData {
  name: string;
  phone: string;
  email?: string;
}

export interface UpdateCustomerData extends Partial<LoyaltyCustomer> {}

export interface LoyaltyCustomerOperationResult {
  success: boolean;
  data?: LoyaltyCustomer;
  error?: any;
}

export interface LoyaltyPointsOperationResult {
  success: boolean;
  error?: any;
}
