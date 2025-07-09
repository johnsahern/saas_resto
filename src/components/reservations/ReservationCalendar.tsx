
import React from 'react';
import { Calendar } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';
import { Reservation } from '@/hooks/useReservations';

interface ReservationCalendarProps {
  selectedDate: Date;
  onDateSelect: (date: Date) => void;
  reservations: Reservation[];
}

export const ReservationCalendar: React.FC<ReservationCalendarProps> = ({
  selectedDate,
  onDateSelect,
  reservations
}) => {
  const getReservationsForDate = (date: Date) => {
    return reservations.filter(reservation => {
      const reservationDate = new Date(reservation.date);
      return reservationDate.toDateString() === date.toDateString() && 
             reservation.status === 'confirmed';
    });
  };

  const hasReservations = (date: Date) => {
    return getReservationsForDate(date).length > 0;
  };

  const handleDateSelect = (date: Date | undefined) => {
    if (date) {
      onDateSelect(date);
    }
  };

  return (
    <div className="w-full">
      <Calendar
        mode="single"
        selected={selectedDate}
        onSelect={handleDateSelect}
        className="w-full pointer-events-auto rounded-md border-0"
        classNames={{
          months: "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0",
          month: "space-y-4",
          caption: "flex justify-center pt-1 relative items-center text-white",
          caption_label: "text-sm font-medium text-white",
          nav: "space-x-1 flex items-center",
          nav_button: cn(
            "h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100 text-white hover:bg-slate-700"
          ),
          nav_button_previous: "absolute left-1",
          nav_button_next: "absolute right-1",
          table: "w-full border-collapse space-y-1",
          head_row: "flex",
          head_cell: "text-slate-400 rounded-md w-9 font-normal text-[0.8rem]",
          row: "flex w-full mt-2",
          cell: "h-9 w-9 text-center text-sm p-0 relative focus-within:relative focus-within:z-20",
          day: cn(
            "h-9 w-9 p-0 font-normal text-white hover:bg-slate-700 rounded-md relative flex items-center justify-center"
          ),
          day_selected: "bg-emerald-600 text-white hover:bg-emerald-600 hover:text-white focus:bg-emerald-600 focus:text-white",
          day_today: "bg-slate-700 text-emerald-400 font-bold",
          day_outside: "text-slate-600 opacity-50",
          day_disabled: "text-slate-600 opacity-50",
          day_hidden: "invisible",
        }}
        modifiers={{
          hasReservations: (date) => hasReservations(date),
        }}
        modifiersClassNames={{
          hasReservations: "relative after:absolute after:top-1 after:right-1 after:w-2 after:h-2 after:bg-emerald-400 after:rounded-full",
        }}
      />
    </div>
  );
};
