
import { LoyaltyCustomer, AddCustomerData, UpdateCustomerData } from '@/types/loyaltyCustomers';
import { apiClient } from '@/integrations/api/client';

export const loyaltyCustomersService = {
  async fetchCustomers(): Promise<LoyaltyCustomer[]> {
    console.log('Fetching loyalty customers (API local)...');
    const response = await apiClient.get('/loyalty-customers');
    if (!response.success) {
      console.error('Error fetching customers:', response.error);
      throw new Error(response.error || 'Erreur API');
    }
    return response.data || [];
  },

  async addCustomer(customer: AddCustomerData): Promise<LoyaltyCustomer> {
    console.log('Adding customer (API local):', customer);
    const response = await apiClient.post('/loyalty-customers', customer);
    if (!response.success) {
      console.error('Error adding customer:', response.error);
      throw new Error(response.error || 'Erreur API');
    }
    return response.data;
  },

  async updateCustomer(id: string, updates: UpdateCustomerData): Promise<LoyaltyCustomer> {
    console.log('Updating customer (API local):', id, updates);
    const response = await apiClient.put(`/loyalty-customers/${id}`, updates);
    if (!response.success) {
      console.error('Error updating customer:', response.error);
      throw new Error(response.error || 'Erreur API');
    }
    return response.data;
  },

  async addPoints(customerId: string, points: number, source: string = 'order'): Promise<void> {
    console.log('Adding points (API local):', customerId, points, source);
    const response = await apiClient.post(`/loyalty-customers/${customerId}/points`, {
      points,
      type: 'earned',
      source
    });
    if (!response.success) {
      console.error('Error adding points:', response.error);
      throw new Error(response.error || 'Erreur API');
    }
  },

  async redeemPoints(customerId: string, points: number, rewardName: string): Promise<void> {
    console.log('Redeeming points (API local):', customerId, points, rewardName);
    const response = await apiClient.post(`/loyalty-customers/${customerId}/points`, {
      points,
      type: 'redeemed',
      source: `reward_redemption: ${rewardName}`
    });
    if (!response.success) {
      console.error('Error redeeming points:', response.error);
      throw new Error(response.error || 'Erreur API');
    }
  }
};
