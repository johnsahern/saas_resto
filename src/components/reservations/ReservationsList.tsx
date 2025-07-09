
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Users, Clock, Phone, CheckCircle, XCircle, Edit } from 'lucide-react';
import { Reservation } from '@/hooks/useReservations';

interface ReservationsListProps {
  reservations: Reservation[];
  onUpdateReservation: (id: string, updates: Partial<Reservation>) => void;
  onDeleteReservation: (id: string) => void;
}

export const ReservationsList: React.FC<ReservationsListProps> = ({
  reservations,
  onUpdateReservation,
  onDeleteReservation,
}) => {
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'confirmed':
        return <Badge className="bg-green-500/20 text-green-400 border-green-500/50">Confirmée</Badge>;
      case 'completed':
        return <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/50">Terminée</Badge>;
      case 'cancelled':
        return <Badge className="bg-red-500/20 text-red-400 border-red-500/50">Annulée</Badge>;
      default:
        return <Badge variant="outline">Inconnue</Badge>;
    }
  };

  const handleStatusChange = (id: string, newStatus: Reservation['status']) => {
    onUpdateReservation(id, { status: newStatus });
  };

  if (reservations.length === 0) {
    return (
      <div className="text-center py-8">
        <Users className="w-12 h-12 text-slate-600 mx-auto mb-4" />
        <p className="text-slate-400">Aucune réservation à afficher</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {reservations.map((reservation) => (
        <Card key={reservation.id} className="bg-slate-900 border-slate-700 hover:border-emerald-500/30 transition-colors">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-4 mb-2">
                  <h3 className="text-white font-semibold text-lg">{reservation.customer_name}</h3>
                  {getStatusBadge(reservation.status)}
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div className="flex items-center gap-2 text-slate-400">
                    <Clock className="w-4 h-4" />
                    <span>{new Date(reservation.date).toLocaleDateString('fr-FR')} à {reservation.time}</span>
                  </div>
                  
                  <div className="flex items-center gap-2 text-slate-400">
                    <Users className="w-4 h-4" />
                    <span>{reservation.party_size} personne(s)</span>
                  </div>
                  
                  <div className="flex items-center gap-2 text-slate-400">
                    <Phone className="w-4 h-4" />
                    <span>{reservation.customer_phone}</span>
                  </div>
                </div>

                {reservation.notes && (
                  <div className="mt-2 p-2 bg-slate-800 rounded text-sm text-slate-300">
                    <strong>Notes:</strong> {reservation.notes}
                  </div>
                )}
              </div>

              <div className="flex items-center gap-2 ml-4">
                {reservation.status === 'confirmed' && (
                  <>
                    <Button
                      size="sm"
                      onClick={() => handleStatusChange(reservation.id, 'completed')}
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      <CheckCircle className="w-4 h-4 mr-1" />
                      Terminer
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleStatusChange(reservation.id, 'cancelled')}
                      className="border-red-500 text-red-400 hover:bg-red-500/10"
                    >
                      <XCircle className="w-4 h-4 mr-1" />
                      Annuler
                    </Button>
                  </>
                )}
                
                {reservation.status === 'cancelled' && (
                  <Button
                    size="sm"
                    onClick={() => handleStatusChange(reservation.id, 'confirmed')}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    <CheckCircle className="w-4 h-4 mr-1" />
                    Reconfirmer
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
