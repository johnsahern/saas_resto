import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { Alert } from '@/components/ui/alert';
import { Loader2, Mail, Lock } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { API_ROUTES, PUBLIC_ROUTES, PROTECTED_ROUTES } from '@/config/routes';

export const OwnerLogin: React.FC = () => {
  const navigate = useNavigate();
  const { login, isAuthenticated, requiresRestaurantSelection, availableRestaurants, selectRestaurant } = useAuth();
  const { toast } = useToast();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      navigate(PROTECTED_ROUTES.DASHBOARD);
    }
  }, [isAuthenticated, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const response = await fetch(`${API_ROUTES.BASE}${API_ROUTES.AUTH.LOGIN}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email: email,
          password: password,
          role: 'owner'
        })
      });

      const data = await response.json();

      if (!data.success) {
        toast({
          variant: 'destructive',
          title: 'Erreur de connexion',
          description: data.error
        });
        return;
      }

      if (data.requiresRestaurantSelection) {
        // Stocker les informations temporairement et rediriger vers la sélection
        sessionStorage.setItem('tempAuthData', JSON.stringify(data));
        navigate(PUBLIC_ROUTES.RESTAURANT_SELECTION);
      } else if (data.data) {
        // Connexion directe avec un seul restaurant
        localStorage.setItem('authToken', data.data.token);
        localStorage.setItem('userData', JSON.stringify(data.data.user));
        localStorage.setItem('restaurantData', JSON.stringify(data.data.restaurant));
        navigate(PROTECTED_ROUTES.DASHBOARD);
      }
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Erreur',
        description: 'Une erreur est survenue lors de la connexion'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleRestaurantSelect = async (restaurantSlug: string) => {
    setError('');
    setIsLoading(true);

    try {
      await selectRestaurant(restaurantSlug);
      navigate(PROTECTED_ROUTES.DASHBOARD);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur de sélection du restaurant');
    } finally {
      setIsLoading(false);
    }
  };

  if (requiresRestaurantSelection && availableRestaurants.length > 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <div className="max-w-md w-full space-y-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-900">
              Sélectionnez votre restaurant
            </h2>
            <p className="mt-2 text-gray-600">
              Choisissez le restaurant auquel vous souhaitez accéder
            </p>
          </div>

          {error && (
            <Alert variant="destructive" className="mb-4">
              {error}
            </Alert>
          )}

          <div className="grid gap-4">
            {availableRestaurants.map((restaurant) => (
              <Card
                key={restaurant.id}
                className="p-4 cursor-pointer hover:shadow-lg transition-shadow"
                onClick={() => handleRestaurantSelect(restaurant.slug)}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium text-lg">{restaurant.name}</h3>
                    <p className="text-sm text-gray-500">
                      {restaurant.role === 'owner' ? 'Propriétaire' : 'Manager'}
                    </p>
                  </div>
                  <Button variant="ghost" disabled={isLoading}>
                    Sélectionner
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900">
            Connexion Propriétaire
          </h2>
          <p className="mt-2 text-gray-600">
            Connectez-vous pour gérer votre restaurant
          </p>
          <p className="mt-2 text-sm text-gray-500">
            Pas encore de compte ?{' '}
            <a href="/register-owner" className="text-blue-600 hover:text-blue-800">
              Créer un compte restaurant
            </a>
          </p>
        </div>

        {error && (
          <Alert variant="destructive" className="mb-4">
            {error}
          </Alert>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="votre@email.com"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Mot de passe</Label>
            <Input
              id="password"
              name="password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <Button
            type="submit"
            className="w-full"
            disabled={isLoading}
          >
            {isLoading ? 'Connexion...' : 'Se connecter'}
          </Button>
        </form>

        <div className="text-center">
          <Button
            variant="link"
            onClick={() => navigate(PUBLIC_ROUTES.HOME)}
            className="text-sm text-gray-500"
          >
            Retour à la sélection
          </Button>
        </div>
      </div>
    </div>
  );
};

export default OwnerLogin; 