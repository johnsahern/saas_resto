
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Search, Phone, Mail } from 'lucide-react';
import { LoyaltyCustomer } from '@/types/loyaltyCustomers';
import { NewCustomerDialog } from './NewCustomerDialog';

interface CustomersListProps {
  customers: LoyaltyCustomer[];
  onAddCustomer: (customer: { name: string; phone: string; email: string }) => Promise<{ success: boolean }>;
}

export const CustomersList = ({ customers, onAddCustomer }: CustomersListProps) => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredCustomers = customers.filter(customer =>
    customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.phone.includes(searchTerm)
  );

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <Search className="w-4 h-4 text-emerald-500" />
          <Input
            placeholder="Rechercher un client..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-sm"
          />
        </div>
        <NewCustomerDialog onAddCustomer={onAddCustomer} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredCustomers.map((customer) => (
          <Card key={customer.id} className="border-emerald-200">
            <CardHeader>
              <CardTitle className="text-emerald-800 flex items-center justify-between">
                {customer.name}
                <Badge variant="outline" className="bg-emerald-50">
                  {customer.points} pts
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex items-center text-sm text-emerald-600">
                <Phone className="w-4 h-4 mr-2" />
                {customer.phone}
              </div>
              {customer.email && (
                <div className="flex items-center text-sm text-emerald-600">
                  <Mail className="w-4 h-4 mr-2" />
                  {customer.email}
                </div>
              )}
              <p className="text-sm text-gray-600">
                Total dépensé: {customer.total_spent} FCFA
              </p>
              {customer.last_visit && (
                <p className="text-xs text-gray-500">
                  Dernière visite: {new Date(customer.last_visit).toLocaleDateString()}
                </p>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};
