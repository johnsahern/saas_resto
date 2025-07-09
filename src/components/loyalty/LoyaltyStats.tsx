
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, Gift, Star } from 'lucide-react';
import { LoyaltyCustomer } from '@/types/loyaltyCustomers';
import { LoyaltyReward } from '@/hooks/useLoyaltyRewards';

interface LoyaltyStatsProps {
  customers: LoyaltyCustomer[];
  rewards: LoyaltyReward[];
}

export const LoyaltyStats = ({ customers, rewards }: LoyaltyStatsProps) => {
  const totalPoints = customers.reduce((sum, customer) => sum + customer.points, 0);

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Clients Fidèles</CardTitle>
          <Users className="h-4 w-4 text-emerald-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-emerald-800">{customers.length}</div>
          <p className="text-xs text-emerald-600">Total des clients inscrits</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Récompenses</CardTitle>
          <Gift className="h-4 w-4 text-emerald-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-emerald-800">{rewards.length}</div>
          <p className="text-xs text-emerald-600">Récompenses disponibles</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Points Totaux</CardTitle>
          <Star className="h-4 w-4 text-emerald-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-emerald-800">{totalPoints}</div>
          <p className="text-xs text-emerald-600">Points en circulation</p>
        </CardContent>
      </Card>
    </div>
  );
};
