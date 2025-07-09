
import React, { useState } from 'react';
import { useDeliveryPersons } from '@/hooks/useDeliveryPersons';
import { AddDeliveryPersonDialog } from './AddDeliveryPersonDialog';
import { DeliveryPersonHeader } from './DeliveryPersonHeader';
import { DeliveryPersonSearchBar } from './DeliveryPersonSearchBar';
import { DeliveryPersonStats } from './DeliveryPersonStats';
import { DeliveryPersonTabs } from './DeliveryPersonTabs';

export const DeliveryPersonManagement: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const { deliveryPersons, loading, refetch } = useDeliveryPersons();

  const filteredPersons = deliveryPersons.filter(person =>
    person.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    person.phone.includes(searchTerm)
  );

  const availablePersons = filteredPersons.filter(person => person.available);
  const unavailablePersons = filteredPersons.filter(person => !person.available);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-center min-h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500 mx-auto mb-4"></div>
            <p className="text-white">Chargement des livreurs...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <DeliveryPersonHeader onAddClick={() => setIsAddDialogOpen(true)} />
      
      <DeliveryPersonSearchBar
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
      />

      <DeliveryPersonStats
        totalCount={deliveryPersons.length}
        availableCount={availablePersons.length}
        unavailableCount={unavailablePersons.length}
      />

      <DeliveryPersonTabs
        filteredPersons={filteredPersons}
        availablePersons={availablePersons}
        unavailablePersons={unavailablePersons}
        onStatusChanged={refetch}
      />

      <AddDeliveryPersonDialog
        isOpen={isAddDialogOpen}
        onClose={() => setIsAddDialogOpen(false)}
        onSuccess={() => {
          refetch();
          setIsAddDialogOpen(false);
        }}
      />
    </div>
  );
};
