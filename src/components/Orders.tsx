import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useActiveOrders, ActiveOrder } from '@/hooks/useRestaurantData';
import { useOrderActions } from '@/hooks/useOrderActions';
import { NewOrderForm } from './forms/NewOrderForm';
import { MenuManagementForm } from './forms/MenuManagementForm';
import { useToast } from '@/hooks/use-toast';
import { OrdersHeader } from './orders/OrdersHeader';
import { OrdersActions } from './orders/OrdersActions';
import { OrdersContent } from './orders/OrdersContent';

export const Orders: React.FC = () => {
  const { orders, loading } = useActiveOrders();
  const { updateOrderStatus, cancelOrder, getNextStatus, getStatusLabel } = useOrderActions();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [isNewOrderDialogOpen, setIsNewOrderDialogOpen] = useState(false);
  const [isMenuDialogOpen, setIsMenuDialogOpen] = useState(false);

  const filteredOrders = orders.filter(order => {
    const matchesSearch = order.order_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (order.customer_name || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleNewOrder = () => {
    setIsNewOrderDialogOpen(true);
  };

  const handleMenuManagement = () => {
    setIsMenuDialogOpen(true);
  };

  const handleOrderSuccess = () => {
    setIsNewOrderDialogOpen(false);
    // Le hook useActiveOrders se mettra à jour en temps réel – pas besoin de recharger.
  };

  const navigateToBilling = () => {
    const event = new CustomEvent('navigate', { detail: 'billing' });
    window.dispatchEvent(event);
  };

  const handleStatusClick = async (order: ActiveOrder) => {
    if (order.status === 'served' || order.status === 'cancelled') {
      return;
    }

    console.log('Handling status click for order:', order.order_number, 'current status:', order.status);

    const result = await updateOrderStatus(order.id, order.status);
    if (result.success) {
      if (result.isCompleted) {
        toast({
          title: "Commande terminée",
          description: `La commande ${order.order_number} a été marquée comme servie et transférée vers la facturation.`,
          duration: 3000,
        });
        
        setTimeout(() => {
          navigateToBilling();
        }, 1500);
      } else {
        toast({
          title: "Statut mis à jour",
          description: `La commande ${order.order_number} est maintenant ${getStatusLabel(getNextStatus(order.status)).toLowerCase()}.`,
          duration: 2000,
        });
      }
      
      // L'UI se rafraîchira via la subscription real-time.
    } else {
      toast({
        title: "Erreur",
        description: "Impossible de mettre à jour le statut de la commande.",
        variant: "destructive",
        duration: 3000,
      });
    }
  };

  const handleCancelOrder = async (orderId: string) => {
    console.log('Handling cancel for order:', orderId);
    
    const success = await cancelOrder(orderId);
    if (success) {
      toast({
        title: "Commande annulée",
        description: "La commande a été annulée avec succès.",
        duration: 2000,
      });
      // L'UI se rafraîchira via la subscription real-time.
    } else {
      toast({
        title: "Erreur",
        description: "Impossible d'annuler la commande.",
        variant: "destructive",
        duration: 3000,
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <OrdersHeader ordersCount={orders.length} />
        <OrdersActions 
          onNewOrder={handleNewOrder}
          onMenuManagement={handleMenuManagement}
        />
      </div>

      <OrdersContent
        orders={orders}
        filteredOrders={filteredOrders}
        loading={loading}
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        statusFilter={statusFilter}
        setStatusFilter={setStatusFilter}
        onStatusClick={handleStatusClick}
        onCancelOrder={handleCancelOrder}
        getNextStatusLabel={(status) => getStatusLabel(getNextStatus(status))}
      />

      <Dialog open={isNewOrderDialogOpen} onOpenChange={setIsNewOrderDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Nouvelle Commande</DialogTitle>
          </DialogHeader>
          <NewOrderForm 
            onSuccess={handleOrderSuccess}
            onCancel={() => setIsNewOrderDialogOpen(false)}
          />
        </DialogContent>
      </Dialog>

      <Dialog open={isMenuDialogOpen} onOpenChange={setIsMenuDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Gestion du Menu</DialogTitle>
          </DialogHeader>
          <MenuManagementForm />
        </DialogContent>
      </Dialog>
    </div>
  );
};
