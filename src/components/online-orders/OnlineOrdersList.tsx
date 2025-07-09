import React, { useState, useMemo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Clock, Phone, MapPin, ChevronDown, ChevronUp, Package } from 'lucide-react';
import { OnlineOrder } from '@/hooks/useOnlineOrders';
import { useOrderItems } from '@/hooks/useOrderItems';
import { apiClient } from '@/integrations/api/client';
import { toast } from '@/components/ui/use-toast';
import { DeliveryAssignmentModal } from '@/components/online-orders/DeliveryAssignmentModal';


interface OnlineOrdersListProps {
  orders: OnlineOrder[];
}

const statusConfig = {
  pending: { label: 'En attente', color: 'bg-yellow-500' },
  preparing: { label: 'En préparation', color: 'bg-orange-500' },
  delivering: { label: 'En livraison', color: 'bg-blue-500' },
  delivered: { label: 'Livrée', color: 'bg-emerald-500' },
  canceled: { label: 'Annulée', color: 'bg-red-500' },
};

export const OnlineOrdersList: React.FC<OnlineOrdersListProps> = ({ orders }) => {
  const [expandedOrders, setExpandedOrders] = useState<Set<string>>(new Set());
  const [selectedOrder, setSelectedOrder] = useState<OnlineOrder | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const orderIds = useMemo(() => orders.map(order => order.id), [orders]);
  const { orderItems, loading: itemsLoading, getItemsForOrder } = useOrderItems(orderIds);

  const toggleExpanded = (orderId: string) => {
    const newExpanded = new Set(expandedOrders);
    if (newExpanded.has(orderId)) newExpanded.delete(orderId);
    else newExpanded.add(orderId);
    setExpandedOrders(newExpanded);
  };

  const handleOrderAction = async (order: OnlineOrder) => {
    console.log('Action sur commande', order.order_number, order.status);
    if (order.status === 'pending') {
      try {
        const response = await apiClient.patch(`/orders/${order.id}`, {
          status: 'preparing'
        });
        if (response.success) {
          toast({ title: 'Succès', description: `Commande #${order.order_number} passée en préparation` });
        } else {
          throw new Error(response.error);
        }
      } catch (error: any) {
        toast({ title: 'Erreur', description: error.message || 'Échec du passage en préparation', variant: 'destructive' });
      }
    } else if (order.status === 'preparing') {
      if (order.customer_address === 'À emporter' || !order.customer_address) {
        try {
          const response = await apiClient.patch(`/orders/${order.id}`, {
            status: 'delivering'
          });
          if (response.success) {
            toast({ title: 'Succès', description: `Commande #${order.order_number} passée en livraison` });
          } else {
            throw new Error(response.error);
          }
        } catch (error: any) {
          toast({ title: 'Erreur', description: error.message || 'Échec du passage en livraison', variant: 'destructive' });
        }
      } else {
        setSelectedOrder(order);
        setIsModalOpen(true);
      }
    }
  };

  const handleMarkAsDelivered = async (order: OnlineOrder) => {
    try {
      const response = await apiClient.patch(`/orders/${order.id}`, {
        status: 'delivered'
      });
      if (response.success) {
        toast({ title: 'Succès', description: `Commande #${order.order_number} marquée comme livrée` });
      } else {
        throw new Error(response.error);
      }
    } catch (error: any) {
      toast({ title: 'Erreur', description: error.message || 'Échec du marquage comme livré', variant: 'destructive' });
    }
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setSelectedOrder(null);
  };

  const handleModalComplete = async (deliveryPartnerId: string) => {
    if (selectedOrder) {
      try {
        const response = await apiClient.patch(`/orders/${selectedOrder.id}`, {
          status: 'delivering',
          delivery_partner_id: deliveryPartnerId
        });
        if (response.success) {
          toast({ title: 'Succès', description: `Livreur assigné pour #${selectedOrder.order_number}` });
        } else {
          throw new Error(response.error);
        }
      } catch (error: any) {
        toast({ title: 'Erreur', description: error.message || 'Échec de l\'assignation', variant: 'destructive' });
      }
      handleModalClose();
    }
  };

  if (orders.length === 0) {
    return <div className="text-center py-8"><p className="text-slate-400">Aucune commande trouvée</p></div>;
  }

  return (
    <div className="space-y-4">
      {orders.map((order) => {
        const config = statusConfig[order.status as keyof typeof statusConfig] || statusConfig.pending;
        const orderDate = new Date(order.created_at);
        const isExpanded = expandedOrders.has(order.id);
        const items = getItemsForOrder(order.id);

        const buttonText = order.status === 'pending' ? 'Accepter' : order.status === 'preparing' ? 'Passer en livraison' : 'Marquer comme livré';
        const showButton = ['pending', 'preparing', 'delivering'].includes(order.status); // Explicit list

        return (
          <Card key={order.id} className="bg-slate-700/50 border-slate-600 hover:border-emerald-500/30 transition-colors">
            <CardContent className="p-4">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div>
                    <h3 className="font-semibold text-white">#{order.order_number}</h3>
                    <p className="text-sm text-slate-300">{order.customer_name}</p>
                    <p className="text-xs text-slate-400">Heure : {orderDate.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit'})}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge className={`${config.color} text-white`}>{config.label}</Badge>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => toggleExpanded(order.id)}
                    className="text-slate-400 hover:text-white p-1"
                  >
                    {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div className="flex items-center gap-2 text-slate-300">
                  <Phone className="w-4 h-4 text-emerald-400" />
                  <span>{order.customer_phone}</span>
                </div>
                {order.customer_address && (
                  <div className="flex items-center gap-2 text-slate-300">
                    <MapPin className="w-4 h-4 text-emerald-400" />
                    <span className="truncate">{order.customer_address}</span>
                  </div>
                )}
                <div className="flex items-center gap-2 text-slate-300">
                  <span className="text-emerald-400">FCFA</span>
                  <span>{order.total_amount.toLocaleString()} FCFA</span>
                </div>
              </div>

              {isExpanded && (
                <div className="mt-4 pt-4 border-t border-slate-600">
                  <div className="flex items-center gap-2 mb-3 text-white">
                    <Package className="w-4 h-4 text-emerald-400" />
                    <span className="font-medium">Articles commandés</span>
                  </div>
                  {order.notes && (
                    <div className="mb-3 p-2 bg-slate-800/60 rounded text-emerald-300">
                      <span className="font-semibold">Note :</span> {order.notes}
                    </div>
                  )}
                  {items.length > 0 ? (
                    <div className="space-y-2">
                      {items.map((item) => (
                        <div key={item.id} className="flex items-center justify-between bg-slate-800/50 p-3 rounded-lg">
                          <div className="flex items-center gap-3">
                            <span className="text-slate-400">🍽️</span>
                            <div>
                              <p className="text-white font-medium">{item.name}</p>
                              <p className="text-sm text-slate-400">Quantité: {item.quantity}</p>
                              {item.options && Object.keys(item.options).length > 0 && (
                                <p className="text-xs text-slate-500">Options: {JSON.stringify(item.options)}</p>
                              )}
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-white font-medium">{item.price.toLocaleString()} FCFA</p>
                            <p className="text-xs text-slate-400">Total: {(item.price * item.quantity).toLocaleString()} FCFA</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-slate-400">Aucun article pour cette commande.</div>
                  )}
                </div>
              )}

              <div className="flex items-center justify-between mt-4 pt-3 border-t border-slate-600">
                <div className="flex items-center gap-2 text-xs text-slate-400">
                  <Clock className="w-3 h-3" />
                  <span>Commandé: {orderDate.toLocaleString('fr-FR')}</span>
                </div>
                <div className="flex items-center gap-2">
                  {showButton && (
                    <Button
                      onClick={() => order.status === 'delivering' ? handleMarkAsDelivered(order) : handleOrderAction(order)}
                      className="bg-emerald-500 hover:bg-emerald-600 text-white"
                    >
                      {buttonText}
                    </Button>
                  )}
                  {order.estimated_delivery_time && (
                    <div className="text-xs text-slate-400">
                      <span>Livraison prévue: {new Date(order.estimated_delivery_time).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit'})}</span>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}

      {selectedOrder && (
        <DeliveryAssignmentModal
          orderId={selectedOrder.id}
          orderNumber={selectedOrder.order_number}
          customerAddress={selectedOrder.customer_address || ''}
          isOpen={isModalOpen}
          onClose={handleModalClose}
          onComplete={handleModalComplete}
        />
      )}
    </div>
  );
};