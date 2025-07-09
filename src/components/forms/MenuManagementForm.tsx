import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Plus, Edit2, Trash2, Save, X } from 'lucide-react';
import { useRestaurantMenus, RestaurantMenuItem } from '@/hooks/useRestaurantMenus';
import { useToast } from '@/hooks/use-toast';
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

export const MenuManagementForm: React.FC = () => {
  const { menus, loading, addMenuItem, updateMenuItem, deleteMenuItem, getMenusByCategory } = useRestaurantMenus();
  const { toast } = useToast();
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    category: '',
    is_available: true
  });

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      price: '',
      category: '',
      is_available: true
    });
    setIsAdding(false);
    setEditingId(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.price) {
      toast({
        title: "Erreur",
        description: "Le nom et le prix sont obligatoires.",
        variant: "destructive",
      });
      return;
    }

    const menuData = {
      name: formData.name,
      description: formData.description || null,
      price: parseFloat(formData.price),
      category: formData.category || null,
      is_available: formData.is_available
    };

    let result;
    if (editingId) {
      result = await updateMenuItem(editingId, menuData);
    } else {
      result = await addMenuItem(menuData);
    }

    if (result.success) {
      toast({
        title: "Succès",
        description: editingId ? "Article modifié avec succès." : "Article ajouté avec succès.",
      });
      resetForm();
    } else {
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de l'opération.",
        variant: "destructive",
      });
    }
  };

  const startEdit = (item: RestaurantMenuItem) => {
    setFormData({
      name: item.name,
      description: item.description || '',
      price: item.price.toString(),
      category: item.category || '',
      is_available: item.is_available
    });
    setEditingId(item.id);
    setIsAdding(false);
  };

  const handleDelete = async (id: string) => {
    const result = await deleteMenuItem(id);
    if (result.success) {
      toast({
        title: "Succès",
        description: "Article supprimé avec succès.",
      });
    } else {
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de la suppression.",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <p className="text-center text-emerald-600">Chargement du menu...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-emerald-800">Gestion du menu</CardTitle>
            <Button 
              onClick={() => setIsAdding(true)}
              className="bg-emerald-600 hover:bg-emerald-700"
            >
              <Plus className="w-4 h-4 mr-2" />
              Ajouter un article
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {(isAdding || editingId) && (
            <form onSubmit={handleSubmit} className="space-y-4 p-4 border border-emerald-200 rounded-lg mb-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Nom de l'article *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Nom de l'article"
                    className="border-emerald-200 focus:border-emerald-500"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="price">Prix (FCFA) *</Label>
                  <Input
                    id="price"
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    placeholder="Prix en FCFA"
                    className="border-emerald-200 focus:border-emerald-500"
                    required
                  />
                </div>
              </div>
              
              <div>
                <Label htmlFor="category">Catégorie</Label>
                <Input
                  id="category"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  placeholder="Catégorie (ex: Plats principaux, Boissons)"
                  className="border-emerald-200 focus:border-emerald-500"
                />
              </div>
              
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Description de l'article"
                  className="border-emerald-200 focus:border-emerald-500"
                  rows={3}
                />
              </div>
              
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="is_available"
                  checked={formData.is_available}
                  onChange={(e) => setFormData({ ...formData, is_available: e.target.checked })}
                  className="rounded border-emerald-300"
                />
                <Label htmlFor="is_available">Article disponible</Label>
              </div>
              
              <div className="flex gap-2">
                <Button type="submit" className="bg-emerald-600 hover:bg-emerald-700">
                  <Save className="w-4 h-4 mr-2" />
                  {editingId ? 'Modifier' : 'Ajouter'}
                </Button>
                <Button type="button" variant="outline" onClick={resetForm}>
                  <X className="w-4 h-4 mr-2" />
                  Annuler
                </Button>
              </div>
            </form>
          )}

          <div className="space-y-6">
            {getMenusByCategory().map(({ category, items }) => (
              <div key={category}>
                <h3 className="text-lg font-semibold text-emerald-800 mb-3">{category}</h3>
                <div className="grid gap-3">
                  {items.map((item) => (
                    <div key={item.id} className="flex items-center justify-between p-4 border border-emerald-100 rounded-lg">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h4 className="font-medium text-emerald-800">{item.name}</h4>
                          {!item.is_available && (
                            <span className="text-xs bg-red-100 text-red-600 px-2 py-1 rounded">
                              Indisponible
                            </span>
                          )}
                        </div>
                        {item.description && (
                          <p className="text-sm text-emerald-600 mt-1">{item.description}</p>
                        )}
                        <p className="text-lg font-bold text-emerald-800 mt-1">
                          {item.price ? (typeof item.price === 'number' ? item.price.toFixed(0) : Number(item.price).toFixed(0)) : '0'} FCFA
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => startEdit(item)}
                          className="border-emerald-500 text-emerald-600"
                        >
                          <Edit2 className="w-4 h-4" />
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              variant="outline"
                              size="sm"
                              className="border-red-500 text-red-600 hover:bg-red-50"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Supprimer l'article</AlertDialogTitle>
                              <AlertDialogDescription>
                                Êtes-vous sûr de vouloir supprimer "{item.name}" ? 
                                Cette action ne peut pas être annulée.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Annuler</AlertDialogCancel>
                              <AlertDialogAction 
                                className="bg-red-600 hover:bg-red-700"
                                onClick={() => handleDelete(item.id)}
                              >
                                Supprimer
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {menus.length === 0 && (
            <div className="text-center py-8">
              <p className="text-emerald-600">Aucun article dans le menu.</p>
              <p className="text-sm text-emerald-500 mt-1">
                Commencez par ajouter des articles à votre menu.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
