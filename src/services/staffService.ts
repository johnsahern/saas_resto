import { apiClient } from '@/integrations/api/client';
import type { Database } from '@/integrations/supabase/types';

export type StaffMember = {
  id: string;
  restaurant_id: string;
  first_name: string;
  last_name: string;
  email?: string;
  phone?: string;
  position?: string;
  department?: string;
  hire_date?: string;
  salary?: number;
  status?: string;
  created_at?: string;
  updated_at?: string;
};

export type StaffMemberInsert = Omit<StaffMember, 'id' | 'created_at' | 'updated_at'>;
export type StaffMemberUpdate = Partial<StaffMemberInsert>;

export type StaffAttendance = Database['public']['Tables']['staff_attendance']['Row'];

// Fetch all staff members
export const fetchStaffMembers = async (): Promise<StaffMember[]> => {
  const response = await apiClient.get('/staff');
  if (!response.success) throw new Error(response.error || 'Erreur API');
  return response.data || [];
};

// Create a new staff member
export const createStaffMember = async (staffData: StaffMemberInsert): Promise<StaffMember> => {
  const response = await apiClient.post('/staff', staffData);
  if (!response.success) throw new Error(response.error || 'Erreur API');
  return response.data;
};

// Update a staff member
export const updateStaffMember = async (id: string, updates: StaffMemberUpdate): Promise<StaffMember> => {
  const response = await apiClient.patch(`/staff/${id}`, updates);
  if (!response.success) throw new Error(response.error || 'Erreur API');
  return response.data;
};

// Delete a staff member
export const deleteStaffMember = async (id: string): Promise<void> => {
  const response = await apiClient.delete(`/staff/${id}`);
  if (!response.success) throw new Error(response.error || 'Erreur API');
};

// Fetch attendance for a staff member
export const fetchStaffAttendance = async (
  staffMemberId: string,
  startDate?: string,
  endDate?: string
): Promise<StaffAttendance[]> => {
  const params = new URLSearchParams({ staff_member_id: staffMemberId });
  if (startDate) params.append('start_date', startDate);
  if (endDate) params.append('end_date', endDate);

  const response = await apiClient.get(`/staff_attendance?${params.toString()}`);
  if (!response.success) {
    console.error('Error fetching staff attendance:', response.error);
    throw new Error(response.error || 'Erreur API');
  }
  return response.data || [];
};

// Record attendance
export const recordAttendance = async (attendanceData: Omit<StaffAttendance, 'id' | 'created_at' | 'updated_at'>): Promise<StaffAttendance> => {
  const response = await apiClient.post('/staff_attendance', attendanceData);
  if (!response.success) {
    console.error('Error recording attendance:', response.error);
    throw new Error(response.error || 'Erreur API');
  }
  return response.data;
};
