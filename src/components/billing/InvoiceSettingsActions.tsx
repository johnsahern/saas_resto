
import React from 'react';
import { Button } from '@/components/ui/button';
import { Save } from 'lucide-react';
import { InvoicePreviewDialog } from './InvoicePreviewDialog';
import { InvoiceSettings } from '@/hooks/useInvoiceSettings';

interface InvoiceSettingsActionsProps {
  settings: InvoiceSettings;
  onSave: () => void;
  isSaving: boolean;
}

export const InvoiceSettingsActions: React.FC<InvoiceSettingsActionsProps> = ({
  settings,
  onSave,
  isSaving
}) => {
  return (
    <div className="flex space-x-2 pt-4">
      <Button 
        onClick={onSave} 
        className="bg-emerald-600 hover:bg-emerald-700"
        disabled={isSaving}
      >
        <Save className="w-4 h-4 mr-2" />
        {isSaving ? 'Sauvegarde...' : 'Sauvegarder'}
      </Button>

      <InvoicePreviewDialog settings={settings} />
    </div>
  );
};
