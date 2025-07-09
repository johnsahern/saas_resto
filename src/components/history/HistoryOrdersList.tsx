import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Clock, User, Hash, MapPin } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { HistoryOrder } from '@/services/historyOrdersService';

interface HistoryOrdersListProps {
  orders: HistoryOrder[];
  loading: boolean;
}

export const HistoryOrdersList: React.FC<HistoryOrdersListProps> = ({ orders, loading }) => {
  const formatCurrency = (amount: number) => {
    return `${amount.toFixed(0)} FCFA`;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'preparing':
        return 'bg-blue-100 text-blue-800';
      case 'ready':
        return 'bg-green-100 text-green-800';
      case 'served':
        return 'bg-emerald-100 text-emerald-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'pending':
        return 'En attente';
      case 'preparing':
        return 'En préparation';
      case 'ready':
        return 'Prêt';
      case 'served':
        return 'Servi';
      case 'cancelled':
        return 'Annulé';
      default:
        return status;
    }
  };

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

  if (orders.length === 0) {
    return (
      <Card className="bg-white border-emerald-100">
        <CardContent className="p-12 text-center">
          <Clock className="w-12 h-12 text-emerald-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-emerald-600 mb-2">Aucune commande</h3>
          <p className="text-emerald-500">Aucune commande trouvée pour cette date.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {orders.map((order) => {
        const items = Array.isArray(order.items) ? order.items : (typeof order.items === 'string' ? JSON.parse(order.items) : []);
        return (
          <Card key={order.id} className="border-emerald-100 hover:border-emerald-300 transition-colors">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <Hash className="w-4 h-4 text-emerald-600" />
                    <span className="font-bold text-emerald-800">{order.order_number}</span>
                  </div>
                  {order.customer_name && (
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4 text-emerald-600" />
                      <span className="text-emerald-700">{order.customer_name}</span>
                    </div>
                  )}
                  {order.table_id && (
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-emerald-600" />
                      <span className="text-emerald-700">Table {order.table_id}</span>
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-4">
                  <Badge className={getStatusColor(order.status)}>
                    {getStatusLabel(order.status)}
                  </Badge>
                  <Badge className="bg-emerald-100 text-emerald-800">
                    {order.source === 'active' ? 'En cours' : 'Facturé'}
                  </Badge>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm text-emerald-600">
                  <Clock className="w-4 h-4" />
                  <span>{format(new Date(order.created_at), 'HH:mm', { locale: fr })}</span>
                </div>
                <div className="text-right">
                  <p className="text-xl font-bold text-emerald-800">
                    {formatCurrency(order.total_amount)}
                  </p>
                  <p className="text-sm text-emerald-600">
                    {items.length} article{items.length > 1 ? 's' : ''}
                  </p>
                </div>
              </div>

              {/* Détails des articles */}
              {items.length > 0 && (
                <div className="mt-4 border-t border-emerald-100 pt-4 space-y-2">
                  {items.map((item: any, idx: number) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between text-sm text-emerald-700"
                    >
                      <span className="truncate pr-2 flex-1">
                        {item.name || item.item_name}
                      </span>
                      <span className="mx-2">x{item.quantity}</span>
                      <span className="font-medium">
                        {((item.price || item.unit_price) * item.quantity)?.toFixed(0)} FCFA
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};
