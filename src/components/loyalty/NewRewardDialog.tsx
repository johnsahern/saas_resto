
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus } from 'lucide-react';
import { toast } from 'sonner';

interface NewRewardDialogProps {
  onAddReward: (reward: { name: string; description: string; points_cost: number }) => Promise<{ success: boolean }>;
}

export const NewRewardDialog = ({ onAddReward }: NewRewardDialogProps) => {
  const [newReward, setNewReward] = useState({
    name: '',
    description: '',
    points_cost: 0
  });

  const handleAddReward = async () => {
    if (!newReward.name || newReward.points_cost <= 0) {
      toast.error('Nom et coût en points requis');
      return;
    }

    const result = await onAddReward(newReward);
    if (result.success) {
      toast.success('Récompense ajoutée avec succès');
      setNewReward({ name: '', description: '', points_cost: 0 });
    } else {
      toast.error('Erreur lors de l\'ajout de la récompense');
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button className="bg-emerald-600 hover:bg-emerald-700">
          <Plus className="w-4 h-4 mr-2" />
          Nouvelle Récompense
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Ajouter une nouvelle récompense</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label htmlFor="rewardName">Nom *</Label>
            <Input
              id="rewardName"
              value={newReward.name}
              onChange={(e) => setNewReward({ ...newReward, name: e.target.value })}
            />
          </div>
          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={newReward.description}
              onChange={(e) => setNewReward({ ...newReward, description: e.target.value })}
            />
          </div>
          <div>
            <Label htmlFor="pointsCost">Coût en points *</Label>
            <Input
              id="pointsCost"
              type="number"
              value={newReward.points_cost}
              onChange={(e) => setNewReward({ ...newReward, points_cost: parseInt(e.target.value) || 0 })}
            />
          </div>
          <Button onClick={handleAddReward} className="w-full bg-emerald-600 hover:bg-emerald-700">
            Ajouter la récompense
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
