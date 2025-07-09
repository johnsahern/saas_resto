
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Box, Plus } from 'lucide-react';

interface InventoryEmptyStateProps {
  totalItemsCount: number;
  canCreate: boolean;
  onAddItem: () => void;
}

export const InventoryEmptyState: React.FC<InventoryEmptyStateProps> = ({ 
  totalItemsCount, 
  canCreate, 
  onAddItem 
}) => {
  return (
    <Card className="bg-white border-emerald-100">
      <CardContent className="p-12 text-center">
        <Box className="w-12 h-12 text-emerald-300 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-emerald-600 mb-2">
          {totalItemsCount === 0 ? 'Aucun article en inventaire' : 'Aucun article trouvé'}
        </h3>
        <p className="text-emerald-500">
          {totalItemsCount === 0 
            ? 'Commencez par ajouter vos premiers articles d\'inventaire.' 
            : 'Aucun article ne correspond à vos critères de recherche.'}
        </p>
        {canCreate && totalItemsCount === 0 && (
          <Button 
            className="mt-4 bg-emerald-600 hover:bg-emerald-700"
            onClick={onAddItem}
          >
            <Plus className="w-4 h-4 mr-2" />
            Ajouter le premier article
          </Button>
        )}
      </CardContent>
    </Card>
  );
};
