
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { InventoryFilters as FiltersType } from '@/types/inventory';

interface InventoryFiltersProps {
  filters: FiltersType;
  onFiltersChange: (filters: FiltersType) => void;
}

export const InventoryFilters: React.FC<InventoryFiltersProps> = ({ filters, onFiltersChange }) => {
  const handleSearchChange = (value: string) => {
    onFiltersChange({ ...filters, searchTerm: value });
  };

  const handleCategoryChange = (value: string) => {
    onFiltersChange({ ...filters, categoryFilter: value });
  };

  const handleStatusChange = (value: string) => {
    onFiltersChange({ ...filters, statusFilter: value });
  };

  return (
    <Card className="bg-white border-emerald-100">
      <CardContent className="p-4">
        <div className="flex gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-emerald-500 w-4 h-4" />
              <Input
                placeholder="Rechercher un article ou fournisseur..."
                value={filters.searchTerm}
                onChange={(e) => handleSearchChange(e.target.value)}
                className="pl-10 border-emerald-200 focus:border-emerald-500"
              />
            </div>
          </div>
          <Select value={filters.categoryFilter} onValueChange={handleCategoryChange}>
            <SelectTrigger className="w-48 border-emerald-200">
              <SelectValue placeholder="Catégorie" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Toutes les catégories</SelectItem>
            </SelectContent>
          </Select>
          <Select value={filters.statusFilter} onValueChange={handleStatusChange}>
            <SelectTrigger className="w-48 border-emerald-200">
              <SelectValue placeholder="Statut" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous les statuts</SelectItem>
              <SelectItem value="normal">Stock normal</SelectItem>
              <SelectItem value="low">Stock faible</SelectItem>
              <SelectItem value="out">Rupture de stock</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardContent>
    </Card>
  );
};
