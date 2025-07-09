import { useState } from 'react';
import { useRestaurantId } from './useRestaurantData';
import { apiClient } from '@/integrations/api/client';

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

export const useOrderForm = () => {
  const [loading, setLoading] = useState(false);
  const [orderData, setOrderData] = useState<OrderFormData>({
    customerName: '',
    tableId: '',
    notes: ''
  });
  const [items, setItems] = useState<OrderItem[]>([
    { name: '', quantity: 1, price: 0 }
  ]);
  const restaurantId = useRestaurantId();

  const getTotalAmount = () => {
    // Calculer le total en FCFA
    return items.reduce((total, item) => total + (item.quantity * item.price), 0);
  };

  const submitOrder = async (onSuccess: () => void) => {
    if (!restaurantId) {
      alert('Restaurant ID manquant');
      return;
    }

    setLoading(true);

    try {
      const totalAmount = getTotalAmount();
      const filteredItems = items.filter(item => item.name.trim() !== '');

      console.log('=== DONNÉES DE LA COMMANDE ===');
      console.log('Restaurant ID:', restaurantId);
      console.log('Items bruts:', items);
      console.log('Items filtrés:', filteredItems);
      console.log('Total Amount:', totalAmount);
      console.log('Order Data:', orderData);

      // Adapter la structure pour active_orders
      const orderPayload = {
        restaurant_id: restaurantId,
        order_number: `ORD-${Date.now()}`,
        table_id: orderData.tableId || null,
        customer_name: orderData.customerName,
        notes: orderData.notes || '',
        items: JSON.stringify(filteredItems.map(item => ({
          name: item.name,
          price: item.price, // Prix en FCFA
          quantity: item.quantity
        }))),
        total_amount: totalAmount, // Prix en FCFA
        status: 'pending',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      console.log('=== PAYLOAD FINAL ===');
      console.log(JSON.stringify(orderPayload, null, 2));

      const response = await apiClient.post('/active-orders', orderPayload);

      if (!response.success) {
        throw new Error(response.error || 'Erreur lors de la création de la commande');
      }

      onSuccess();
    } catch (error) {
      console.error('Erreur lors de la création de la commande:', error);
      alert('Erreur lors de la création de la commande');
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    orderData,
    setOrderData,
    items,
    setItems,
    getTotalAmount,
    submitOrder
  };
};
