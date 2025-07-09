
import React from 'react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search } from 'lucide-react';

interface OnlineOrdersFiltersProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  statusFilter: string;
  setStatusFilter: (status: string) => void;
}

export const OnlineOrdersFilters: React.FC<OnlineOrdersFiltersProps> = ({
  searchTerm,
  setSearchTerm,
  statusFilter,
  setStatusFilter
}) => {
  return (
    <div className="flex flex-col sm:flex-row gap-4 items-center">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
        <Input
          placeholder="Rechercher par numéro, nom ou téléphone..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10 bg-slate-800 border-slate-700 text-white placeholder:text-slate-400 focus:border-emerald-500"
        />
      </div>
      
      <Select value={statusFilter} onValueChange={setStatusFilter}>
        <SelectTrigger className="w-[200px] bg-slate-800 border-slate-700 text-white">
          <SelectValue placeholder="Filtrer par statut" />
        </SelectTrigger>
        <SelectContent className="bg-slate-800 border-slate-700">
          <SelectItem value="all" className="text-white hover:bg-slate-700">Tous les statuts</SelectItem>
          <SelectItem value="pending" className="text-white hover:bg-slate-700">En attente</SelectItem>
          <SelectItem value="confirmed" className="text-white hover:bg-slate-700">Confirmées</SelectItem>
          <SelectItem value="preparing" className="text-white hover:bg-slate-700">En préparation</SelectItem>
          <SelectItem value="ready" className="text-white hover:bg-slate-700">Prêtes</SelectItem>
          <SelectItem value="delivered" className="text-white hover:bg-slate-700">Livrées</SelectItem>
          <SelectItem value="cancelled" className="text-white hover:bg-slate-700">Annulées</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
};
