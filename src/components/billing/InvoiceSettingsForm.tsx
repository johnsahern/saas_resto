
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { RestaurantInfoFields } from './RestaurantInfoFields';
import { LogoUploadField } from './LogoUploadField';
import { InvoiceSettingsActions } from './InvoiceSettingsActions';
import { InvoiceSettings } from '@/hooks/useInvoiceSettings';

interface InvoiceSettingsFormProps {
  settings: InvoiceSettings;
  onInputChange: (field: string, value: string | number) => void;
  onSave: () => void;
  isSaving: boolean;
}

export const InvoiceSettingsForm: React.FC<InvoiceSettingsFormProps> = ({
  settings,
  onInputChange,
  onSave,
  isSaving
}) => {
  return (
    <Card className="bg-white border-emerald-100">
      <CardHeader>
        <CardTitle className="text-emerald-800">Configuration des Factures</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <RestaurantInfoFields settings={settings} onInputChange={onInputChange} />
        <LogoUploadField settings={settings} onInputChange={onInputChange} />
        <InvoiceSettingsActions 
          settings={settings} 
          onSave={onSave} 
          isSaving={isSaving} 
        />
      </CardContent>
    </Card>
  );
};
