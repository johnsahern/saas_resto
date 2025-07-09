import { useState, useEffect } from 'react';
import { useStaff } from '@/hooks/useStaff';
import { fetchAttendance, saveAttendance } from '@/services/attendanceService';
import type { StaffMember } from '@/services/staffService';
import type { StaffAttendance } from '@/services/attendanceService';

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

export const useAttendanceManagement = () => {
  const { staff, loading: staffLoading } = useStaff();
  const [selectedDate, setSelectedDate] = useState(() => {
    // Toujours au format YYYY-MM-DD
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  });
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecordType[]>([]);
  const [loading, setLoading] = useState(false);

  const loadAttendanceForDate = async (date: string) => {
    try {
      setLoading(true);
      // Récupérer les enregistrements existants
      const existingAttendance = await fetchAttendance({ date });
      // Créer les enregistrements pour tous les employés
      const records: AttendanceRecordType[] = staff.map(member => {
        const existingRecord = existingAttendance.find(record =>
          record.staff_member_id === member.id
        );
        return existingRecord || {
          staff_member_id: member.id,
          attendance_date: date,
          status: 'absent'
        };
      });
      setAttendanceRecords(records);
    } catch (error) {
      console.error('Error loading attendance:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (staff.length > 0) {
      loadAttendanceForDate(selectedDate);
    }
  }, [staff, selectedDate]);

  const getStaffMember = (staffId: string): StaffMember | undefined => {
    return staff.find(member => member.id === staffId);
  };

  // Actions pour clock-in, clock-out, changement de statut
  const handleStatusChange = async (staffId: string, newStatus: string) => {
    try {
      const record = attendanceRecords.find(r => r.staff_member_id === staffId);
      if (!record) return;
      const updated = await saveAttendance({ ...record, status: newStatus });
      setAttendanceRecords(prev => prev.map(r => r.staff_member_id === staffId ? updated : r));
    } catch (error) {
      console.error('Erreur lors de la mise à jour du statut:', error);
    }
  };

  const handleClockIn = async (staffId: string) => {
    try {
      const record = attendanceRecords.find(r => r.staff_member_id === staffId);
      if (!record) return;
      const now = new Date();
      const clockInTime = now.toTimeString().slice(0, 8);
      const updated = await saveAttendance({ ...record, attendance_date: selectedDate, clock_in_time: clockInTime, status: 'present' });
      setAttendanceRecords(prev => prev.map(r => r.staff_member_id === staffId ? updated : r));
    } catch (error) {
      console.error('Erreur lors de l\'enregistrement de l\'arrivée:', error);
    }
  };

  const handleClockOut = async (staffId: string) => {
    try {
      const record = attendanceRecords.find(r => r.staff_member_id === staffId);
      if (!record) return;
      const now = new Date();
      const clockOutTime = now.toTimeString().slice(0, 8);
      const updated = await saveAttendance({ ...record, attendance_date: selectedDate, clock_out_time: clockOutTime });
      setAttendanceRecords(prev => prev.map(r => r.staff_member_id === staffId ? updated : r));
    } catch (error) {
      console.error('Erreur lors de l\'enregistrement du départ:', error);
    }
  };

  return {
    selectedDate,
    setSelectedDate,
    attendanceRecords,
    loading: loading || staffLoading,
    getStaffMember,
    handleStatusChange,
    handleClockIn,
    handleClockOut
  };
};
