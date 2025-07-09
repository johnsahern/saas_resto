import React from 'react';
import { Button } from '@/components/ui/button';
import { Eye } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { ActiveOrder } from '@/hooks/useRestaurantData';

interface OrderDetailsDialogProps {
  order: ActiveOrder;
}

export const OrderDetailsDialog: React.FC<OrderDetailsDialogProps> = ({ order }) => {
  // Correction TS : typage explicite de order.items
  const itemsRaw: unknown = order.items;
  let items: any[] = [];
  if (Array.isArray(itemsRaw)) {
    items = itemsRaw;
  } else if (typeof itemsRaw === 'string' && itemsRaw.trim().startsWith('[')) {
    try {
      items = JSON.parse(itemsRaw);
    } catch {
      items = [];
    }
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="border-emerald-500 text-emerald-600">
          <Eye className="w-4 h-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Détails de la commande {order.order_number}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-medium text-emerald-700">Client</p>
              <p className="text-emerald-600">{order.customer_name || 'Non spécifié'}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-emerald-700">Table</p>
              <p className="text-emerald-600">{order.table_id || 'Non assignée'}</p>
            </div>
          </div>
          
          <div>
            <p className="text-sm font-medium text-emerald-700 mb-2">Articles</p>
            <div className="space-y-2">
              {items.length > 0 ? (
                items.map((item: any, index: number) => (
                  <div key={index} className="flex justify-between items-center p-2 bg-emerald-50 rounded">
                    <span className="text-emerald-800">{item.quantity || 1}x {item.name || 'Article'}</span>
                    <span className="font-medium text-emerald-600">{((item.quantity || 1) * Number(item.price || 0)).toFixed(0)} FCFA</span>
                  </div>
                ))
              ) : (
                <p className="text-emerald-500 text-sm">Aucun article spécifié</p>
              )}
            </div>
          </div>

          {order.notes && (
            <div>
              <p className="text-sm font-medium text-emerald-700">Notes</p>
              <p className="text-emerald-600 text-sm">{order.notes}</p>
            </div>
          )}

          <div className="flex justify-between items-center pt-4 border-t border-emerald-200">
            <span className="text-lg font-bold text-emerald-800">Total</span>
            <span className="text-lg font-bold text-emerald-600">{order.total_amount.toFixed(0)} FCFA</span>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
