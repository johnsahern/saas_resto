
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Users, UserCheck, Award, Clock } from 'lucide-react';
import type { StaffMember } from '@/services/staffService';

interface StaffStatsProps {
  staff: StaffMember[];
}

export const StaffStats: React.FC<StaffStatsProps> = ({ staff }) => {
  const getStaffStats = () => {
    const totalStaff = staff.length;
    const activeStaff = staff.filter(member => member.status === 'active').length;
    // Calculate other stats when we have attendance data
    const averagePerformance = 85; // Placeholder
    const totalHours = 0; // Placeholder

    return {
      totalStaff,
      activeStaff,
      averagePerformance,
      totalHours
    };
  };

  const stats = getStaffStats();

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      <Card className="bg-white border-emerald-100">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-emerald-600">Personnel total</p>
              <p className="text-2xl font-bold text-emerald-800">{stats.totalStaff}</p>
            </div>
            <div className="p-2 rounded-full bg-blue-500">
              <Users className="w-4 h-4 text-white" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-white border-emerald-100">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-emerald-600">Personnel actif</p>
              <p className="text-2xl font-bold text-emerald-800">{stats.activeStaff}</p>
            </div>
            <div className="p-2 rounded-full bg-green-500">
              <UserCheck className="w-4 h-4 text-white" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-white border-emerald-100">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-emerald-600">Performance moy.</p>
              <p className="text-2xl font-bold text-emerald-800">{stats.averagePerformance.toFixed(1)}%</p>
            </div>
            <div className="p-2 rounded-full bg-purple-500">
              <Award className="w-4 h-4 text-white" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-white border-emerald-100">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-emerald-600">Heures/semaine</p>
              <p className="text-2xl font-bold text-emerald-800">{stats.totalHours}h</p>
            </div>
            <div className="p-2 rounded-full bg-teal-500">
              <Clock className="w-4 h-4 text-white" />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
