
import React from 'react';
import { Button } from '@/components/ui/button';

interface OrderFormActionsProps {
  loading: boolean;
  isFormValid: boolean;
  onCancel: () => void;
}

export const OrderFormActions: React.FC<OrderFormActionsProps> = ({
  loading,
  isFormValid,
  onCancel
}) => {
  return (
    <div className="flex gap-2 justify-end">
      <Button
        type="button"
        variant="outline"
        onClick={onCancel}
        className="border-gray-300"
      >
        Annuler
      </Button>
      <Button
        type="submit"
        disabled={loading || !isFormValid}
        className="bg-emerald-600 hover:bg-emerald-700"
      >
        {loading ? 'Création...' : 'Créer la commande'}
      </Button>
    </div>
  );
};
