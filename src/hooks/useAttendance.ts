import { useState, useEffect } from 'react';
import { fetchAttendance, saveAttendance } from '@/services/attendanceService';
import type { StaffAttendance } from '@/services/attendanceService';

interface AttendanceData {
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

export const useAttendance = (staffMemberId: string, date?: string) => {
  const [attendance, setAttendance] = useState<StaffAttendance[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadAttendance = async () => {
    try {
      setLoading(true);
      setError(null);
      const params: any = { staff_member_id: staffMemberId };
      if (date) params.date = date;
      const data = await fetchAttendance(params);
      setAttendance(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors du chargement de la présence');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (staffMemberId) {
      loadAttendance();
    }
    // eslint-disable-next-line
  }, [staffMemberId, date]);

  const recordAttendance = async (attendanceData: AttendanceData) => {
    try {
      const newRecord = await saveAttendance(attendanceData);
      setAttendance(prev => [newRecord, ...prev.filter(r =>
        !(r.staff_member_id === newRecord.staff_member_id && r.attendance_date === newRecord.attendance_date)
      )]);
      return newRecord;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de l\'enregistrement de la présence');
      throw err;
    }
  };

  return { attendance, loading, error, loadAttendance, recordAttendance };
};
