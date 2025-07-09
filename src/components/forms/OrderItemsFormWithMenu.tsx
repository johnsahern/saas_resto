import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Minus } from 'lucide-react';
import { MenuItemSelector } from './MenuItemSelector';

interface OrderItem {
  name: string;
  quantity: number;
  price: number; // Prix en centimes
  menu_item_id?: string;
}

interface OrderItemsFormWithMenuProps {
  items: OrderItem[];
  onItemsChange: (items: OrderItem[]) => void;
}

export const OrderItemsFormWithMenu: React.FC<OrderItemsFormWithMenuProps> = ({ 
  items, 
  onItemsChange 
}) => {
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
    if (field === 'price' && typeof value === 'number') {
      // Convertir le prix en centimes
      updatedItems[index] = { 
        ...updatedItems[index], 
        [field]: Math.round(value * 100)
      };
    } else {
      updatedItems[index] = { ...updatedItems[index], [field]: value };
    }
    onItemsChange(updatedItems);
  };

  const addMenuItemToOrder = (menuItem: OrderItem) => {
    // Vérifier si l'article existe déjà dans la commande
    const existingItemIndex = items.findIndex(item => item.name === menuItem.name);
    
    if (existingItemIndex >= 0) {
      // Si l'article existe, augmenter la quantité
      const updatedItems = [...items];
      updatedItems[existingItemIndex].quantity += 1;
      onItemsChange(updatedItems);
    } else {
      // Sinon, ajouter un nouvel article
      onItemsChange([...items, {
        ...menuItem,
        price: menuItem.price // Prix en FCFA
      }]);
    }
  };

  return (
    <div>
      <Label>Articles de la commande</Label>
      <Tabs defaultValue="menu" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="menu">Depuis le menu</TabsTrigger>
          <TabsTrigger value="manual">Saisie manuelle</TabsTrigger>
        </TabsList>
        
        <TabsContent value="menu" className="space-y-4">
          <MenuItemSelector onAddItem={addMenuItemToOrder} />
          
          {items.length > 0 && (
            <div className="space-y-2">
              <Label className="text-sm font-medium">Articles sélectionnés :</Label>
              {items.map((item, index) => (
                <div key={index} className="flex gap-2 items-end p-2 bg-emerald-50 rounded-lg">
                  <div className="flex-1">
                    <span className="font-medium text-emerald-800">{item.name}</span>
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
                    <span className="text-sm font-bold text-emerald-800">
                      {item.price.toFixed(0)} FCFA
                    </span>
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
          )}
        </TabsContent>
        
        <TabsContent value="manual" className="space-y-2">
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
                  placeholder="Prix FCFA"
                  min="0"
                  step="0.01"
                  value={(item.price / 100).toFixed(2)}
                  onChange={(e) => updateItem(index, 'price', parseFloat(e.target.value))}
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
          
          <Button
            type="button"
            variant="outline"
            onClick={addItem}
            className="mt-2 border-emerald-500 text-emerald-600 hover:bg-emerald-50"
          >
            <Plus className="w-4 h-4 mr-2" />
            Ajouter un article
          </Button>
        </TabsContent>
      </Tabs>
    </div>
  );
};
