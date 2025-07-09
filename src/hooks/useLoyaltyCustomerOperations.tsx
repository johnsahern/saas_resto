
import { useState } from 'react';
import { loyaltyCustomersService } from '@/services/loyaltyCustomersService';
import { LoyaltyCustomer, AddCustomerData, UpdateCustomerData, LoyaltyCustomerOperationResult, LoyaltyPointsOperationResult } from '@/types/loyaltyCustomers';

export const useLoyaltyCustomerOperations = (
  customers: LoyaltyCustomer[],
  setCustomers: (customers: LoyaltyCustomer[]) => void
) => {
  const addCustomer = async (customer: AddCustomerData): Promise<LoyaltyCustomerOperationResult> => {
    try {
      const data = await loyaltyCustomersService.addCustomer(customer);
      setCustomers([...customers, data]);
      return { success: true, data };
    } catch (error) {
      console.error('Error adding customer:', error);
      return { success: false, error };
    }
  };

  const updateCustomer = async (id: string, updates: UpdateCustomerData): Promise<LoyaltyCustomerOperationResult> => {
    try {
      const data = await loyaltyCustomersService.updateCustomer(id, updates);
      setCustomers(customers.map(c => c.id === id ? data : c));
      return { success: true, data };
    } catch (error) {
      console.error('Error updating customer:', error);
      return { success: false, error };
    }
  };

  const addPoints = async (customerId: string, points: number, source: string = 'order'): Promise<LoyaltyPointsOperationResult> => {
    try {
      await loyaltyCustomersService.addPoints(customerId, points, source);
      
      // Update local state
      setCustomers(customers.map(c => 
        c.id === customerId 
          ? { ...c, points: c.points + points, last_visit: new Date().toISOString() }
          : c
      ));

      return { success: true };
    } catch (error) {
      console.error('Error adding points:', error);
      return { success: false, error };
    }
  };

  const redeemPoints = async (customerId: string, points: number, rewardName: string): Promise<LoyaltyPointsOperationResult> => {
    try {
      await loyaltyCustomersService.redeemPoints(customerId, points, rewardName);
      
      // Update local state
      setCustomers(customers.map(c => 
        c.id === customerId ? { ...c, points: c.points - points } : c
      ));

      return { success: true };
    } catch (error) {
      console.error('Error redeeming points:', error);
      return { success: false, error };
    }
  };

  const findCustomerByPhone = (phone: string) => {
    return customers.find(c => c.phone === phone);
  };

  return {
    addCustomer,
    updateCustomer,
    addPoints,
    redeemPoints,
    findCustomerByPhone
  };
};
