
import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { RestaurantTable } from '@/hooks/useRestaurantData';
import { useLoyaltyCustomers } from '@/hooks/useLoyaltyCustomers';
import { Search, Star, Plus } from 'lucide-react';

interface OrderCustomerFormProps {
  customerName: string;
  tableId: string;
  tables: RestaurantTable[];
  onCustomerNameChange: (name: string) => void;
  onTableIdChange: (tableId: string) => void;
}

export const OrderCustomerForm: React.FC<OrderCustomerFormProps> = ({
  customerName,
  tableId,
  tables,
  onCustomerNameChange,
  onTableIdChange,
}) => {
  const { customers, findCustomerByPhone } = useLoyaltyCustomers();
  const [customerPhone, setCustomerPhone] = useState('');
  const [loyaltyCustomer, setLoyaltyCustomer] = useState<any>(null);
  const [showLoyaltySearch, setShowLoyaltySearch] = useState(false);

  const handlePhoneSearch = () => {
    if (customerPhone.trim()) {
      const customer = findCustomerByPhone(customerPhone.trim());
      if (customer) {
        setLoyaltyCustomer(customer);
        onCustomerNameChange(customer.name);
      } else {
        setLoyaltyCustomer(null);
      }
    }
  };

  const handleSelectLoyaltyCustomer = (customer: any) => {
    setLoyaltyCustomer(customer);
    setCustomerPhone(customer.phone);
    onCustomerNameChange(customer.name);
    setShowLoyaltySearch(false);
  };

  const clearLoyaltyCustomer = () => {
    setLoyaltyCustomer(null);
    setCustomerPhone('');
    onCustomerNameChange('');
  };

  return (
    <div className="space-y-4">
      {/* Programme de fidélité */}
      <div className="border border-emerald-200 rounded-lg p-4 bg-emerald-50">
        <div className="flex items-center justify-between mb-3">
          <Label className="text-emerald-800 font-medium flex items-center gap-2">
            <Star className="w-4 h-4" />
            Programme de Fidélité
          </Label>
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={() => setShowLoyaltySearch(!showLoyaltySearch)}
            className="border-emerald-300"
          >
            <Search className="w-4 h-4 mr-1" />
            Rechercher
          </Button>
        </div>

        {loyaltyCustomer ? (
          <div className="bg-white rounded-lg p-3 border border-emerald-200">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium text-emerald-800">{loyaltyCustomer.name}</h4>
                <p className="text-sm text-emerald-600">{loyaltyCustomer.phone}</p>
                <div className="flex items-center gap-2 mt-1">
                  <Badge variant="outline" className="bg-emerald-100 text-emerald-800">
                    {loyaltyCustomer.points} points
                  </Badge>
                  <span className="text-xs text-gray-500">
                    Total dépensé: {loyaltyCustomer.total_spent} FCFA
                  </span>
                </div>
              </div>
              <Button
                type="button"
                size="sm"
                variant="ghost"
                onClick={clearLoyaltyCustomer}
                className="text-gray-500"
              >
                Annuler
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-2">
            <div className="flex gap-2">
              <Input
                placeholder="Numéro de téléphone"
                value={customerPhone}
                onChange={(e) => setCustomerPhone(e.target.value)}
                className="border-emerald-200"
              />
              <Button
                type="button"
                size="sm"
                onClick={handlePhoneSearch}
                className="bg-emerald-600 hover:bg-emerald-700"
              >
                <Search className="w-4 h-4" />
              </Button>
            </div>
            
            {showLoyaltySearch && (
              <div className="max-h-32 overflow-y-auto bg-white rounded border border-emerald-200">
                {customers.map((customer) => (
                  <div
                    key={customer.id}
                    className="p-2 hover:bg-emerald-50 cursor-pointer border-b border-emerald-100 last:border-b-0"
                    onClick={() => handleSelectLoyaltyCustomer(customer)}
                  >
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="font-medium text-sm">{customer.name}</p>
                        <p className="text-xs text-gray-600">{customer.phone}</p>
                      </div>
                      <Badge variant="outline" className="text-xs">
                        {customer.points} pts
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Informations de base */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="customerName">Nom du client *</Label>
          <Input
            id="customerName"
            value={customerName}
            onChange={(e) => onCustomerNameChange(e.target.value)}
            required
            className="border-emerald-200 focus:border-emerald-500"
          />
        </div>
        <div>
          <Label htmlFor="tableId">Table (optionnel)</Label>
          <Select value={tableId} onValueChange={onTableIdChange}>
            <SelectTrigger className="border-emerald-200">
              <SelectValue placeholder="Sélectionner une table" />
            </SelectTrigger>
            <SelectContent>
              {tables.filter(table => table.status === 'available').map((table) => (
                <SelectItem key={table.id} value={table.id}>
                  Table {table.table_number} ({table.capacity} places)
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {loyaltyCustomer && (
        <div className="text-sm text-emerald-600 bg-emerald-50 p-2 rounded">
          💡 Ce client gagnera des points de fidélité avec cette commande !
        </div>
      )}
    </div>
  );
};
