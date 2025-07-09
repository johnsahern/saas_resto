import { apiClient } from '@/integrations/api/client';

export interface HistoryStockMovement {
  id: string;
  type: 'addition' | 'withdrawal';
  item_name: string;
  quantity: number;
  date: string;
  time?: string;
  notes?: string;
  created_by?: string;
}

export const fetchHistoryStockMovements = async (dateStr: string): Promise<HistoryStockMovement[]> => {
  const response = await apiClient.get(`/history/stock-movements?date=${dateStr}`);
  if (response.error) throw new Error(response.error);
  const stockMovements = response.data || [];
  return stockMovements;
};
