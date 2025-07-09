import React from 'react';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { apiClient } from '@/integrations/api/client';

interface DeliveryPersonStatusToggleProps {
  personId: string;
  isActive: boolean;
  onStatusChange: (isActive: boolean) => void;
}

export function DeliveryPersonStatusToggle({ 
  personId, 
  isActive, 
  onStatusChange 
}: DeliveryPersonStatusToggleProps) {

  const handleToggle = async (checked: boolean) => {
    try {
      const response = await apiClient.patch(`/delivery-persons/${personId}`, {
        available: checked
      });

      if (response.success) {
        onStatusChange(checked);
      } else {
        console.error('Erreur lors de la mise à jour du statut:', response.error);
      }
    } catch (error) {
      console.error('Erreur lors de la mise à jour du statut:', error);
    }
  };

  return (
    <div className="flex items-center space-x-2">
      <Switch
        id={`status-${personId}`}
        checked={isActive}
        onCheckedChange={handleToggle}
      />
      <Label htmlFor={`status-${personId}`} className="text-sm">
        {isActive ? 'Actif' : 'Inactif'}
      </Label>
    </div>
  );
}
