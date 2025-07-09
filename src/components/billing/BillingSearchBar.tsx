
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';

interface BillingSearchBarProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
}

export const BillingSearchBar: React.FC<BillingSearchBarProps> = ({ 
  searchTerm, 
  onSearchChange 
}) => {
  return (
    <Card className="bg-white border-emerald-100">
      <CardContent className="p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-emerald-500 w-4 h-4" />
          <Input
            placeholder="Rechercher par numéro de facture ou client..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-10 border-emerald-200 focus:border-emerald-500"
          />
        </div>
      </CardContent>
    </Card>
  );
};
