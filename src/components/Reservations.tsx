
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CalendarDays, Users } from 'lucide-react';
import { useReservations } from '@/hooks/useReservations';
import { ReservationCalendar } from './reservations/ReservationCalendar';
import { ReservationsList } from './reservations/ReservationsList';
import { ReservationStats } from './reservations/ReservationStats';
import { NewReservationDialog } from './reservations/NewReservationDialog';
import { ReservationsHeader } from './reservations/ReservationsHeader';
import { SelectedDateInfo } from './reservations/SelectedDateInfo';
import { ReservationsTabs } from './reservations/ReservationsTabs';

export const Reservations: React.FC = () => {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [showNewReservationDialog, setShowNewReservationDialog] = useState(false);
  const { reservations, loading, createReservation, updateReservation, deleteReservation } = useReservations();

  // Filter reservations for the selected date
  const selectedDateReservations = reservations.filter(reservation => {
    const reservationDate = new Date(reservation.date);
    return reservationDate.toDateString() === selectedDate.toDateString();
  });

  // Calculate statistics for the selected date only
  const selectedDateConfirmed = selectedDateReservations.filter(r => r.status === 'confirmed');
  const selectedDateCompleted = selectedDateReservations.filter(r => r.status === 'completed');
  const selectedDateCancelled = selectedDateReservations.filter(r => r.status === 'cancelled');

  const handleCreateReservation = async (reservationData: any) => {
    try {
      await createReservation(reservationData);
      setShowNewReservationDialog(false);
    } catch (error) {
      console.error('Erreur lors de la création de la réservation:', error);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-center min-h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500 mx-auto mb-4"></div>
            <p className="text-white">Chargement des réservations...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <ReservationsHeader onAddReservation={() => setShowNewReservationDialog(true)} />

      {/* Statistiques pour la date sélectionnée */}
      <ReservationStats
        totalReservations={selectedDateReservations.length}
        confirmedReservations={selectedDateConfirmed.length}
        completedReservations={selectedDateCompleted.length}
        cancelledReservations={selectedDateCancelled.length}
      />

      {/* Contenu principal */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendrier */}
        <div className="lg:col-span-1">
          <Card className="bg-slate-800 border-slate-700 hover:border-emerald-500/30 transition-colors elegant-shadow">
            <CardHeader>
              <CardTitle className="text-white text-lg flex items-center gap-2">
                <CalendarDays className="w-5 h-5 text-emerald-500" />
                Calendrier
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ReservationCalendar
                selectedDate={selectedDate}
                onDateSelect={setSelectedDate}
                reservations={reservations}
              />
              <SelectedDateInfo
                selectedDate={selectedDate}
                reservationCount={selectedDateReservations.length}
              />
            </CardContent>
          </Card>
        </div>

        {/* Liste des réservations */}
        <div className="lg:col-span-2">
          <Card className="bg-slate-800 border-slate-700 hover:border-emerald-500/30 transition-colors elegant-shadow">
            <CardHeader>
              <CardTitle className="text-white text-lg flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Users className="w-5 h-5 text-emerald-500" />
                  Réservations du jour
                </div>
                <Badge variant="outline" className="border-emerald-500 text-emerald-400">
                  {selectedDateReservations.length} réservations
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {selectedDateReservations.length > 0 ? (
                <ReservationsList
                  reservations={selectedDateReservations}
                  onUpdateReservation={updateReservation}
                  onDeleteReservation={deleteReservation}
                />
              ) : (
                <div className="text-center py-12">
                  <CalendarDays className="w-12 h-12 text-slate-600 mx-auto mb-4" />
                  <p className="text-slate-400 text-lg mb-2">Aucune réservation pour cette date</p>
                  <p className="text-slate-500 text-sm">
                    Sélectionnez une autre date ou créez une nouvelle réservation
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Onglets pour les réservations de la date sélectionnée */}
      <ReservationsTabs
        reservations={selectedDateReservations}
        onUpdateReservation={updateReservation}
        onDeleteReservation={deleteReservation}
      />

      {/* Dialog pour nouvelle réservation */}
      <NewReservationDialog
        open={showNewReservationDialog}
        onOpenChange={setShowNewReservationDialog}
        onCreateReservation={handleCreateReservation}
        selectedDate={selectedDate}
      />
    </div>
  );
};
