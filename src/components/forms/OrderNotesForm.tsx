
import React from 'react';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

interface OrderNotesFormProps {
  notes: string;
  onNotesChange: (notes: string) => void;
}

export const OrderNotesForm: React.FC<OrderNotesFormProps> = ({
  notes,
  onNotesChange
}) => {
  return (
    <div>
      <Label htmlFor="notes">Notes (optionnel)</Label>
      <Textarea
        id="notes"
        placeholder="Instructions spéciales, allergies, etc."
        value={notes}
        onChange={(e) => onNotesChange(e.target.value)}
        className="border-emerald-200 focus:border-emerald-500"
      />
    </div>
  );
};
