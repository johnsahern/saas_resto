
import React from 'react';
import { StockAddDialog } from './StockAddDialog';
import { StockRemoveDialog } from './StockRemoveDialog';

interface StockActionsProps {
  itemId: string;
  itemName: string;
  currentStock: number;
  onStockUpdate: () => void;
}

export const StockActions: React.FC<StockActionsProps> = ({ 
  itemId, 
  itemName, 
  currentStock, 
  onStockUpdate 
}) => {
  return (
    <div className="flex gap-2">
      <StockAddDialog
        itemId={itemId}
        itemName={itemName}
        currentStock={currentStock}
        onStockUpdate={onStockUpdate}
      />
      <StockRemoveDialog
        itemId={itemId}
        itemName={itemName}
        currentStock={currentStock}
        onStockUpdate={onStockUpdate}
      />
    </div>
  );
};
