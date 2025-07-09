
import { useState, useEffect } from 'react';
import { fetchHistoryStockMovements, HistoryStockMovement } from '@/services/historyStockService';

export const useHistoryStockMovements = (selectedDate: Date) => {
  const [stockMovements, setStockMovements] = useState<HistoryStockMovement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStockMovements = async (date: Date) => {
    try {
      setLoading(true);
      setError(null);
      
      // Effacer immédiatement les données précédentes
      setStockMovements([]);
      
      // Formatage de la date en utilisant la timezone locale
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      const dateStr = `${year}-${month}-${day}`;
      
      console.log('Fetching stock movements for date:', dateStr, 'from date object:', date);
      
      const stockData = await fetchHistoryStockMovements(dateStr);
      
      // Vérifier si la date sélectionnée n'a pas changé pendant la requête
      const currentDateStr = `${selectedDate.getFullYear()}-${String(selectedDate.getMonth() + 1).padStart(2, '0')}-${String(selectedDate.getDate()).padStart(2, '0')}`;
      
      if (dateStr === currentDateStr) {
        setStockMovements(stockData);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors du chargement des mouvements de stock');
      console.error('Error fetching history stock movements:', err);
      setStockMovements([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Effacer immédiatement les données quand la date change
    setStockMovements([]);
    setError(null);
    
    fetchStockMovements(selectedDate);
  }, [selectedDate.getFullYear(), selectedDate.getMonth(), selectedDate.getDate()]);

  const refreshStockMovements = () => {
    fetchStockMovements(selectedDate);
  };

  return { stockMovements, loading, error, refreshStockMovements };
};
