import React, { useState, useEffect } from 'react';
import { useInvoiceSettings } from '@/hooks/useInvoiceSettings';
import { InvoiceSettingsForm } from './InvoiceSettingsForm';
import { toast } from 'sonner';

export const InvoiceSettings: React.FC = () => {
  const { settings, loading, error, updateSettings } = useInvoiceSettings();
  const [localSettings, setLocalSettings] = useState(settings);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    setLocalSettings(settings);
  }, [settings]);

  const handleSave = async () => {
    if (!localSettings) return;
    setIsSaving(true);
    try {
      const success = await updateSettings(localSettings);
      if (success) {
        toast.success('Paramètres sauvegardés avec succès !');
      } else {
        toast.error('Erreur lors de la sauvegarde des paramètres');
      }
    } catch (error) {
      toast.error('Erreur lors de la sauvegarde des paramètres');
    } finally {
      setIsSaving(false);
    }
  };

  const handleInputChange = (field: string, value: string | number) => {
    setLocalSettings(prev => ({
      ...prev,
      [field]: value
    }));
  };

  if (loading || !localSettings) return <div>Chargement des paramètres de facturation...</div>;
  if (error) return <div className="text-red-600">Erreur : {error}</div>;

  return (
    <div className="space-y-6">
      <InvoiceSettingsForm
        settings={localSettings}
        onInputChange={handleInputChange}
        onSave={handleSave}
        isSaving={isSaving}
      />
    </div>
  );
};
