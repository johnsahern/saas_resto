
import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus, Minus } from 'lucide-react';

interface OrderItem {
  name: string;
  quantity: number;
  price: number;
}

interface OrderItemsFormProps {
  items: OrderItem[];
  onItemsChange: (items: OrderItem[]) => void;
}

export const OrderItemsForm: React.FC<OrderItemsFormProps> = ({ items, onItemsChange }) => {
  const addItem = () => {
    onItemsChange([...items, { name: '', quantity: 1, price: 0 }]);
  };

  const removeItem = (index: number) => {
    if (items.length > 1) {
      onItemsChange(items.filter((_, i) => i !== index));
    }
  };

  const updateItem = (index: number, field: keyof OrderItem, value: string | number) => {
    const updatedItems = [...items];
    updatedItems[index] = { ...updatedItems[index], [field]: value };
    onItemsChange(updatedItems);
  };

  return (
    <div>
      <Label>Articles de la commande</Label>
      <div className="space-y-2">
        {items.map((item, index) => (
          <div key={index} className="flex gap-2 items-end">
            <div className="flex-1">
              <Input
                placeholder="Nom de l'article"
                value={item.name}
                onChange={(e) => updateItem(index, 'name', e.target.value)}
                className="border-emerald-200 focus:border-emerald-500"
              />
            </div>
            <div className="w-20">
              <Input
                type="number"
                placeholder="Qté"
                min="1"
                value={item.quantity}
                onChange={(e) => updateItem(index, 'quantity', parseInt(e.target.value) || 1)}
                className="border-emerald-200 focus:border-emerald-500"
              />
            </div>
            <div className="w-24">
              <Input
                type="number"
                placeholder="Prix €"
                min="0"
                step="0.01"
                value={item.price}
                onChange={(e) => updateItem(index, 'price', parseFloat(e.target.value) || 0)}
                className="border-emerald-200 focus:border-emerald-500"
              />
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => removeItem(index)}
              disabled={items.length === 1}
              className="border-red-300 text-red-600 hover:bg-red-50"
            >
              <Minus className="w-4 h-4" />
            </Button>
          </div>
        ))}
      </div>
      <Button
        type="button"
        variant="outline"
        onClick={addItem}
        className="mt-2 border-emerald-500 text-emerald-600 hover:bg-emerald-50"
      >
        <Plus className="w-4 h-4 mr-2" />
        Ajouter un article
      </Button>
    </div>
  );
};
