import React from 'react';
import { usePermissions } from '@/hooks/usePermissions';
import { InventoryItem } from '@/hooks/useInventory';
import { InventoryFilters as FiltersType } from '@/types/inventory';
import { InventoryStats } from './InventoryStats';
import { InventoryFilters } from './InventoryFilters';
import { InventoryItem as InventoryItemComponent } from './InventoryItem';
import { InventoryEmptyState } from './InventoryEmptyState';
import { InventoryLoading } from './InventoryLoading';
import { filterInventoryItems, calculateInventoryStats } from '@/utils/inventoryUtils';
import { NewInventoryItemForm } from '../forms/NewInventoryItemForm';
import { Dialog, DialogContent } from '@/components/ui/dialog';

interface InventoryTabContentProps {
  inventory: InventoryItem[];
  loading: boolean;
  filters: FiltersType;
  onFiltersChange: (filters: FiltersType) => void;
  onStockUpdate: () => void;
  canCreate: boolean;
  onNewItem: () => void;
}

export const InventoryTabContent: React.FC<InventoryTabContentProps> = ({
  inventory,
  loading,
  filters,
  onFiltersChange,
  onStockUpdate,
  canCreate,
  onNewItem
}) => {
  const { canModify } = usePermissions();
  const filteredItems = filterInventoryItems(inventory, filters);
  const stats = calculateInventoryStats(inventory);

  const [editItem, setEditItem] = React.useState(null);
  const [editOpen, setEditOpen] = React.useState(false);

  const handleEdit = (item) => {
    setEditItem(item);
    setEditOpen(true);
  };

  const handleEditSuccess = () => {
    setEditOpen(false);
    setEditItem(null);
    onStockUpdate();
  };

  if (loading) {
    return <InventoryLoading />;
  }

  return (
    <>
      <InventoryStats stats={stats} />
      <InventoryFilters filters={filters} onFiltersChange={onFiltersChange} />

      <div className="grid gap-4">
        {filteredItems.map((item) => (
          <InventoryItemComponent 
            key={item.id}
            item={item} 
            canModify={canModify()} 
            onUpdate={onStockUpdate}
            onEdit={handleEdit}
          />
        ))}
      </div>

      {filteredItems.length === 0 && !loading && (
        <InventoryEmptyState 
          totalItemsCount={inventory.length}
          canCreate={canCreate}
          onAddItem={onNewItem}
        />
      )}

      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent>
          {editItem && (
            <NewInventoryItemForm
              initialData={editItem}
              onSuccess={handleEditSuccess}
              onCancel={() => setEditOpen(false)}
            />
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};
