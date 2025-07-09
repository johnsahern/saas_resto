import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { Alert } from '@/components/ui/alert';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Loader2, Plus, Trash2, Edit2, Key, RefreshCw } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { managerService, Manager } from '@/services/managerService';

export const ManagerManagement: React.FC = () => {
  const { user, restaurant } = useAuth();
  const { toast } = useToast();
  const [managers, setManagers] = useState<Manager[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedManager, setSelectedManager] = useState<Manager | null>(null);
  const [newManager, setNewManager] = useState({
    email: '',
    name: '',
    password: '',
    confirmPassword: '',
  });
  const [managerCode, setManagerCode] = useState<string | null>(null);

  // Charger la liste des managers
  const loadManagers = async () => {
    if (!restaurant?.id) return;
    
    setIsLoading(true);
    try {
      const { managers: loadedManagers, managerCode } = await managerService.getManagersByRestaurant(restaurant.id);
      setManagers(loadedManagers);
      setManagerCode(managerCode);
      setError('');
    } catch (err) {
      setError('Erreur lors du chargement des managers');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadManagers();
  }, [restaurant?.id]);

  // Générer un nouveau code restaurant
  const handleGenerateNewCode = async (managerId: string) => {
    if (!restaurant?.id) return;
    
    try {
      const newCode = await managerService.generateRestaurantCode(restaurant.id);
      await managerService.updateManager(managerId, { restaurantCode: newCode });
      toast({
        title: "Succès",
        description: "Nouveau code restaurant généré",
      });
      loadManagers();
    } catch (err) {
      toast({
        title: "Erreur",
        description: "Erreur lors de la génération du code",
        variant: "destructive",
      });
    }
  };

  // Ajouter un nouveau manager
  const handleAddManager = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!restaurant?.id) return;

    if (newManager.password !== newManager.confirmPassword) {
      toast({
        title: "Erreur",
        description: "Les mots de passe ne correspondent pas",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      // Découper le nom en prénom et nom
      const [firstName, ...lastNameParts] = newManager.name.trim().split(' ');
      const lastName = lastNameParts.join(' ');
      await managerService.createManager({
        firstName,
        lastName,
        email: newManager.email,
        password: newManager.password,
        restaurantId: restaurant.id,
        phone: newManager.phone || ''
      });
      toast({
        title: "Succès",
        description: "Le manager a été créé avec succès",
      });
      
      setIsAddDialogOpen(false);
      setNewManager({
        email: '',
        name: '',
        password: '',
        confirmPassword: '',
      });
      loadManagers();
    } catch (err) {
      toast({
        title: "Erreur",
        description: "Erreur lors de la création du manager",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Désactiver un manager
  const handleDeactivateManager = async (managerId: string) => {
    setIsLoading(true);
    try {
      await managerService.deactivateManager(managerId);
      
      toast({
        title: "Succès",
        description: "Le manager a été désactivé",
      });
      
      loadManagers();
    } catch (err) {
      toast({
        title: "Erreur",
        description: "Erreur lors de la désactivation du manager",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="mb-4">
        <Label>Code restaurant (à communiquer aux managers)</Label>
        <div className="flex items-center space-x-2">
          <Input value={managerCode || ''} readOnly className="w-32 font-mono" />
          <Button type="button" onClick={() => { navigator.clipboard.writeText(managerCode || ''); toast({ title: 'Code copié !' }); }} disabled={!managerCode} variant="outline" size="sm">
            Copier
          </Button>
        </div>
      </div>
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Gestion des Managers</h2>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Ajouter un Manager
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Ajouter un nouveau manager</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleAddManager} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nom complet</Label>
                <Input
                  id="name"
                  value={newManager.name}
                  onChange={(e) => setNewManager({ ...newManager, name: e.target.value })}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={newManager.email}
                  onChange={(e) => setNewManager({ ...newManager, email: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Mot de passe</Label>
                <Input
                  id="password"
                  type="password"
                  value={newManager.password}
                  onChange={(e) => setNewManager({ ...newManager, password: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirmer le mot de passe</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={newManager.confirmPassword}
                  onChange={(e) => setNewManager({ ...newManager, confirmPassword: e.target.value })}
                  required
                />
              </div>

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Création...
                  </>
                ) : (
                  'Créer le manager'
                )}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {error && (
        <Alert variant="destructive">
          {error}
        </Alert>
      )}

      <div className="grid gap-4">
        {managers.map((manager) => (
          <Card key={manager.id} className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium">{manager.name}</h3>
                <p className="text-sm text-gray-500">{manager.email}</p>
                <div className="flex items-center mt-2 text-sm text-gray-500">
                  <Key className="h-4 w-4 mr-1" />
                  Code Restaurant: {manager.restaurantCode}
                  <Button
                    variant="ghost"
                    size="sm"
                    className="ml-2"
                    onClick={() => handleGenerateNewCode(manager.id)}
                  >
                    <RefreshCw className="h-3 w-3" />
                  </Button>
                </div>
              </div>
              <div className="flex space-x-2">
                <Button 
                  variant="destructive" 
                  size="sm"
                  onClick={() => handleDeactivateManager(manager.id)}
                  disabled={isLoading}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default ManagerManagement; 