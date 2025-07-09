import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';

interface Restaurant {
  id: string;
  name: string;
  slug: string;
  role: string;
}

export default function RestaurantSelection() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [selectedRestaurant, setSelectedRestaurant] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Récupérer les données temporaires de la session
    const tempAuthData = sessionStorage.getItem('tempAuthData');
    if (!tempAuthData) {
      navigate('/owner-login');
      return;
    }

    const data = JSON.parse(tempAuthData);
    if (data.restaurants) {
      setRestaurants(data.restaurants);
    }
  }, [navigate]);

  const handleRestaurantSelect = async (restaurantId: string) => {
    setSelectedRestaurant(restaurantId);
    setIsLoading(true);

    try {
      const tempAuthData = sessionStorage.getItem('tempAuthData');
      if (!tempAuthData) {
        navigate('/owner-login');
        return;
      }

      const data = JSON.parse(tempAuthData);
      const restaurant = restaurants.find(r => r.id === restaurantId);

      if (!restaurant) {
        throw new Error('Restaurant non trouvé');
      }

      // Nouvelle requête de connexion avec le restaurant sélectionné
      const response = await fetch(`${import.meta.env.VITE_API_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email: data.email,
          password: data.password,
          restaurantCode: restaurant.slug,
          role: 'owner'
        })
      });

      const loginData = await response.json();

      if (!loginData.success) {
        throw new Error(loginData.error);
      }

      // Stocker les informations d'authentification
      localStorage.setItem('authToken', loginData.data.token);
      localStorage.setItem('userData', JSON.stringify(loginData.data.user));
      localStorage.setItem('restaurantData', JSON.stringify(loginData.data.restaurant));

      // Nettoyer les données temporaires
      sessionStorage.removeItem('tempAuthData');

      // Rediriger vers le tableau de bord
      navigate('/dashboard');
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Erreur',
        description: error instanceof Error ? error.message : 'Une erreur est survenue'
      });
      setSelectedRestaurant(null);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <Card className="w-full max-w-md p-8 space-y-6">
        <div className="space-y-2 text-center">
          <h1 className="text-2xl font-bold tracking-tight">
            Sélectionnez un Restaurant
          </h1>
          <p className="text-sm text-gray-500">
            Choisissez le restaurant auquel vous souhaitez accéder
          </p>
        </div>

        <div className="space-y-4">
          {restaurants.map((restaurant) => (
            <Button
              key={restaurant.id}
              variant={selectedRestaurant === restaurant.id ? 'default' : 'outline'}
              className="w-full py-6 justify-start"
              onClick={() => handleRestaurantSelect(restaurant.id)}
              disabled={isLoading}
            >
              <div className="text-left">
                <div className="font-medium">{restaurant.name}</div>
                <div className="text-sm text-gray-500">
                  Code: {restaurant.slug}
                </div>
              </div>
            </Button>
          ))}
        </div>

        <div className="text-center">
          <Button
            variant="link"
            onClick={() => {
              sessionStorage.removeItem('tempAuthData');
              navigate('/owner-login');
            }}
            className="text-sm text-gray-500"
          >
            Retour à la connexion
          </Button>
        </div>
      </Card>
    </div>
  );
}
