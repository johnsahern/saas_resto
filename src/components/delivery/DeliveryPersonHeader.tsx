
import React from 'react';
import { Button } from '@/components/ui/button';
import { Users, Plus } from 'lucide-react';

interface DeliveryPersonHeaderProps {
  onAddClick: () => void;
}

export const DeliveryPersonHeader: React.FC<DeliveryPersonHeaderProps> = ({ 
  onAddClick 
}) => (
  <div className="flex items-center justify-between">
    <div>
      <h3 className="text-2xl font-bold text-white flex items-center gap-3">
        <Users className="w-7 h-7 text-emerald-500" />
        Gestion des livreurs
      </h3>
      <p className="text-slate-400 mt-1">Gérez votre équipe de livraison</p>
    </div>
    <Button
      onClick={onAddClick}
      className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold flex items-center gap-2"
    >
      <Plus className="w-4 h-4" />
      Ajouter un livreur
    </Button>
  </div>
);
