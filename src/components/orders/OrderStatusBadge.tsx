
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { Clock, CheckCircle, XCircle } from 'lucide-react';

const statusConfig = {
  pending: { label: 'En attente', color: 'bg-yellow-500', icon: Clock },
  preparing: { label: 'En préparation', color: 'bg-blue-500', icon: Clock },
  ready: { label: 'Prêt', color: 'bg-green-500', icon: CheckCircle },
  served: { label: 'Servi', color: 'bg-gray-500', icon: CheckCircle },
  cancelled: { label: 'Annulé', color: 'bg-red-500', icon: XCircle }
};

interface OrderStatusBadgeProps {
  status: string;
  onClick: () => void;
  nextStatusLabel?: string;
}

export const OrderStatusBadge: React.FC<OrderStatusBadgeProps> = ({ 
  status, 
  onClick, 
  nextStatusLabel 
}) => {
  const config = statusConfig[status as keyof typeof statusConfig];
  const canChangeStatus = status !== 'served' && status !== 'cancelled';

  return (
    <Badge 
      className={cn(
        "text-white cursor-pointer transition-colors",
        config.color,
        canChangeStatus && "hover:opacity-80"
      )}
      onClick={onClick}
      title={canChangeStatus ? `Cliquer pour passer à: ${nextStatusLabel}` : 'Statut final'}
    >
      {config.label}
      {canChangeStatus && (
        <span className="ml-1 text-xs">→</span>
      )}
    </Badge>
  );
};
