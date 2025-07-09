import { apiClient } from '@/integrations/api/client';

export interface HistoryOrder {
  id: string;
  order_number: string;
  customer_name: string | null;
  table_id: string | null;
  items: any[];
  total_amount: number;
  status: string;
  created_at: string;
  source: 'active' | 'billing';
}

export const fetchHistoryOrders = async (dateStr: string): Promise<HistoryOrder[]> => {
  const response = await apiClient.get(`/history/orders?date=${dateStr}`);
  if (response.error) throw new Error(response.error);
  const orders = response.data || [];
  return orders;
};
