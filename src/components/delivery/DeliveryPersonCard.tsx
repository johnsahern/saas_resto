import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Phone, Star, MapPin } from 'lucide-react';
import { DeliveryPerson } from '@/hooks/useDeliveryPersons';
import { DeliveryPersonStatusToggle } from './DeliveryPersonStatusToggle';

interface DeliveryPersonCardProps {
  person: DeliveryPerson;
  onStatusChanged: () => void;
}

export const DeliveryPersonCard: React.FC<DeliveryPersonCardProps> = ({ 
  person, 
  onStatusChanged 
}) => (
  <Card className="bg-slate-700/50 border-slate-600 hover:border-emerald-500/30 transition-colors">
    <CardContent className="p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-gradient-to-br from-emerald-500/20 to-green-500/20 rounded-full flex items-center justify-center border border-emerald-500/30">
            <span className="text-emerald-400 font-bold text-lg">
              {person.name.charAt(0).toUpperCase()}
            </span>
          </div>
          <div>
            <h3 className="font-semibold text-white">{person.name}</h3>
            <div className="flex items-center gap-2 text-sm text-slate-300">
              <Phone className="w-3 h-3" />
              <span>{person.phone}</span>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          {person.rating && (
            <div className="flex items-center gap-1">
              <Star className="w-4 h-4 text-yellow-400 fill-current" />
              <span className="text-white text-sm">{person.rating}</span>
            </div>
          )}
          <Badge className={person.available ? "bg-green-500 text-white" : "bg-red-500 text-white"}>
            {person.available ? 'Disponible' : 'Indisponible'}
          </Badge>
        </div>
      </div>
      
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-xs text-slate-400">
          <MapPin className="w-3 h-3" />
          <span>Position en temps réel</span>
        </div>
        <div className="flex gap-2 items-center">
          <DeliveryPersonStatusToggle 
            personId={person.id}
            isActive={person.available}
            onStatusChange={onStatusChanged}
          />
          <Button
            variant="ghost"
            size="sm"
            className="text-emerald-400 hover:text-emerald-300 hover:bg-emerald-500/10 p-2"
          >
            <MapPin className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </CardContent>
  </Card>
);
