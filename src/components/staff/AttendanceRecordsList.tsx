import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AttendanceRecord } from './AttendanceRecord';
import { calculateHours } from '@/utils/attendanceUtils';
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

interface AttendanceRecordsListProps {
  selectedDate: string;
  attendanceRecords: AttendanceRecordType[];
  getStaffMember: (staffId: string) => StaffMember | undefined;
  onStatusChange: (staffId: string, newStatus: string) => void;
  onClockIn: (staffId: string) => void;
  onClockOut: (staffId: string) => void;
}

export const AttendanceRecordsList: React.FC<AttendanceRecordsListProps> = ({
  selectedDate,
  attendanceRecords,
  getStaffMember,
  onStatusChange,
  onClockIn,
  onClockOut
}) => {
  return (
    <Card className="bg-white border-emerald-100">
      <CardHeader>
        <CardTitle className="text-emerald-800">
          Présence du {selectedDate.split('-').reverse().join('/')}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {attendanceRecords.map((record) => {
            const member = getStaffMember(record.staff_member_id);
            if (!member) return null;

            return (
              <AttendanceRecord
                key={record.staff_member_id}
                record={record}
                member={member}
                onStatusChange={onStatusChange}
                onClockIn={onClockIn}
                onClockOut={onClockOut}
                calculateHours={calculateHours}
              />
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};
