import { InventoryItem } from '@/hooks/useInventory';
import { InventoryFilters, InventoryStats } from '@/types/inventory';

export const filterInventoryItems = (
  items: InventoryItem[], 
  filters: InventoryFilters
): InventoryItem[] => {
  return items.filter(item => {
    const matchesSearch = item.item_name.toLowerCase().includes(filters.searchTerm.toLowerCase());
    let matchesStatus = true;
    
    if (filters.statusFilter === 'low') {
      matchesStatus = item.current_stock > 0 && item.current_stock <= item.min_stock;
    } else if (filters.statusFilter === 'out') {
      matchesStatus = item.current_stock <= 0;
    } else if (filters.statusFilter === 'normal') {
      matchesStatus = item.current_stock > item.min_stock;
    }
    
    return matchesSearch && matchesStatus;
  });
};

export const calculateInventoryStats = (items: InventoryItem[]): InventoryStats => {
  return {
    totalItems: items.length,
    lowStockItems: items.filter(item => item.current_stock > 0 && item.current_stock <= item.min_stock).length,
    outOfStockItems: items.filter(item => item.current_stock <= 0).length,
    totalValue: items.reduce((sum, item) => sum + (item.current_stock * item.cost_per_unit), 0)
  };
};
