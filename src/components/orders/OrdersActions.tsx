
import React from 'react';
import { Button } from '@/components/ui/button';
import { Plus, Menu as MenuIcon } from 'lucide-react';
import { usePermissions } from '@/hooks/usePermissions';

interface OrdersActionsProps {
  onNewOrder: () => void;
  onMenuManagement: () => void;
}

export const OrdersActions: React.FC<OrdersActionsProps> = ({
  onNewOrder,
  onMenuManagement
}) => {
  const { canCreate } = usePermissions();

  return (
    <div className="flex gap-2">
      <Button 
        variant="outline"
        className="border-emerald-500 text-emerald-600 hover:bg-emerald-50"
        onClick={onMenuManagement}
      >
        <MenuIcon className="w-4 h-4 mr-2" />
        Gérer le menu
      </Button>
      {canCreate() && (
        <Button 
          className="bg-emerald-600 hover:bg-emerald-700"
          onClick={onNewOrder}
        >
          <Plus className="w-4 h-4 mr-2" />
          Nouvelle commande
        </Button>
      )}
    </div>
  );
};
