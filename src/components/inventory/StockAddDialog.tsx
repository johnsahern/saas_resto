
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus, Package } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Card, CardContent } from '@/components/ui/card';
import { useInventory } from '@/hooks/useInventory';

interface StockAddDialogProps {
  itemId: string;
  itemName: string;
  currentStock: number;
  onStockUpdate: () => void;
}

export const StockAddDialog: React.FC<StockAddDialogProps> = ({
  itemId,
  itemName,
  currentStock,
  onStockUpdate,
}) => {
  const { addStock } = useInventory();
  const [isOpen, setIsOpen] = useState(false);
  const [quantity, setQuantity] = useState(0);
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);

  const handleAddStock = async () => {
    if (quantity <= 0) return;
    
    setLoading(true);
    try {
      const result = await addStock(itemId, quantity, notes);
      
      if (result.success) {
        setIsOpen(false);
        setQuantity(0);
        setNotes('');
        onStockUpdate();
      } else {
        console.error('Erreur lors de l\'ajout:', result.error);
        alert(result.error || 'Erreur lors de l\'ajout de stock');
      }
    } catch (error) {
      console.error('Erreur lors de l\'ajout de stock:', error);
      alert('Erreur lors de l\'ajout de stock');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button size="sm" className="bg-green-600 hover:bg-green-700">
          <Plus className="w-4 h-4" />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="text-emerald-800">
            Ajouter du stock - {itemName}
          </DialogTitle>
        </DialogHeader>
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-emerald-600">
                <Package className="w-4 h-4" />
                <span>Stock actuel: {currentStock}</span>
              </div>
              
              <div>
                <Label htmlFor="addQuantity">Quantité à ajouter</Label>
                <Input
                  id="addQuantity"
                  type="number"
                  min="1"
                  value={quantity}
                  onChange={(e) => setQuantity(parseInt(e.target.value) || 0)}
                  className="border-emerald-200 focus:border-emerald-500"
                />
              </div>

              <div>
                <Label htmlFor="addNotes">Notes (optionnel)</Label>
                <Input
                  id="addNotes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Raison de l'ajout..."
                  className="border-emerald-200 focus:border-emerald-500"
                />
              </div>

              <div className="text-sm text-emerald-600">
                Nouveau stock: {currentStock + quantity}
              </div>

              <div className="flex gap-2 justify-end">
                <Button
                  variant="outline"
                  onClick={() => setIsOpen(false)}
                >
                  Annuler
                </Button>
                <Button
                  onClick={handleAddStock}
                  disabled={loading || quantity <= 0}
                  className="bg-green-600 hover:bg-green-700"
                >
                  {loading ? 'Ajout...' : 'Ajouter'}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </DialogContent>
    </Dialog>
  );
};
