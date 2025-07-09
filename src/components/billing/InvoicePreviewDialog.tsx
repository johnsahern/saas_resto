
import React from 'react';
import { Button } from '@/components/ui/button';
import { Eye } from 'lucide-react';
import { InvoiceTemplate } from './InvoiceTemplate';
import { InvoiceSettings } from '@/hooks/useInvoiceSettings';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

interface InvoicePreviewDialogProps {
  settings: InvoiceSettings;
}

export const InvoicePreviewDialog: React.FC<InvoicePreviewDialogProps> = ({
  settings
}) => {
  const sampleOrder = {
    id: 'sample-id',
    order_number: 'FAC-001',
    customer_name: 'Client Exemple',
    table_id: '5',
    items: [
      { name: 'Thieboudienne', quantity: 2, price: 3500 },
      { name: 'Bissap', quantity: 2, price: 1000 }
    ],
    total_amount: 9000,
    served_at: new Date().toISOString(),
    original_order_id: null,
    notes: 'Commande exemple pour prévisualisation',
    created_at: new Date().toISOString()
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" className="border-emerald-500 text-emerald-600">
          <Eye className="w-4 h-4 mr-2" />
          Prévisualiser
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Prévisualisation de la Facture</DialogTitle>
        </DialogHeader>
        <InvoiceTemplate 
          order={sampleOrder} 
          settings={settings} 
          showActions={false}
        />
      </DialogContent>
    </Dialog>
  );
};
