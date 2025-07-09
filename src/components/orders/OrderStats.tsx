
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Clock, CheckCircle, XCircle } from 'lucide-react';
import { ActiveOrder } from '@/hooks/useRestaurantData';
import { useOrderStatistics } from '@/hooks/useOrderStatistics';

const statusConfig = {
  pending: { label: 'En attente', color: 'bg-yellow-500', icon: Clock },
  preparing: { label: 'En préparation', color: 'bg-blue-500', icon: Clock },
  ready: { label: 'Prêt', color: 'bg-green-500', icon: CheckCircle },
  served: { label: 'Servi', color: 'bg-gray-500', icon: CheckCircle },
  cancelled: { label: 'Annulé', color: 'bg-red-500', icon: XCircle }
};

interface OrderStatsProps {
  orders: ActiveOrder[];
}

export const OrderStats: React.FC<OrderStatsProps> = ({ orders }) => {
  const { getStatusCount, loading } = useOrderStatistics();

  const getStatsWithServed = () => {
    return Object.keys(statusConfig).map(status => {
      let count: number;
      
      if (status === 'served') {
        // Use count from database view for served orders (from billing_orders)
        count = getStatusCount('served');
      } else {
        // Use count from active orders for other statuses
        count = orders.filter(order => order.status === status).length;
      }

      return {
        status,
        count,
        ...statusConfig[status as keyof typeof statusConfig]
      };
    });
  };

  if (loading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {Object.keys(statusConfig).map((status) => (
          <Card key={status} className="bg-white border-emerald-100">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-emerald-600">Chargement...</p>
                  <p className="text-2xl font-bold text-emerald-800">-</p>
                </div>
                <div className="animate-pulse p-2 rounded-full bg-gray-300">
                  <div className="w-4 h-4"></div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
      {getStatsWithServed().map(({ status, count, label, color, icon: Icon }) => (
        <Card key={status} className="bg-white border-emerald-100">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-emerald-600">{label}</p>
                <p className="text-2xl font-bold text-emerald-800">{count}</p>
              </div>
              <div className={`p-2 rounded-full ${color}`}>
                <Icon className="w-4 h-4 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
