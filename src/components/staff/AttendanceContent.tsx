
import React from 'react';
import { Timer } from 'lucide-react';
import { AttendanceStats } from './AttendanceStats';
import { AttendanceRecordsList } from './AttendanceRecordsList';
import { getAttendanceStats } from '@/utils/attendanceUtils';
import type { StaffMember } from '@/services/staffService';

interface AttendanceRecordType {
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
}

interface AttendanceContentProps {
  selectedDate: string;
  attendanceRecords: AttendanceRecordType[];
  loading: boolean;
  getStaffMember: (staffId: string) => StaffMember | undefined;
  onStatusChange: (staffId: string, newStatus: string) => void;
  onClockIn: (staffId: string) => void;
  onClockOut: (staffId: string) => void;
}

export const AttendanceContent: React.FC<AttendanceContentProps> = ({
  selectedDate,
  attendanceRecords,
  loading,
  getStaffMember,
  onStatusChange,
  onClockIn,
  onClockOut
}) => {
  const stats = getAttendanceStats(attendanceRecords);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Timer className="w-8 h-8 animate-spin text-emerald-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <AttendanceStats stats={stats} />
      <AttendanceRecordsList
        selectedDate={selectedDate}
        attendanceRecords={attendanceRecords}
        getStaffMember={getStaffMember}
        onStatusChange={onStatusChange}
        onClockIn={onClockIn}
        onClockOut={onClockOut}
      />
    </div>
  );
};
