import { ManagerManagement } from "./ManagerManagement";

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Users, Clock, Loader2 } from 'lucide-react';
import { useStaff } from '@/hooks/useStaff';
import { NewStaffDialog } from '@/components/staff/NewStaffDialog';
import { AttendanceList } from '@/components/staff/AttendanceList';
import { StaffStats } from '@/components/staff/StaffStats';
import { StaffFilters } from '@/components/staff/StaffFilters';
import { StaffList } from '@/components/staff/StaffList';
import { StaffSuccessMessage } from '@/components/staff/StaffSuccessMessage';
import type { StaffMemberInsert } from '@/services/staffService';

export const Staff: React.FC = () => {
  const { staff, loading, error, addStaff } = useStaff();
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [activeTab, setActiveTab] = useState<'list' | 'attendance'>('list');
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const filteredStaff = staff.filter(member => {
    const fullName = `${member.first_name} ${member.last_name}`;
    const matchesSearch = fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (member.email && member.email.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesRole = roleFilter === 'all' || member.position === roleFilter;
    const matchesStatus = statusFilter === 'all' || member.status === statusFilter;
    return matchesSearch && matchesRole && matchesStatus;
  });

  const handleAddStaff = async (staffData: StaffMemberInsert): Promise<void> => {
    try {
      const newMember = await addStaff(staffData);
      const fullName = `${newMember.first_name} ${newMember.last_name}`;
      setSuccessMessage(fullName);
      console.log('Staff member added successfully:', newMember);
    } catch (error) {
      console.error('Error adding staff member:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center text-red-600 p-8">
        <p>Erreur: {error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {successMessage && (
        <StaffSuccessMessage
          memberName={successMessage}
          onDismiss={() => setSuccessMessage(null)}
        />
      )}

      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold bg-gradient-to-r from-emerald-600 to-green-600 bg-clip-text text-transparent">
            Gestion du personnel
          </h2>
          <p className="text-emerald-600">Équipe, plannings et performances</p>
        </div>
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-1 bg-emerald-50 rounded-lg p-1">
            <Button
              variant={activeTab === 'list' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setActiveTab('list')}
              className={activeTab === 'list' ? 'bg-emerald-600 text-white' : 'text-emerald-600'}
            >
              <Users className="w-4 h-4 mr-2" />
              Liste du personnel
            </Button>
            <Button
              variant={activeTab === 'attendance' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setActiveTab('attendance')}
              className={activeTab === 'attendance' ? 'bg-emerald-600 text-white' : 'text-emerald-600'}
            >
              <Clock className="w-4 h-4 mr-2" />
              Présence
            </Button>
          </div>
          {activeTab === 'list' && <NewStaffDialog onAddStaff={handleAddStaff} />}
        </div>
      </div>

      {activeTab === 'attendance' ? (
        <AttendanceList />
      ) : (
        <>
          <StaffStats staff={staff} />
          <StaffFilters
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            roleFilter={roleFilter}
            setRoleFilter={setRoleFilter}
            statusFilter={statusFilter}
            setStatusFilter={setStatusFilter}
            staff={staff}
          />
          <StaffList filteredStaff={filteredStaff} />
        </>
      )}
    </div>
  );
};
