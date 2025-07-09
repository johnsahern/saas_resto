
import { useState, useEffect } from 'react';
import { fetchStaffMembers, createStaffMember, updateStaffMember, deleteStaffMember } from '@/services/staffService';
import type { StaffMember, StaffMemberInsert, StaffMemberUpdate } from '@/services/staffService';

export const useStaff = () => {
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadStaff = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('Loading staff members...');
      const data = await fetchStaffMembers();
      console.log('Staff members loaded:', data);
      setStaff(data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors du chargement du personnel';
      setError(errorMessage);
      console.error('Error loading staff:', err);
    } finally {
      setLoading(false);
    }
  };

  const addStaff = async (staffData: StaffMemberInsert) => {
    try {
      console.log('Adding staff member with data:', staffData);
      const newStaff = await createStaffMember(staffData);
      console.log('Staff member created successfully:', newStaff);
      setStaff(prev => [newStaff, ...prev]);
      return newStaff;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de l\'ajout du personnel';
      setError(errorMessage);
      console.error('Error adding staff:', err);
      throw err;
    }
  };

  const editStaff = async (id: string, updates: StaffMemberUpdate) => {
    try {
      console.log('Updating staff member:', id, updates);
      const updatedStaff = await updateStaffMember(id, updates);
      console.log('Staff member updated successfully:', updatedStaff);
      setStaff(prev => prev.map(member => member.id === id ? updatedStaff : member));
      return updatedStaff;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de la modification du personnel';
      setError(errorMessage);
      console.error('Error updating staff:', err);
      throw err;
    }
  };

  const removeStaff = async (id: string) => {
    try {
      console.log('Deleting staff member:', id);
      await deleteStaffMember(id);
      console.log('Staff member deleted successfully');
      setStaff(prev => prev.filter(member => member.id !== id));
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de la suppression du personnel';
      setError(errorMessage);
      console.error('Error deleting staff:', err);
      throw err;
    }
  };

  useEffect(() => {
    loadStaff();
  }, []);

  return {
    staff,
    loading,
    error,
    loadStaff,
    addStaff,
    editStaff,
    removeStaff
  };
};
