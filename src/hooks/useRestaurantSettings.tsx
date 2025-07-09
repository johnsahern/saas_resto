import { useState, useEffect, useCallback } from 'react';

export interface RestaurantSettings {
  id: string;
  restaurant_id: string;
  name: string;
  description: string;
  address: string;
  phone: string;
  email: string;
  website: string;
  logo: string | null;
  opening_hours: any;
  payment_methods: any;
  // Ajoute d'autres champs si besoin
}

export function useRestaurantSettings() {
  const [settings, setSettings] = useState<RestaurantSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSettings = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('saas_token');
      const res = await fetch('/api/restaurant-settings', {
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
        },
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error || 'Erreur API');
      setSettings(data.data);
    } catch (e: any) {
      setError(e.message || 'Erreur inconnue');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  const saveSettings = async (updates: Partial<RestaurantSettings>) => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('saas_token');
      const res = await fetch('/api/restaurant-settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(updates),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error || 'Erreur API');
      await fetchSettings();
      return true;
    } catch (e: any) {
      setError(e.message || 'Erreur inconnue');
      return false;
    } finally {
      setLoading(false);
    }
  };

  return { settings, loading, error, saveSettings, refetch: fetchSettings };
} 