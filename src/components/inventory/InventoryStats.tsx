
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Package, AlertTriangle, TrendingDown, TrendingUp } from 'lucide-react';
import { InventoryStats as StatsType } from '@/types/inventory';

interface InventoryStatsProps {
  stats: StatsType;
}

export const InventoryStats: React.FC<InventoryStatsProps> = ({ stats }) => {
  const formatCurrency = (amount: number) => {
    return `${amount.toFixed(0)} FCFA`;
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      <Card className="bg-white border-emerald-100">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-emerald-600">Articles totaux</p>
              <p className="text-2xl font-bold text-emerald-800">{stats.totalItems}</p>
            </div>
            <div className="p-2 rounded-full bg-blue-500">
              <Package className="w-4 h-4 text-white" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-white border-emerald-100">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-emerald-600">Stock faible</p>
              <p className="text-2xl font-bold text-yellow-600">{stats.lowStockItems}</p>
            </div>
            <div className="p-2 rounded-full bg-yellow-500">
              <TrendingDown className="w-4 h-4 text-white" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-white border-emerald-100">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-emerald-600">Ruptures</p>
              <p className="text-2xl font-bold text-red-600">{stats.outOfStockItems}</p>
            </div>
            <div className="p-2 rounded-full bg-red-500">
              <AlertTriangle className="w-4 h-4 text-white" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-white border-emerald-100">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-emerald-600">Valeur totale</p>
              <p className="text-2xl font-bold text-emerald-800">{formatCurrency(stats.totalValue)}</p>
            </div>
            <div className="p-2 rounded-full bg-emerald-500">
              <TrendingUp className="w-4 h-4 text-white" />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
