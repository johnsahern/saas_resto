import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ShoppingCart, Clock, Calendar } from 'lucide-react';
import { useOnlineOrders } from '@/hooks/useOnlineOrders';
import { OnlineOrdersCalendar } from './online-orders/OnlineOrdersCalendar';
import { OnlineOrdersList } from './online-orders/OnlineOrdersList';
import { OnlineOrdersStats } from './online-orders/OnlineOrdersStats';
import { OnlineOrdersFilters } from './online-orders/OnlineOrdersFilters';
import { SelectedDateInfo } from './reservations/SelectedDateInfo';

export const OnlineOrders: React.FC = () => {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const { orders, loading, getOrdersByDate } = useOnlineOrders();

  // Filter orders for the selected date
  const selectedDateOrders = getOrdersByDate(selectedDate);

  // Apply additional filters
  const filteredOrders = selectedDateOrders.filter(order => {
    const matchesSearch = order.order_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         order.customer_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         order.customer_phone.includes(searchTerm);
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Calculate statistics for the selected date
  const totalOrders = selectedDateOrders.length;
  const pendingOrders = selectedDateOrders.filter(o => o.status === 'pending').length;
  const inProgressOrders = selectedDateOrders.filter(o => o.status === 'preparing' || o.status === 'delivering').length;
  const deliveredOrders = selectedDateOrders.filter(o => o.status === 'delivered').length;
  
  // Calculate total revenue for the selected date
  const totalRevenue = selectedDateOrders.reduce((sum, order) => sum + order.total_amount, 0);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-center min-h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500 mx-auto mb-4"></div>
            <p className="text-white">Chargement des commandes en ligne...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold bg-gradient-to-r from-emerald-600 to-green-600 bg-clip-text text-transparent">
            Commandes en ligne
          </h2>
          <p className="text-emerald-600">
            Gérez toutes vos commandes en ligne avec élégance
          </p>
        </div>
      </div>

      {/* Statistiques */}
      <OnlineOrdersStats
        totalOrders={totalOrders}
        pendingOrders={pendingOrders}
        inProgressOrders={inProgressOrders}
        deliveredOrders={deliveredOrders}
        totalRevenue={totalRevenue}
      />

      {/* Filtres */}
      <OnlineOrdersFilters
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        statusFilter={statusFilter}
        setStatusFilter={setStatusFilter}
      />

      {/* Contenu principal */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendrier */}
        <div className="lg:col-span-1">
          <Card className="bg-slate-800 border-slate-700 hover:border-emerald-500/30 transition-colors elegant-shadow">
            <CardHeader>
              <CardTitle className="text-white text-lg flex items-center gap-2">
                <Calendar className="w-5 h-5 text-emerald-500" />
                Calendrier
              </CardTitle>
            </CardHeader>
            <CardContent>
              <OnlineOrdersCalendar
                selectedDate={selectedDate}
                onDateSelect={setSelectedDate}
                orders={orders}
              />
              <SelectedDateInfo
                selectedDate={selectedDate}
                reservationCount={selectedDateOrders.length}
              />
            </CardContent>
          </Card>
        </div>

        {/* Liste des commandes */}
        <div className="lg:col-span-2">
          <Card className="bg-slate-800 border-slate-700 hover:border-emerald-500/30 transition-colors elegant-shadow">
            <CardHeader>
              <CardTitle className="text-white text-lg flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ShoppingCart className="w-5 h-5 text-emerald-500" />
                  Commandes du jour
                </div>
                <Badge variant="outline" className="border-emerald-500 text-emerald-400">
                  {filteredOrders.length} commandes
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {filteredOrders.length > 0 ? (
                <OnlineOrdersList orders={filteredOrders} />
              ) : (
                <div className="text-center py-12">
                  <ShoppingCart className="w-12 h-12 text-slate-600 mx-auto mb-4" />
                  <p className="text-slate-400 text-lg mb-2">Aucune commande pour cette date</p>
                  <p className="text-slate-500 text-sm">
                    Sélectionnez une autre date ou vérifiez vos filtres
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Onglets pour les statuts */}
      <Tabs defaultValue="all" className="w-full">
        <TabsList className="grid w-full grid-cols-6 bg-slate-800 border-slate-700">
          <TabsTrigger value="all" className="text-slate-400 data-[state=active]:text-emerald-400 data-[state=active]:bg-emerald-900/30">
            Toutes
          </TabsTrigger>
          <TabsTrigger value="pending" className="text-slate-400 data-[state=active]:text-yellow-400 data-[state=active]:bg-yellow-900/30">
            En attente
          </TabsTrigger>
          <TabsTrigger value="preparing" className="text-slate-400 data-[state=active]:text-orange-400 data-[state=active]:bg-orange-900/30">
            En préparation
          </TabsTrigger>
          <TabsTrigger value="delivering" className="text-slate-400 data-[state=active]:text-blue-400 data-[state=active]:bg-blue-900/30">
            En livraison
          </TabsTrigger>
          <TabsTrigger value="delivered" className="text-slate-400 data-[state=active]:text-emerald-400 data-[state=active]:bg-emerald-900/30">
            Livrées
          </TabsTrigger>
          <TabsTrigger value="canceled" className="text-slate-400 data-[state=active]:text-red-400 data-[state=active]:bg-red-900/30">
            Annulées
          </TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="mt-6">
          <OnlineOrdersList orders={selectedDateOrders} />
        </TabsContent>
        <TabsContent value="pending" className="mt-6">
          <OnlineOrdersList orders={selectedDateOrders.filter(o => o.status === 'pending')} />
        </TabsContent>
        <TabsContent value="preparing" className="mt-6">
          <OnlineOrdersList orders={selectedDateOrders.filter(o => o.status === 'preparing')} />
        </TabsContent>
        <TabsContent value="delivering" className="mt-6">
          <OnlineOrdersList orders={selectedDateOrders.filter(o => o.status === 'delivering')} />
        </TabsContent>
        <TabsContent value="delivered" className="mt-6">
          <OnlineOrdersList orders={selectedDateOrders.filter(o => o.status === 'delivered')} />
        </TabsContent>
        <TabsContent value="canceled" className="mt-6">
          <OnlineOrdersList orders={selectedDateOrders.filter(o => o.status === 'canceled')} />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default OnlineOrders;