
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Minus, Package } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Card, CardContent } from '@/components/ui/card';
import { useInventory } from '@/hooks/useInventory';

interface StockRemoveDialogProps {
  itemId: string;
  itemName: string;
  currentStock: number;
  onStockUpdate: () => void;
}

export const StockRemoveDialog: React.FC<StockRemoveDialogProps> = ({
  itemId,
  itemName,
  currentStock,
  onStockUpdate,
}) => {
  const { withdrawStock } = useInventory();
  const [isOpen, setIsOpen] = useState(false);
  const [quantity, setQuantity] = useState(0);
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRemoveStock = async () => {
    if (quantity <= 0 || quantity > currentStock) return;
    
    setLoading(true);
    try {
      const result = await withdrawStock(itemId, quantity, notes);
      
      if (result.success) {
        setIsOpen(false);
        setQuantity(0);
        setNotes('');
        onStockUpdate();
      } else {
        console.error('Erreur lors du retrait:', result.error);
        alert(result.error || 'Erreur lors du retrait de stock');
      }
    } catch (error) {
      console.error('Erreur lors du retrait de stock:', error);
      alert('Erreur lors du retrait de stock');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="destructive">
          <Minus className="w-4 h-4" />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="text-emerald-800">
            Retirer du stock - {itemName}
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
                <Label htmlFor="removeQuantity">Quantité à retirer</Label>
                <Input
                  id="removeQuantity"
                  type="number"
                  min="1"
                  max={currentStock}
                  value={quantity}
                  onChange={(e) => setQuantity(parseInt(e.target.value) || 0)}
                  className="border-emerald-200 focus:border-emerald-500"
                />
              </div>

              <div>
                <Label htmlFor="removeNotes">Notes (optionnel)</Label>
                <Input
                  id="removeNotes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Raison du retrait..."
                  className="border-emerald-200 focus:border-emerald-500"
                />
              </div>

              <div className="text-sm text-emerald-600">
                Nouveau stock: {Math.max(0, currentStock - quantity)}
              </div>

              <div className="flex gap-2 justify-end">
                <Button
                  variant="outline"
                  onClick={() => setIsOpen(false)}
                >
                  Annuler
                </Button>
                <Button
                  onClick={handleRemoveStock}
                  disabled={loading || quantity <= 0 || quantity > currentStock}
                  variant="destructive"
                >
                  {loading ? 'Retrait...' : 'Retirer'}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </DialogContent>
    </Dialog>
  );
};
