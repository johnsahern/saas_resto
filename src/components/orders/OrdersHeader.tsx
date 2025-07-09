
import React from 'react';
import { Calendar } from 'lucide-react';

interface OrdersHeaderProps {
  ordersCount: number;
}

export const OrdersHeader: React.FC<OrdersHeaderProps> = ({ ordersCount }) => {
  const today = new Date().toLocaleDateString('fr-FR', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  return (
    <div>
      <h2 className="text-3xl font-bold bg-gradient-to-r from-emerald-600 to-green-600 bg-clip-text text-transparent">
        Gestion des commandes - {today}
      </h2>
      <div className="flex items-center gap-2 text-emerald-600">
        <Calendar className="w-4 h-4" />
        <p>Suivi en temps réel des commandes du jour ({ordersCount} commandes actives)</p>
      </div>
    </div>
  );
};
