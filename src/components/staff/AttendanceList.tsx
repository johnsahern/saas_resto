
import React from 'react';
import { useAttendanceManagement } from '@/hooks/useAttendanceManagement';
import { AttendanceHeader } from './AttendanceHeader';
import { AttendanceContent } from './AttendanceContent';

export const AttendanceList: React.FC = () => {
  const {
    selectedDate,
    setSelectedDate,
    attendanceRecords,
    loading,
    getStaffMember,
    handleClockIn,
    handleClockOut,
    handleStatusChange
  } = useAttendanceManagement();

  return (
    <div className="space-y-6">
      <AttendanceHeader
        selectedDate={selectedDate}
        onDateChange={setSelectedDate}
      />
      
      <AttendanceContent
        selectedDate={selectedDate}
        attendanceRecords={attendanceRecords}
        loading={loading}
        getStaffMember={getStaffMember}
        onStatusChange={handleStatusChange}
        onClockIn={handleClockIn}
        onClockOut={handleClockOut}
      />
    </div>
  );
};
