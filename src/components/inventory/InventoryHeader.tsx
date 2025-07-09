
import React from 'react';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

interface InventoryHeaderProps {
  itemCount: number;
  canCreate: boolean;
  onNewItem: () => void;
}

export const InventoryHeader: React.FC<InventoryHeaderProps> = ({
  itemCount,
  canCreate,
  onNewItem
}) => {
  return (
    <div className="flex items-center justify-between">
      <div>
        <h2 className="text-3xl font-bold bg-gradient-to-r from-emerald-600 to-green-600 bg-clip-text text-transparent">
          Gestion des stocks
        </h2>
        <p className="text-emerald-600">Suivi et gestion complète de l'inventaire ({itemCount} articles)</p>
      </div>
      {canCreate && (
        <Button 
          className="bg-emerald-600 hover:bg-emerald-700"
          onClick={onNewItem}
        >
          <Plus className="w-4 h-4 mr-2" />
          Ajouter un article
        </Button>
      )}
    </div>
  );
};
