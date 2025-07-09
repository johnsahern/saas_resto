
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ActiveOrder } from '@/hooks/useRestaurantData';
import { OrderStats } from './OrderStats';
import { OrderFilters } from './OrderFilters';
import { OrdersList } from './OrdersList';
import { MenuManagementForm } from '../forms/MenuManagementForm';

interface OrdersContentProps {
  orders: ActiveOrder[];
  filteredOrders: ActiveOrder[];
  loading: boolean;
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  statusFilter: string;
  setStatusFilter: (status: string) => void;
  onStatusClick: (order: ActiveOrder) => void;
  onCancelOrder: (orderId: string) => void;
  getNextStatusLabel: (status: string) => string;
}

export const OrdersContent: React.FC<OrdersContentProps> = ({
  orders,
  filteredOrders,
  loading,
  searchTerm,
  setSearchTerm,
  statusFilter,
  setStatusFilter,
  onStatusClick,
  onCancelOrder,
  getNextStatusLabel
}) => {
  return (
    <Tabs defaultValue="orders" className="w-full">
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="orders">Commandes actives du jour</TabsTrigger>
        <TabsTrigger value="menu">Gestion du menu</TabsTrigger>
      </TabsList>
      
      <TabsContent value="orders" className="space-y-6">
        <OrderStats orders={orders} />

        <OrderFilters
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          statusFilter={statusFilter}
          setStatusFilter={setStatusFilter}
        />

        <OrdersList
          orders={orders}
          filteredOrders={filteredOrders}
          loading={loading}
          onStatusClick={onStatusClick}
          onCancelOrder={onCancelOrder}
          getNextStatusLabel={getNextStatusLabel}
        />
      </TabsContent>
      
      <TabsContent value="menu">
        <MenuManagementForm />
      </TabsContent>
    </Tabs>
  );
};
