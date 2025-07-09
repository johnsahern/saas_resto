
import { useHistoryOrders } from './useHistoryOrders';
import { useHistoryStockMovements } from './useHistoryStockMovements';

// Re-export types for backward compatibility
export type { HistoryOrder } from '@/services/historyOrdersService';
export type { HistoryStockMovement } from '@/services/historyStockService';

export const useHistoryData = (selectedDate: Date) => {
  const { 
    orders, 
    loading: ordersLoading, 
    error: ordersError, 
    refreshOrders 
  } = useHistoryOrders(selectedDate);
  
  const { 
    stockMovements, 
    loading: stockLoading, 
    error: stockError, 
    refreshStockMovements 
  } = useHistoryStockMovements(selectedDate);

  const loading = ordersLoading || stockLoading;
  const error = ordersError || stockError;

  const refreshData = () => {
    refreshOrders();
    refreshStockMovements();
  };

  return { orders, stockMovements, loading, error, refreshData };
};
