
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface RecentOrdersProps {
  orders: any[];
}

export const DashboardRecentOrders: React.FC<RecentOrdersProps> = ({ orders }) => {
  return (
    <Card className="bg-slate-800 border-slate-700 hover:border-emerald-500/50 transition-colors">
      <CardHeader>
        <CardTitle className="text-white">Commandes récentes</CardTitle>
        <CardDescription className="text-slate-400">
          Dernières commandes en cours • {orders.length} total
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {orders.slice(0, 3).map((order, index) => (
            <div 
              key={order.id} 
              className="flex items-center justify-between p-3 bg-slate-700 rounded-lg border border-emerald-500/20"
            >
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gradient-to-r from-emerald-600 to-teal-600 rounded-full flex items-center justify-center">
                  <span className="text-sm font-bold text-white">{index + 1}</span>
                </div>
                <div>
                  <p className="text-white font-medium">#{order.order_number}</p>
                  <p className="text-sm text-slate-400">
                    {order.customer_name || 'Client'} • {order.status} • {new Date(order.created_at).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <div className="text-emerald-400 font-bold">{order.total_amount.toFixed(0)} FCFA</div>
                <div className="text-xs text-slate-400">{order.items.length} articles</div>
              </div>
            </div>
          ))}
          {orders.length === 0 && (
            <p className="text-slate-400 text-center py-4">Aucune commande en cours</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
