
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useLoyaltyCustomers } from '@/hooks/useLoyaltyCustomers';
import { useLoyaltyRewards } from '@/hooks/useLoyaltyRewards';
import { toast } from 'sonner';
import { LoyaltyStats } from './loyalty/LoyaltyStats';
import { CustomersList } from './loyalty/CustomersList';
import { RewardsList } from './loyalty/RewardsList';
import { RedemptionsTab } from './loyalty/RedemptionsTab';

export const Loyalty = () => {
  const { customers, loading: customersLoading, addCustomer, redeemPoints } = useLoyaltyCustomers();
  const { rewards, loading: rewardsLoading, addReward, deleteReward } = useLoyaltyRewards();

  const handleRedeemReward = async (customerId: string, reward: any) => {
    const customer = customers.find(c => c.id === customerId);
    if (!customer || customer.points < reward.points_cost) {
      toast.error('Points insuffisants');
      return;
    }

    const result = await redeemPoints(customerId, reward.points_cost, reward.name);
    if (result.success) {
      toast.success('Récompense échangée avec succès');
    } else {
      toast.error('Erreur lors de l\'échange');
    }
  };

  if (customersLoading || rewardsLoading) {
    return (
      <div className="p-6">
        <p className="text-center text-emerald-600">Chargement du programme de fidélité...</p>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-emerald-800">Programme de Fidélité</h1>
      </div>

      <LoyaltyStats customers={customers} rewards={rewards} />

      <Tabs defaultValue="customers" className="space-y-4">
        <TabsList>
          <TabsTrigger value="customers">Clients</TabsTrigger>
          <TabsTrigger value="rewards">Récompenses</TabsTrigger>
          <TabsTrigger value="redemptions">Échanges</TabsTrigger>
        </TabsList>

        <TabsContent value="customers" className="space-y-4">
          <CustomersList customers={customers} onAddCustomer={addCustomer} />
        </TabsContent>

        <TabsContent value="rewards" className="space-y-4">
          <RewardsList 
            rewards={rewards} 
            onAddReward={addReward} 
            onDeleteReward={deleteReward} 
          />
        </TabsContent>

        <TabsContent value="redemptions" className="space-y-4">
          <RedemptionsTab 
            customers={customers} 
            rewards={rewards} 
            onRedeemReward={handleRedeemReward} 
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};
