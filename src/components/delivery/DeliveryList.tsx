
import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Clock, Phone, MapPin, Euro, ChevronDown, ChevronUp, Package, Star } from 'lucide-react';
import { Delivery } from '@/hooks/useDeliveries';
import { DeliveryPerson } from '@/hooks/useDeliveryPersons';

interface DeliveryListProps {
  deliveries: Delivery[];
  deliveryPersons: DeliveryPerson[];
}

const statusConfig = {
  pending: { label: 'En attente', color: 'bg-yellow-500' },
  assigned: { label: 'Assignée', color: 'bg-blue-500' },
  in_transit: { label: 'En cours', color: 'bg-orange-500' },
  delivered: { label: 'Livrée', color: 'bg-green-500' },
  cancelled: { label: 'Annulée', color: 'bg-red-500' }
};

export const DeliveryList: React.FC<DeliveryListProps> = ({ deliveries, deliveryPersons }) => {
  const [expandedDeliveries, setExpandedDeliveries] = useState<Set<string>>(new Set());

  const toggleExpanded = (deliveryId: string) => {
    const newExpanded = new Set(expandedDeliveries);
    if (newExpanded.has(deliveryId)) {
      newExpanded.delete(deliveryId);
    } else {
      newExpanded.add(deliveryId);
    }
    setExpandedDeliveries(newExpanded);
  };

  const getDeliveryPerson = (personId: string) => {
    return deliveryPersons.find(person => person.id === personId);
  };

  if (deliveries.length === 0) {
    return (
      <div className="text-center py-8">
        <Package className="w-12 h-12 text-slate-600 mx-auto mb-4" />
        <p className="text-slate-400 text-lg mb-2">Aucune livraison trouvée</p>
        <p className="text-slate-500 text-sm">Sélectionnez une autre date</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {deliveries.map((delivery) => {
        const config = statusConfig[delivery.status as keyof typeof statusConfig] || statusConfig.pending;
        const deliveryDate = new Date(delivery.created_at);
        const isExpanded = expandedDeliveries.has(delivery.id);
        const deliveryPerson = getDeliveryPerson(delivery.delivery_person_id);
        
        return (
          <Card key={delivery.id} className="bg-slate-700/50 border-slate-600 hover:border-emerald-500/30 transition-colors">
            <CardContent className="p-4">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div>
                    <h3 className="font-semibold text-white">Commande #{delivery.order_id.slice(0, 8)}</h3>
                    <p className="text-sm text-slate-300">
                      {deliveryPerson ? deliveryPerson.name : 'Livreur non assigné'}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge className={`${config.color} text-white`}>
                    {config.label}
                  </Badge>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => toggleExpanded(delivery.id)}
                    className="text-slate-400 hover:text-white p-1"
                  >
                    {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                {deliveryPerson && (
                  <div className="flex items-center gap-2 text-slate-300">
                    <Phone className="w-4 h-4 text-emerald-400" />
                    <span>{deliveryPerson.phone}</span>
                  </div>
                )}

                <div className="flex items-center gap-2 text-slate-300">
                  <MapPin className="w-4 h-4 text-emerald-400" />
                  <span>{delivery.distance ? `${delivery.distance.toFixed(1)} km` : 'Distance inconnue'}</span>
                </div>

                <div className="flex items-center gap-2 text-slate-300">
                  <Euro className="w-4 h-4 text-emerald-400" />
                  <span>{delivery.fee?.toLocaleString() || 0} FCFA</span>
                </div>
              </div>

              {isExpanded && (
                <div className="mt-4 pt-4 border-t border-slate-600">
                  <div className="space-y-3">
                    {deliveryPerson && deliveryPerson.rating && (
                      <div className="flex items-center gap-2">
                        <Star className="w-4 h-4 text-yellow-400" />
                        <span className="text-white">Note: {deliveryPerson.rating}/5</span>
                      </div>
                    )}
                    
                    {delivery.estimated_time && (
                      <div className="flex items-center gap-2 text-slate-300">
                        <Clock className="w-4 h-4 text-emerald-400" />
                        <span>Temps estimé: {delivery.estimated_time} minutes</span>
                      </div>
                    )}

                    {delivery.notes && (
                      <div className="bg-slate-800/50 p-3 rounded-lg">
                        <p className="text-slate-300 text-sm">
                          <strong>Notes:</strong> {delivery.notes}
                        </p>
                      </div>
                    )}

                    {delivery.actual_delivery_time && (
                      <div className="text-xs text-slate-400">
                        <span>Livré le: {new Date(delivery.actual_delivery_time).toLocaleString('fr-FR')}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              <div className="flex items-center justify-between mt-4 pt-3 border-t border-slate-600">
                <div className="flex items-center gap-2 text-xs text-slate-400">
                  <Clock className="w-3 h-3" />
                  <span>Créée: {deliveryDate.toLocaleString('fr-FR')}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};
