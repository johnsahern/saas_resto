
import { useMemo } from 'react';

interface OrderItem {
  name: string;
  quantity: number;
  price: number;
}

interface OrderFormData {
  customerName: string;
  tableId: string;
  notes: string;
}

interface UseOrderFormValidationProps {
  orderData: OrderFormData;
  items: OrderItem[];
}

export const useOrderFormValidation = ({ orderData, items }: UseOrderFormValidationProps) => {
  const isFormValid = useMemo(() => {
    return orderData.customerName && items.some(item => item.name.trim() !== '');
  }, [orderData.customerName, items]);

  const getTotalAmount = useMemo(() => {
    return items.reduce((total, item) => total + (item.quantity * item.price), 0);
  }, [items]);

  return {
    isFormValid,
    getTotalAmount
  };
};
