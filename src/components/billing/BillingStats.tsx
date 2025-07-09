
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Euro, Receipt, Users, TrendingUp } from 'lucide-react';
import { BillingOrder } from '@/hooks/useBillingOrders';

interface BillingStatsProps {
  billingOrders: BillingOrder[];
}

export const BillingStats: React.FC<BillingStatsProps> = ({ billingOrders }) => {
  const stats = {
    totalRevenue: billingOrders.reduce((sum, order) => sum + (order.total_amount || 0), 0),
    totalInvoices: billingOrders.length,
    paidInvoices: billingOrders.length,
    averageTicket: billingOrders.length > 0 ? billingOrders.reduce((sum, order) => sum + (order.total_amount || 0), 0) / billingOrders.length : 0
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      <Card className="bg-white border-emerald-100">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-emerald-600">Chiffre d'affaires</p>
              <p className="text-2xl font-bold text-emerald-800">{stats.totalRevenue.toFixed(0)} FCFA</p>
            </div>
            <div className="p-2 rounded-full bg-green-500">
              <Euro className="w-4 h-4 text-white" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-white border-emerald-100">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-emerald-600">Commandes totales</p>
              <p className="text-2xl font-bold text-emerald-800">{stats.totalInvoices}</p>
            </div>
            <div className="p-2 rounded-full bg-blue-500">
              <Receipt className="w-4 h-4 text-white" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-white border-emerald-100">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-emerald-600">Clients servis</p>
              <p className="text-2xl font-bold text-emerald-800">{billingOrders.length}</p>
            </div>
            <div className="p-2 rounded-full bg-emerald-500">
              <Users className="w-4 h-4 text-white" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-white border-emerald-100">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-emerald-600">Ticket moyen</p>
              <p className="text-2xl font-bold text-emerald-800">{stats.averageTicket.toFixed(0)} FCFA</p>
            </div>
            <div className="p-2 rounded-full bg-teal-500">
              <TrendingUp className="w-4 h-4 text-white" />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
