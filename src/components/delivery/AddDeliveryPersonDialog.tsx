import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { UserPlus, Phone, User, Star } from 'lucide-react';
import { apiClient } from '@/integrations/api/client';
import { toast } from 'sonner';

interface AddDeliveryPersonDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const AddDeliveryPersonDialog: React.FC<AddDeliveryPersonDialogProps> = ({
  isOpen,
  onClose,
  onSuccess
}) => {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    available: true,
    rating: 5.0
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim() || !formData.phone.trim()) {
      toast.error('Veuillez remplir tous les champs obligatoires');
      return;
    }

    setIsSubmitting(true);

    try {
      console.log('Ajout du livreur:', formData);

      const response = await apiClient.post('/delivery-persons', {
        name: formData.name.trim(),
        phone: formData.phone.trim(),
        available: formData.available,
        rating: formData.rating
      });

      if (response.success) {
        console.log('Livreur ajouté avec succès:', response.data);
        toast.success('Livreur ajouté avec succès !');
        
        // Réinitialiser le formulaire
        setFormData({
          name: '',
          phone: '',
          available: true,
          rating: 5.0
        });
        
        onSuccess();
      } else {
        throw new Error(response.error || 'Erreur lors de l\'ajout');
      }
    } catch (error: any) {
      console.error('Erreur lors de l\'ajout du livreur:', error);
      toast.error('Erreur lors de l\'ajout du livreur: ' + (error.message || 'Erreur inconnue'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      setFormData({
        name: '',
        phone: '',
        available: true,
        rating: 5.0
      });
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md bg-slate-800 border-slate-700 text-white">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <div className="p-2 bg-emerald-500/20 rounded-lg">
              <UserPlus className="w-5 h-5 text-emerald-400" />
            </div>
            Ajouter un nouveau livreur
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Nom */}
          <div className="space-y-2">
            <Label htmlFor="name" className="text-sm font-medium text-slate-300 flex items-center gap-2">
              <User className="w-4 h-4" />
              Nom complet *
            </Label>
            <Input
              id="name"
              type="text"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              placeholder="Ex: Jean Dupont"
              className="bg-slate-700 border-slate-600 text-white placeholder-slate-400 focus:border-emerald-500"
              required
            />
          </div>

          {/* Téléphone */}
          <div className="space-y-2">
            <Label htmlFor="phone" className="text-sm font-medium text-slate-300 flex items-center gap-2">
              <Phone className="w-4 h-4" />
              Numéro de téléphone *
            </Label>
            <Input
              id="phone"
              type="tel"
              value={formData.phone}
              onChange={(e) => handleInputChange('phone', e.target.value)}
              placeholder="Ex: +229 XX XX XX XX"
              className="bg-slate-700 border-slate-600 text-white placeholder-slate-400 focus:border-emerald-500"
              required
            />
          </div>

          {/* Note initiale */}
          <div className="space-y-2">
            <Label htmlFor="rating" className="text-sm font-medium text-slate-300 flex items-center gap-2">
              <Star className="w-4 h-4" />
              Note initiale
            </Label>
            <Input
              id="rating"
              type="number"
              min="1"
              max="5"
              step="0.1"
              value={formData.rating}
              onChange={(e) => handleInputChange('rating', parseFloat(e.target.value) || 5.0)}
              className="bg-slate-700 border-slate-600 text-white focus:border-emerald-500"
            />
          </div>

          {/* Disponibilité */}
          <div className="flex items-center justify-between p-4 bg-slate-700/50 rounded-lg border border-slate-600">
            <div>
              <Label htmlFor="available" className="text-sm font-medium text-slate-300">
                Disponibilité
              </Label>
              <p className="text-xs text-slate-400 mt-1">
                Le livreur est-il disponible pour les livraisons ?
              </p>
            </div>
            <Switch
              id="available"
              checked={formData.available}
              onCheckedChange={(checked) => handleInputChange('available', checked)}
              className="data-[state=checked]:bg-emerald-600"
            />
          </div>

          {/* Boutons */}
          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isSubmitting}
              className="flex-1 border-slate-600 text-slate-300 hover:bg-slate-700"
            >
              Annuler
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white"
            >
              {isSubmitting ? (
                <div className="flex items-center gap-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Ajout...
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <UserPlus className="w-4 h-4" />
                  Ajouter le livreur
                </div>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
