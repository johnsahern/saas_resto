import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { Alert } from '@/components/ui/alert';
import { useToast } from '@/components/ui/use-toast';
import { API_ROUTES, PROTECTED_ROUTES, PUBLIC_ROUTES } from '@/config/routes';

export const RegisterOwner: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    restaurant: {
      name: '',
      email: '',
      phone: '',
      address: '',
    },
    owner: {
      first_name: '',
      last_name: '',
      email: '',
      phone: '',
      password: '',
      password_confirmation: ''
    }
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const [section, field] = e.target.name.split('.');
    setFormData(prev => ({
      ...prev,
      [section]: {
        ...prev[section as keyof typeof prev],
        [field]: e.target.value
      }
    }));
  };

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    // Validation
    if (formData.owner.password !== formData.owner.password_confirmation) {
      setError('Les mots de passe ne correspondent pas');
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch(`${API_ROUTES.BASE}${API_ROUTES.AUTH.REGISTER_RESTAURANT}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          restaurant_name: formData.restaurant.name,
          restaurant_address: formData.restaurant.address,
          restaurant_phone: formData.restaurant.phone,
          restaurant_email: formData.restaurant.email,
          owner_first_name: formData.owner.first_name,
          owner_last_name: formData.owner.last_name,
          owner_email: formData.owner.email,
          password: formData.owner.password
        })
      });

      const data = await response.json();

      if (!data.success) {
        toast({
          variant: 'destructive',
          title: 'Erreur d\'inscription',
          description: data.error
        });
        return;
      }

      toast({
        title: 'Inscription réussie',
        description: 'Votre compte a été créé avec succès. Veuillez vous connecter.'
      });

      // Rediriger vers la page de connexion propriétaire
      navigate(PUBLIC_ROUTES.OWNER_LOGIN);
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Erreur',
        description: 'Une erreur est survenue lors de l\'inscription'
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <Card className="w-full max-w-2xl p-6 space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold">Créer votre compte restaurant</h1>
          <p className="text-gray-600 mt-2">
            Inscrivez-vous pour commencer à gérer votre restaurant
          </p>
        </div>

        {error && (
          <Alert variant="destructive">
            {error}
          </Alert>
        )}

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Informations du restaurant */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Informations du restaurant</h2>
            <div className="grid gap-4">
              <div>
                <Label htmlFor="restaurant.name">Nom du restaurant *</Label>
                <Input
                  id="restaurant.name"
                  name="restaurant.name"
                  value={formData.restaurant.name}
                  onChange={handleChange}
                  required
                />
              </div>
              <div>
                <Label htmlFor="restaurant.email">Email du restaurant *</Label>
                <Input
                  id="restaurant.email"
                  name="restaurant.email"
                  type="email"
                  value={formData.restaurant.email}
                  onChange={handleChange}
                  required
                />
              </div>
              <div>
                <Label htmlFor="restaurant.phone">Téléphone du restaurant *</Label>
                <Input
                  id="restaurant.phone"
                  name="restaurant.phone"
                  value={formData.restaurant.phone}
                  onChange={handleChange}
                  required
                />
              </div>
              <div>
                <Label htmlFor="restaurant.address">Adresse du restaurant *</Label>
                <Input
                  id="restaurant.address"
                  name="restaurant.address"
                  value={formData.restaurant.address}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>
          </div>

          {/* Informations du propriétaire */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Informations du propriétaire</h2>
            <div className="grid gap-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="owner.first_name">Prénom *</Label>
                  <Input
                    id="owner.first_name"
                    name="owner.first_name"
                    value={formData.owner.first_name}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="owner.last_name">Nom *</Label>
                  <Input
                    id="owner.last_name"
                    name="owner.last_name"
                    value={formData.owner.last_name}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="owner.email">Email du propriétaire *</Label>
                <Input
                  id="owner.email"
                  name="owner.email"
                  type="email"
                  value={formData.owner.email}
                  onChange={handleChange}
                  required
                />
              </div>
              <div>
                <Label htmlFor="owner.phone">Téléphone du propriétaire</Label>
                <Input
                  id="owner.phone"
                  name="owner.phone"
                  value={formData.owner.phone}
                  onChange={handleChange}
                />
              </div>
              <div>
                <Label htmlFor="owner.password">Mot de passe *</Label>
                <Input
                  id="owner.password"
                  name="owner.password"
                  type="password"
                  value={formData.owner.password}
                  onChange={handleChange}
                  required
                />
              </div>
              <div>
                <Label htmlFor="owner.password_confirmation">Confirmer le mot de passe *</Label>
                <Input
                  id="owner.password_confirmation"
                  name="owner.password_confirmation"
                  type="password"
                  value={formData.owner.password_confirmation}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>
          </div>

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? 'Création en cours...' : 'Créer mon compte'}
          </Button>
        </form>
      </Card>
    </div>
  );
};

export default RegisterOwner;
