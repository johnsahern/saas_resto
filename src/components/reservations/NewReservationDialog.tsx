
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar, Users, Clock, Phone, User } from 'lucide-react';
import { Reservation } from '@/hooks/useReservations';

interface NewReservationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreateReservation: (data: Omit<Reservation, 'id' | 'created_at'>) => void;
  selectedDate: Date;
}

export const NewReservationDialog: React.FC<NewReservationDialogProps> = ({
  open,
  onOpenChange,
  onCreateReservation,
  selectedDate,
}) => {
  const [formData, setFormData] = useState({
    customer_name: '',
    customer_phone: '',
    date: selectedDate.toISOString().split('T')[0],
    time: '',
    party_size: 2,
    status: 'confirmed' as const,
    notes: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onCreateReservation(formData);
    setFormData({
      customer_name: '',
      customer_phone: '',
      date: selectedDate.toISOString().split('T')[0],
      time: '',
      party_size: 2,
      status: 'confirmed',
      notes: '',
    });
  };

  const timeSlots = [
    '11:30', '12:00', '12:30', '13:00', '13:30', '14:00',
    '18:30', '19:00', '19:30', '20:00', '20:30', '21:00', '21:30'
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-slate-800 border-slate-700 text-white sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-emerald-400 text-xl flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            Nouvelle réservation
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 gap-4">
            <div>
              <Label htmlFor="customer_name" className="text-slate-300 flex items-center gap-2">
                <User className="w-4 h-4" />
                Nom du client
              </Label>
              <Input
                id="customer_name"
                value={formData.customer_name}
                onChange={(e) => setFormData({ ...formData, customer_name: e.target.value })}
                className="bg-slate-900 border-slate-600 text-white"
                required
              />
            </div>

            <div>
              <Label htmlFor="customer_phone" className="text-slate-300 flex items-center gap-2">
                <Phone className="w-4 h-4" />
                Téléphone
              </Label>
              <Input
                id="customer_phone"
                type="tel"
                value={formData.customer_phone}
                onChange={(e) => setFormData({ ...formData, customer_phone: e.target.value })}
                className="bg-slate-900 border-slate-600 text-white"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="date" className="text-slate-300">Date</Label>
                <Input
                  id="date"
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  className="bg-slate-900 border-slate-600 text-white"
                  required
                />
              </div>

              <div>
                <Label htmlFor="time" className="text-slate-300 flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  Heure
                </Label>
                <Select
                  value={formData.time}
                  onValueChange={(value) => setFormData({ ...formData, time: value })}
                  required
                >
                  <SelectTrigger className="bg-slate-900 border-slate-600 text-white">
                    <SelectValue placeholder="Choisir une heure" />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-800 border-slate-600">
                    {timeSlots.map((time) => (
                      <SelectItem key={time} value={time} className="text-white">
                        {time}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label htmlFor="party_size" className="text-slate-300 flex items-center gap-2">
                <Users className="w-4 h-4" />
                Nombre de personnes
              </Label>
              <Select
                value={formData.party_size.toString()}
                onValueChange={(value) => setFormData({ ...formData, party_size: parseInt(value) })}
              >
                <SelectTrigger className="bg-slate-900 border-slate-600 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-slate-600">
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((size) => (
                    <SelectItem key={size} value={size.toString()} className="text-white">
                      {size} personne{size > 1 ? 's' : ''}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="notes" className="text-slate-300">Notes (optionnel)</Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                className="bg-slate-900 border-slate-600 text-white"
                placeholder="Allergies, demandes spéciales..."
                rows={3}
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="border-slate-600 text-slate-300 hover:bg-slate-700"
            >
              Annuler
            </Button>
            <Button
              type="submit"
              className="bg-emerald-600 hover:bg-emerald-700 text-white"
            >
              Créer la réservation
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
