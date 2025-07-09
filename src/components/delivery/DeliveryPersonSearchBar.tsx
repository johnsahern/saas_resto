
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';

interface DeliveryPersonSearchBarProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
}

export const DeliveryPersonSearchBar: React.FC<DeliveryPersonSearchBarProps> = ({
  searchTerm,
  onSearchChange
}) => (
  <Card className="bg-slate-800 border-slate-700">
    <CardContent className="p-4">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
        <Input
          type="text"
          placeholder="Rechercher un livreur..."
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-10 bg-slate-700 border-slate-600 text-white placeholder-slate-400 focus:border-emerald-500"
        />
      </div>
    </CardContent>
  </Card>
);
