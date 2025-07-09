
import React from 'react';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

interface NewInvoiceDialogProps {
  canCreate: boolean;
}

export const NewInvoiceDialog: React.FC<NewInvoiceDialogProps> = ({ canCreate }) => {
  const handleNavigateToOrders = () => {
    const event = new CustomEvent('navigate', { detail: 'orders' });
    window.dispatchEvent(event);
  };

  if (!canCreate) {
    return null;
  }

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button className="bg-emerald-600 hover:bg-emerald-700">
          <Plus className="w-4 h-4 mr-2" />
          Nouvelle facture
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Créer une nouvelle facture</AlertDialogTitle>
          <AlertDialogDescription>
            Cette fonctionnalité est en cours de développement. Pour l'instant, les factures sont automatiquement générées à partir des commandes terminées.
            <br /><br />
            Souhaitez-vous être redirigé vers la section des commandes pour créer une nouvelle commande qui générera automatiquement une facture ?
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Annuler</AlertDialogCancel>
          <AlertDialogAction 
            className="bg-emerald-600 hover:bg-emerald-700"
            onClick={handleNavigateToOrders}
          >
            Aller aux commandes
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
