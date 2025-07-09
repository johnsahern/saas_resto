
export interface InventoryStats {
  totalItems: number;
  lowStockItems: number;
  outOfStockItems: number;
  totalValue: number;
}

export interface InventoryFilters {
  searchTerm: string;
  categoryFilter: string;
  statusFilter: string;
}
