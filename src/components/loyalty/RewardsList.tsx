
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { LoyaltyReward } from '@/hooks/useLoyaltyRewards';
import { NewRewardDialog } from './NewRewardDialog';

interface RewardsListProps {
  rewards: LoyaltyReward[];
  onAddReward: (reward: { name: string; description: string; points_cost: number }) => Promise<{ success: boolean }>;
  onDeleteReward: (id: string) => Promise<{ success: boolean }>;
}

export const RewardsList = ({ rewards, onAddReward, onDeleteReward }: RewardsListProps) => {
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-emerald-800">Récompenses disponibles</h2>
        <NewRewardDialog onAddReward={onAddReward} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {rewards.map((reward) => (
          <Card key={reward.id} className="border-emerald-200">
            <CardHeader>
              <CardTitle className="text-emerald-800">{reward.name}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {reward.description && (
                <p className="text-sm text-gray-600">{reward.description}</p>
              )}
              <div className="flex items-center justify-between">
                <Badge className="bg-emerald-100 text-emerald-800">
                  {reward.points_cost} points
                </Badge>
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() => onDeleteReward(reward.id)}
                >
                  Supprimer
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};
