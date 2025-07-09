import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Package, Edit2, Building2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { InventoryItem as InventoryItemType } from '@/hooks/useInventory';
import { StockActions } from './StockActions';

interface InventoryItemProps {
  item: InventoryItemType;
  canModify: boolean;
  onUpdate?: () => void;
  onEdit?: (item: InventoryItemType) => void;
}

export const InventoryItem: React.FC<InventoryItemProps> = ({ 
  item, 
  canModify, 
  onUpdate = () => {},
  onEdit
}) => {
  const isLowStock = item.current_stock <= item.min_stock;
  const isOutOfStock = item.current_stock === 0;

  const formatCurrency = (amount: number) => {
    return `${amount.toFixed(0)} FCFA`;
  };

  return (
    <Card className="bg-white border-emerald-100 hover:border-emerald-300 transition-colors">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className={`p-3 rounded-full ${
              isOutOfStock ? 'bg-red-500' : 
              isLowStock ? 'bg-yellow-500' : 
              'bg-green-500'
            }`}>
              <Package className="w-5 h-5 text-white" />
            </div>
            
            <div className="flex-1">
              <h3 className="font-bold text-lg text-emerald-800">{item.item_name}</h3>
              <div className="flex items-center gap-4 mt-2">
                <p className="text-sm text-emerald-600">
                  Stock: <span className="font-semibold">{item.current_stock} {item.unit}</span>
                </p>
                <p className="text-sm text-emerald-600">
                  Min: <span className="font-semibold">{item.min_stock} {item.unit}</span>
                </p>
              </div>
              <div className="flex items-center gap-4 mt-1">
                <p className="text-sm text-emerald-500">
                  Coût unitaire: <span className="font-semibold">{formatCurrency(item.cost_per_unit)}</span>
                </p>
                {item.supplier_name && (
                  <div className="flex items-center gap-1 text-sm text-emerald-700 bg-emerald-50 px-2 py-1 rounded-full">
                    <Building2 className="w-3 h-3" />
                    <span className="font-medium">{item.supplier_name}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="flex flex-col items-end gap-3">
            <div className="text-right">
              <p className="text-xl font-bold text-emerald-800">
                {formatCurrency(item.current_stock * item.cost_per_unit)}
              </p>
              <Badge className={cn(
                "text-white font-medium", 
                isOutOfStock ? "bg-red-500" : 
                isLowStock ? "bg-yellow-500" : 
                "bg-green-500"
              )}>
                {isOutOfStock ? 'Rupture de stock' : 
                 isLowStock ? 'Stock faible' : 
                 'Stock normal'}
              </Badge>
            </div>

            {canModify && (
              <div className="flex items-center gap-2">
                <StockActions
                  itemId={item.id}
                  itemName={item.item_name}
                  currentStock={item.current_stock}
                  onStockUpdate={onUpdate}
                />
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="border-emerald-500 text-emerald-600 hover:bg-emerald-50"
                  onClick={() => onEdit && onEdit(item)}
                >
                  <Edit2 className="w-4 h-4" />
                </Button>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
