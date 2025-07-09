import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Plus, Search, AlertCircle } from 'lucide-react';
import { useRestaurantMenus, RestaurantMenuItem } from '@/hooks/useRestaurantMenus';

interface OrderItem {
  name: string;
  quantity: number;
  price: number;
  menu_item_id?: string;
}

interface MenuItemSelectorProps {
  onAddItem: (item: OrderItem) => void;
}

export const MenuItemSelector: React.FC<MenuItemSelectorProps> = ({ onAddItem }) => {
  const { menus, loading, getMenusByCategory } = useRestaurantMenus();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  console.log('MenuItemSelector - menus:', menus, 'loading:', loading);

  const filteredMenus = menus.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
    return matchesSearch && matchesCategory && item.is_available;
  });

  const categories = [...new Set(menus.map(item => item.category || 'Autres'))];

  const handleAddMenuItem = (menuItem: RestaurantMenuItem) => {
    console.log('Adding menu item to order:', menuItem);
    onAddItem({
      name: menuItem.name,
      quantity: 1,
      price: Number(menuItem.price),
      menu_item_id: menuItem.id
    });
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-4">
          <p className="text-center text-emerald-600">Chargement du menu...</p>
        </CardContent>
      </Card>
    );
  }

  if (menus.length === 0) {
    return (
      <Card className="border-emerald-200">
        <CardHeader>
          <CardTitle className="text-emerald-800 flex items-center gap-2">
            <AlertCircle className="w-5 h-5" />
            Menu non disponible
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-emerald-600">
            Aucun élément de menu n'est disponible pour le moment. 
            Veuillez d'abord ajouter des articles au menu dans l'onglet "Gestion du menu".
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-emerald-200">
      <CardHeader>
        <CardTitle className="text-emerald-800">Sélectionner depuis le menu</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-emerald-500 w-4 h-4" />
            <Input
              placeholder="Rechercher un plat..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 border-emerald-200 focus:border-emerald-500"
            />
          </div>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-3 py-2 border border-emerald-200 rounded-md focus:border-emerald-500"
          >
            <option value="all">Toutes catégories</option>
            {categories.map(category => (
              <option key={category} value={category}>{category}</option>
            ))}
          </select>
        </div>

        <div className="max-h-64 overflow-y-auto space-y-2">
          {filteredMenus.length === 0 ? (
            <p className="text-center text-emerald-600 py-4">Aucun plat trouvé</p>
          ) : (
            filteredMenus.map((item) => (
              <div key={item.id} className="flex items-center justify-between p-3 border border-emerald-100 rounded-lg hover:bg-emerald-50">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h4 className="font-medium text-emerald-800">{item.name}</h4>
                    {item.category && (
                      <Badge variant="outline" className="text-xs border-emerald-300">
                        {item.category}
                      </Badge>
                    )}
                  </div>
                  {item.description && (
                    <p className="text-sm text-emerald-600 mt-1">{item.description}</p>
                  )}
                  <p className="text-lg font-bold text-emerald-800 mt-1">
                    {Number(item.price).toFixed(0)} FCFA
                  </p>
                </div>
                <Button
                  type="button"
                  size="sm"
                  onClick={() => handleAddMenuItem(item)}
                  className="bg-emerald-600 hover:bg-emerald-700"
                >
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
};
