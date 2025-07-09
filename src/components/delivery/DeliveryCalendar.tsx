import React from 'react';
import { Calendar } from '@/components/ui/calendar';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { Delivery } from '@/hooks/useDeliveries';
import { CalendarDays, Package } from 'lucide-react';
import { startOfDay, endOfDay } from 'date-fns'; // Ajout de date-fns

interface DeliveryCalendarProps {
  selectedDate: Date;
  onDateSelect: (date: Date) => void;
  deliveries: Delivery[];
}

export const DeliveryCalendar: React.FC<DeliveryCalendarProps> = ({
  selectedDate,
  onDateSelect,
  deliveries
}) => {
  const getDeliveryCountForDate = (date: Date) => {
    const startOfSelectedDay = startOfDay(date); // Début du jour sélectionné
    const endOfSelectedDay = endOfDay(date);     // Fin du jour sélectionné

    return deliveries.filter(delivery => {
      const deliveryDate = new Date(delivery.created_at);
      return deliveryDate >= startOfSelectedDay && deliveryDate <= endOfSelectedDay;
    }).length;
  };

  const modifiers = {
    hasDeliveries: (date: Date) => getDeliveryCountForDate(date) > 0,
  };

  const modifiersStyles = {
    hasDeliveries: {
      backgroundColor: 'rgba(16, 185, 129, 0.2)',
      border: '2px solid rgba(16, 185, 129, 0.5)',
      borderRadius: '8px',
      fontWeight: 'bold',
    },
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('fr-FR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="space-y-6">
      {/* En-tête du calendrier */}
      <div className="flex items-center gap-3 p-4 bg-gradient-to-r from-emerald-500/10 to-green-500/10 rounded-lg border border-emerald-500/20">
        <div className="p-2 bg-emerald-500/20 rounded-lg">
          <CalendarDays className="w-6 h-6 text-emerald-400" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-white">Calendrier des livraisons</h3>
          <p className="text-sm text-emerald-300">Sélectionnez une date pour voir les livraisons</p>
        </div>
      </div>

      {/* Calendrier principal */}
      <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6 hover:border-emerald-500/30 transition-all duration-300">
        <Calendar
          mode="single"
          selected={selectedDate}
          onSelect={(date) => date && onDateSelect(date)}
          className={cn("w-full pointer-events-auto")}
          modifiers={modifiers}
          modifiersStyles={modifiersStyles}
          classNames={{
            months: "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0",
            month: "space-y-4",
            caption: "flex justify-center pt-1 relative items-center text-white",
            caption_label: "text-lg font-semibold",
            nav: "space-x-1 flex items-center",
            nav_button: "h-8 w-8 bg-slate-700 hover:bg-emerald-500/20 text-slate-300 hover:text-emerald-400 border border-slate-600 hover:border-emerald-500/50 rounded-md transition-all",
            nav_button_previous: "absolute left-1",
            nav_button_next: "absolute right-1",
            table: "w-full border-collapse space-y-1",
            head_row: "flex",
            head_cell: "text-emerald-400 rounded-md w-10 font-semibold text-sm",
            row: "flex w-full mt-2",
            cell: "h-10 w-10 text-center text-sm p-0 relative focus-within:relative focus-within:z-20",
            day: "h-10 w-10 p-0 font-normal text-slate-300 hover:bg-emerald-500/20 hover:text-emerald-400 rounded-lg transition-all duration-200",
            day_selected: "bg-emerald-500 text-white hover:bg-emerald-600 hover:text-white font-bold",
            day_today: "bg-slate-600 text-white font-semibold",
            day_outside: "text-slate-600 opacity-50",
            day_disabled: "text-slate-700 opacity-30",
          }}
        />
      </div>

      {/* Informations sur la date sélectionnée */}
      <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-emerald-500/20 rounded-lg">
            <Package className="w-5 h-5 text-emerald-400" />
          </div>
          <div>
            <h4 className="text-white font-semibold">Date sélectionnée</h4>
            <p className="text-emerald-300 text-sm capitalize">{formatDate(selectedDate)}</p>
          </div>
        </div>
        
        <div className="flex items-center justify-between">
          <span className="text-slate-400">Livraisons prévues :</span>
          <Badge className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
            {getDeliveryCountForDate(selectedDate)} livraison(s)
          </Badge>
        </div>
      </div>
      
      {/* Légende */}
      <div className="flex items-center gap-4 text-sm">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-emerald-500/20 border-2 border-emerald-500/50 rounded"></div>
          <span className="text-slate-400">Jours avec livraisons</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-emerald-500 rounded"></div>
          <span className="text-slate-400">Date sélectionnée</span>
        </div>
      </div>
    </div>
  );
};