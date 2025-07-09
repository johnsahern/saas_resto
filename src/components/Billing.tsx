import React, { useState } from 'react';
import { Receipt, Settings, Calendar } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useDailySales } from '@/hooks/useRestaurantData';
import { useBillingOrders } from '@/hooks/useBillingOrders';
import { usePermissions } from '@/hooks/usePermissions';
import { InvoiceSettings } from './billing/InvoiceSettings';
import { BillingStats } from './billing/BillingStats';
import { BillingSearchBar } from './billing/BillingSearchBar';
import { BillingInvoicesList } from './billing/BillingInvoicesList';
import { NewInvoiceDialog } from './billing/NewInvoiceDialog';

export const Billing: React.FC = () => {
  const { salesData, loading: salesLoading } = useDailySales();
  const { billingOrders, loading: billingLoading } = useBillingOrders();
  const { canCreate } = usePermissions();
  const [searchTerm, setSearchTerm] = useState('');

  // Obtenir la date d'aujourd'hui (UTC, sans l'heure)
  const todayDate = new Date();
  todayDate.setHours(0, 0, 0, 0);

  // Filtrer les factures du jour (en cas de bug backend)
  const todayOrders = billingOrders.filter(order => {
    const servedAt = new Date(order.served_at);
    servedAt.setHours(0, 0, 0, 0);
    return servedAt.getTime() === todayDate.getTime();
  });

  const filteredOrders = todayOrders.filter(order =>
    order.order_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (order.customer_name || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Obtenir la date d'aujourd'hui formatée
  const today = new Date().toLocaleDateString('fr-FR', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  if (salesLoading || billingLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-center min-h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500 mx-auto mb-4"></div>
            <p className="text-emerald-600">Chargement des données de facturation...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold bg-gradient-to-r from-emerald-600 to-green-600 bg-clip-text text-transparent">
            Facturation - {today}
          </h2>
          <div className="flex items-center gap-2 text-emerald-600">
            <Calendar className="w-4 h-4" />
            <p>Gestion des factures et paiements du jour ({todayOrders.length} factures)</p>
          </div>
        </div>
        <NewInvoiceDialog canCreate={canCreate()} />
      </div>

      <BillingStats billingOrders={todayOrders} />

      <Tabs defaultValue="invoices" className="w-full">
        <TabsList className="grid w-full grid-cols-2 bg-emerald-50">
          <TabsTrigger value="invoices" className="data-[state=active]:bg-emerald-600 data-[state=active]:text-white">
            <Receipt className="w-4 h-4 mr-2" />
            Factures du jour
          </TabsTrigger>
          <TabsTrigger value="settings" className="data-[state=active]:bg-emerald-600 data-[state=active]:text-white">
            <Settings className="w-4 h-4 mr-2" />
            Configuration
          </TabsTrigger>
        </TabsList>

        <TabsContent value="invoices" className="space-y-4">
          <BillingSearchBar 
            searchTerm={searchTerm} 
            onSearchChange={setSearchTerm} 
          />
          <BillingInvoicesList 
            filteredOrders={filteredOrders} 
            totalOrders={todayOrders.length} 
          />
        </TabsContent>

        <TabsContent value="settings">
          <InvoiceSettings />
        </TabsContent>
      </Tabs>
    </div>
  );
};
