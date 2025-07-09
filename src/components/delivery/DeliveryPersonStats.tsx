
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Users, UserCheck, UserX } from 'lucide-react';

interface DeliveryPersonStatsProps {
  totalCount: number;
  availableCount: number;
  unavailableCount: number;
}

export const DeliveryPersonStats: React.FC<DeliveryPersonStatsProps> = ({
  totalCount,
  availableCount,
  unavailableCount
}) => (
  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
    <Card className="bg-slate-800 border-slate-700">
      <CardContent className="p-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-emerald-500/20 rounded-lg">
            <Users className="w-5 h-5 text-emerald-400" />
          </div>
          <div>
            <p className="text-sm text-slate-400">Total livreurs</p>
            <p className="text-xl font-bold text-white">{totalCount}</p>
          </div>
        </div>
      </CardContent>
    </Card>

    <Card className="bg-slate-800 border-slate-700">
      <CardContent className="p-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-green-500/20 rounded-lg">
            <UserCheck className="w-5 h-5 text-green-400" />
          </div>
          <div>
            <p className="text-sm text-slate-400">Disponibles</p>
            <p className="text-xl font-bold text-white">{availableCount}</p>
          </div>
        </div>
      </CardContent>
    </Card>

    <Card className="bg-slate-800 border-slate-700">
      <CardContent className="p-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-red-500/20 rounded-lg">
            <UserX className="w-5 h-5 text-red-400" />
          </div>
          <div>
            <p className="text-sm text-slate-400">Indisponibles</p>
            <p className="text-xl font-bold text-white">{unavailableCount}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  </div>
);
