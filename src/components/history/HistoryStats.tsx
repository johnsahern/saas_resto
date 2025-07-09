
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { ShoppingCart, DollarSign, TrendingUp, TrendingDown } from 'lucide-react';

interface HistoryStatsProps {
  totalRevenue: number;
  totalOrders: number;
  stockAdditions: number;
  stockWithdrawals: number;
}

export const HistoryStats: React.FC<HistoryStatsProps> = ({
  totalRevenue,
  totalOrders,
  stockAdditions,
  stockWithdrawals
}) => {
  const formatCurrency = (amount: number) => {
    return `${amount.toFixed(0)} FCFA`;
  };

  const stats = [
    {
      title: 'Chiffre d\'affaires',
      value: formatCurrency(totalRevenue),
      icon: DollarSign,
      color: 'bg-emerald-500'
    },
    {
      title: 'Commandes',
      value: totalOrders.toString(),
      icon: ShoppingCart,
      color: 'bg-blue-500'
    },
    {
      title: 'Ajouts de stock',
      value: stockAdditions.toString(),
      icon: TrendingUp,
      color: 'bg-green-500'
    },
    {
      title: 'Retraits de stock',
      value: stockWithdrawals.toString(),
      icon: TrendingDown,
      color: 'bg-orange-500'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat) => {
        const Icon = stat.icon;
        return (
          <Card key={stat.title} className="border-emerald-100">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-emerald-600">{stat.title}</p>
                  <p className="text-2xl font-bold text-emerald-800">{stat.value}</p>
                </div>
                <div className={`p-3 rounded-full ${stat.color}`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};
