
import React, { useState } from 'react';
import { usePermissions } from '@/hooks/usePermissions';
import { useInventory } from '@/hooks/useInventory';
import { InventoryFilters as FiltersType } from '@/types/inventory';
import { InventoryHeader } from './InventoryHeader';
import { InventoryTabs } from './InventoryTabs';
import { NewItemDialog } from './NewItemDialog';

export const InventoryContainer: React.FC = () => {
  const { canCreate } = usePermissions();
  const { inventory, loading, refreshInventory } = useInventory();
  const [filters, setFilters] = useState<FiltersType>({
    searchTerm: '',
    categoryFilter: 'all',
    statusFilter: 'all'
  });
  const [isNewItemDialogOpen, setIsNewItemDialogOpen] = useState(false);

  const handleNewItem = () => {
    if (canCreate()) {
      setIsNewItemDialogOpen(true);
    }
  };

  const handleItemSuccess = async () => {
    setIsNewItemDialogOpen(false);
    await refreshInventory();
  };

  const handleStockUpdate = async () => {
    await refreshInventory();
  };

  return (
    <div className="space-y-6">
      <InventoryHeader 
        itemCount={inventory.length}
        canCreate={canCreate()}
        onNewItem={handleNewItem}
      />

      <InventoryTabs
        inventory={inventory}
        loading={loading}
        filters={filters}
        onFiltersChange={setFilters}
        onStockUpdate={handleStockUpdate}
        canCreate={canCreate()}
        onNewItem={handleNewItem}
      />

      <NewItemDialog
        isOpen={isNewItemDialogOpen}
        onOpenChange={setIsNewItemDialogOpen}
        onSuccess={handleItemSuccess}
        onCancel={() => setIsNewItemDialogOpen(false)}
      />
    </div>
  );
};
