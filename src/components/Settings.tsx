import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { 
  Settings as SettingsIcon, 
  Save, 
  Utensils,
  Clock,
  CreditCard,
  Bell,
  Users,
  Shield,
  Wifi,
  Printer,
  Plus,
  Receipt,
  Upload
} from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import { useRestaurantSettings } from '@/hooks/useRestaurantSettings';
import { useInvoiceSettings } from '@/hooks/useInvoiceSettings';
import { useRestaurantId } from '@/contexts/AuthContext';
import { ManagerManagement } from './staff/ManagerManagement';

interface RestaurantSettings {
  name: string;
  description: string;
  address: string;
  phone: string;
  email: string;
  website: string;
  logo: string;
}

interface OpeningHours {
  [key: string]: { open: string; close: string; closed: boolean };
}

interface PaymentMethods {
  cash: boolean;
  card: boolean;
  cheque: boolean;
  digitalWallet: boolean;
}

interface NotificationSettings {
  newOrders: boolean;
  orderStatus: boolean;
  lowStock: boolean;
  dailyReport: boolean;
  sound: boolean;
}

const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
const dayLabels = {
  monday: 'Lundi',
  tuesday: 'Mardi',
  wednesday: 'Mercredi',
  thursday: 'Jeudi',
  friday: 'Vendredi',
  saturday: 'Samedi',
  sunday: 'Dimanche'
};

