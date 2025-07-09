import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Building2, Package } from 'lucide-react';
import { toast } from 'sonner';
import { apiClient } from '@/integrations/api/client';
import { useRestaurantId } from '@/contexts/AuthContext';

interface Supplier {
  id: string;
  name: string;
}

interface NewInventoryItemFormProps {
  onSuccess: () => void;
  onCancel: () => void;
  initialData?: any; // InventoryItemType
}

export const NewInventoryItemForm: React.FC<NewInventoryItemFormProps> = ({ onSuccess, onCancel, initialData }) => {
  const [loading, setLoading] = useState(false);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [itemData, setItemData] = useState({
    itemName: initialData?.item_name || '',
    currentStock: initialData?.current_stock || 0,
    minimumStock: initialData?.min_stock || 0,
    unit: initialData?.unit || 'units',
    costPerUnit: initialData?.cost_per_unit || 0,
    supplierId: initialData?.supplier_id || ''
  });

  useEffect(() => {
    fetchSuppliers();
  }, []);

  useEffect(() => {
    if (initialData) {
      setItemData({
        itemName: initialData.item_name || '',
        currentStock: initialData.current_stock || 0,
        minimumStock: initialData.min_stock || 0,
        unit: initialData.unit || 'units',
        costPerUnit: initialData.cost_per_unit || 0,
        supplierId: initialData.supplier_id || ''
      });
    }
  }, [initialData]);

  const fetchSuppliers = async () => {
    try {
      const response = await apiClient.get('/suppliers');
      if (response.success && response.data) {
        setSuppliers(response.data);
      } else {
        setSuppliers([]);
        console.error('Erreur lors du chargement des fournisseurs:', response.error);
      }
    } catch (error) {
      console.error('Erreur lors du chargement des fournisseurs:', error);
      setSuppliers([]);
    }
  };

  const formatCurrency = (amount: number) => {
    return `${amount.toFixed(0)} FCFA`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (initialData) {
        // Edition
        const response = await apiClient.patch(`/inventory/${initialData.id}`, {
          item_name: itemData.itemName,
          current_stock: itemData.currentStock,
          min_stock: itemData.minimumStock,
          unit: itemData.unit,
          cost_per_unit: itemData.costPerUnit,
          supplier_id: itemData.supplierId === 'none' ? null : itemData.supplierId
        });
        if (response.success) {
          toast.success('Article modifié avec succès !');
          onSuccess();
        } else {
          throw new Error(response.error || 'Erreur lors de la modification');
        }
      } else {
        // Création
        const response = await apiClient.post('/inventory', {
          name: itemData.itemName,
          current_stock: itemData.currentStock,
          min_stock: itemData.minimumStock,
          unit: itemData.unit,
          cost_per_unit: itemData.costPerUnit,
          supplier_id: itemData.supplierId === 'none' ? null : itemData.supplierId,
          category: 'general'
        });
        if (response.success) {
          toast.success('Article ajouté avec succès !');
          onSuccess();
        } else {
          throw new Error(response.error || 'Erreur lors de la création');
        }
      }
    } catch (error) {
      toast.error('Erreur lors de la sauvegarde de l\'article');
    } finally {
      setLoading(false);
    }
  };

  const totalValue = itemData.currentStock * itemData.costPerUnit;
  const selectedSupplier = suppliers.find(s => s.id === itemData.supplierId);

  return (
    <Card className="w-full max-w-lg">
      <CardHeader>
        <CardTitle className="text-emerald-800 flex items-center gap-2">
          <Package className="w-5 h-5" />
          Nouvel article d'inventaire
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="itemName">Nom de l'article *</Label>
            <Input
              id="itemName"
              value={itemData.itemName}
              onChange={(e) => setItemData({...itemData, itemName: e.target.value})}
              required
              className="border-emerald-200 focus:border-emerald-500"
              placeholder="Ex: Tomates, Farine, Huile d'olive..."
            />
          </div>

          <div>
            <Label htmlFor="supplier" className="flex items-center gap-2">
              <Building2 className="w-4 h-4" />
              Fournisseur
            </Label>
            <Select value={itemData.supplierId} onValueChange={(value) => setItemData({...itemData, supplierId: value})}>
              <SelectTrigger className="border-emerald-200">
                <SelectValue placeholder="Sélectionnez un fournisseur" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Aucun fournisseur</SelectItem>
                {suppliers.map((supplier) => (
                  <SelectItem key={supplier.id} value={supplier.id}>
                    <div className="flex items-center gap-2">
                      <Building2 className="w-3 h-3" />
                      {supplier.name}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {selectedSupplier && (
              <p className="text-xs text-emerald-600 mt-1">
                Fournisseur sélectionné: {selectedSupplier.name}
              </p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="currentStock">Stock actuel *</Label>
              <Input
                id="currentStock"
                type="number"
                min="0"
                value={itemData.currentStock}
                onChange={(e) => setItemData({...itemData, currentStock: parseInt(e.target.value) || 0})}
                required
                className="border-emerald-200 focus:border-emerald-500"
              />
            </div>
            <div>
              <Label htmlFor="minimumStock">Stock minimum *</Label>
              <Input
                id="minimumStock"
                type="number"
                min="0"
                value={itemData.minimumStock}
                onChange={(e) => setItemData({...itemData, minimumStock: parseInt(e.target.value) || 0})}
                required
                className="border-emerald-200 focus:border-emerald-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="unit">Unité</Label>
              <Select value={itemData.unit} onValueChange={(value) => setItemData({...itemData, unit: value})}>
                <SelectTrigger className="border-emerald-200">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="units">Unités</SelectItem>
                  <SelectItem value="kg">Kilogrammes</SelectItem>
                  <SelectItem value="g">Grammes</SelectItem>
                  <SelectItem value="l">Litres</SelectItem>
                  <SelectItem value="ml">Millilitres</SelectItem>
                  <SelectItem value="pieces">Pièces</SelectItem>
                  <SelectItem value="packages">Emballages</SelectItem>
                  <SelectItem value="boxes">Boîtes</SelectItem>
                  <SelectItem value="bottles">Bouteilles</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="costPerUnit">Coût unitaire (FCFA)</Label>
              <Input
                id="costPerUnit"
                type="number"
                min="0"
                step="1"
                value={itemData.costPerUnit}
                onChange={(e) => setItemData({...itemData, costPerUnit: parseFloat(e.target.value) || 0})}
                className="border-emerald-200 focus:border-emerald-500"
              />
            </div>
          </div>

          {totalValue > 0 && (
            <div className="p-4 bg-emerald-50 rounded-lg border border-emerald-200">
              <div className="space-y-2">
                <p className="text-sm text-emerald-700">
                  <strong>Valeur totale du stock:</strong> {formatCurrency(totalValue)}
                </p>
                {selectedSupplier && (
                  <p className="text-sm text-emerald-600">
                    <strong>Fournisseur:</strong> {selectedSupplier.name}
                  </p>
                )}
              </div>
            </div>
          )}

          <div className="flex gap-2 justify-end pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              className="border-gray-300"
            >
              Annuler
            </Button>
            <Button
              type="submit"
              disabled={loading || !itemData.itemName}
              className="bg-emerald-600 hover:bg-emerald-700"
            >
              {loading ? 'Création...' : 'Ajouter l\'article'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};
