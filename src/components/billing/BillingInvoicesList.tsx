
import React from 'react';
import { BillingOrder } from '@/hooks/useBillingOrders';
import { InvoiceCard } from './InvoiceCard';
import { BillingEmptyState } from './BillingEmptyState';

interface BillingInvoicesListProps {
  filteredOrders: BillingOrder[];
  totalOrders: number;
}

export const BillingInvoicesList: React.FC<BillingInvoicesListProps> = ({ 
  filteredOrders, 
  totalOrders 
}) => {
  if (filteredOrders.length > 0) {
    return (
      <div className="grid gap-4">
        {filteredOrders.map((order) => (
          <InvoiceCard key={order.id} order={order} />
        ))}
      </div>
    );
  }

  return (
    <BillingEmptyState 
      hasOrders={totalOrders > 0} 
      isFiltered={totalOrders > 0 && filteredOrders.length === 0} 
    />
  );
};
