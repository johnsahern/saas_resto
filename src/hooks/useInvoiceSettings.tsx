import { useState, useEffect, useCallback } from 'react';

export interface InvoiceSettings {
  restaurantName: string;
  address: string;
  phone: string;
  email: string;
  logo: string | null;
  taxRate: number;
  currency: string;
}

const defaultSettings: InvoiceSettings = {
  restaurantName: '',
  address: '',
  phone: '',
  email: '',
  logo: null,
  taxRate: 0,
  currency: 'EUR'
};

export const useInvoiceSettings = () => {
  const [settings, setSettings] = useState<InvoiceSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fonction utilitaire pour récupérer le token
  const getToken = () => {
    return localStorage.getItem('saas_token') || '';
  };

  // Utilisation de la variable d'environnement pour l'URL API
  const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8080';

  const fetchSettings = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const token = getToken();
      if (!token) {
        setError('Vous devez être connecté pour accéder à la configuration de facturation.');
        setLoading(false);
        return;
      }
      const res = await fetch(`${apiUrl}/api/restaurant-settings`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.status === 401) {
        setError('Session expirée ou non autorisée. Veuillez vous reconnecter.');
        setLoading(false);
        return;
      }
      const data = await res.json();
      if (!data.success) throw new Error(data.error || 'Erreur API');
      // Mapping des champs SQL -> InvoiceSettings
      setSettings({
        restaurantName: data.data.name || '',
        address: data.data.address || '',
        phone: data.data.phone || '',
        email: data.data.email || '',
        logo: data.data.logo || null,
        taxRate: data.data.tax_rate || 0,
        currency: data.data.currency || 'EUR'
      });
    } catch (e: any) {
      setError(e.message || 'Erreur inconnue');
    } finally {
      setLoading(false);
    }
  }, [apiUrl]);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  const updateSettings = async (newSettings: Partial<InvoiceSettings>) => {
    setLoading(true);
    setError(null);
    try {
      const token = getToken();
      if (!token) {
        setError('Vous devez être connecté pour modifier la configuration de facturation.');
        setLoading(false);
        return false;
      }
      // Mapping InvoiceSettings -> SQL
      const updates: any = {};
      if ('restaurantName' in newSettings) updates.name = newSettings.restaurantName;
      if ('address' in newSettings) updates.address = newSettings.address;
      if ('phone' in newSettings) updates.phone = newSettings.phone;
      if ('email' in newSettings) updates.email = newSettings.email;
      if ('logo' in newSettings) updates.logo = newSettings.logo;
      if ('taxRate' in newSettings) updates.tax_rate = newSettings.taxRate;
      if ('currency' in newSettings) updates.currency = newSettings.currency;
      const res = await fetch(`${apiUrl}/api/restaurant-settings`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(updates)
      });
      if (res.status === 401) {
        setError('Session expirée ou non autorisée. Veuillez vous reconnecter.');
        setLoading(false);
        return false;
      }
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

  return { settings, loading, error, updateSettings };
};
