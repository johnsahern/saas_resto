
import React from 'react';
import { AttendanceDateSelector } from './AttendanceDateSelector';

interface AttendanceHeaderProps {
  selectedDate: string;
  onDateChange: (date: string) => void;
}

export const AttendanceHeader: React.FC<AttendanceHeaderProps> = ({
  selectedDate,
  onDateChange
}) => {
  return (
    <div className="flex items-center justify-between">
      <div>
        <h2 className="text-3xl font-bold bg-gradient-to-r from-emerald-600 to-green-600 bg-clip-text text-transparent">
          Liste de présence
        </h2>
        <p className="text-emerald-600">Gestion quotidienne de l'assiduité</p>
      </div>
      <div className="flex items-center space-x-4">
        <AttendanceDateSelector
          selectedDate={selectedDate}
          onDateChange={onDateChange}
        />
      </div>
    </div>
  );
};
