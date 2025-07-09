import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Package, TrendingUp, TrendingDown, Clock } from 'lucide-react';
import { format, parseISO, isValid } from 'date-fns';
import { fr } from 'date-fns/locale';
import { HistoryStockMovement } from '@/services/historyStockService';

interface HistoryStockMovementsProps {
  movements: HistoryStockMovement[];
  loading: boolean;
}

export const HistoryStockMovements: React.FC<HistoryStockMovementsProps> = ({ movements, loading }) => {
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500 mx-auto mb-4"></div>
          <p className="text-emerald-600">Chargement des mouvements de stock...</p>
        </div>
      </div>
    );
  }

  if (movements.length === 0) {
    return (
      <Card className="bg-white border-emerald-100">
        <CardContent className="p-12 text-center">
          <Package className="w-12 h-12 text-emerald-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-emerald-600 mb-2">Aucun mouvement de stock</h3>
          <p className="text-emerald-500">Aucun mouvement de stock trouvé pour cette date.</p>
        </CardContent>
      </Card>
    );
  }

  const formatTime = (dateString: string) => {
    try {
      console.log('Formatting time for:', dateString);
      
      // Parser la date ISO
      const date = parseISO(dateString);
      if (isValid(date)) {
        return format(date, 'HH:mm', { locale: fr });
      }
      
      return '--:--';
    } catch (error) {
      console.error('Erreur lors du formatage de l\'heure:', error, 'pour la date:', dateString);
      return '--:--';
    }
  };

  return (
    <div className="space-y-4">
      {movements.map((movement) => {
        const isAddition = movement.type === 'addition';
        const Icon = isAddition ? TrendingUp : TrendingDown;
        const bgColor = isAddition ? 'bg-green-50' : 'bg-orange-50';
        const borderColor = isAddition ? 'border-green-200' : 'border-orange-200';
        const iconColor = isAddition ? 'bg-green-500' : 'bg-orange-500';
        const badgeColor = isAddition ? 'bg-green-100 text-green-800' : 'bg-orange-100 text-orange-800';

        return (
          <Card key={movement.id} className={`${bgColor} ${borderColor} hover:border-opacity-60 transition-colors`}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className={`p-3 rounded-full ${iconColor}`}>
                    <Icon className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg text-emerald-800">{movement.item_name}</h3>
                    <div className="flex items-center gap-4 mt-1">
                      <p className="text-sm text-emerald-600">
                        Quantité: <span className="font-semibold">{movement.quantity}</span>
                      </p>
                      <div className="flex items-center gap-1 text-sm text-emerald-600">
                        <Clock className="w-3 h-3" />
                        <span>{isAddition
                          ? formatTime(movement.date)
                          : movement.time ? movement.time.slice(0, 5) : '--:--'
                        }</span>
                      </div>
                    </div>
                    {movement.notes && (
                      <p className="text-sm text-emerald-500 mt-1">
                        <span className="font-medium">Note:</span> {movement.notes}
                      </p>
                    )}
                  </div>
                </div>
                <Badge className={badgeColor}>
                  {isAddition ? 'Ajout' : 'Retrait'}
                </Badge>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};
