
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Truck, Clock, CheckCircle, User, Euro } from 'lucide-react';

interface DeliveryStatsProps {
  totalDeliveries: number;
  pendingDeliveries: number;
  inProgressDeliveries: number;
  completedDeliveries: number;
  availableDrivers: number;
  totalRevenue?: number;
}

export const DeliveryStats: React.FC<DeliveryStatsProps> = ({
  totalDeliveries,
  pendingDeliveries,
  inProgressDeliveries,
  completedDeliveries,
  availableDrivers,
  totalRevenue = 0
}) => {
  const stats = [
    {
      title: 'Total livraisons',
      value: totalDeliveries,
      icon: Truck,
      color: 'text-emerald-500',
      bgColor: 'bg-emerald-500/10',
    },
    {
      title: 'En attente',
      value: pendingDeliveries,
      icon: Clock,
      color: 'text-yellow-500',
      bgColor: 'bg-yellow-500/10',
    },
    {
      title: 'En cours',
      value: inProgressDeliveries,
      icon: Truck,
      color: 'text-orange-500',
      bgColor: 'bg-orange-500/10',
    },
    {
      title: 'Terminées',
      value: completedDeliveries,
      icon: CheckCircle,
      color: 'text-green-500',
      bgColor: 'bg-green-500/10',
    },
    {
      title: 'Livreurs disponibles',
      value: availableDrivers,
      icon: User,
      color: 'text-blue-500',
      bgColor: 'bg-blue-500/10',
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
      {stats.map((stat, index) => {
        const Icon = stat.icon;
        return (
          <Card key={index} className="bg-slate-800 border-slate-700 hover:border-emerald-500/30 transition-colors elegant-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-300">
                {stat.title}
              </CardTitle>
              <div className={`${stat.bgColor} p-2 rounded-lg`}>
                <Icon className={`h-4 w-4 ${stat.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">
                {stat.value}
              </div>
            </CardContent>
          </Card>
        );
      })}
      
      {totalRevenue > 0 && (
        <Card className="bg-slate-800 border-slate-700 hover:border-emerald-500/30 transition-colors elegant-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-300">
              Revenus livraisons
            </CardTitle>
            <div className="bg-emerald-500/10 p-2 rounded-lg">
              <Euro className="h-4 w-4 text-emerald-500" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">
              {totalRevenue.toLocaleString()} FCFA
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
