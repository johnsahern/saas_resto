
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { FileText } from 'lucide-react';

interface BillingEmptyStateProps {
  hasOrders: boolean;
  isFiltered: boolean;
}

export const BillingEmptyState: React.FC<BillingEmptyStateProps> = ({ 
  hasOrders, 
  isFiltered 
}) => {
  return (
    <Card className="bg-white border-emerald-100">
      <CardContent className="p-12 text-center">
        <FileText className="w-12 h-12 text-emerald-300 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-emerald-600 mb-2">
          {!hasOrders ? 'Aucune facture générée' : 'Aucune facture trouvée'}
        </h3>
        <p className="text-emerald-500">
          {!hasOrders 
            ? 'Les factures apparaîtront ici quand les commandes seront marquées comme servies.'
            : 'Aucune facture ne correspond à vos critères de recherche.'
          }
        </p>
      </CardContent>
    </Card>
  );
};
