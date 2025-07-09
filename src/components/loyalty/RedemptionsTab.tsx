
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { LoyaltyCustomer } from '@/types/loyaltyCustomers';
import { LoyaltyReward } from '@/hooks/useLoyaltyRewards';

interface RedemptionsTabProps {
  customers: LoyaltyCustomer[];
  rewards: LoyaltyReward[];
  onRedeemReward: (customerId: string, reward: LoyaltyReward) => Promise<void>;
}

export const RedemptionsTab = ({ customers, rewards, onRedeemReward }: RedemptionsTabProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-emerald-800">Échanger des récompenses</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {customers.map((customer) => (
            <div key={customer.id} className="border border-emerald-100 rounded-lg p-4">
              <div className="flex justify-between items-center mb-2">
                <h4 className="font-medium text-emerald-800">{customer.name}</h4>
                <Badge>{customer.points} points</Badge>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                {rewards
                  .filter(reward => customer.points >= reward.points_cost)
                  .map((reward) => (
                    <Button
                      key={reward.id}
                      size="sm"
                      variant="outline"
                      onClick={() => onRedeemReward(customer.id, reward)}
                      className="text-xs"
                    >
                      {reward.name} ({reward.points_cost} pts)
                    </Button>
                  ))}
              </div>
              {rewards.filter(reward => customer.points >= reward.points_cost).length === 0 && (
                <p className="text-sm text-gray-500">Aucune récompense disponible</p>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
