
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download, Printer } from 'lucide-react';
import { InvoiceSettings } from '@/hooks/useInvoiceSettings';
import { BillingOrder } from '@/hooks/useBillingOrders';
import { QRCodeCanvas } from 'qrcode.react';

interface InvoiceTemplateProps {
  order: BillingOrder;
  settings: InvoiceSettings | null;
  showActions?: boolean;
}

export const InvoiceTemplate: React.FC<InvoiceTemplateProps> = ({ 
  order, 
  settings, 
  showActions = true 
}) => {
  // Valeurs par défaut si settings est null
  const defaultSettings: InvoiceSettings = {
    restaurantName: 'Restaurant',
    address: '',
    phone: '',
    email: '',
    logo: null,
    taxRate: 0,
    currency: 'FCFA'
  };

  const currentSettings = settings || defaultSettings;

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPDF = () => {
    // Créer un nouveau document pour l'impression
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>Facture ${order.order_number}</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            .invoice-header { text-align: center; margin-bottom: 30px; }
            .invoice-details { margin-bottom: 20px; }
            .invoice-table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
            .invoice-table th, .invoice-table td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            .invoice-table th { background-color: #f2f2f2; }
            .total-section { text-align: right; margin-top: 20px; }
            .footer { margin-top: 30px; text-align: center; font-size: 12px; color: #666; }
            @media print { button { display: none; } }
          </style>
        </head>
        <body>
          ${document.getElementById('invoice-content')?.innerHTML}
        </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.print();
    }
  };

  const subtotal = order.total_amount;
  const taxAmount = (subtotal * currentSettings.taxRate) / 100;
  const total = subtotal + taxAmount;

  return (
    <div className="bg-white block">
      <style>{`
      @media print {
        body {
          margin: 0 !important;
          padding: 0 !important;
          background: white !important;
        }
        #invoice-content {
          margin: 0 !important;
          box-shadow: none !important;
          border: none !important;
          width: 300px !important;
          min-width: 0 !important;
          max-width: 100vw !important;
          position: static !important;
        }
        .print\\:hidden {
          display: none !important;
        }
        #root > *:not(#invoice-content) {
          display: none !important;
        }
      }
    `}</style>
      <div id="invoice-content" className="p-2 w-[300px] border border-gray-200 rounded shadow-sm text-xs font-mono">
        {/* En-tête minimal */}
        <div className="text-center mb-2">
          {currentSettings.logo && (
            <img src={currentSettings.logo} alt="Logo" className="h-8 w-auto mx-auto mb-1" />
          )}
          <div className="font-bold text-base">{currentSettings.restaurantName}</div>
          <div>{currentSettings.address}</div>
          <div>{currentSettings.phone}</div>
        </div>
        {/* Infos facture */}
        <div className="flex justify-between mb-1">
          <span>N° {order.order_number}</span>
          <span>{new Date(order.served_at).toLocaleDateString('fr-FR')}</span>
        </div>
        {order.customer_name && (
          <div className="mb-1 text-left">
            Client : <span className="font-bold">{order.customer_name}</span>
          </div>
        )}
        {/* Liste articles */}
        <div className="border-t border-b border-gray-300 py-1 my-1">
          {order.items?.map((item: any, idx: number) => (
            <div key={idx} className="flex justify-between">
              <span>{item.name || item.item_name} x{item.quantity}</span>
              <span>{((item.price || item.unit_price) * item.quantity)?.toFixed(0)} {currentSettings.currency}</span>
            </div>
          ))}
        </div>
        {/* Totaux */}
        <div className="flex justify-between font-bold mt-2">
          <span>Total</span>
          <span>{total.toFixed(0)} {currentSettings.currency}</span>
        </div>
        {currentSettings.taxRate > 0 && (
          <div className="flex justify-between text-[10px]">
            <span>TVA ({currentSettings.taxRate}%)</span>
            <span>{taxAmount.toFixed(0)} {currentSettings.currency}</span>
          </div>
        )}
        {/* QR code unique */}
        <div className="flex justify-center mt-3 mb-1">
          <QRCodeCanvas value={`RECU-${order.id || order.order_number}`} size={64} level="M" />
        </div>
        {/* Footer */}
        <div className="text-center text-[10px] text-gray-500 mt-2">
          Merci de votre visite !<br />
          {new Date().toLocaleString('fr-FR')}
        </div>
      </div>
      {/* Actions */}
      {showActions && (
        <div className="flex flex-col space-y-2 ml-2 print:hidden">
          <Button onClick={handleDownloadPDF} variant="outline" size="sm" className="border-emerald-500 text-emerald-600">
            <Download className="w-4 h-4 mr-2" />PDF
          </Button>
          <Button onClick={handlePrint} variant="outline" size="sm" className="border-emerald-500 text-emerald-600">
            <Printer className="w-4 h-4 mr-2" />Imprimer
          </Button>
        </div>
      )}
    </div>
  );
};
