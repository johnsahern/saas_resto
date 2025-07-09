
import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Clock } from 'lucide-react';
import { cn } from '@/lib/utils';

const statusConfig = {
  present: { label: 'Présent', color: 'bg-green-500', icon: Clock },
  absent: { label: 'Absent', color: 'bg-red-500', icon: Clock },
  late: { label: 'En retard', color: 'bg-yellow-500', icon: Clock },
  sick: { label: 'Malade', color: 'bg-orange-500', icon: Clock },
  vacation: { label: 'Congé', color: 'bg-blue-500', icon: Clock }
};

interface AttendanceActionsProps {
  staffId: string;
  clockInTime?: string;
  clockOutTime?: string;
  status: string;
  onClockIn: (staffId: string) => void;
  onClockOut: (staffId: string) => void;
}

export const AttendanceActions: React.FC<AttendanceActionsProps> = ({
  staffId,
  clockInTime,
  clockOutTime,
  status,
  onClockIn,
  onClockOut
}) => {
  const statusConf = statusConfig[status as keyof typeof statusConfig] || statusConfig.absent;
  const StatusIcon = statusConf.icon;

  if (!clockInTime) {
    return (
      <Button
        size="sm"
        onClick={() => onClockIn(staffId)}
        className="bg-green-600 hover:bg-green-700"
      >
        <Clock className="w-4 h-4 mr-1" />
        Arrivée
      </Button>
    );
  }

  if (!clockOutTime) {
    return (
      <Button
        size="sm"
        variant="outline"
        onClick={() => onClockOut(staffId)}
        className="border-red-500 text-red-600 hover:bg-red-50"
      >
        <Clock className="w-4 h-4 mr-1" />
        Départ
      </Button>
    );
  }

  return (
    <Badge className={cn("text-white", statusConf.color)}>
      <StatusIcon className="w-3 h-3 mr-1" />
      {statusConf.label}
    </Badge>
  );
};
