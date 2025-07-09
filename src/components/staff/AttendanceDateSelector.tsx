
import React from 'react';
import { Input } from '@/components/ui/input';
import { Calendar } from 'lucide-react';

interface AttendanceDateSelectorProps {
  selectedDate: string;
  onDateChange: (date: string) => void;
}

export const AttendanceDateSelector: React.FC<AttendanceDateSelectorProps> = ({
  selectedDate,
  onDateChange
}) => {
  return (
    <div className="flex items-center space-x-2">
      <Calendar className="w-4 h-4 text-emerald-600" />
      <Input
        type="date"
        value={selectedDate}
        onChange={(e) => onDateChange(e.target.value)}
        className="w-40 border-emerald-200 focus:border-emerald-500"
      />
    </div>
  );
};
