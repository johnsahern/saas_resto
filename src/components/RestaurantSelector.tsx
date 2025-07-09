import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ChefHat, Crown, UserCheck, ExternalLink, Building2 } from 'lucide-react';

interface Restaurant {
  id: string;
  name: string;
  slug: string;
  role: 'owner' | 'manager';
}

interface RestaurantSelectorProps {
  restaurants: Restaurant[];
  userInfo: any;
  onSelectRestaurant: (restaurant: Restaurant) => void;
  onBack: () => void;
  error?: string;
  isLoading?: boolean;
}

export const RestaurantSelector: React.FC<RestaurantSelectorProps> = ({
  restaurants,
  userInfo,
  onSelectRestaurant,
  onBack,
  error,
  isLoading = false
}) => {
  const getRoleIcon = (role: string) => {
    return role === 'owner' ? <Crown className="w-4 h-4 text-yellow-500" /> : <UserCheck className="w-4 h-4 text-blue-500" />;
  };

  const getRoleLabel = (role: string) => {
    return role === 'owner' ? 'Propriétaire' : 'Manager';
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="w-full max-w-2xl space-y-6">
        {/* Header */}
        <div className="text-center">
          <div className="flex items-center justify-center mb-4">
            <Building2 className="h-12 w-12 text-blue-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900">Sélection du restaurant</h1>
          <p className="text-gray-600 mt-2">
            Bonjour {userInfo?.first_name} ! Choisissez le restaurant auquel vous souhaitez accéder
          </p>
        </div>

        {/* Liste des restaurants */}
        <Card>
          <CardHeader>
            <CardTitle>Vos restaurants ({restaurants.length})</CardTitle>
            <CardDescription>
              Sélectionnez le restaurant que vous souhaitez gérer
            </CardDescription>
          </CardHeader>
          <CardContent>
            {error && (
              <Alert variant="destructive" className="mb-4">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            
            <div className="grid gap-4">
              {restaurants.map((restaurant) => (
                <button
                  key={restaurant.id}
                  onClick={() => onSelectRestaurant(restaurant)}
                  disabled={isLoading}
                  className="w-full p-4 border border-gray-200 rounded-xl hover:border-blue-300 hover:bg-blue-50 transition-all duration-200 text-left group disabled:opacity-50"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-blue-100 rounded-lg group-hover:bg-blue-200 transition-colors">
                        <ChefHat className="w-6 h-6 text-blue-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">{restaurant.name}</h3>
                        <div className="flex items-center space-x-2 mt-1">
                          {getRoleIcon(restaurant.role)}
                          <span className="text-sm text-gray-600">{getRoleLabel(restaurant.role)}</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-blue-600 opacity-0 group-hover:opacity-100 transition-opacity">
                      <ExternalLink className="w-5 h-5" />
                    </div>
                  </div>
                </button>
              ))}
            </div>

            <div className="mt-6 pt-4 border-t border-gray-200">
              <Button
                variant="ghost"
                onClick={onBack}
                className="text-sm text-gray-500 hover:text-gray-700"
              >
                ← Retour à la connexion
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
