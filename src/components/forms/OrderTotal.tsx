
import React from 'react';

interface OrderTotalProps {
  totalAmount: number;
}

export const OrderTotal: React.FC<OrderTotalProps> = ({ totalAmount }) => {
  return (
    <div className="bg-emerald-50 p-4 rounded-lg">
      <div className="flex justify-between items-center">
        <span className="text-lg font-medium text-emerald-800">Total</span>
        <span className="text-2xl font-bold text-emerald-600">{totalAmount.toFixed(0)} FCFA</span>
      </div>
    </div>
  );
};
