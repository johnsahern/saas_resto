
import React from 'react';
import { Plus, Building2 } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { InventoryItem } from '@/hooks/useInventory';
import { InventoryFilters as FiltersType } from '@/types/inventory';
import { InventoryTabContent } from './InventoryTabContent';
import { SupplierManagement } from './SupplierManagement';

interface InventoryTabsProps {
  inventory: InventoryItem[];
  loading: boolean;
  filters: FiltersType;
  onFiltersChange: (filters: FiltersType) => void;
  onStockUpdate: () => void;
  canCreate: boolean;
  onNewItem: () => void;
}

export const InventoryTabs: React.FC<InventoryTabsProps> = ({
  inventory,
  loading,
  filters,
  onFiltersChange,
  onStockUpdate,
  canCreate,
  onNewItem
}) => {
  return (
    <Tabs defaultValue="inventory" className="space-y-6">
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="inventory" className="flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Inventaire
        </TabsTrigger>
        <TabsTrigger value="suppliers" className="flex items-center gap-2">
          <Building2 className="w-4 h-4" />
          Fournisseurs
        </TabsTrigger>
      </TabsList>

      <TabsContent value="inventory" className="space-y-6">
        <InventoryTabContent
          inventory={inventory}
          loading={loading}
          filters={filters}
          onFiltersChange={onFiltersChange}
          onStockUpdate={onStockUpdate}
          canCreate={canCreate}
          onNewItem={onNewItem}
        />
      </TabsContent>

      <TabsContent value="suppliers">
        <SupplierManagement />
      </TabsContent>
    </Tabs>
  );
};
