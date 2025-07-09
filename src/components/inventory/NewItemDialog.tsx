
import React from 'react';
import {
  Dialog,
  DialogContent,
} from '@/components/ui/dialog';
import { NewInventoryItemForm } from '../forms/NewInventoryItemForm';

interface NewItemDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
  onCancel: () => void;
}

export const NewItemDialog: React.FC<NewItemDialogProps> = ({
  isOpen,
  onOpenChange,
  onSuccess,
  onCancel
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <NewInventoryItemForm 
          onSuccess={onSuccess}
          onCancel={onCancel}
        />
      </DialogContent>
    </Dialog>
  );
};
