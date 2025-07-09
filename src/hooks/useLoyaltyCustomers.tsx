
import { useState, useEffect } from 'react';
import { loyaltyCustomersService } from '@/services/loyaltyCustomersService';
import { useLoyaltyCustomerOperations } from '@/hooks/useLoyaltyCustomerOperations';
import { LoyaltyCustomer } from '@/types/loyaltyCustomers';

export const useLoyaltyCustomers = () => {
  const [customers, setCustomers] = useState<LoyaltyCustomer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCustomers = async () => {
    try {
      const data = await loyaltyCustomersService.fetchCustomers();
      setCustomers(data);
    } catch (err) {
      console.error('Error:', err);
      setError(err instanceof Error ? err.message : 'Error fetching customers');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  const operations = useLoyaltyCustomerOperations(customers, setCustomers);

  return {
    customers,
    loading,
    error,
    ...operations,
    refetch: fetchCustomers
  };
};

export type { LoyaltyCustomer } from '@/types/loyaltyCustomers';
