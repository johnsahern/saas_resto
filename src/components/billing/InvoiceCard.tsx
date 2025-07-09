import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Download, Printer, Receipt, Eye } from 'lucide-react';
import { BillingOrder } from '@/hooks/useBillingOrders';
import { useInvoiceSettings } from '@/hooks/useInvoiceSettings';
import { InvoiceTemplate } from './InvoiceTemplate';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
interface InvoiceCardProps {
  order: BillingOrder;
}
export const InvoiceCard: React.FC<InvoiceCardProps> = ({
  order
}) => {
  const {
    settings
  } = useInvoiceSettings();
  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>Facture ${order.order_number}</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 0; padding: 20px; }
            @media print { body { margin: 0; } }
          </style>
        </head>
        <body>
          <div id="print-content"></div>
          <script>
            window.onload = function() {
              document.getElementById('print-content').innerHTML = \`${document.querySelector('[data-invoice-template]')?.innerHTML}\`;
              window.print();
              window.close();
            }
          </script>
        </body>
        </html>
      `);
      printWindow.document.close();
    }
  };
  const handleDownloadPDF = () => {
    // Pour une vraie implémentation PDF, vous pourriez utiliser une bibliothèque comme jsPDF ou html2pdf
    console.log('Téléchargement PDF pour la facture:', order.order_number);

    // Pour l'instant, on ouvre la prévisualisation
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>Facture ${order.order_number}</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            .no-print { display: none; }
          </style>
        </head>
        <body>
          ${document.querySelector('[data-invoice-template]')?.innerHTML}
        </body>
        </html>
      `);
      printWindow.document.close();
    }
  };
  return <Card className="bg-white border-emerald-100">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="p-2 rounded-full bg-green-500">
              <Receipt className="w-4 h-4 text-white" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="font-bold text-emerald-800">{order.order_number}</h3>
                {order.table_id && <Badge variant="outline" className="border-emerald-500 text-emerald-600">
                    Table {order.table_id}
                  </Badge>}
              </div>
              <p className="text-sm text-emerald-600">{order.customer_name || 'Client'}</p>
              <p className="text-xs text-emerald-500">
                Servi le {new Date(order.served_at).toLocaleString('fr-FR')}
              </p>
            </div>
          </div>

          <div className="text-right">
            <p className="text-lg font-bold text-emerald-800">{order.total_amount.toFixed(0)} FCFA</p>
            <Badge className="bg-green-500 text-white">
              Facturé
            </Badge>
          </div>

          <div className="flex space-x-2">
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm" className="border-emerald-500 text-emerald-600">
                  <Eye className="w-4 h-4 mr-2" />
                  Voir
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Facture {order.order_number}</DialogTitle>
                </DialogHeader>
                <div data-invoice-template>
                  <InvoiceTemplate order={order} settings={settings} />
                </div>
              </DialogContent>
            </Dialog>

            <Button onClick={handleDownloadPDF} variant="outline" size="sm" className="border-emerald-500 text-emerald-600">
              <Download className="w-4 h-4 mr-2" />
              PDF
            </Button>

            
          </div>
        </div>
      </CardContent>
    </Card>;
};