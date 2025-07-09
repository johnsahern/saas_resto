import { apiClient } from '@/integrations/api/client';

export type StaffAttendance = {
  id: string;
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
  approved_by?: string;
  restaurant_id: string;
  created_at?: string;
  updated_at?: string;
};

// Récupérer la présence
export const fetchAttendance = async (params: {
  staff_member_id?: string;
  date?: string;
  start_date?: string;
  end_date?: string;
}) => {
  const query = new URLSearchParams(params as any).toString();
  const response = await apiClient.get(`/staff_attendance?${query}`);
  if (!response.success) throw new Error(response.error || 'Erreur API');
  return response.data as StaffAttendance[];
};

// Enregistrer ou mettre à jour une présence
export const saveAttendance = async (attendance: Partial<StaffAttendance>) => {
  const response = await apiClient.post('/staff_attendance', attendance);
  if (!response.success) throw new Error(response.error || 'Erreur API');
  return response.data as StaffAttendance;
};
