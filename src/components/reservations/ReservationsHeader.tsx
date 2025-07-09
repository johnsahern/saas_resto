
import React from 'react';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

interface ReservationsHeaderProps {
  onAddReservation: () => void;
}

export const ReservationsHeader: React.FC<ReservationsHeaderProps> = ({
  onAddReservation,
}) => {
  return (
    <div className="flex items-center justify-between">
      <div>
        <h2 className="text-3xl font-bold bg-gradient-to-r from-emerald-600 to-green-600 bg-clip-text text-transparent">
          Réservations
        </h2>
        <p className="text-emerald-600">
          Gérez les réservations de votre restaurant avec élégance
        </p>
      </div>
      <Button
        onClick={onAddReservation}
        className="bg-emerald-600 hover:bg-emerald-700 text-white elegant-shadow"
      >
        <Plus className="w-4 h-4 mr-2" />
        Ajouter une réservation
      </Button>
    </div>
  );
};
