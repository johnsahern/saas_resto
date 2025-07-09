
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Phone, Star, MapPin } from 'lucide-react';
import { DeliveryPerson } from '@/hooks/useDeliveryPersons';

interface AvailableDriversListProps {
  deliveryPersons: DeliveryPerson[];
}

export const AvailableDriversList: React.FC<AvailableDriversListProps> = ({ deliveryPersons }) => {
  const availableDrivers = deliveryPersons.filter(person => person.available);

  if (availableDrivers.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-slate-400">Aucun livreur disponible</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {availableDrivers.map((driver) => (
        <Card key={driver.id} className="bg-slate-700/50 border-slate-600 hover:border-emerald-500/30 transition-colors">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-emerald-500/20 rounded-full flex items-center justify-center">
                  <span className="text-emerald-400 font-semibold">
                    {driver.name.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div>
                  <h3 className="font-semibold text-white">{driver.name}</h3>
                  <div className="flex items-center gap-2 text-sm text-slate-300">
                    <Phone className="w-3 h-3" />
                    <span>{driver.phone}</span>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                {driver.rating && (
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 text-yellow-400 fill-current" />
                    <span className="text-white text-sm">{driver.rating}</span>
                  </div>
                )}
                <Badge className="bg-green-500 text-white">
                  Disponible
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
