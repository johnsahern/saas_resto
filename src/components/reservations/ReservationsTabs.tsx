
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CheckCircle, Clock, XCircle } from 'lucide-react';
import { Reservation } from '@/hooks/useReservations';
import { ReservationsList } from './ReservationsList';

interface ReservationsTabsProps {
  reservations: Reservation[];
  onUpdateReservation: (id: string, updates: Partial<Reservation>) => void;
  onDeleteReservation: (id: string) => void;
}

export const ReservationsTabs: React.FC<ReservationsTabsProps> = ({
  reservations,
  onUpdateReservation,
  onDeleteReservation,
}) => {
  const confirmedReservations = reservations.filter(r => r.status === 'confirmed');
  const completedReservations = reservations.filter(r => r.status === 'completed');
  const cancelledReservations = reservations.filter(r => r.status === 'cancelled');

  return (
    <Tabs defaultValue="confirmed" className="space-y-4">
      <TabsList className="grid w-full grid-cols-3 bg-slate-800">
        <TabsTrigger value="confirmed" className="flex items-center gap-2 data-[state=active]:bg-emerald-600">
          <CheckCircle className="w-4 h-4" />
          Confirmées ({confirmedReservations.length})
        </TabsTrigger>
        <TabsTrigger value="completed" className="flex items-center gap-2 data-[state=active]:bg-emerald-600">
          <Clock className="w-4 h-4" />
          Terminées ({completedReservations.length})
        </TabsTrigger>
        <TabsTrigger value="cancelled" className="flex items-center gap-2 data-[state=active]:bg-emerald-600">
          <XCircle className="w-4 h-4" />
          Annulées ({cancelledReservations.length})
        </TabsTrigger>
      </TabsList>

      <TabsContent value="confirmed">
        <Card className="bg-slate-800 border-slate-700">
          <CardContent className="p-6">
            <ReservationsList
              reservations={confirmedReservations}
              onUpdateReservation={onUpdateReservation}
              onDeleteReservation={onDeleteReservation}
            />
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="completed">
        <Card className="bg-slate-800 border-slate-700">
          <CardContent className="p-6">
            <ReservationsList
              reservations={completedReservations}
              onUpdateReservation={onUpdateReservation}
              onDeleteReservation={onDeleteReservation}
            />
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="cancelled">
        <Card className="bg-slate-800 border-slate-700">
          <CardContent className="p-6">
            <ReservationsList
              reservations={cancelledReservations}
              onUpdateReservation={onUpdateReservation}
              onDeleteReservation={onDeleteReservation}
            />
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
};
