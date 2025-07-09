
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Upload } from 'lucide-react';
import { InvoiceSettings } from '@/hooks/useInvoiceSettings';

interface LogoUploadFieldProps {
  settings: InvoiceSettings;
  onInputChange: (field: string, value: string | number) => void;
}

export const LogoUploadField: React.FC<LogoUploadFieldProps> = ({
  settings,
  onInputChange
}) => {
  const [logoFile, setLogoFile] = useState<File | null>(null);

  const handleLogoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setLogoFile(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        const logoData = e.target?.result as string;
        console.log('Logo chargé:', logoData.substring(0, 50) + '...');
        onInputChange('logo', logoData);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="space-y-2">
      <Label htmlFor="logo">Logo du Restaurant</Label>
      <div className="flex items-center space-x-2">
        <Input
          id="logo"
          type="file"
          accept="image/*"
          onChange={handleLogoUpload}
          className="border-emerald-200 focus:border-emerald-500"
        />
        <Button variant="outline" className="border-emerald-500 text-emerald-600">
          <Upload className="w-4 h-4 mr-2" />
          Charger
        </Button>
      </div>
      {settings.logo && (
        <div className="mt-2">
          <img
            src={settings.logo}
            alt="Logo prévisualisation"
            className="h-16 w-auto border border-emerald-200 rounded"
          />
        </div>
      )}
    </div>
  );
};