export const Settings: React.FC = () => {
  const { settings, loading, error, saveSettings } = useRestaurantSettings();
  const { settings: invoiceSettings, loading: invoiceLoading, error: invoiceError, updateSettings: updateInvoiceSettings } = useInvoiceSettings();
  const restaurantId = useRestaurantId();
  
  const [restaurantInfo, setRestaurantInfo] = useState({
    name: '',
    description: '',
    address: '',
    phone: '',
    email: '',
    website: '',
    logo: ''
  });
  
  const [openingHours, setOpeningHours] = useState<OpeningHours>({
    monday: { open: '11:00', close: '22:00', closed: false },
    tuesday: { open: '11:00', close: '22:00', closed: false },
    wednesday: { open: '11:00', close: '22:00', closed: false },
    thursday: { open: '11:00', close: '22:00', closed: false },
    friday: { open: '11:00', close: '23:00', closed: false },
    saturday: { open: '11:00', close: '23:00', closed: false },
    sunday: { open: '12:00', close: '21:00', closed: false }
  });
  
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethods>({
    cash: true,
    card: true,
    cheque: false,
    digitalWallet: true
  });
  
  const [notifications, setNotifications] = useState<NotificationSettings>({
    newOrders: true,
    orderStatus: true,
    lowStock: true,
    dailyReport: true,
    sound: true
  });
  
  const [showRestaurantId, setShowRestaurantId] = useState(false);

  // États pour les paramètres de facturation
  const [billingSettings, setBillingSettings] = useState({
    restaurantName: '',
    address: '',
    phone: '',
    email: '',
    logo: null as string | null,
    taxRate: 0,
    currency: 'FCFA'
  });

  useEffect(() => {
    if (settings) {
      setRestaurantInfo(prev => ({
        ...prev,
        name: settings.name || '',
        description: settings.description || '',
        address: settings.address || '',
        phone: settings.phone || '',
        email: settings.email || '',
        website: settings.website || '',
        logo: settings.logo || ''
      }));
      let oh = settings.opening_hours;
      if (typeof oh === 'string') {
        try { oh = JSON.parse(oh); } catch { oh = {}; }
      }
      setOpeningHours(oh || {});
      let pm = settings.payment_methods;
      if (typeof pm === 'string') {
        try { pm = JSON.parse(pm); } catch { pm = {}; }
      }
      setPaymentMethods(pm || {});
    }
  }, [settings]);

  useEffect(() => {
    if (invoiceSettings) {
      setBillingSettings({
        restaurantName: invoiceSettings.restaurantName || '',
        address: invoiceSettings.address || '',
        phone: invoiceSettings.phone || '',
        email: invoiceSettings.email || '',
        logo: invoiceSettings.logo || null,
        taxRate: invoiceSettings.taxRate || 0,
        currency: invoiceSettings.currency || 'FCFA'
      });
    }
  }, [invoiceSettings]);

  if (loading) return <div>Chargement des paramètres...</div>;
  if (error) return <div className="text-red-600">Erreur : {error}</div>;

  const handleSave = async () => {
    await saveSettings({
      ...restaurantInfo,
      opening_hours: openingHours,
      payment_methods: paymentMethods
    });
    alert('Paramètres sauvegardés avec succès !');
  };

  const handleSaveBilling = async () => {
    const success = await updateInvoiceSettings(billingSettings);
    if (success) {
      alert('Paramètres de facturation sauvegardés avec succès !');
    } else {
      alert('Erreur lors de la sauvegarde des paramètres de facturation');
    }
  };

  const handleLogoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setBillingSettings({
          ...billingSettings,
          logo: e.target?.result as string
        });
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold bg-gradient-to-r from-emerald-600 to-green-600 bg-clip-text text-transparent">
            Configuration
          </h2>
          <p className="text-emerald-600">Paramètres du restaurant et de l'application</p>
        </div>
        <Button onClick={handleSave} className="bg-emerald-600 hover:bg-emerald-700">
          <Save className="w-4 h-4 mr-2" />
          Sauvegarder
        </Button>
      </div>

      {/* Section discrète pour l'ID du restaurant */}
      <div className="flex items-center gap-2 justify-end text-xs text-gray-400 select-none" style={{userSelect:'none'}}>
        <span>ID du restaurant :</span>
        <input
          type={showRestaurantId ? 'text' : 'password'}
          value={settings?.restaurant_id || ''}
          readOnly
          className="bg-gray-100 border border-gray-200 rounded px-2 py-1 w-56 text-xs text-gray-500 tracking-wider"
          style={{letterSpacing:'0.05em'}}
        />
        <button
          type="button"
          onClick={() => setShowRestaurantId(v => !v)}
          className="text-emerald-500 hover:underline focus:outline-none"
          tabIndex={-1}
        >
          {showRestaurantId ? 'Masquer' : 'Afficher'}
        </button>
      </div>

      <Tabs defaultValue="billing" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5 bg-emerald-50 border border-emerald-200">
          <TabsTrigger value="billing" className="data-[state=active]:bg-emerald-500 data-[state=active]:text-white">
            <Receipt className="w-4 h-4 mr-2" />
            Facturation
          </TabsTrigger>
          <TabsTrigger value="payment" className="data-[state=active]:bg-emerald-500 data-[state=active]:text-white">
            <CreditCard className="w-4 h-4 mr-2" />
            Paiements
          </TabsTrigger>
          <TabsTrigger value="notifications" className="data-[state=active]:bg-emerald-500 data-[state=active]:text-white">
            <Bell className="w-4 h-4 mr-2" />
            Notifications
          </TabsTrigger>
          <TabsTrigger value="users" className="data-[state=active]:bg-emerald-500 data-[state=active]:text-white">
            <Users className="w-4 h-4 mr-2" />
            Utilisateurs
          </TabsTrigger>
          <TabsTrigger value="system" className="data-[state=active]:bg-emerald-500 data-[state=active]:text-white">
            <SettingsIcon className="w-4 h-4 mr-2" />
            Système
          </TabsTrigger>
        </TabsList>

        <TabsContent value="billing">
          <Card className="bg-white border-emerald-100">
            <CardHeader>
              <CardTitle className="text-emerald-800 flex items-center justify-between">
                <div className="flex items-center">
                  <Receipt className="w-5 h-5 mr-2" />
                  Configuration de facturation
                </div>
                <Button onClick={handleSaveBilling} className="bg-emerald-600 hover:bg-emerald-700">
                  <Save className="w-4 h-4 mr-2" />
                  Sauvegarder
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="restaurantName" className="text-emerald-700">Nom du restaurant</Label>
                    <Input
                      id="restaurantName"
                      value={billingSettings.restaurantName}
                      onChange={(e) => setBillingSettings({...billingSettings, restaurantName: e.target.value})}
                      className="border-emerald-200"
                      placeholder="Nom de votre restaurant"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="address" className="text-emerald-700">Adresse</Label>
                    <Textarea
                      id="address"
                      value={billingSettings.address}
                      onChange={(e) => setBillingSettings({...billingSettings, address: e.target.value})}
                      className="border-emerald-200"
                      placeholder="Adresse complète du restaurant"
                      rows={3}
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="phone" className="text-emerald-700">Téléphone</Label>
                    <Input
                      id="phone"
                      value={billingSettings.phone}
                      onChange={(e) => setBillingSettings({...billingSettings, phone: e.target.value})}
                      className="border-emerald-200"
                      placeholder="+33 1 23 45 67 89"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="email" className="text-emerald-700">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={billingSettings.email}
                      onChange={(e) => setBillingSettings({...billingSettings, email: e.target.value})}
                      className="border-emerald-200"
                      placeholder="contact@restaurant.com"
                    />
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="logo" className="text-emerald-700">Logo du restaurant</Label>
                    <div className="mt-2">
                      {billingSettings.logo && (
                        <div className="mb-4">
                          <img 
                            src={billingSettings.logo} 
                            alt="Logo" 
                            className="h-20 w-auto border border-emerald-200 rounded"
                          />
                        </div>
                      )}
                      <div className="flex items-center gap-2">
                        <Input
                          id="logo"
                          type="file"
                          accept="image/*"
                          onChange={handleLogoUpload}
                          className="border-emerald-200"
                        />
                        <Button variant="outline" size="sm" className="border-emerald-500 text-emerald-600">
                          <Upload className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <Label htmlFor="taxRate" className="text-emerald-700">Taux de TVA (%)</Label>
                    <Input
                      id="taxRate"
                      type="number"
                      min="0"
                      max="100"
                      step="0.1"
                      value={billingSettings.taxRate}
                      onChange={(e) => setBillingSettings({...billingSettings, taxRate: parseFloat(e.target.value) || 0})}
                      className="border-emerald-200"
                      placeholder="18.0"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="currency" className="text-emerald-700">Devise</Label>
                    <Select 
                      value={billingSettings.currency} 
                      onValueChange={(value) => setBillingSettings({...billingSettings, currency: value})}
                    >
                      <SelectTrigger className="border-emerald-200">
                        <SelectValue placeholder="Sélectionner une devise" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="FCFA">FCFA (Franc CFA)</SelectItem>
                        <SelectItem value="EUR">EUR (Euro)</SelectItem>
                        <SelectItem value="USD">USD (Dollar américain)</SelectItem>
                        <SelectItem value="GBP">GBP (Livre sterling)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
              
              {invoiceError && (
                <div className="text-red-600 text-sm bg-red-50 p-3 rounded border border-red-200">
                  Erreur : {invoiceError}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="payment">
          <Card className="bg-white border-emerald-100">
            <CardHeader>
              <CardTitle className="text-emerald-800 flex items-center">
                <CreditCard className="w-5 h-5 mr-2" />
                Méthodes de paiement
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex flex-col gap-4">
                <div className="flex items-center gap-4">
                  <Switch
                    checked={paymentMethods.cash || false}
                    onCheckedChange={(checked) => setPaymentMethods({ ...paymentMethods, cash: checked })}
                  />
                  <Label>Espèces</Label>
                </div>
                <div className="flex items-center gap-4">
                  <Switch
                    checked={paymentMethods.card || false}
                    onCheckedChange={(checked) => setPaymentMethods({ ...paymentMethods, card: checked })}
                  />
                  <Label>Carte bancaire</Label>
                </div>
                <div className="flex items-center gap-4">
                  <Switch
                    checked={paymentMethods.cheque || false}
                    onCheckedChange={(checked) => setPaymentMethods({ ...paymentMethods, cheque: checked })}
                  />
                  <Label>Chèque</Label>
                </div>
                <div className="flex items-center gap-4">
                  <Switch
                    checked={paymentMethods.digitalWallet || false}
                    onCheckedChange={(checked) => setPaymentMethods({ ...paymentMethods, digitalWallet: checked })}
                  />
                  <Label>Portefeuille digital</Label>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications">
          <Card className="bg-white border-emerald-100">
            <CardHeader>
              <CardTitle className="text-emerald-800 flex items-center">
                <Bell className="w-5 h-5 mr-2" />
                Notifications
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex flex-col gap-4">
                <div className="flex items-center gap-4">
                  <Switch
                    checked={notifications.newOrders}
                    onCheckedChange={(checked) => setNotifications({ ...notifications, newOrders: checked })}
                  />
                  <Label>Nouvelles commandes</Label>
                </div>
                <div className="flex items-center gap-4">
                  <Switch
                    checked={notifications.orderStatus}
                    onCheckedChange={(checked) => setNotifications({ ...notifications, orderStatus: checked })}
                  />
                  <Label>Changement de statut commande</Label>
                </div>
                <div className="flex items-center gap-4">
                  <Switch
                    checked={notifications.lowStock}
                    onCheckedChange={(checked) => setNotifications({ ...notifications, lowStock: checked })}
                  />
                  <Label>Stock faible</Label>
                </div>
                <div className="flex items-center gap-4">
                  <Switch
                    checked={notifications.dailyReport}
                    onCheckedChange={(checked) => setNotifications({ ...notifications, dailyReport: checked })}
                  />
                  <Label>Rapport quotidien</Label>
                </div>
                <div className="flex items-center gap-4">
                  <Switch
                    checked={notifications.sound}
                    onCheckedChange={(checked) => setNotifications({ ...notifications, sound: checked })}
                  />
                  <Label>Son</Label>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="users">
          <Card className="bg-white border-emerald-100">
            <CardHeader>
              <CardTitle className="text-emerald-800 flex items-center">
                <Users className="w-5 h-5 mr-2" />
                Gestion des managers
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ManagerManagement />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="system">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="bg-white border-emerald-100">
              <CardHeader>
                <CardTitle className="text-emerald-800 flex items-center">
                  <Shield className="w-5 h-5 mr-2" />
                  Sécurité
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label className="text-emerald-700">Authentification à deux facteurs</Label>
                  <Switch />
                </div>
                <div className="flex items-center justify-between">
                  <Label className="text-emerald-700">Déconnexion automatique</Label>
                  <Switch defaultChecked />
                </div>
                <div className="space-y-2">
                  <Label className="text-emerald-700">Durée de session (minutes)</Label>
                  <Input type="number" defaultValue="30" className="border-emerald-200" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white border-emerald-100">
              <CardHeader>
                <CardTitle className="text-emerald-800 flex items-center">
                  <Wifi className="w-5 h-5 mr-2" />
                  Intégrations
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label className="text-emerald-700">Terminal de paiement</Label>
                  <Switch />
                </div>
                <div className="flex items-center justify-between">
                  <Label className="text-emerald-700">Imprimante de tickets</Label>
                  <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <Label className="text-emerald-700">Synchronisation cloud</Label>
                  <Switch defaultChecked />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};
