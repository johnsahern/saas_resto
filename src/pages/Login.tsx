import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader2, ChefHat, Mail, Lock, ExternalLink, Building, User } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/components/ui/use-toast';

const Login = () => {
  const navigate = useNavigate();
  const { login, isAuthenticated, isLoading: authLoading } = useAuth();
  const { toast } = useToast();
  
  // États pour les deux types de connexion
  const [ownerData, setOwnerData] = useState({
    email: '',
    password: ''
  });
  
  const [managerData, setManagerData] = useState({
    email: '',
    password: '',
    restaurantCode: ''
  });
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('owner');

  // Rediriger si déjà connecté
  useEffect(() => {
    if (isAuthenticated && !authLoading) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, authLoading, navigate]);

  const handleOwnerChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setOwnerData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleManagerChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setManagerData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleOwnerSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const result = await login(ownerData.email, ownerData.password, 'owner');
      
      if ('data' in result) {
        toast({
          title: "Connexion réussie",
          description: "Bienvenue sur votre tableau de bord",
        });
        navigate('/dashboard');
      } else if ('requiresRestaurantSelection' in result) {
        // Rediriger vers la sélection de restaurant
        navigate('/restaurant-selection', { 
          state: { 
            email: ownerData.email, 
            password: ownerData.password, 
            restaurants: result.restaurants 
          } 
        });
      } else if ('error' in result) {
        setError(result.error);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur de connexion');
    } finally {
      setIsLoading(false);
    }
  };

  const handleManagerSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      if (!managerData.restaurantCode) {
        throw new Error('Le code restaurant est requis');
      }
      
      const result = await login(managerData.email, managerData.password, 'manager', managerData.restaurantCode);
      
      if ('data' in result) {
        toast({
          title: "Connexion réussie",
          description: "Bienvenue sur votre tableau de bord",
        });
        navigate('/dashboard');
      } else if ('error' in result) {
        setError(result.error);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur de connexion');
    } finally {
      setIsLoading(false);
    }
  };

  const goToRegistration = () => {
    navigate('/register-owner');
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="w-full max-w-md space-y-6">
        {/* Header */}
        <div className="text-center">
          <div className="flex items-center justify-center mb-4">
            <ChefHat className="h-12 w-12 text-blue-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900">Mon Resto</h1>
          <p className="text-gray-600 mt-2">Gestion complète de restaurant</p>
        </div>

        {/* Onglets de connexion */}
        <Card>
          <CardHeader>
            <CardTitle>Connexion</CardTitle>
            <CardDescription>
              Connectez-vous à votre espace de gestion
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="owner" value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-6">
                <TabsTrigger value="owner" className="flex items-center gap-2">
                  <Building className="h-4 w-4" />
                  Propriétaire
                </TabsTrigger>
                <TabsTrigger value="manager" className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  Manager
                </TabsTrigger>
              </TabsList>
              
              {error && (
                <Alert variant="destructive" className="mb-4">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <TabsContent value="owner">
                <form onSubmit={handleOwnerSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="owner-email">Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="owner-email"
                        name="email"
                        type="email"
                        value={ownerData.email}
                        onChange={handleOwnerChange}
                        className="pl-10"
                        placeholder="votre.email@exemple.com"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="owner-password">Mot de passe</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="owner-password"
                        name="password"
                        type="password"
                        value={ownerData.password}
                        onChange={handleOwnerChange}
                        className="pl-10"
                        placeholder="••••••••"
                        required
                      />
                    </div>
                  </div>

                  <Button 
                    type="submit" 
                    className="w-full" 
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Connexion...
                      </>
                    ) : (
                      'Se connecter'
                    )}
                  </Button>
                </form>
              </TabsContent>
              
              <TabsContent value="manager">
                <form onSubmit={handleManagerSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="restaurant-code">Code Restaurant</Label>
                    <Input
                      id="restaurant-code"
                      name="restaurantCode"
                      value={managerData.restaurantCode}
                      onChange={handleManagerChange}
                      placeholder="Code de votre restaurant"
                      required
                    />
                    <p className="text-xs text-gray-500">
                      Le code fourni par le propriétaire du restaurant
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="manager-email">Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="manager-email"
                        name="email"
                        type="email"
                        value={managerData.email}
                        onChange={handleManagerChange}
                        className="pl-10"
                        placeholder="votre.email@exemple.com"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="manager-password">Mot de passe</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="manager-password"
                        name="password"
                        type="password"
                        value={managerData.password}
                        onChange={handleManagerChange}
                        className="pl-10"
                        placeholder="••••••••"
                        required
                      />
                    </div>
                  </div>

                  <Button 
                    type="submit" 
                    className="w-full" 
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Connexion...
                      </>
                    ) : (
                      'Se connecter'
                    )}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        {/* Inscription */}
        <Card>
          <CardContent className="pt-6">
            <div className="text-center space-y-3">
              <p className="text-sm text-gray-600">
                Vous n'avez pas encore de restaurant ?
              </p>
              <Button 
                variant="outline" 
                className="w-full" 
                onClick={goToRegistration}
              >
                <ExternalLink className="mr-2 h-4 w-4" />
                Créer un restaurant
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Informations */}
        <div className="text-center space-y-2">
          <div className="flex items-center justify-center space-x-4 text-sm text-gray-500">
            <span>✅ Multi-tenant</span>
            <span>📊 Analytics</span>
            <span>🚀 Performance</span>
          </div>
          <p className="text-xs text-gray-400">
            Mon Resto - Gestion moderne de restaurant
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
