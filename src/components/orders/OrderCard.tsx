import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Eye, Edit2, X } from 'lucide-react';
import { Clock, CheckCircle, XCircle } from 'lucide-react';
import { ActiveOrder } from '@/hooks/useRestaurantData';
import { usePermissions } from '@/hooks/usePermissions';
import { OrderStatusBadge } from './OrderStatusBadge';
import { OrderDetailsDialog } from './OrderDetailsDialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

const statusConfig = {
  pending: { label: 'En attente', color: 'bg-yellow-500', icon: Clock },
  preparing: { label: 'En préparation', color: 'bg-blue-500', icon: Clock },
  ready: { label: 'Prêt', color: 'bg-green-500', icon: CheckCircle },
  served: { label: 'Servi', color: 'bg-gray-500', icon: CheckCircle },
  cancelled: { label: 'Annulé', color: 'bg-red-500', icon: XCircle }
};

interface OrderCardProps {
  order: ActiveOrder;
  onStatusClick: (order: ActiveOrder) => void;
  onCancelOrder: (orderId: string) => void;
  getNextStatusLabel: (status: string) => string;
}

export const OrderCard: React.FC<OrderCardProps> = ({ 
  order, 
  onStatusClick, 
  onCancelOrder,
  getNextStatusLabel 
}) => {
  const { canModify } = usePermissions();
  const config = statusConfig[order.status];
  const Icon = config.icon;

  return (
    <Card className="bg-white border-emerald-100 hover:border-emerald-300 transition-colors">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className={`p-2 rounded-full ${config.color}`}>
              <Icon className="w-4 h-4 text-white" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="font-bold text-emerald-800">{order.order_number}</h3>
                {order.table_id && (
                  <Badge variant="outline" className="border-emerald-500 text-emerald-600">
                    Table {order.table_id}
                  </Badge>
                )}
              </div>
              <p className="text-sm text-emerald-600">{order.customer_name || 'Client'}</p>
              <p className="text-xs text-emerald-500">
                {new Date(order.created_at).toLocaleString('fr-FR')}
              </p>
            </div>
          </div>

          <div className="text-right">
            <p className="text-lg font-bold text-emerald-800">{Number(order.total_amount || 0).toFixed(0)} FCFA</p>
            <OrderStatusBadge
              status={order.status}
              onClick={() => onStatusClick(order)}
              nextStatusLabel={getNextStatusLabel(order.status)}
            />
          </div>

          <div className="flex space-x-2">
            <OrderDetailsDialog order={order} />

            {canModify() && order.status !== 'served' && order.status !== 'cancelled' && (
              <>
                <Button variant="outline" size="sm" className="border-emerald-500 text-emerald-600">
                  <Edit2 className="w-4 h-4" />
                </Button>

                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="outline" size="sm" className="border-red-500 text-red-600 hover:bg-red-50">
                      <X className="w-4 h-4" />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Annuler la commande</AlertDialogTitle>
                      <AlertDialogDescription>
                        Êtes-vous sûr de vouloir annuler la commande {order.order_number} ? 
                        Cette action ne peut pas être annulée.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Retour</AlertDialogCancel>
                      <AlertDialogAction 
                        className="bg-red-600 hover:bg-red-700"
                        onClick={() => onCancelOrder(order.id)}
                      >
                        Annuler la commande
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
