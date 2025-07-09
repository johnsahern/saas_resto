
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Users, UserCheck, UserX } from 'lucide-react';
import { DeliveryPerson } from '@/hooks/useDeliveryPersons';
import { DeliveryPersonCard } from './DeliveryPersonCard';

interface DeliveryPersonTabsProps {
  filteredPersons: DeliveryPerson[];
  availablePersons: DeliveryPerson[];
  unavailablePersons: DeliveryPerson[];
  onStatusChanged: () => void;
}

export const DeliveryPersonTabs: React.FC<DeliveryPersonTabsProps> = ({
  filteredPersons,
  availablePersons,
  unavailablePersons,
  onStatusChanged
}) => (
  <Tabs defaultValue="all" className="w-full">
    <TabsList className="grid w-full grid-cols-3 bg-slate-800 border-slate-700">
      <TabsTrigger value="all" className="text-slate-400 data-[state=active]:text-emerald-400 data-[state=active]:bg-emerald-900/30">
        Tous les livreurs ({filteredPersons.length})
      </TabsTrigger>
      <TabsTrigger value="available" className="text-slate-400 data-[state=active]:text-green-400 data-[state=active]:bg-green-900/30">
        Disponibles ({availablePersons.length})
      </TabsTrigger>
      <TabsTrigger value="unavailable" className="text-slate-400 data-[state=active]:text-red-400 data-[state=active]:bg-red-900/30">
        Indisponibles ({unavailablePersons.length})
      </TabsTrigger>
    </TabsList>

    <TabsContent value="all" className="mt-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredPersons.map((person) => (
          <DeliveryPersonCard key={person.id} person={person} onStatusChanged={onStatusChanged} />
        ))}
      </div>
      {filteredPersons.length === 0 && (
        <div className="text-center py-8">
          <Users className="w-12 h-12 text-slate-600 mx-auto mb-4" />
          <p className="text-slate-400 text-lg">Aucun livreur trouvé</p>
        </div>
      )}
    </TabsContent>

    <TabsContent value="available" className="mt-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {availablePersons.map((person) => (
          <DeliveryPersonCard key={person.id} person={person} onStatusChanged={onStatusChanged} />
        ))}
      </div>
      {availablePersons.length === 0 && (
        <div className="text-center py-8">
          <UserCheck className="w-12 h-12 text-slate-600 mx-auto mb-4" />
          <p className="text-slate-400 text-lg">Aucun livreur disponible</p>
        </div>
      )}
    </TabsContent>

    <TabsContent value="unavailable" className="mt-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {unavailablePersons.map((person) => (
          <DeliveryPersonCard key={person.id} person={person} onStatusChanged={onStatusChanged} />
        ))}
      </div>
      {unavailablePersons.length === 0 && (
        <div className="text-center py-8">
          <UserX className="w-12 h-12 text-slate-600 mx-auto mb-4" />
          <p className="text-slate-400 text-lg">Aucun livreur indisponible</p>
        </div>
      )}
    </TabsContent>
  </Tabs>
);
