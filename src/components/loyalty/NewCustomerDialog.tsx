
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus } from 'lucide-react';
import { toast } from 'sonner';

interface NewCustomerDialogProps {
  onAddCustomer: (customer: { name: string; phone: string; email: string }) => Promise<{ success: boolean }>;
}

export const NewCustomerDialog = ({ onAddCustomer }: NewCustomerDialogProps) => {
  const [newCustomer, setNewCustomer] = useState({
    name: '',
    phone: '',
    email: ''
  });

  const handleAddCustomer = async () => {
    if (!newCustomer.name || !newCustomer.phone) {
      toast.error('Nom et téléphone requis');
      return;
    }

    const result = await onAddCustomer(newCustomer);
    if (result.success) {
      toast.success('Client ajouté avec succès');
      setNewCustomer({ name: '', phone: '', email: '' });
    } else {
      toast.error('Erreur lors de l\'ajout du client');
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button className="bg-emerald-600 hover:bg-emerald-700">
          <Plus className="w-4 h-4 mr-2" />
          Nouveau Client
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Ajouter un nouveau client</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label htmlFor="name">Nom *</Label>
            <Input
              id="name"
              value={newCustomer.name}
              onChange={(e) => setNewCustomer({ ...newCustomer, name: e.target.value })}
            />
          </div>
          <div>
            <Label htmlFor="phone">Téléphone *</Label>
            <Input
              id="phone"
              value={newCustomer.phone}
              onChange={(e) => setNewCustomer({ ...newCustomer, phone: e.target.value })}
            />
          </div>
          <div>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={newCustomer.email}
              onChange={(e) => setNewCustomer({ ...newCustomer, email: e.target.value })}
            />
          </div>
          <Button onClick={handleAddCustomer} className="w-full bg-emerald-600 hover:bg-emerald-700">
            Ajouter le client
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
