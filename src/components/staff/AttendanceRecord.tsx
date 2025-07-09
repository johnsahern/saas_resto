
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { CheckCircle, XCircle, Coffee, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { AttendanceActions } from './AttendanceActions';
import type { StaffMember } from '@/services/staffService';

const statusConfig = {
  present: { label: 'Présent', color: 'bg-green-500', icon: CheckCircle },
  absent: { label: 'Absent', color: 'bg-red-500', icon: XCircle },
  late: { label: 'En retard', color: 'bg-yellow-500', icon: AlertCircle },
  sick: { label: 'Malade', color: 'bg-orange-500', icon: XCircle },
  vacation: { label: 'Congé', color: 'bg-blue-500', icon: Coffee }
};

interface AttendanceRecordProps {
  record: {
    id?: string;
    staff_member_id: string;
    attendance_date: string;
    clock_in_time?: string;
    clock_out_time?: string;
    break_start_time?: string;
    break_end_time?: string;
    status: string;
    total_hours?: number;
    overtime_hours?: number;
    notes?: string;
  };
  member: StaffMember;
  onStatusChange: (staffId: string, newStatus: string) => void;
  onClockIn: (staffId: string) => void;
  onClockOut: (staffId: string) => void;
  calculateHours: (clockIn?: string, clockOut?: string) => string;
}

export const AttendanceRecord: React.FC<AttendanceRecordProps> = ({
  record,
  member,
  onStatusChange,
  onClockIn,
  onClockOut,
  calculateHours
}) => {
  const getInitials = (member: StaffMember) => {
    return `${member.first_name[0]}${member.last_name[0]}`.toUpperCase();
  };

  return (
    <div className="flex items-center justify-between p-4 border border-emerald-100 rounded-lg hover:border-emerald-300 transition-colors">
      <div className="flex items-center space-x-4">
        <Avatar className="w-12 h-12">
          <AvatarImage src={member.avatar_url || undefined} alt={`${member.first_name} ${member.last_name}`} />
          <AvatarFallback className="bg-emerald-500 text-white font-bold">
            {getInitials(member)}
          </AvatarFallback>
        </Avatar>
        <div>
          <div className="flex items-center space-x-2">
            <h3 className="font-bold text-emerald-800">{member.first_name} {member.last_name}</h3>
            <Badge variant="outline" className="border-emerald-500 text-emerald-600">
              {member.position}
            </Badge>
          </div>
          <p className="text-sm text-emerald-600">N° {member.employee_number}</p>
        </div>
      </div>

      <div className="flex items-center space-x-6">
        {/* Heures */}
        <div className="flex items-center space-x-4 text-sm">
          <div className="text-center">
            <p className="text-emerald-600">Arrivée</p>
            <p className="font-bold text-emerald-800">
              {record.clock_in_time || '--:--'}
            </p>
          </div>
          <div className="text-center">
            <p className="text-emerald-600">Départ</p>
            <p className="font-bold text-emerald-800">
              {record.clock_out_time || '--:--'}
            </p>
          </div>
          <div className="text-center">
            <p className="text-emerald-600">Total</p>
            <p className="font-bold text-emerald-800">
              {calculateHours(record.clock_in_time, record.clock_out_time)}
            </p>
          </div>
        </div>

        {/* Statut */}
        <div className="flex items-center space-x-2">
          <Select 
            value={record.status} 
            onValueChange={(value) => onStatusChange(record.staff_member_id, value)}
          >
            <SelectTrigger className="w-32 border-emerald-200">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(statusConfig).map(([status, config]) => (
                <SelectItem key={status} value={status}>
                  <div className="flex items-center space-x-2">
                    <div className={cn("w-2 h-2 rounded-full", config.color)} />
                    <span>{config.label}</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Actions */}
        <div className="flex space-x-2">
          <AttendanceActions
            staffId={record.staff_member_id}
            clockInTime={record.clock_in_time}
            clockOutTime={record.clock_out_time}
            status={record.status}
            onClockIn={onClockIn}
            onClockOut={onClockOut}
          />
        </div>
      </div>
    </div>
  );
};
