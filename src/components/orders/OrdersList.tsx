
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Clock } from 'lucide-react';
import { ActiveOrder } from '@/hooks/useRestaurantData';
import { OrderCard } from './OrderCard';

interface OrdersListProps {
  orders: ActiveOrder[];
  filteredOrders: ActiveOrder[];
  loading: boolean;
  onStatusClick: (order: ActiveOrder) => void;
  onCancelOrder: (orderId: string) => void;
  getNextStatusLabel: (status: string) => string;
}

export const OrdersList: React.FC<OrdersListProps> = ({
  orders,
  filteredOrders,
  loading,
  onStatusClick,
  onCancelOrder,
  getNextStatusLabel
}) => {
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500 mx-auto mb-4"></div>
          <p className="text-emerald-600">Chargement des commandes...</p>
        </div>
      </div>
    );
  }

  if (filteredOrders.length === 0) {
    return (
      <Card className="bg-white border-emerald-100">
        <CardContent className="p-12 text-center">
          <Clock className="w-12 h-12 text-emerald-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-emerald-600 mb-2">Aucune commande trouvée</h3>
          <p className="text-emerald-500">
            {orders.length === 0 ? 'Aucune commande en cours.' : 'Aucune commande ne correspond à vos critères de recherche.'}
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid gap-4">
      {filteredOrders.map((order) => (
        <OrderCard
          key={order.id}
          order={order}
          onStatusClick={onStatusClick}
          onCancelOrder={onCancelOrder}
          getNextStatusLabel={getNextStatusLabel}
        />
      ))}
    </div>
  );
};
