
import React from 'react';

interface SelectedDateInfoProps {
  selectedDate: Date;
  reservationCount: number;
}

export const SelectedDateInfo: React.FC<SelectedDateInfoProps> = ({
  selectedDate,
  reservationCount,
}) => {
  return (
    <div className="mt-4 p-4 bg-slate-900 rounded-lg border border-slate-700">
      <p className="text-emerald-400 font-medium text-sm mb-2">
        Date sélectionnée: {selectedDate.toLocaleDateString('fr-FR', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        })}
      </p>
      <p className="text-slate-400 text-sm">
        {reservationCount} réservation(s) pour cette date
      </p>
    </div>
  );
};
