import React, { useState, useEffect } from 'react';
import { apiClient } from '@/integrations/api/client';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { toast } from '@/components/ui/use-toast';
import { useRestaurantId } from '@/contexts/AuthContext';

interface DeliveryPerson {
  id: string;
  name: string;
  phone: string;
  available: boolean;
  rating: number | null;
}

interface DeliveryAssignmentModalProps {
  orderId: string | null;
  orderNumber: string;
  customerAddress: string;
  isOpen: boolean;
  onClose: () => void;
  onComplete: (deliveryPartnerId: string) => void;
}

export function DeliveryAssignmentModal({
  orderId,
  orderNumber,
  customerAddress,
  isOpen,
  onClose,
  onComplete
}: DeliveryAssignmentModalProps) {
  const [deliveryPersons, setDeliveryPersons] = useState<DeliveryPerson[]>([]);
  const [selectedDeliveryPersonId, setSelectedDeliveryPersonId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const restaurantId = useRestaurantId();

  useEffect(() => {
    const fetchDeliveryPersons = async () => {
      if (!isOpen) return;
      setLoading(true);
      
      try {
        const response = await apiClient.get(`/delivery-persons?restaurant_id=${restaurantId}&is_active=true`);

        if (response.success) {
          setDeliveryPersons(response.data || []);
          if (response.data && response.data.length > 0) {
            setSelectedDeliveryPersonId(response.data[0].id);
          }
        } else {
          throw new Error(response.error);
        }
      } catch (error) {
        console.error('Erreur lors du chargement des livreurs:', error);
        toast({
          title: 'Erreur',
          description: 'Impossible de charger la liste des livreurs',
          variant: 'destructive'
        });
      } finally {
        setLoading(false);
      }
    };

    fetchDeliveryPersons();
  }, [isOpen]);

  const handleAssignDeliveryPerson = async () => {
    if (!selectedDeliveryPersonId || !orderId) {
      toast({
        title: 'Erreur',
        description: 'Veuillez sélectionner un livreur et vérifier l\'ID de la commande',
        variant: 'destructive'
      });
      return;
    }

    setLoading(true);

    try {
      // Créer une livraison
      const deliveryResponse = await apiClient.post('/deliveries', {
        order_id: orderId,
        delivery_person_id: selectedDeliveryPersonId,
        status: 'assigned',
        notes: `Livraison assignée manuellement pour la commande #${orderNumber}`
      });

      if (!deliveryResponse.success) {
        throw new Error(deliveryResponse.error);
      }

      // Mettre à jour le statut du livreur
      const personResponse = await apiClient.patch(`/delivery-persons/${selectedDeliveryPersonId}`, {
        available: false
      });

      if (!personResponse.success) {
        console.warn('Erreur lors de la mise à jour du livreur:', personResponse.error);
      }

      toast({
        title: 'Succès',
        description: 'Livreur assigné avec succès'
      });
      onComplete(selectedDeliveryPersonId);
    } catch (error: any) {
      console.error('Erreur lors de l\'assignation du livreur:', error);
      toast({
        title: 'Erreur',
        description: error.message || 'Impossible d\'assigner le livreur',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Assigner un livreur</DialogTitle>
          <DialogDescription>
            Commande #{orderNumber} - Adresse: {customerAddress}
          </DialogDescription>
        </DialogHeader>

        {deliveryPersons.length === 0 ? (
          <div className="text-center py-4">
            <p className="text-red-500">Aucun livreur disponible actuellement</p>
            <p className="text-sm text-gray-500 mt-2">Ajoutez des livreurs ou attendez qu'un livreur soit disponible</p>
          </div>
        ) : (
          <RadioGroup 
            value={selectedDeliveryPersonId || ''} 
            onValueChange={setSelectedDeliveryPersonId}
            className="space-y-3 py-4"
          >
            {deliveryPersons.map((person) => (
              <div key={person.id} className="flex items-center space-x-2 border p-3 rounded-md">
                <RadioGroupItem value={person.id} id={person.id} />
                <Label htmlFor={person.id} className="flex-1 cursor-pointer">
                  <div>
                    <span className="font-medium">{person.name}</span>
                    <span className="ml-2 text-sm text-gray-500">{person.phone}</span>
                  </div>
                  {!isNaN(parseFloat(person.rating as any)) && isFinite(Number(person.rating)) && (
                    <div className="text-sm text-yellow-500">
                      Note: {Number(person.rating).toFixed(1)} ★
                    </div>
                  )}
                </Label>
              </div>
            ))}
          </RadioGroup>
        )}

        <DialogFooter className="flex flex-row justify-between">
          <Button variant="outline" onClick={onClose} disabled={loading}>
            Annuler
          </Button>
          <Button 
            onClick={handleAssignDeliveryPerson} 
            disabled={!selectedDeliveryPersonId || loading || deliveryPersons.length === 0}
            className="ml-2"
          >
            {loading ? 'Assignation...' : 'Assigner le livreur'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}