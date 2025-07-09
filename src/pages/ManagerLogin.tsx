import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { API_ROUTES, PUBLIC_ROUTES, PROTECTED_ROUTES } from '@/config/routes';

export default function ManagerLogin() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    restaurantCode: ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const validateRestaurantCode = async () => {
    if (!formData.restaurantCode) return;

    try {
      const response = await fetch(`${API_ROUTES.BASE}${API_ROUTES.AUTH.VALIDATE_RESTAURANT_CODE}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          code: formData.restaurantCode
        })
      });

      const data = await response.json();

      if (data.success && data.data.isValid) {
        toast({
          title: 'Code valide',
          description: `Restaurant: ${data.data.restaurant.name}`,
          duration: 3000
        });
      } else {
        toast({
          variant: 'destructive',
          title: 'Code invalide',
          description: 'Ce code restaurant n\'existe pas'
        });
      }
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Erreur',
        description: 'Impossible de vérifier le code restaurant'
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch(`${API_ROUTES.BASE}${API_ROUTES.AUTH.LOGIN}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
          restaurantCode: formData.restaurantCode,
          role: 'manager'
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

      // Stocker les informations d'authentification
      localStorage.setItem('authToken', data.data.token);
      localStorage.setItem('userData', JSON.stringify(data.data.user));
      localStorage.setItem('restaurantData', JSON.stringify(data.data.restaurant));

      // Rediriger vers le tableau de bord
      navigate(PROTECTED_ROUTES.DASHBOARD);
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

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <Card className="w-full max-w-md p-8 space-y-6">
        <div className="space-y-2 text-center">
          <h1 className="text-2xl font-bold tracking-tight">
            Connexion Manager
          </h1>
          <p className="text-sm text-gray-500">
            Connectez-vous avec votre code restaurant
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="restaurantCode">Code Restaurant</Label>
            <Input
              id="restaurantCode"
              name="restaurantCode"
              placeholder="Entrez votre code restaurant"
              required
              value={formData.restaurantCode}
              onChange={handleChange}
              onBlur={validateRestaurantCode}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="votre@email.com"
              required
              value={formData.email}
              onChange={handleChange}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Mot de passe</Label>
            <Input
              id="password"
              name="password"
              type="password"
              required
              value={formData.password}
              onChange={handleChange}
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
      </Card>
    </div>
  );
} 