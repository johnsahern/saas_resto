
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Truck, Calendar, Users, Settings } from 'lucide-react';
import { useDeliveries } from '@/hooks/useDeliveries';
import { useDeliveryPersons } from '@/hooks/useDeliveryPersons';
import { DeliveryStats } from './delivery/DeliveryStats';
import { DeliveryCalendar } from './delivery/DeliveryCalendar';
import { DeliveryList } from './delivery/DeliveryList';
import { AvailableDriversList } from './delivery/AvailableDriversList';
import { DeliveryPersonManagement } from './delivery/DeliveryPersonManagement';

export const Delivery: React.FC = () => {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const { deliveries, loading: deliveriesLoading, getDeliveriesByDate } = useDeliveries();
  const { deliveryPersons, loading: personsLoading, getAvailableDeliveryPersons } = useDeliveryPersons();

  // Filter deliveries for the selected date
  const selectedDateDeliveries = getDeliveriesByDate(selectedDate);
  const availableDrivers = getAvailableDeliveryPersons();

  // DEBUG : log des données reçues
  console.log('[DEBUG] deliveries:', deliveries);
  console.log('[DEBUG] selectedDate:', selectedDate);
  console.log('[DEBUG] selectedDateDeliveries:', selectedDateDeliveries);

  // Calculate statistics for the selected date
  const totalDeliveries = selectedDateDeliveries.length;
  const pendingDeliveries = selectedDateDeliveries.filter(d => d.status === 'pending').length;
  const inProgressDeliveries = selectedDateDeliveries.filter(d => d.status === 'in_transit' || d.status === 'assigned').length;
  const completedDeliveries = selectedDateDeliveries.filter(d => d.status === 'delivered').length;
  const totalRevenue = selectedDateDeliveries.reduce((sum, delivery) => sum + (delivery.fee || 0), 0);

  if (deliveriesLoading || personsLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-center min-h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500 mx-auto mb-4"></div>
            <p className="text-white">Chargement des données de livraison...</p>
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
            Gestion des livraisons
          </h2>
          <p className="text-emerald-600">
            Suivi en temps réel de vos livraisons et livreurs
          </p>
        </div>
      </div>

      {/* Statistiques */}
      <DeliveryStats
        totalDeliveries={totalDeliveries}
        pendingDeliveries={pendingDeliveries}
        inProgressDeliveries={inProgressDeliveries}
        completedDeliveries={completedDeliveries}
        availableDrivers={availableDrivers.length}
        totalRevenue={totalRevenue}
      />

      {/* Onglets principaux */}
      <Tabs defaultValue="deliveries" className="w-full">
        <TabsList className="grid w-full grid-cols-2 bg-slate-800 border-slate-700">
          <TabsTrigger value="deliveries" className="text-slate-400 data-[state=active]:text-emerald-400 data-[state=active]:bg-emerald-900/30 flex items-center gap-2">
            <Truck className="w-4 h-4" />
            Livraisons
          </TabsTrigger>
          <TabsTrigger value="management" className="text-slate-400 data-[state=active]:text-emerald-400 data-[state=active]:bg-emerald-900/30 flex items-center gap-2">
            <Users className="w-4 h-4" />
            Gestion des livreurs
          </TabsTrigger>
        </TabsList>

        {/* Onglet Livraisons */}
        <TabsContent value="deliveries" className="mt-6 space-y-6">
          {/* Contenu principal */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Calendrier */}
            <div className="lg:col-span-1">
              <DeliveryCalendar
                selectedDate={selectedDate}
                onDateSelect={setSelectedDate}
                deliveries={deliveries}
              />
            </div>

            {/* Livraisons du jour */}
            <div className="lg:col-span-2">
              <Card className="bg-slate-800 border-slate-700 hover:border-emerald-500/30 transition-colors elegant-shadow">
                <CardHeader>
                  <CardTitle className="text-white text-lg flex items-center gap-2">
                    <Truck className="w-5 h-5 text-emerald-500" />
                    Livraisons du jour
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <DeliveryList 
                    deliveries={selectedDateDeliveries} 
                    deliveryPersons={deliveryPersons}
                  />
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Onglets pour les différentes vues de livraisons */}
          <Tabs defaultValue="all" className="w-full">
            <TabsList className="grid w-full grid-cols-6 bg-slate-800 border-slate-700">
              <TabsTrigger value="all" className="text-slate-400 data-[state=active]:text-emerald-400 data-[state=active]:bg-emerald-900/30">
                Toutes
              </TabsTrigger>
              <TabsTrigger value="pending" className="text-slate-400 data-[state=active]:text-yellow-400 data-[state=active]:bg-yellow-900/30">
                En attente
              </TabsTrigger>
              <TabsTrigger value="assigned" className="text-slate-400 data-[state=active]:text-blue-400 data-[state=active]:bg-blue-900/30">
                Assignées
              </TabsTrigger>
              <TabsTrigger value="in_transit" className="text-slate-400 data-[state=active]:text-orange-400 data-[state=active]:bg-orange-900/30">
                En cours
              </TabsTrigger>
              <TabsTrigger value="delivered" className="text-slate-400 data-[state=active]:text-green-400 data-[state=active]:bg-green-900/30">
                Livrées
              </TabsTrigger>
              <TabsTrigger value="drivers" className="text-slate-400 data-[state=active]:text-purple-400 data-[state=active]:bg-purple-900/30">
                Livreurs
              </TabsTrigger>
            </TabsList>

            <TabsContent value="all" className="mt-6">
              <DeliveryList deliveries={selectedDateDeliveries} deliveryPersons={deliveryPersons} />
            </TabsContent>

            <TabsContent value="pending" className="mt-6">
              <DeliveryList 
                deliveries={selectedDateDeliveries.filter(d => d.status === 'pending')} 
                deliveryPersons={deliveryPersons} 
              />
            </TabsContent>

            <TabsContent value="assigned" className="mt-6">
              <DeliveryList 
                deliveries={selectedDateDeliveries.filter(d => d.status === 'assigned')} 
                deliveryPersons={deliveryPersons} 
              />
            </TabsContent>

            <TabsContent value="in_transit" className="mt-6">
              <DeliveryList 
                deliveries={selectedDateDeliveries.filter(d => d.status === 'in_transit')} 
                deliveryPersons={deliveryPersons} 
              />
            </TabsContent>

            <TabsContent value="delivered" className="mt-6">
              <DeliveryList 
                deliveries={selectedDateDeliveries.filter(d => d.status === 'delivered')} 
                deliveryPersons={deliveryPersons} 
              />
            </TabsContent>

            <TabsContent value="drivers" className="mt-6">
              <Card className="bg-slate-800 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-white text-lg flex items-center gap-2">
                    <Users className="w-5 h-5 text-emerald-500" />
                    Livreurs disponibles
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <AvailableDriversList deliveryPersons={deliveryPersons} />
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </TabsContent>

        {/* Onglet Gestion des livreurs */}
        <TabsContent value="management" className="mt-6">
          <DeliveryPersonManagement />
        </TabsContent>
      </Tabs>
    </div>
  );
};
