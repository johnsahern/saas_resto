
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Users, CheckCircle, XCircle, AlertCircle } from 'lucide-react';

interface AttendanceStatsProps {
  stats: {
    total: number;
    present: number;
    absent: number;
    late: number;
  };
}

export const AttendanceStats: React.FC<AttendanceStatsProps> = ({ stats }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      <Card className="bg-white border-emerald-100">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-emerald-600">Total employés</p>
              <p className="text-2xl font-bold text-emerald-800">{stats.total}</p>
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
              <p className="text-sm text-emerald-600">Présents</p>
              <p className="text-2xl font-bold text-green-600">{stats.present}</p>
            </div>
            <div className="p-2 rounded-full bg-green-500">
              <CheckCircle className="w-4 h-4 text-white" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-white border-emerald-100">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-emerald-600">Absents</p>
              <p className="text-2xl font-bold text-red-600">{stats.absent}</p>
            </div>
            <div className="p-2 rounded-full bg-red-500">
              <XCircle className="w-4 h-4 text-white" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-white border-emerald-100">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-emerald-600">En retard</p>
              <p className="text-2xl font-bold text-yellow-600">{stats.late}</p>
            </div>
            <div className="p-2 rounded-full bg-yellow-500">
              <AlertCircle className="w-4 h-4 text-white" />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
