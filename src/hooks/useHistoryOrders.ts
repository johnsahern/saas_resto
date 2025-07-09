
import { useState, useEffect } from 'react';
import { fetchHistoryOrders, HistoryOrder } from '@/services/historyOrdersService';

export const useHistoryOrders = (selectedDate: Date) => {
  const [orders, setOrders] = useState<HistoryOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchOrders = async (date: Date) => {
    try {
      setLoading(true);
      setError(null);
      
      // Effacer immédiatement les données précédentes
      setOrders([]);
      
      // Formatage de la date en utilisant la timezone locale
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      const dateStr = `${year}-${month}-${day}`;
      
      console.log('Fetching orders for date:', dateStr, 'from date object:', date);
      
      const ordersData = await fetchHistoryOrders(dateStr);
      
      // Vérifier si la date sélectionnée n'a pas changé pendant la requête
      const currentDateStr = `${selectedDate.getFullYear()}-${String(selectedDate.getMonth() + 1).padStart(2, '0')}-${String(selectedDate.getDate()).padStart(2, '0')}`;
      
      if (dateStr === currentDateStr) {
        setOrders(ordersData);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors du chargement des commandes');
      console.error('Error fetching history orders:', err);
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Effacer immédiatement les données quand la date change
    setOrders([]);
    setError(null);
    
    fetchOrders(selectedDate);
  }, [selectedDate.getFullYear(), selectedDate.getMonth(), selectedDate.getDate()]);

  const refreshOrders = () => {
    fetchOrders(selectedDate);
  };

  return { orders, loading, error, refreshOrders };
};
