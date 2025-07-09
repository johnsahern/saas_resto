import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { UserPlus, Trash2, UserCheck, Mail, Phone, User } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

export const ManagerManagement = () => {
  const { user, restaurant } = useAuth();
  const [managers, setManagers] = useState([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newManager, setNewManager] = useState({
    email: '',
    firstName: '',
    lastName: '',
    phone: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Seul le propriétaire peut accéder à cette fonctionnalité
  if (user?.role !== 'owner') {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center">
            <UserCheck className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Accès restreint</h3>
            <p className="text-gray-600">Seuls les propriétaires peuvent gérer les managers.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const fetchManagers = async () => {
    try {
      // API call to get managers - à implémenter
      // const response = await apiClient.get(`/restaurants/${restaurant?.id}/managers`);
      // setManagers(response.data || []);
      
      // Mock data pour l'instant
      setManagers([
        {
          id: '1',
          email: 'manager1@example.com',
          firstName: 'Jean',
          lastName: 'Dupont',
          phone: '+33123456789',
          isActive: true
        }
      ]);
    } catch (error) {
      console.error('Erreur récupération managers:', error);
    }
  };

  useEffect(() => {
    if (restaurant?.id) {
      fetchManagers();
    }
  }, [restaurant?.id]);

  const handleAddManager = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setSuccess('');

    try {
      // API call to create manager - à implémenter
      // const response = await apiClient.post('/managers', {
      //   ...newManager,
      //   restaurantId: restaurant?.id,
      //   role: 'manager'
      // });

      setSuccess('Manager ajouté avec succès !');
      setNewManager({ email: '', firstName: '', lastName: '', phone: '' });
      setShowAddForm(false);
      fetchManagers();
    } catch (error) {
      setError(error.message || 'Erreur lors de l\'ajout du manager');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteManager = async (managerId) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce manager ?')) return;

    try {
      // API call to delete manager - à implémenter
      // await apiClient.delete(`/managers/${managerId}`);
      
      setSuccess('Manager supprimé avec succès !');
      fetchManagers();
    } catch (error) {
      setError(error.message || 'Erreur lors de la suppression');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Gestion des Managers</h2>
          <p className="text-gray-600">Gérez les managers de votre restaurant {restaurant?.name}</p>
        </div>
        <Button onClick={() => setShowAddForm(true)} className="flex items-center gap-2">
          <UserPlus className="w-4 h-4" />
          Ajouter un Manager
        </Button>
      </div>

      {/* Messages */}
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      
      {success && (
        <Alert>
          <AlertDescription>{success}</AlertDescription>
        </Alert>
      )}

      {/* Formulaire d'ajout */}
      {showAddForm && (
        <Card>
          <CardHeader>
            <CardTitle>Ajouter un nouveau Manager</CardTitle>
            <CardDescription>
              Le manager recevra un email pour créer son mot de passe
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleAddManager} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="firstName">Prénom</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="firstName"
                      value={newManager.firstName}
                      onChange={(e) => setNewManager({...newManager, firstName: e.target.value})}
                      className="pl-10"
                      placeholder="Jean"
                      required
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="lastName">Nom</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="lastName"
                      value={newManager.lastName}
                      onChange={(e) => setNewManager({...newManager, lastName: e.target.value})}
                      className="pl-10"
                      placeholder="Dupont"
                      required
                    />
                  </div>
                </div>
              </div>
              
              <div>
                <Label htmlFor="email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="email"
                    type="email"
                    value={newManager.email}
                    onChange={(e) => setNewManager({...newManager, email: e.target.value})}
                    className="pl-10"
                    placeholder="manager@restaurant.com"
                    required
                  />
                </div>
              </div>
              
              <div>
                <Label htmlFor="phone">Téléphone (optionnel)</Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="phone"
                    value={newManager.phone}
                    onChange={(e) => setNewManager({...newManager, phone: e.target.value})}
                    className="pl-10"
                    placeholder="+33123456789"
                  />
                </div>
              </div>

              <div className="flex gap-2">
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? 'Création...' : 'Créer le Manager'}
                </Button>
                <Button type="button" variant="outline" onClick={() => setShowAddForm(false)}>
                  Annuler
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Liste des managers */}
      <Card>
        <CardHeader>
          <CardTitle>Managers actuels ({managers.length})</CardTitle>
          <CardDescription>
            Liste des managers ayant accès à ce restaurant
          </CardDescription>
        </CardHeader>
        <CardContent>
          {managers.length === 0 ? (
            <div className="text-center py-8">
              <UserCheck className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <p className="text-gray-600">Aucun manager pour le moment</p>
              <p className="text-sm text-gray-500 mt-1">Ajoutez votre premier manager pour déléguer la gestion</p>
            </div>
          ) : (
            <div className="space-y-4">
              {managers.map((manager) => (
                <div key={manager.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <UserCheck className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900">
                        {manager.firstName} {manager.lastName}
                      </h4>
                      <p className="text-sm text-gray-600">{manager.email}</p>
                      {manager.phone && (
                        <p className="text-sm text-gray-500">{manager.phone}</p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge variant={manager.isActive ? "default" : "secondary"}>
                      {manager.isActive ? 'Actif' : 'Inactif'}
                    </Badge>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDeleteManager(manager.id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
