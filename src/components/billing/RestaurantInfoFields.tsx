import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { InvoiceSettings } from '@/hooks/useInvoiceSettings';
import { useRestaurantId } from '@/contexts/AuthContext';

interface RestaurantInfoFieldsProps {
  settings: InvoiceSettings;
  onInputChange: (field: string, value: string | number) => void;
}

export const RestaurantInfoFields: React.FC<RestaurantInfoFieldsProps> = ({
  settings,
  onInputChange
}) => {
  const restaurantId = useRestaurantId();
  return (
    <>
      <div className="mb-4">
        <Label htmlFor="restaurantId">ID du Restaurant</Label>
        <Input id="restaurantId" value={restaurantId || ''} readOnly className="border-emerald-200 bg-gray-100 text-gray-600" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="restaurantName">Nom du Restaurant</Label>
          <Input
            id="restaurantName"
            value={settings.restaurantName}
            onChange={(e) => onInputChange('restaurantName', e.target.value)}
            className="border-emerald-200 focus:border-emerald-500"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="phone">Téléphone</Label>
          <Input
            id="phone"
            value={settings.phone}
            onChange={(e) => onInputChange('phone', e.target.value)}
            className="border-emerald-200 focus:border-emerald-500"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            value={settings.email}
            onChange={(e) => onInputChange('email', e.target.value)}
            className="border-emerald-200 focus:border-emerald-500"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="taxRate">Taux de TVA (%)</Label>
          <Input
            id="taxRate"
            type="number"
            value={settings.taxRate}
            onChange={(e) => onInputChange('taxRate', parseFloat(e.target.value) || 0)}
            className="border-emerald-200 focus:border-emerald-500"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="address">Adresse</Label>
        <Textarea
          id="address"
          value={settings.address}
          onChange={(e) => onInputChange('address', e.target.value)}
          className="border-emerald-200 focus:border-emerald-500"
          rows={3}
        />
      </div>
    </>
  );
};
